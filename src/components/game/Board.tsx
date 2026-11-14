'use client';

import { moodFor } from '@/lib/game';
import type { Board as BoardCells, Player, PlayerIndex, Result } from '@/lib/types';
import { Cell } from './Cell';

interface BoardProps {
  board: BoardCells;
  players: readonly [Player, Player];
  turn: PlayerIndex;
  result: Result | null;
  locked: boolean;
  onSelect: (index: number) => void;
}

export function Board({ board, players, turn, result, locked, onSelect }: BoardProps) {
  const winLine = result?.kind === 'win' ? result.line : null;

  return (
    <div role="group" aria-label="Game board" className="grid aspect-square w-full grid-cols-3 gap-2 rounded-3xl bg-card p-2">
      {board.map((owner, index) => (
        <Cell
          key={index}
          index={index}
          player={owner === null ? null : players[owner]}
          ghost={players[turn].character}
          mood={owner === null ? 'idle' : moodFor(owner, result)}
          winOrder={winLine ? winLine.indexOf(index) : -1}
          locked={locked || result !== null}
          onSelect={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
