import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, AudioLines, Camera, CheckCircle2, ChevronRight, CircleX, Clock3, FileText, Fingerprint, LoaderCircle, MessageSquareText, RefreshCw, ScanLine, ShieldCheck, Sparkles, X } from 'lucide-react';
import { api } from '../lib/api';
import type { GenerationHistoryEntry } from '../lib/types';

function Scene() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void import('../components/EvidenceScene').then(({ mountEvidenceScene }) => {
      if (!cancelled && ref.current) cleanup = mountEvidenceScene(ref.current);
    }).catch(() => undefined);
    return () => { cancelled = true; cleanup?.(); };
  }, []);
  return <canvas className="hero-scene" ref={ref} aria-label="A three dimensional investigator's desk with an open case folder, magnifying glass, and evidence note" role="img" />;
}

const evidenceTypes = [
  { Icon: MessageSquareText, label: 'Private messages', meta: 'THREAD 02 · 21:14' },
  { Icon: Camera, label: 'Camera stills', meta: 'CAM 04 · 22:08' },
  { Icon: FileText, label: 'Paper trail', meta: 'ACCESS LOG · 19:42' },
  { Icon: AudioLines, label: 'CCTV timelines', meta: 'LOADING BAY · 23:16' },
];

function historyStatus(entry:GenerationHistoryEntry){
  if(entry.status==='succeeded')return {label:'Succeeded',Icon:CheckCircle2};
  if(entry.status==='failed')return {label:'Failed',Icon:CircleX};
  return {label:'In progress',Icon:LoaderCircle};
}
function displayDate(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?'Time unavailable':date.toLocaleString();}
function HistoryDetailsModal({entry,onClose}:{entry:GenerationHistoryEntry;onClose:()=>void}){
  const navigate=useNavigate();
  const dialog=useRef<HTMLDivElement>(null);
  const [retrying,setRetrying]=useState(false);
  const [retryError,setRetryError]=useState('');
  useEffect(()=>{
    const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const previousOverflow=document.body.style.overflow;
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();onClose();return;}
      if(event.key!=='Tab'||!dialog.current)return;
      const focusable=Array.from(dialog.current.querySelectorAll<HTMLElement>('button,a[href],[tabindex="0"]')).filter((element)=>!element.hasAttribute('disabled'));
      if(!focusable.length)return;
      const first=focusable[0]!;const last=focusable[focusable.length-1]!;
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.body.style.overflow='hidden';window.addEventListener('keydown',onKeyDown);dialog.current?.focus();
    return()=>{window.removeEventListener('keydown',onKeyDown);document.body.style.overflow=previousOverflow;previousFocus?.focus();};
  },[]);
  const retryGeneration=async()=>{setRetrying(true);setRetryError('');try{const result=await api.retryCase(entry.caseId);onClose();navigate(`/cases/${result.caseId}/generating`);}catch(cause){setRetryError(cause instanceof Error?cause.message:'Could not retry this case. Try again.');setRetrying(false);}};
  const stage=entry.stage?.replaceAll('_',' ')||'Not available';
  const canRetry=entry.status==='failed'||(entry.status==='succeeded'&&entry.demoMode&&entry.caseStatus==='ready');
  return <div className="history-modal-backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}>
    <div ref={dialog} className="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-dialog-title" tabIndex={-1}>
    <div className="history-dialog-content">
      <div className="history-dialog-top"><span className="eyebrow">CASE GENERATION RECORD</span><button className="history-close" type="button" onClick={onClose} aria-label="Close generation details"><X size={18}/></button></div>
      <div className="history-dialog-heading"><div><h2 id="history-dialog-title">{entry.title}</h2><span className={`history-status history-status-${entry.status}`}>{(() => {const {label,Icon}=historyStatus(entry);return <><Icon size={14}/>{label}</>;})()}</span></div></div>
      <div className="history-meta-grid"><div><span>CREATED</span><b>{displayDate(entry.createdAt)}</b></div><div><span>LAST UPDATED</span><b>{displayDate(entry.updatedAt)}</b></div><div><span>GENERATION STAGE</span><b className="capitalize">{stage}</b></div><div><span>CASE STATE</span><b className="capitalize">{entry.caseStatus}</b></div></div>
      <section className="history-detail-block"><h3>Submitted scenario</h3><p className="history-story">{entry.details.scenario||'No scenario details were saved.'}</p></section>
      <section className="history-detail-block"><h3>Case settings</h3><dl className="history-settings"><div><dt>Setting</dt><dd>{entry.details.setting||'Not specified'}</dd></div><div><dt>Difficulty</dt><dd className="capitalize">{entry.details.difficulty}</dd></div><div><dt>Tone</dt><dd className="capitalize">{entry.details.tone.replaceAll('_',' ')}</dd></div><div><dt>Evidence</dt><dd>{entry.details.evidenceTypes.map((type)=>type.toUpperCase()).join(' · ')||'Not specified'}</dd></div>{entry.details.contentNote&&<div className="history-setting-wide"><dt>Content boundaries</dt><dd>{entry.details.contentNote}</dd></div>}</dl></section>
      {entry.demoMode&&<div className="history-fallback-note"><Sparkles size={15}/><span>Sample mystery used. This playable case is the built-in sample and was not generated from the submitted story.{entry.fallbackReason&&<> <span className="history-fallback-code">Reason: <code>{entry.fallbackReason}</code></span></>}</span></div>}
      {entry.status==='failed'&&<section className="history-failure" role="status"><h3>Generation failed</h3><p>{entry.failure?.message||'This case could not be prepared. Try creating a new mystery.'}</p><span>Diagnostic code: <code>{entry.failure?.code||'GENERATION_FAILED'}</code></span></section>}
      {entry.summary&&<section className="history-detail-block"><h3>Generated case</h3><p>{entry.summary.caseBrief}</p><p className="history-incident">{entry.summary.incident}</p><div className="history-counts"><span><b>{entry.summary.suspectCount}</b> suspects</span><span><b>{entry.summary.evidenceCount}</b> evidence items</span></div></section>}
      {entry.status==='generating'&&<p className="history-pending"><LoaderCircle size={15} className="spin"/>This case is still being prepared. Reopen its progress screen to follow along.</p>}
      {retryError&&<p className="generation-slow-error" role="alert">{retryError}</p>}
      <div className="history-dialog-actions"><button className="button button-quiet" type="button" onClick={onClose}>Close</button>{canRetry&&<button className="button button-primary" type="button" onClick={retryGeneration} disabled={retrying}>{retrying?<LoaderCircle size={15} className="spin"/>:<RefreshCw size={15}/>}Retry generation</button>}{entry.status==='generating'&&<Link className="button button-primary" to={`/cases/${entry.caseId}/generating`} onClick={onClose}>View progress <ChevronRight size={15}/></Link>}{entry.status==='succeeded'&&<Link className="button button-primary" to={entry.caseStatus==='completed'?`/cases/${entry.caseId}/result`:`/cases/${entry.caseId}`} onClick={onClose}>{entry.caseStatus==='completed'?'View result':'Open case'} <ChevronRight size={15}/></Link>}</div>
    </div>
    </div>
  </div>;
}

function GenerationHistory(){
  const [entries,setEntries]=useState<GenerationHistoryEntry[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [selected,setSelected]=useState<GenerationHistoryEntry|null>(null);
  const load=()=>{setLoading(true);setError('');void api.getHistory().then(({history})=>setEntries(history)).catch((cause)=>setError(cause instanceof Error?cause.message:'Could not load your case history.')).finally(()=>setLoading(false));};
  useEffect(()=>{load();},[]);
  return <section className="history-section section-shell" aria-labelledby="history-heading">
    <div className="section-kicker"><span>YOUR CASE FILES</span><span>RECENT GENERATIONS</span></div>
    <div className="history-heading"><div><span className="eyebrow"><Clock3 size={13}/> PRIVATE TO THIS BROWSER</span><h2 id="history-heading">Generation <em>history.</em></h2></div><p>Review the cases you’ve started, including their settings and generation outcome.</p><button className="history-refresh" type="button" onClick={load} disabled={loading} aria-label="Refresh generation history"><RefreshCw size={15} className={loading ? "spin" : ""}/><span>Refresh</span></button></div>
    {loading?<div className="history-state" role="status"><LoaderCircle size={17} className="spin"/>Loading your case history…</div>:error?<div className="history-state history-state-error" role="alert"><span>{error}</span><button className="button button-quiet" type="button" onClick={load}><RefreshCw size={14}/> Try again</button></div>:entries.length===0?<div className="history-empty"><p>Your generated cases will appear here.</p><Link to="/create" className="text-link">Build your first case <ArrowUpRight size={14}/></Link></div>:<div className="history-list">{entries.map((entry)=>{const {label,Icon}=historyStatus(entry);return <button className="history-row" type="button" key={entry.caseId} onClick={()=>setSelected(entry)}><span className="history-row-main"><b>{entry.title}</b><small>{displayDate(entry.createdAt)}</small></span><span className={`history-status history-status-${entry.status}`}><Icon size={14} className={entry.status==='generating'?'spin':''}/>{label}</span><ChevronRight className="history-row-chevron" size={16}/></button>;})}</div>}
    {selected&&<HistoryDetailsModal entry={selected} onClose={()=>setSelected(null)}/>}
  </section>;
}

export function LandingPage() {
  return <main>
    <section className="hero section-shell">
      <div className="hero-copy">
        <div className="eyebrow eyebrow-line"><span className="live-dot" /> A FICTIONAL INVESTIGATION, BUILT AROUND YOU</div>
        <h1>Every clue leaves<br />a <em>trace.</em></h1>
        <p className="hero-lede">Bring a story. Step into the investigation. Somewhere in the evidence, the truth is waiting.</p>
        <div className="hero-actions"><Link to="/create" className="button button-primary">Create your mystery <ArrowUpRight size={17} /></Link><a className="text-link" href="#how-it-works">See how it works <ArrowDown size={15} /></a></div>
        <div className="hero-footnote"><ShieldCheck size={15} /><span>Entirely fictional. Completely yours to solve.</span></div>
      </div>
      <div className="hero-art"><div className="art-grid" /><Scene /><div className="artifact-label label-a"><span>OBJECT 01</span><b>Case folder</b><small>ORIGINAL RECORD</small></div><div className="artifact-label label-b"><span>TRACE DETECTED</span><b>Evidence connected</b><small>3 MATCHES FOUND</small></div><div className="art-index">FIG. 01 <span>—</span> THE INVESTIGATION DESK</div></div>
      <div className="hero-index"><span>01</span><span className="index-rule" /><span>THE INVITATION</span></div>
    </section>

    <section className="ticker" aria-label="Evidence types"><div className="ticker-track">{[0, 1].map((copy) => <div className="ticker-group" key={copy}>{evidenceTypes.map(({ Icon, label }, i) => <span className="ticker-item" key={i}><Icon size={17} strokeWidth={1.5} />{label}<i>✳</i></span>)}</div>)}</div></section>

    <section className="intro section-shell" id="how-it-works">
      <div className="section-kicker"><span>THE PREMISE</span><span>01 / 03</span></div>
      <div className="intro-grid"><h2>A story is just<br />the <em>beginning.</em></h2><div className="intro-copy"><p>Give us a small scenario. We’ll build a whole world around it: a cast of suspects, a timeline that doesn’t quite add up, and a trail of evidence with something to say.</p><p>Read between the lines. Follow what doesn’t fit. Then decide who did it.</p><Link to="/create" className="button button-quiet">Enter the investigation <ArrowUpRight size={15} /></Link></div></div>
      <div className="process-rail">{[{n:'01',title:'Set the scene',body:'A story, a setting, a tone. You set the stage.'},{n:'02',title:'Read the room',body:'Chat threads, records, and camera timelines.'},{n:'03',title:'Make your call',body:'Choose a suspect. Back it up with evidence.'}].map((s)=><article className="process-card" key={s.n}><span>{s.n}</span><h3>{s.title}</h3><p>{s.body}</p></article>)}</div>
    </section>

    <GenerationHistory />

    <section className="evidence-section section-shell">
      <div className="section-kicker"><span>INSIDE THE FILE</span><span>02 / 03</span></div>
      <div className="evidence-heading"><h2>Nothing here<br />is <em>just a detail.</em></h2><p>Each artifact is part of the story. Some will point you in the right direction. Others have a reason to mislead.</p></div>
      <div className="evidence-cards">{evidenceTypes.map(({ Icon, label, meta }, i)=><article className={`evidence-teaser evidence-teaser-${i+1}`} key={label}><div className="teaser-top"><span>ARTIFACT 0{i+1}</span><Icon size={18}/></div><div className="teaser-visual"><div className={`teaser-graphic graphic-${i+1}`}>{i===0?<div className="chat-bubbles"><i>Did you lock the west door?</i><b>Of course. 9:40 exactly.</b><i>That’s not what the log says.</i></div>:i===1?<div className="camera-frame"><ScanLine /><span>CAM 04 <b>22:08:16</b></span></div>:i===2?<div className="paper-lines"><i>PROPERTY TRANSFER</i><span/><span/><span/><b>19:42 · SIGNED</b></div>:<div className="cctv-lines"><span>22:04</span><i/><span>22:08</span><i/><span>22:13</span></div>}</div></div><h3>{label}</h3><span className="mono-label">{meta}</span></article>)}</div>
      <div className="fiction-note"><Fingerprint size={16}/><span>Every person, message, image, and record is synthetic fiction, made for your case.</span></div>
    </section>

    <section className="closing section-shell"><div className="closing-mark"><Fingerprint size={24}/></div><span className="eyebrow">THE FILE IS OPEN</span><h2>Ready to trust<br />your <em>instincts?</em></h2><p>Start with a story. See where the evidence takes you.</p><Link to="/create" className="button button-primary">Create your mystery <ArrowUpRight size={17}/></Link><div className="closing-stamp">ALL PERSONS &amp; EVENTS<br/>ARE FICTIONAL</div></section>
  </main>;
}
