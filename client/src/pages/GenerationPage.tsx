import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Circle, Fingerprint, LoaderCircle, ScanLine } from 'lucide-react';
import { api } from '../lib/api';

const stages = [ ['blueprint','Building the case'], ['evidence','Connecting the clues'], ['media','Preparing evidence'], ['consistency','Checking consistency'] ];
export function GenerationPage() {
  const { caseId = '' } = useParams(); const navigate = useNavigate();
  const [stage, setStage] = useState('blueprint'); const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false; let timer = 0; let delay = 1400;
    const poll = async () => {
      try {
        const result = await api.getCase(caseId);
        if (cancelled) return;
        if (result.status === 'ready' || result.status === 'completed') { navigate(`/cases/${caseId}`, { replace: true }); return; }
        if (result.status === 'failed') { setError('This case could not be assembled. Your story is still here; start a fresh investigation when you’re ready.'); return; }
        setStage(result.generationStage || 'blueprint'); delay = Math.min(Math.round(delay * 1.35), 5000); timer = window.setTimeout(poll, delay);
      } catch { if (!cancelled) { setError('We lost the connection while preparing this case. Try checking again.'); } }
    };
    timer = window.setTimeout(poll, 400); return () => { cancelled = true; window.clearTimeout(timer); };
  }, [caseId, navigate]);
  const activeIndex = Math.max(0, stages.findIndex(([key])=>key===stage));
  return <main className="generation-page section-shell"><Link to="/" className="back-link"><ArrowLeft size={15}/> Return to the desk</Link><div className="generation-card"><div className="generation-orbit"><div className="orbit-ring orbit-ring-one"/><div className="orbit-ring orbit-ring-two"/><div className="orbit-center"><Fingerprint size={33} strokeWidth={1.1}/></div><span className="orbit-dot dot-one"/><span className="orbit-dot dot-two"/></div><span className="eyebrow"><span className="live-dot"/> CASE FILE {error?'NEEDS ATTENTION':'IN PROGRESS'}</span><h1>{error?'The trail went quiet.':'Putting the pieces together.'}</h1><p>{error||'Building a fictional investigation from your story. This usually takes a short moment.'}</p>{!error&&<div className="generation-stages">{stages.map(([key,label],index)=><div className={`generation-stage ${index<activeIndex?'done':''} ${index===activeIndex?'current':''}`} key={key}>{index<activeIndex?<Check size={15}/>:index===activeIndex?<LoaderCircle className="spin" size={15}/>:<Circle size={15}/>}<span>{label}</span></div>)}</div>}{error&&<Link to="/create" className="button button-primary">Try another story <ScanLine size={16}/></Link>}<div className="generation-disclaimer">FICTIONAL CASE · SYNTHETIC EVIDENCE · YOUR SOLUTION STAYS PRIVATE</div></div></main>;
}
