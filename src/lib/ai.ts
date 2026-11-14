import { emptyCells, evaluate, otherPlayer, placeMark } from './game';
import type { Board, Difficulty, PlayerIndex } from './types';

export type Rng = () => number;

const scoreCache = new Map<string, number>();

function pick(cells: readonly number[], rng: Rng): number {
  return cells[Math.min(cells.length - 1, Math.floor(rng() * cells.length))];
}

function winningMove(board: Board, player: PlayerIndex): number | null {
  for (const index of emptyCells(board)) {
    const result = evaluate(placeMark(board, index, player));
    if (result?.kind === 'win') return index;
  }
  return null;
}

// Score of a position for the player about to move. Positive means that player
// can force a win, negative a loss, zero a draw. Faster wins score higher.
function score(board: Board, toMove: PlayerIndex): number {
  const key = `${board.map((cell) => cell ?? '-').join('')}${toMove}`;
  const cached = scoreCache.get(key);
  if (cached !== undefined) return cached;

  const result = evaluate(board);
  let value: number;
  if (result) {
    // A finished win always belongs to the player who just moved, never to toMove.
    value = result.kind === 'draw' ? 0 : -(emptyCells(board).length + 1);
  } else {
    value = -Infinity;
    for (const index of emptyCells(board)) {
      value = Math.max(value, -score(placeMark(board, index, toMove), otherPlayer(toMove)));
    }
  }
  scoreCache.set(key, value);
  return value;
}

function hardMove(board: Board, player: PlayerIndex, rng: Rng): number {
  const opponent = otherPlayer(player);
  let best = -Infinity;
  let candidates: number[] = [];
  for (const index of emptyCells(board)) {
    const value = -score(placeMark(board, index, player), opponent);
    if (value > best) {
      best = value;
      candidates = [index];
    } else if (value === best) {
      candidates.push(index);
    }
  }
  return pick(candidates, rng);
}

function easyMove(board: Board, player: PlayerIndex, rng: Rng): number {
  const win = winningMove(board, player);
  if (win !== null) return win;
  const block = winningMove(board, otherPlayer(player));
  if (block !== null && rng() < 0.5) return block;
  return pick(emptyCells(board), rng);
}

export function chooseMove(
  board: Board,
  player: PlayerIndex,
  difficulty: Difficulty,
  rng: Rng = Math.random,
): number {
  return difficulty === 'hard' ? hardMove(board, player, rng) : easyMove(board, player, rng);
}
