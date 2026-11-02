/**
 * Harkco Studio Web Audio Engine
 * Tactile micro-sound synthesizer with selectable hardware profiles
 */

export type SoundTheme = 'relay' | 'braun' | 'velvet';

export interface SoundThemeInfo {
  id: SoundTheme;
  name: string;
  badge: string;
  description: string;
}

export const SOUND_THEMES: SoundThemeInfo[] = [
  {
    id: 'relay',
    name: 'Analogt Relä',
    badge: 'Mekanisk',
    description: 'Tungt, taktilt klick med fysisk relästuds och lågfrekvent duns',
  },
  {
    id: 'braun',
    name: 'Braun ET66',
    badge: 'Dieter Rams',
    description: 'Knivskarpa minimalistiska elektroniska mikropip i Dieter Rams-stil',
  },
  {
    id: 'velvet',
    name: 'Soft Velvet',
    badge: 'Akustisk',
    description: 'Mjuka, harmoniska klocktoner med mjuk attack och varm klang',
  },
];

let audioCtx: AudioContext | null = null;
let isMuted = false;
let currentTheme: SoundTheme = 'relay';

// Initialize sound theme from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('harkco_hub_sound_theme') as SoundTheme | null;
    if (saved && (saved === 'relay' || saved === 'braun' || saved === 'velvet')) {
      currentTheme = saved;
    }
  } catch {}
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setAudioMuted(muted: boolean) {
  isMuted = muted;
}

export function getAudioMuted(): boolean {
  return isMuted;
}

export function setSoundTheme(theme: SoundTheme) {
  currentTheme = theme;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('harkco_hub_sound_theme', theme);
    } catch {}
  }
}

export function getSoundTheme(): SoundTheme {
  return currentTheme;
}

export function previewSoundTheme(theme: SoundTheme) {
  if (isMuted) return;
  const previous = currentTheme;
  currentTheme = theme;
  playChime();
  currentTheme = previous;
}

export function playLaunchClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (currentTheme === 'braun') {
      // Braun high-tech dual frequency pulse
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1180, now);
      gain1.gain.setValueAtTime(0.04, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.025);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1760, now + 0.028);
      gain2.gain.setValueAtTime(0.03, now + 0.028);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.028);
      osc2.stop(now + 0.06);
      return;
    }

    if (currentTheme === 'velvet') {
      // Soft acoustic chord bloom
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.015);
        gain.gain.setValueAtTime(0.025, now + idx * 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18 + idx * 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.015);
        osc.stop(now + 0.2);
      });
      return;
    }

    // Default: Analog Relay heavy switch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // Mechanical contact snap
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(1400, now);
    snap.frequency.exponentialRampToValueAtTime(300, now + 0.02);
    snapGain.gain.setValueAtTime(0.025, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
    snap.connect(snapGain);
    snapGain.connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.02);
  } catch {}
}

export function playTabClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (currentTheme === 'braun') {
      // Crisp 1400Hz Braun digital calculator ticker
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.016);
      return;
    }

    if (currentTheme === 'velvet') {
      // Soft organic wooden marimba chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
      return;
    }

    // Default: Analog Relay contact tick
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.028);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.028);
  } catch {}
}

export function playDismissClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (currentTheme === 'braun') {
      // Descending Braun electronic blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.025);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
      return;
    }

    if (currentTheme === 'velvet') {
      // Soft mellow tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.06);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
      return;
    }

    // Default: Analog Relay downward unlatch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.05);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {}
}

export function playChime() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (currentTheme === 'braun') {
      // Crisp 3-step electronic arpeggio
      const steps = [880, 1320, 1760]; // A5, E6, A6
      steps.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.03, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.05);
      });
      return;
    }

    if (currentTheme === 'velvet') {
      // Warm acoustic velvet bell bloom
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        gain.gain.setValueAtTime(0.035, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + idx * 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + 0.45);
      });
      return;
    }

    // Default: Analog Relay dual harmonic chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(783.99, now + 0.08); // G5
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  } catch {}
}
