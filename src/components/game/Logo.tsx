import { CHARACTERS } from '@/lib/characters';

const LETTERS = (() => {
  let colored = 0;
  return [...'Jelly Tac Toe'].map((ch) => ({
    ch,
    color: ch === ' ' ? undefined : CHARACTERS[colored++ % CHARACTERS.length].color,
  }));
})();

export function Logo() {
  return (
    <h1 aria-label="Jelly Tac Toe" className="font-display text-2xl font-semibold tracking-wide sm:text-3xl">
      {LETTERS.map((letter, index) => (
        <span key={index} aria-hidden="true" style={{ color: letter.color }}>
          {letter.ch}
        </span>
      ))}
    </h1>
  );
}
