import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ChevronRight, CircleX, Clock3, LoaderCircle, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
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
        <p className="eyebrow">After Hours <span aria-hidden="true">/</span> The Case Archive</p>
        <h1>A story worth<br />investigating.</h1>
        <p className="hero-lede">Turn a fictional premise into a case file. Read the records, weigh each account, and decide what really happened.</p>
        <div className="hero-actions"><Link to="/create" className="button button-primary">Open a case <ArrowUpRight size={17} /></Link></div>
        <p className="hero-footnote"><ShieldCheck size={15} /><span>Every person and piece of evidence is fictional.</span></p>
      </div>
      <figure className="hero-art"><Scene /><figcaption className="scene-caption">The investigator's desk</figcaption></figure>
    </section>

    <section className="intro section-shell" id="how-it-works">
      <div className="section-heading"><p className="eyebrow">How it works</p><h2>Follow the record.<br /><em>Find the contradiction.</em></h2><p>Each case brings together people, a timeline, and evidence in different forms. Build your theory from what the file actually shows.</p></div>
      <ol className="process-rail"><li><span>01</span><div><h3>Set the premise</h3><p>Describe a fictional situation and choose the tone of the case.</p></div></li><li><span>02</span><div><h3>Examine the file</h3><p>Compare messages, documents, images, and camera observations.</p></div></li><li><span>03</span><div><h3>Make your accusation</h3><p>Name a suspect and cite the records that support your conclusion.</p></div></li></ol>
    </section>

    <GenerationHistory />
  </main>;
}
