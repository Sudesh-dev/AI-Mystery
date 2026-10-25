import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, FileText, Image, MessageSquareText, Video, WandSparkles } from 'lucide-react';
import { z } from 'zod';
import { api } from '../lib/api';
import type { EvidenceType } from '../lib/types';

const schema = z.object({ scenario: z.string().trim().min(80, 'Give us at least 80 characters to build a fair mystery.').max(5000, 'Keep the story under 5,000 characters.'), title: z.string().trim().min(3).max(80).optional(), setting: z.string().trim().max(120).optional(), difficulty: z.enum(['easy','medium','hard']), tone: z.enum(['cozy','classic_detective','thriller','lighthearted']), contentNote: z.string().trim().max(300).optional() });
const choices: { id: EvidenceType; title: string; detail: string; Icon: typeof MessageSquareText }[] = [
  { id: 'chat', title: 'Message threads', detail: 'Conversations & DMs', Icon: MessageSquareText },
  { id: 'image', title: 'Image evidence', detail: 'Stills & scene details', Icon: Image },
  { id: 'cctv', title: 'CCTV timeline', detail: 'Simulated camera footage', Icon: Video },
  { id: 'document', title: 'Paper trail', detail: 'Logs, notes & receipts', Icon: FileText },
];

export function CreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ scenario: '', title: '', setting: '', difficulty: 'medium', tone: 'classic_detective', contentNote: '' });
  const [types, setTypes] = useState<EvidenceType[]>(['chat','image','cctv','document']);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const toggle = (id: EvidenceType) => setTypes((current) => current.includes(id) ? current.filter((type) => type !== id) : [...current, id]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    const parsed = schema.safeParse({...form,title:form.title.trim()||undefined,setting:form.setting.trim()||undefined,contentNote:form.contentNote.trim()||undefined});
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || 'Check the highlighted fields.'); return; }
    setBusy(true);
    try {
      const created = await api.createCase({ ...parsed.data, evidenceTypes: types.length ? types : ['document'] });
      navigate(`/cases/${created.caseId}/generating`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'We could not open that case. Try again.'); setBusy(false); }
  };

  return <main className="create-page section-shell">
    <Link to="/" className="back-link"><ArrowLeft size={15}/> Back to the desk</Link>
    <div className="create-layout"><div className="create-intro"><div className="eyebrow"><span className="live-dot"/> CASE BUILDER · 01</div><h1>Set the scene.<br/><em>We’ll follow the clues.</em></h1><p>Start with a fictional situation. We’ll assemble the people, the evidence, and the details that don’t quite line up.</p><div className="builder-note"><WandSparkles size={17}/><span>Your story guides the case. Every person and artifact will be fictional.</span></div><div className="builder-index">CASE CREATION <span>—</span> APPROX. 1 MIN</div></div>
      <form className="builder-form" onSubmit={submit}>
        <div className="form-heading"><span>01 / STORY</span><span className="required-tag">REQUIRED</span></div>
        <label className="field-label" htmlFor="scenario">What happened?</label>
        <textarea id="scenario" value={form.scenario} onChange={(e)=>setForm({...form,scenario:e.target.value})} placeholder="A stage manager at a small theatre finds the original script missing just before opening night. Three people had keys to the prop room..." maxLength={5000} rows={5} aria-describedby="story-help story-count" />
        <div className="field-foot"><span id="story-help">Give us a fictional setup. Do not include real names or private messages.</span><span id="story-count" className={form.scenario.length>5000?'error-text':''}>{form.scenario.length} / 5,000</span></div>
        <div className="form-row"><div className="form-field"><label className="field-label" htmlFor="title">Case title <span>OPTIONAL</span></label><input id="title" value={form.title} maxLength={80} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Let the story name itself" /></div><div className="form-field"><label className="field-label" htmlFor="setting">Setting <span>OPTIONAL</span></label><input id="setting" value={form.setting} maxLength={120} onChange={(e)=>setForm({...form,setting:e.target.value})} placeholder="A theatre on opening night" /></div></div>
        <div className="form-row"><div className="form-field"><label className="field-label" htmlFor="difficulty">Difficulty</label><select id="difficulty" value={form.difficulty} onChange={(e)=>setForm({...form,difficulty:e.target.value})}><option value="easy">Easy · clear clues</option><option value="medium">Medium · read between lines</option><option value="hard">Hard · subtle connections</option></select></div><div className="form-field"><label className="field-label" htmlFor="tone">Story tone</label><select id="tone" value={form.tone} onChange={(e)=>setForm({...form,tone:e.target.value})}><option value="classic_detective">Classic detective</option><option value="cozy">Cozy mystery</option><option value="thriller">Thriller</option><option value="lighthearted">Lighthearted</option></select></div></div>
        <div className="form-heading evidence-form-heading"><span>02 / EVIDENCE TYPES</span><span className="required-tag">CHOOSE ANY</span></div>
        <div className="evidence-choice-grid">{choices.map(({id,title,detail,Icon})=><button type="button" className={`evidence-choice ${types.includes(id)?'selected':''}`} key={id} onClick={()=>toggle(id)} aria-pressed={types.includes(id)}><span className="choice-icon"><Icon size={17}/></span><span><b>{title}</b><small>{detail}</small></span><span className="choice-check">{types.includes(id)&&<Check size={13}/>}</span></button>)}</div>
        <div className="form-field content-note"><label className="field-label" htmlFor="content-note">Content boundaries <span>OPTIONAL</span></label><input id="content-note" value={form.contentNote} maxLength={300} onChange={(e)=>setForm({...form,contentNote:e.target.value})} placeholder="Keep it light; no violence" /></div>
        {error&&<div className="form-error" role="alert">{error}</div>}
        <div className="form-bottom"><span>By continuing, you confirm this is a fictional scenario.</span><button className="button button-primary" type="submit" disabled={busy}>{busy?'Opening case…':'Build the case'}<ArrowUpRight size={16}/></button></div>
      </form></div>
  </main>;
}
