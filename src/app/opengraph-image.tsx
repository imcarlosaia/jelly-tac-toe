import { ImageResponse } from 'next/og';
import { CHARACTERS } from '@/lib/characters';

export const alt = 'Jelly Tac Toe: pick your character and play';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TITLE = (() => {
  let colored = 0;
  return [...'Jelly Tac Toe'].map((ch) => ({
    ch,
    color: ch === ' ' ? null : CHARACTERS[colored++ % CHARACTERS.length].color,
  }));
})();

const EYE = { width: 18, height: 18, borderRadius: 9, backgroundColor: '#1D1D2B' } as const;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#171A3A',
        }}
      >
        <div style={{ display: 'flex', fontSize: 128, fontWeight: 700 }}>
          {TITLE.map((letter, index) =>
            letter.color === null ? (
              <div key={index} style={{ width: 44 }} />
            ) : (
              <div key={index} style={{ color: letter.color }}>
                {letter.ch}
              </div>
            ),
          )}
        </div>
        <div style={{ display: 'flex', marginTop: 20, fontSize: 40, color: '#B9BCE0' }}>
          Pick your character and play
        </div>
        <div style={{ display: 'flex', marginTop: 60 }}>
          {CHARACTERS.map((character) => (
            <div
              key={character.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 112,
                height: 112,
                margin: '0 14px',
                borderRadius: 40,
                backgroundColor: character.color,
              }}
            >
              <div style={{ ...EYE, marginRight: 22 }} />
              <div style={EYE} />
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
