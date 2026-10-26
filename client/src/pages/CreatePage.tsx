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
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [attempted, setAttempted] = useState(false);
  const storyLength = form.scenario.trim().length;
  const storyError = attempted && storyLength < 80 ? 'Add a little more detail (at least 80 characters) so the mystery can be solved fairly.' : '';
  const titleError = attempted && form.title.trim().length > 0 && form.title.trim().length < 3 ? 'Use at least 3 characters, or leave the title blank.' : '';
  const toggle = (id: EvidenceType) => setTypes((current) => {
    return current.includes(id) ? current.filter((type) => type !== id) : [...current, id];
  });
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setAttempted(true);
    const parsed = schema.safeParse({...form,title:form.title.trim()||undefined,setting:form.setting.trim()||undefined,contentNote:form.contentNote.trim()||undefined});
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = typeof issue?.path[0] === 'string' ? document.getElementById(issue.path[0]) : null;
      field?.focus();
      if (issue?.path[0] !== 'scenario') setError(issue?.message || 'Check the highlighted fields.');
      return;
    }
    setBusy(true);
    try {
      const created = await api.createCase({ ...parsed.data, evidenceTypes: types.length ? types : ['document'] });
      navigate(`/cases/${created.caseId}/generating`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'We could not open that case. Try again.'); setBusy(false); }
  };

  return <main className="create-page section-shell">
    <Link to="/" className="back-link"><ArrowLeft size={15}/> Back to the desk</Link>
    <div className="create-layout"><div className="create-intro"><div className="eyebrow">Case builder</div><h1>Set the scene.<br/><em>We’ll follow the clues.</em></h1><p>Start with a fictional situation. We’ll assemble the people, the evidence, and the details that don’t quite line up.</p><div className="builder-note"><WandSparkles size={17}/><span>Your story guides the case. Every person and artifact will be fictional.</span></div></div>
      <form className="builder-form" onSubmit={submit}>
        <div className="form-heading"><span>Story</span><span className="required-tag">Required</span></div>
        <label className="field-label" htmlFor="scenario">What happened?</label>
        <textarea id="scenario" value={form.scenario} onChange={(e)=>{setForm({...form,scenario:e.target.value});setError('');}} placeholder="A stage manager at a small theatre finds the original script missing just before opening night. Three people had keys to the prop room..." maxLength={5000} rows={5} aria-invalid={Boolean(storyError)} aria-describedby="story-help story-count story-validation" />
        <div className="field-foot"><span id="story-help">Give us a fictional setup. Do not include real names or private messages.</span><span id="story-count" className={storyLength<80?'story-count-low':''}>{storyLength} / 5,000</span></div>
        <div className={`story-validation ${storyError?'is-error':''}`} id="story-validation" aria-live="polite">{storyError||(storyLength>=80?'Story length looks good.':`${80-storyLength} more characters to meet the minimum`)}</div>
        <div className="form-row"><div className="form-field"><label className="field-label" htmlFor="title">Case title <span>OPTIONAL</span></label><input id="title" value={form.title} maxLength={80} aria-invalid={Boolean(titleError)} aria-describedby="title-validation" onChange={(e)=>{setForm({...form,title:e.target.value});setError('');}} placeholder="Let the story name itself" /><div className={`field-inline-error ${titleError?'is-visible':''}`} id="title-validation" aria-live="polite">{titleError}</div></div><div className="form-field"><label className="field-label" htmlFor="setting">Setting <span>OPTIONAL</span></label><input id="setting" value={form.setting} maxLength={120} onChange={(e)=>setForm({...form,setting:e.target.value})} placeholder="A theatre on opening night" /></div></div>
        <div className="form-row"><div className="form-field"><label className="field-label" htmlFor="difficulty">Difficulty</label><select id="difficulty" value={form.difficulty} onChange={(e)=>setForm({...form,difficulty:e.target.value})}><option value="easy">Easy · clear clues</option><option value="medium">Medium · read between lines</option><option value="hard">Hard · subtle connections</option></select></div><div className="form-field"><label className="field-label" htmlFor="tone">Story tone</label><select id="tone" value={form.tone} onChange={(e)=>setForm({...form,tone:e.target.value})}><option value="classic_detective">Classic detective</option><option value="cozy">Cozy mystery</option><option value="thriller">Thriller</option><option value="lighthearted">Lighthearted</option></select></div></div>
        <div className="form-heading evidence-form-heading"><span>Evidence preferences</span><span className="required-tag">OPTIONAL</span></div>
        <div className="evidence-choice-grid">{choices.map(({id,title,detail,Icon})=>{const selected=types.includes(id);return <button type="button" className={`evidence-choice ${selected?'selected':''}`} key={id} onClick={()=>toggle(id)} aria-pressed={selected} aria-label={`${title}: ${selected?'included':'not included'}`}><span className="choice-icon"><Icon size={17}/></span><span><b>{title}</b><small>{detail}</small></span><span className="choice-check">{selected&&<Check size={13}/>}</span></button>;})}</div>
        <p className="evidence-selection-hint">Choose preferred formats, or leave them all off and we’ll use text evidence where needed.</p>
        <div className="form-field content-note"><label className="field-label" htmlFor="content-note">Content boundaries <span>OPTIONAL</span></label><input id="content-note" value={form.contentNote} maxLength={300} onChange={(e)=>setForm({...form,contentNote:e.target.value})} placeholder="Keep it light; no violence" /></div>
        {error&&<div className="form-error" role="alert">{error}</div>}
        <div className="form-bottom"><span>By continuing, you confirm this is a fictional scenario.</span><button className="button button-primary" type="submit" disabled={busy}>{busy?'Opening case…':'Build the case'}<ArrowUpRight size={16}/></button></div>
      </form></div>
  </main>;
}
