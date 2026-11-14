export type SoundName = 'place0' | 'place1' | 'win' | 'draw';

type AudioContextConstructor = typeof AudioContext;

let context: AudioContext | null = null;

function getConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null;
  const legacy = (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
  return window.AudioContext ?? legacy ?? null;
}

export function isSoundSupported(): boolean {
  return getConstructor() !== null;
}

function getContext(): AudioContext | null {
  const Constructor = getConstructor();
  if (!Constructor) return null;
  if (!context) context = new Constructor();
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(audio: AudioContext, from: number, to: number, offset: number, duration: number): void {
  const start = audio.currentTime + offset;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(from, start);
  oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

const SOUNDS: Record<SoundName, (audio: AudioContext) => void> = {
  place0: (audio) => tone(audio, 520, 260, 0, 0.12),
  place1: (audio) => tone(audio, 660, 330, 0, 0.12),
  win: (audio) => {
    tone(audio, 523, 523, 0, 0.16);
    tone(audio, 659, 659, 0.12, 0.16);
    tone(audio, 784, 784, 0.24, 0.34);
  },
  draw: (audio) => {
    tone(audio, 440, 440, 0, 0.18);
    tone(audio, 330, 330, 0.16, 0.3);
  },
};

export function playSound(name: SoundName): void {
  try {
    const audio = getContext();
    if (audio) SOUNDS[name](audio);
  } catch {
    // Audio failed to start: the game stays silent.
  }
}
