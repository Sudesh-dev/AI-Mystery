import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Circle, Fingerprint, LoaderCircle, ScanLine, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

const stages = [ ['blueprint','Building the case'], ['evidence','Connecting the clues'], ['media','Preparing evidence'], ['consistency','Checking consistency'] ];
export function GenerationPage() {
  const { caseId = '' } = useParams(); const navigate = useNavigate();
  const [stage, setStage] = useState('blueprint'); const [error, setError] = useState('');const [canRetry,setCanRetry]=useState(false);const [retrying,setRetrying]=useState(false);const [retryError,setRetryError]=useState('');
  const [slowGeneration,setSlowGeneration]=useState(false);const [fallbackLoading,setFallbackLoading]=useState(false);const [fallbackError,setFallbackError]=useState('');
  useEffect(() => {
    let cancelled = false; let timer = 0; let delay = 1400;
    const poll = async () => {
      try {
        const result = await api.getCase(caseId);
        if (cancelled) return;
        if (result.status === 'ready' || result.status === 'completed') { navigate(`/cases/${caseId}`, { replace: true }); return; }
        if (result.status === 'failed') { setError('This case could not be assembled. Your story is still here; retry it or start a fresh investigation.');setCanRetry(true); return; }
        setStage(result.generationStage || 'blueprint');setSlowGeneration(Boolean(result.slowGeneration)); delay = Math.min(Math.round(delay * 1.35), 5000); timer = window.setTimeout(poll, delay);
      } catch { if (!cancelled) { setError('We lost the connection while preparing this case. Try checking again.'); } }
    };
    timer = window.setTimeout(poll, 400); return () => { cancelled = true; window.clearTimeout(timer); };
  }, [caseId, navigate]);
  const openSample=async()=>{
    setFallbackLoading(true);setFallbackError('');
    try{const result=await api.useFallback(caseId);if(result.status==='ready'||result.status==='completed'){navigate(`/cases/${caseId}`,{replace:true});return;}if(result.status==='failed'){setError('The custom case could not be prepared. Start a new investigation or return to your history.');return;}setFallbackError('The sample case could not be opened. Your custom generation is still running.');}
    catch(cause){setFallbackError(cause instanceof Error?cause.message:'The sample case could not be opened. Try again.');}
    finally{setFallbackLoading(false);}
  };
  const retryGeneration=async()=>{
    setRetrying(true);setRetryError('');
    try{const result=await api.retryCase(caseId);navigate(`/cases/${result.caseId}/generating`,{replace:true});}
    catch(cause){setRetryError(cause instanceof Error?cause.message:'Could not retry this case. Try again.');setRetrying(false);}
  };
  const activeIndex = Math.max(0, stages.findIndex(([key])=>key===stage));
  return <main className="generation-page section-shell"><Link to="/" className="back-link"><ArrowLeft size={15}/> Return to the desk</Link><div className="generation-card"><div className="generation-orbit"><div className="orbit-ring orbit-ring-one"/><div className="orbit-ring orbit-ring-two"/><div className="orbit-center"><Fingerprint size={33} strokeWidth={1.1}/></div><span className="orbit-dot dot-one"/><span className="orbit-dot dot-two"/></div><span className="eyebrow"><span className="live-dot"/> CASE FILE {error?'NEEDS ATTENTION':'IN PROGRESS'}</span><h1>{error?'The trail went quiet.':'Putting the pieces together.'}</h1><p>{error||'Building a fictional investigation from your story. This usually takes a short moment.'}</p>{!error&&<div className="generation-stages">{stages.map(([key,label],index)=><div className={`generation-stage ${index<activeIndex?'done':''} ${index===activeIndex?'current':''}`} key={key}>{index<activeIndex?<Check size={15}/>:index===activeIndex?<LoaderCircle className="spin" size={15}/>:<Circle size={15}/>}<span>{label}</span></div>)}</div>}
      {slowGeneration&&!error&&<aside className="generation-slow" aria-live="polite"><div className="generation-slow-title"><Sparkles size={17}/><h2>Your custom case is taking longer</h2></div><p>You can open a clearly labeled sample mystery now, or let Gemini keep building your story in the background.</p><div className="generation-slow-actions"><button className="button button-primary" type="button" onClick={openSample} disabled={fallbackLoading}>{fallbackLoading?<LoaderCircle size={15} className="spin"/>:<Sparkles size={15}/>}Open sample case</button><Link className="button button-quiet" to="/">Keep waiting in the background</Link></div>{fallbackError&&<p className="generation-slow-error" role="alert">{fallbackError}</p>}</aside>}
      {error&&<div className="generation-error-actions">{canRetry&&<button type="button" className="button button-primary" onClick={retryGeneration} disabled={retrying}>{retrying?<LoaderCircle size={15} className="spin"/>:<Sparkles size={15}/>}Retry this story</button>}<Link to="/create" className="button button-quiet">Try another story <ScanLine size={16}/></Link></div>}{retryError&&<p className="generation-slow-error" role="alert">{retryError}</p>}<div className="generation-disclaimer">FICTIONAL CASE Â· SYNTHETIC EVIDENCE Â· YOUR SOLUTION STAYS PRIVATE</div></div></main>;
}
