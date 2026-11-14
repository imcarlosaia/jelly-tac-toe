import type { Board, Cell, Line, Mood, PlayerIndex, Result } from './types';

export const LINES: readonly Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const EMPTY_BOARD: Board = Object.freeze(Array<Cell>(9).fill(null));

export function otherPlayer(player: PlayerIndex): PlayerIndex {
  return player === 0 ? 1 : 0;
}

export function emptyCells(board: Board): number[] {
  const cells: number[] = [];
  board.forEach((cell, index) => {
    if (cell === null) cells.push(index);
  });
  return cells;
}

export function placeMark(board: Board, index: number, player: PlayerIndex): Board {
  const next = [...board];
  next[index] = player;
  return next;
}

export function evaluate(board: Board): Result | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    const owner = board[a];
    if (owner !== null && owner === board[b] && owner === board[c]) {
      return { kind: 'win', winner: owner, line };
    }
  }
  return board.every((cell) => cell !== null) ? { kind: 'draw' } : null;
}

export function moodFor(player: PlayerIndex, result: Result | null): Mood {
  if (!result) return 'idle';
  if (result.kind === 'draw') return 'shrug';
  return result.winner === player ? 'happy' : 'sad';
}
