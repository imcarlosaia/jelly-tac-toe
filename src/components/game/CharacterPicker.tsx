'use client';

import { CHARACTERS } from '@/lib/characters';
import type { CharacterId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Character } from './Character';

interface CharacterPickerProps {
  label: string;
  value: CharacterId;
  taken: CharacterId;
  onChange: (id: CharacterId) => void;
}

export function CharacterPicker({ label, value, taken, onChange }: CharacterPickerProps) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 gap-2">
      {CHARACTERS.map((character) => {
        const selected = character.id === value;
        const unavailable = character.id === taken;
        return (
          <button
            key={character.id}
            type="button"
            title={character.name}
            aria-label={unavailable ? `${character.name}, taken` : character.name}
            aria-pressed={selected}
            disabled={unavailable}
            onClick={() => onChange(character.id)}
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl bg-cell transition-colors',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring',
              selected && 'ring-4 ring-white',
              unavailable ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:bg-cell-hover',
            )}
          >
            <Character id={character.id} className={cn('h-12 w-12', selected && 'jelly-bob')} />
          </button>
        );
      })}
    </div>
  );
}
