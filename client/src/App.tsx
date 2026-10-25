import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Fingerprint } from 'lucide-react';
import { LandingPage } from './pages/LandingPage';
import { CreatePage } from './pages/CreatePage';
import { GenerationPage } from './pages/GenerationPage';
import { CasePage } from './pages/CasePage';
import { ResultPage } from './pages/ResultPage';

function Preloader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0; let value = 0; const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      value = Math.min(92, 100 * (1 - Math.exp(-elapsed / 430)));
      setProgress(value);
      if (elapsed < 860) raf = requestAnimationFrame(tick);
      else { setProgress(100); window.setTimeout(() => setVisible(false), 220); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  if (!visible) return null;
  return <div className="preloader" role="status" aria-label="Preparing the investigation room">
    <div className="preloader-mark"><Fingerprint size={26} strokeWidth={1.2} /></div>
    <span className="eyebrow">PRIVATE CASE FILE</span>
    <div className="preloader-title">After Hours</div>
    <div className="preloader-track"><span style={{ width: `${progress}%` }} /></div>
    <div className="preloader-caption">Preparing your investigation <span>{Math.round(progress)}%</span></div>
  </div>;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max * 100 : 0);
    };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return <div className="scroll-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>;
}

function Header() {
  const location = useLocation();
  return <header className="site-header">
    <Link className="brand" to="/"><span className="brand-icon"><Fingerprint size={19} /></span><span>AFTER HOURS<small>AN AI MYSTERY ROOM</small></span></Link>
    <nav aria-label="Main navigation"><Link className={location.pathname === '/' ? 'active' : ''} to="/">The experience</Link><a href="/#how-it-works">How it works</a></nav>
    <Link to="/create" className="header-cta">Open a case <ArrowUpRight size={15} /></Link>
  </header>;
}

function NotFound() { return <main className="not-found"><span className="eyebrow">FILE NOT FOUND</span><h1>This lead went cold.</h1><Link className="button button-primary" to="/">Return to the desk <ArrowUpRight size={16} /></Link></main>; }

export default function App() {
  return <><Preloader /><ScrollProgress /><Header /><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/create" element={<CreatePage />} />
    <Route path="/cases/:caseId/generating" element={<GenerationPage />} />
    <Route path="/cases/:caseId" element={<CasePage />} />
    <Route path="/cases/:caseId/result" element={<ResultPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes><footer className="site-footer"><span>AFTER HOURS <b>·</b> FICTIONAL CASES, REAL DEDUCTION</span><span>AN EXPERIMENT IN OBSERVATION <b>✳</b> 2026</span></footer></>;
}
