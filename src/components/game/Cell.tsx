'use client';

import type { CSSProperties } from 'react';
import { getCharacter } from '@/lib/characters';
import type { CharacterId, Mood, Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Character } from './Character';

interface CellProps {
  index: number;
  player: Player | null;
  ghost: CharacterId;
  mood: Mood;
  winOrder: number;
  locked: boolean;
  onSelect: () => void;
}

function pieceAnimation(winning: boolean, mood: Mood): string {
  if (winning) return 'jelly-jump';
  if (mood === 'sad') return 'jelly-sag';
  if (mood === 'shrug') return 'jelly-wobble';
  return 'jelly-in';
}

export function Cell({ index, player, ghost, mood, winOrder, locked, onSelect }: CellProps) {
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  const playable = player === null && !locked;
  const winning = winOrder >= 0;
  const content = player === null ? 'empty' : `${getCharacter(player.character).name}, ${player.name}`;

  return (
    <button
      type="button"
      aria-label={`Row ${row}, column ${column}, ${content}`}
      aria-disabled={!playable}
      onClick={() => {
        if (playable) onSelect();
      }}
      className={cn(
        'group flex aspect-square items-center justify-center rounded-2xl bg-cell transition-colors',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring',
        playable ? 'cursor-pointer hover:bg-cell-hover' : 'cursor-default',
        winning && 'ring-4 ring-white',
      )}
    >
      {player !== null && (
        <Character
          id={player.character}
          mood={mood}
          seed={index}
          className={cn('h-3/4 w-3/4', pieceAnimation(winning, mood))}
          style={winning ? ({ '--jelly-delay': `${winOrder * 120}ms` } as CSSProperties) : undefined}
        />
      )}
      {playable && (
        <Character
          id={ghost}
          className="h-3/4 w-3/4 opacity-0 transition-opacity group-hover:opacity-25 group-focus-visible:opacity-25"
        />
      )}
    </button>
  );
}
