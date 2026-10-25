import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, AudioLines, Camera, FileText, Fingerprint, MessageSquareText, ScanLine, ShieldCheck } from 'lucide-react';
import { mountEvidenceScene } from '../components/EvidenceScene';

function Scene() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => ref.current ? mountEvidenceScene(ref.current) : undefined, []);
  return <canvas className="hero-scene" ref={ref} aria-label="A three dimensional investigator's desk with an open case folder, magnifying glass, and evidence note" role="img" />;
}

const evidenceTypes = [
  { Icon: MessageSquareText, label: 'Private messages', meta: 'THREAD 02 · 21:14' },
  { Icon: Camera, label: 'Camera stills', meta: 'CAM 04 · 22:08' },
  { Icon: FileText, label: 'Paper trail', meta: 'ACCESS LOG · 19:42' },
  { Icon: AudioLines, label: 'CCTV timelines', meta: 'LOADING BAY · 23:16' },
];

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

    <section className="evidence-section section-shell">
      <div className="section-kicker"><span>INSIDE THE FILE</span><span>02 / 03</span></div>
      <div className="evidence-heading"><h2>Nothing here<br />is <em>just a detail.</em></h2><p>Each artifact is part of the story. Some will point you in the right direction. Others have a reason to mislead.</p></div>
      <div className="evidence-cards">{evidenceTypes.map(({ Icon, label, meta }, i)=><article className={`evidence-teaser evidence-teaser-${i+1}`} key={label}><div className="teaser-top"><span>ARTIFACT 0{i+1}</span><Icon size={18}/></div><div className="teaser-visual"><div className={`teaser-graphic graphic-${i+1}`}>{i===0?<div className="chat-bubbles"><i>Did you lock the west door?</i><b>Of course. 9:40 exactly.</b><i>That’s not what the log says.</i></div>:i===1?<div className="camera-frame"><ScanLine /><span>CAM 04 <b>22:08:16</b></span></div>:i===2?<div className="paper-lines"><i>PROPERTY TRANSFER</i><span/><span/><span/><b>19:42 · SIGNED</b></div>:<div className="cctv-lines"><span>22:04</span><i/><span>22:08</span><i/><span>22:13</span></div>}</div></div><h3>{label}</h3><span className="mono-label">{meta}</span></article>)}</div>
      <div className="fiction-note"><Fingerprint size={16}/><span>Every person, message, image, and record is synthetic fiction, made for your case.</span></div>
    </section>

    <section className="closing section-shell"><div className="closing-mark"><Fingerprint size={24}/></div><span className="eyebrow">THE FILE IS OPEN</span><h2>Ready to trust<br />your <em>instincts?</em></h2><p>Start with a story. See where the evidence takes you.</p><Link to="/create" className="button button-primary">Create your mystery <ArrowUpRight size={17}/></Link><div className="closing-stamp">ALL PERSONS &amp; EVENTS<br/>ARE FICTIONAL</div></section>
  </main>;
}
