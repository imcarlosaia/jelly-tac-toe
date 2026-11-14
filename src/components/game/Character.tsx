import { useId, type CSSProperties, type ReactNode } from 'react';
import { getCharacter } from '@/lib/characters';
import type { CharacterId, Mood } from '@/lib/types';
import { cn } from '@/lib/utils';

const FACE_INK = '#1D1D2B';
const GLOSS = { fill: '#FFFFFF', fillOpacity: 0.45 } as const;
const GLOSS_STROKE = {
  fill: 'none',
  stroke: '#FFFFFF',
  strokeOpacity: 0.45,
  strokeWidth: 5,
  strokeLinecap: 'round',
} as const;

interface ShapeDef {
  body: (paint: string) => ReactNode;
  gloss: ReactNode;
  face: { x: number; y: number; scale: number };
}

const SHAPES: Record<CharacterId, ShapeDef> = {
  zest: {
    body: (paint) => (
      <g fill={paint}>
        <rect x="38" y="8" width="24" height="84" rx="12" transform="rotate(45 50 50)" />
        <rect x="38" y="8" width="24" height="84" rx="12" transform="rotate(-45 50 50)" />
      </g>
    ),
    gloss: <rect x="45" y="14" width="6" height="22" rx="3" transform="rotate(-45 50 50)" {...GLOSS} />,
    face: { x: 50, y: 47, scale: 1 },
  },
  minty: {
    body: (paint) => <circle cx="50" cy="50" r="30" fill="none" stroke={paint} strokeWidth="22" />,
    gloss: <path d="M22 40 A30 30 0 0 1 40 22" {...GLOSS_STROKE} />,
    face: { x: 50, y: 77, scale: 0.85 },
  },
  twinkle: {
    body: (paint) => (
      <polygon
        points="50,16 60.6,39.4 86.1,42.3 67.1,59.6 72.3,84.7 50,72 27.7,84.7 32.9,59.6 13.9,42.3 39.4,39.4"
        fill={paint}
        stroke={paint}
        strokeWidth="12"
        strokeLinejoin="round"
      />
    ),
    gloss: <circle cx="43" cy="30" r="4" {...GLOSS} />,
    face: { x: 50, y: 52, scale: 1 },
  },
  puff: {
    body: (paint) => (
      <g fill={paint}>
        <circle cx="32" cy="58" r="20" />
        <circle cx="54" cy="44" r="24" />
        <circle cx="72" cy="60" r="18" />
        <rect x="30" y="56" width="44" height="22" rx="11" />
      </g>
    ),
    gloss: <circle cx="44" cy="30" r="4.5" {...GLOSS} />,
    face: { x: 52, y: 56, scale: 1 },
  },
  drip: {
    body: (paint) => (
      <path
        d="M50 10 C50 10 82 46 82 62 A32 32 0 0 1 18 62 C18 46 50 10 50 10 Z"
        fill={paint}
        stroke={paint}
        strokeWidth="6"
        strokeLinejoin="round"
      />
    ),
    gloss: <path d="M40 34 L33 46" {...GLOSS_STROKE} />,
    face: { x: 50, y: 62, scale: 1 },
  },
  luna: {
    body: (paint) => (
      <path
        d="M60 12 A40 40 0 1 0 88 64 A31 31 0 0 1 60 12 Z"
        fill={paint}
        stroke={paint}
        strokeWidth="6"
        strokeLinejoin="round"
      />
    ),
    gloss: <circle cx="30" cy="34" r="4" {...GLOSS} />,
    face: { x: 40, y: 58, scale: 0.9 },
  },
};

const MOUTHS: Record<Mood, string> = {
  idle: 'M-5 8 Q0 13 5 8',
  happy: 'M-6 7 Q0 15 6 7',
  sad: 'M-5 12 Q0 7 5 12',
  shrug: 'M-5 10 L5 10',
};

const LINE = { fill: 'none', stroke: FACE_INK, strokeWidth: 2.4, strokeLinecap: 'round' } as const;

function Face({ mood }: { mood: Mood }) {
  const eyeY = mood === 'sad' ? 1.5 : 0;
  return (
    <>
      <circle cx="-14" cy="7" r="3.4" fill="#FFFFFF" fillOpacity="0.35" />
      <circle cx="14" cy="7" r="3.4" fill="#FFFFFF" fillOpacity="0.35" />
      {mood === 'happy' ? (
        <>
          <path d="M-10.5 1.5 Q-7 -4 -3.5 1.5" {...LINE} />
          <path d="M3.5 1.5 Q7 -4 10.5 1.5" {...LINE} />
        </>
      ) : (
        <g className={mood === 'idle' ? 'jelly-blink' : undefined}>
          <circle cx="-7" cy={eyeY} r="3.6" fill={FACE_INK} />
          <circle cx="7" cy={eyeY} r="3.6" fill={FACE_INK} />
          {mood !== 'sad' && (
            <>
              <circle cx="-5.8" cy="-1.2" r="1.2" fill="#FFFFFF" />
              <circle cx="8.2" cy="-1.2" r="1.2" fill="#FFFFFF" />
            </>
          )}
        </g>
      )}
      <path d={MOUTHS[mood]} {...LINE} />
    </>
  );
}

interface CharacterProps {
  id: CharacterId;
  mood?: Mood;
  seed?: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

export function Character({ id, mood = 'idle', seed = 0, title, className, style }: CharacterProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { color } = getCharacter(id);
  const shape = SHAPES[id];
  const blink = {
    '--blink-duration': `${3 + (seed % 4)}s`,
    '--blink-delay': `${((seed * 0.37) % 2).toFixed(2)}s`,
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('jelly-shadow overflow-visible', className)}
      style={{ ...blink, ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <radialGradient id={`${uid}-light`} cx="0.32" cy="0.22" r="0.6">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <mask id={`${uid}-mask`}>{shape.body('#FFFFFF')}</mask>
      </defs>
      {shape.body(color)}
      <g mask={`url(#${uid}-mask)`}>
        <rect width="100" height="100" fill={`url(#${uid}-shade)`} />
        <rect width="100" height="100" fill={`url(#${uid}-light)`} />
      </g>
      {shape.gloss}
      <g transform={`translate(${shape.face.x} ${shape.face.y}) scale(${shape.face.scale})`}>
        <Face mood={mood} />
      </g>
    </svg>
  );
}
