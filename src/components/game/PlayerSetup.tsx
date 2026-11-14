'use client';

import { Input } from '@/components/ui/Input';
import { COMPUTER_NAME, DEFAULT_NAMES, MAX_NAME_LENGTH } from '@/lib/reducer';
import type { CharacterId, PlayerIndex } from '@/lib/types';
import { CharacterPicker } from './CharacterPicker';

interface PlayerSetupProps {
  seat: PlayerIndex;
  heading: string;
  name: string;
  nameEditable: boolean;
  character: CharacterId;
  taken: CharacterId;
  onNameChange: (name: string) => void;
  onCharacterChange: (id: CharacterId) => void;
}

export function PlayerSetup({
  seat,
  heading,
  name,
  nameEditable,
  character,
  taken,
  onNameChange,
  onCharacterChange,
}: PlayerSetupProps) {
  const inputId = `player-${seat}-name`;
  return (
    <section aria-label={heading} className="flex flex-col items-center gap-3 rounded-3xl bg-card p-5">
      <h2 className="font-display text-xl font-semibold">{heading}</h2>
      {nameEditable ? (
        <>
          <label htmlFor={inputId} className="sr-only">
            {heading} name
          </label>
          <Input
            id={inputId}
            value={name}
            maxLength={MAX_NAME_LENGTH}
            placeholder={DEFAULT_NAMES[seat]}
            autoComplete="off"
            onChange={(event) => onNameChange(event.target.value)}
            className="max-w-56"
          />
        </>
      ) : (
        <p className="flex h-11 items-center font-bold text-muted-foreground">{COMPUTER_NAME}</p>
      )}
      <CharacterPicker
        label={`${heading} character`}
        value={character}
        taken={taken}
        onChange={onCharacterChange}
      />
    </section>
  );
}
