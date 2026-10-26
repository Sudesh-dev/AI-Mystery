import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const TRACK_URL = '/audio/investigation-suspense.mp3';
const MUTE_STORAGE_KEY = 'after-hours.soundtrack-muted';
const VOLUME_STORAGE_KEY = 'after-hours.soundtrack-volume';
const DEFAULT_VOLUME = 50;

type PlayerStatus = 'starting' | 'playing' | 'paused' | 'blocked' | 'unavailable';

let sessionMutedPreference: boolean | null = null;
let sessionVolumePreference: number | null = null;

function readMutedPreference(): boolean {
  if (sessionMutedPreference !== null) return sessionMutedPreference;
  try {
    sessionMutedPreference = window.localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    sessionMutedPreference = false;
  }
  return sessionMutedPreference;
}

function readVolumePreference(): number {
  if (sessionVolumePreference !== null) return sessionVolumePreference;
  try {
    const stored = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    const saved = stored === null ? DEFAULT_VOLUME : Number(stored);
    sessionVolumePreference = Number.isFinite(saved) && saved >= 0 && saved <= 100 ? saved : DEFAULT_VOLUME;
  } catch {
    sessionVolumePreference = DEFAULT_VOLUME;
  }
  return sessionVolumePreference;
}

function savePreferences(muted: boolean, volume: number): void {
  sessionMutedPreference = muted;
  sessionVolumePreference = volume;
  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  } catch {
    // The in-memory preference still protects this session if storage is disabled.
  }
}

function playAudio(
  audio: HTMLAudioElement,
  isActive: () => boolean,
  setStatus: (status: PlayerStatus) => void,
): void {
  try {
    void audio.play().then(() => {
      if (isActive()) setStatus('playing');
    }).catch((error: unknown) => {
      if (!isActive()) return;
      if (error instanceof DOMException && error.name === 'NotAllowedError') setStatus('blocked');
      else if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('unavailable');
    });
  } catch {
    if (isActive()) setStatus('unavailable');
  }
}

export function InvestigationSoundtrack() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakerButton = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);
  const lastAudibleVolume = useRef(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(readMutedPreference);
  const [volume, setVolume] = useState(readVolumePreference);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [status, setStatus] = useState<PlayerStatus>('starting');

  useEffect(() => {
    let active = true;
    mounted.current = true;
    const audio = new Audio(TRACK_URL);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = readVolumePreference() / 100;
    audio.muted = readMutedPreference() || audio.volume === 0;
    audioRef.current = audio;

    const onPlaying = () => { if (active) setStatus('playing'); };
    const onPause = () => { if (active) setStatus('paused'); };
    const onError = () => { if (active) setStatus('unavailable'); };
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    if (audio.muted) setStatus('paused');
    else playAudio(audio, () => active, setStatus);

    return () => {
      active = false;
      mounted.current = false;
      audio.pause();
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, []);

  const toggleSpeaker = () => {
    const audio = audioRef.current;
    if (!audio || status === 'unavailable') return;

    if (status === 'blocked') {
      setControlsOpen(true);
      audio.muted = false;
      setMuted(false);
      savePreferences(false, volume);
      playAudio(audio, () => mounted.current, setStatus);
      return;
    }

    if (muted || volume === 0) {
      const nextVolume = volume === 0 ? lastAudibleVolume.current : volume;
      setVolume(nextVolume);
      setMuted(false);
      setControlsOpen(false);
      audio.volume = nextVolume / 100;
      audio.muted = false;
      savePreferences(false, nextVolume);
      if (audio.paused) playAudio(audio, () => mounted.current, setStatus);
      return;
    }

    if (!controlsOpen) {
      setControlsOpen(true);
      return;
    }

    setControlsOpen(false);
    setMuted(true);
    audio.pause();
    savePreferences(true, volume);
  };

  const changeVolume = (nextVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = nextVolume === 0;
    setVolume(nextVolume);
    setMuted(nextMuted);
    audio.volume = nextVolume / 100;
    audio.muted = nextMuted;
    if (nextVolume > 0) lastAudibleVolume.current = nextVolume;
    savePreferences(nextMuted, nextVolume);

    if (nextMuted) {
      audio.pause();
      return;
    }
    if (status === 'blocked' || audio.paused) playAudio(audio, () => mounted.current, setStatus);
  };

  const unavailable = status === 'unavailable';
  const effectivelyMuted = muted || volume === 0 || unavailable;
  const closeVolumeOnEscape = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && controlsOpen) {
      event.preventDefault();
      setControlsOpen(false);
      speakerButton.current?.focus();
    }
  };

  return <div className="soundtrack-wrap">
    <button
      ref={speakerButton}
      className={`soundtrack-speaker ${effectivelyMuted ? 'is-muted' : ''}`}
      type="button"
      onClick={toggleSpeaker}
      onKeyDown={closeVolumeOnEscape}
      disabled={unavailable}
      aria-label={unavailable ? 'Soundtrack unavailable' : status === 'blocked' ? 'Enable soundtrack' : effectivelyMuted ? 'Turn soundtrack on' : controlsOpen ? 'Mute soundtrack and close volume' : 'Open soundtrack volume'}
      aria-controls="soundtrack-volume-control"
      aria-expanded={controlsOpen}
      title={unavailable ? 'Soundtrack unavailable' : status === 'blocked' ? 'Enable soundtrack' : effectivelyMuted ? 'Turn soundtrack on' : controlsOpen ? 'Mute soundtrack and close volume' : 'Soundtrack volume'}
    >
      {effectivelyMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
    </button>
    {controlsOpen && !unavailable && <div className="soundtrack-volume-popover" id="soundtrack-volume-control" role="group" aria-label="Soundtrack volume control" onKeyDown={closeVolumeOnEscape}>
      <label htmlFor="soundtrack-volume-slider">Volume</label>
      <input
        id="soundtrack-volume-slider"
        type="range"
        min="0"
        max="100"
        step="1"
        value={volume}
        onChange={(event) => changeVolume(Number(event.currentTarget.value))}
        aria-valuetext={`${volume}%`}
      />
      <output htmlFor="soundtrack-volume-slider">{volume}%</output>
      {status === 'blocked' && <p className="soundtrack-popover-note">Playback is blocked. Activate the speaker to try again.</p>}
    </div>}
    {status === 'blocked' && !controlsOpen && <span className="soundtrack-autoplay-note" role="status">Tap the speaker to enable soundtrack.</span>}
    {unavailable && <span className="soundtrack-unavailable" role="status">Soundtrack unavailable</span>}
  </div>;
}
