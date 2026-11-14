import { describe, expect, it } from 'vitest';
import { chooseMove } from './ai';
import type { Rng } from './ai';
import { EMPTY_BOARD, emptyCells, evaluate, otherPlayer, placeMark } from './game';
import type { Board, Cell, PlayerIndex } from './types';

const board = (cells: string): Board =>
  [...cells].map((ch): Cell => (ch === '0' ? 0 : ch === '1' ? 1 : null));

const RNGS: readonly Rng[] = [() => 0, () => 0.5, () => 0.99];

function assertNeverLoses(current: Board, toMove: PlayerIndex, computer: PlayerIndex, rng: Rng): void {
  const result = evaluate(current);
  if (result) {
    if (result.kind === 'win') expect(result.winner).toBe(computer);
    return;
  }
  if (toMove === computer) {
    const move = chooseMove(current, computer, 'hard', rng);
    assertNeverLoses(placeMark(current, move, computer), otherPlayer(toMove), computer, rng);
    return;
  }
  for (const index of emptyCells(current)) {
    assertNeverLoses(placeMark(current, index, toMove), otherPlayer(toMove), computer, rng);
  }
}

describe('hard', () => {
  it.each(RNGS.map((rng, i) => [i, rng] as const))(
    'never loses against any opponent when moving second (rng %i)',
    (_i, rng) => {
      assertNeverLoses(EMPTY_BOARD, 0, 1, rng);
    },
  );

  it.each(RNGS.map((rng, i) => [i, rng] as const))(
    'never loses against any opponent when moving first (rng %i)',
    (_i, rng) => {
      assertNeverLoses(EMPTY_BOARD, 1, 1, rng);
    },
  );

  it('takes an immediate win over a block', () => {
    for (const rng of RNGS) expect(chooseMove(board('11-00----'), 1, 'hard', rng)).toBe(2);
  });

  it('blocks an immediate threat', () => {
    for (const rng of RNGS) expect(chooseMove(board('00--1----'), 1, 'hard', rng)).toBe(2);
  });
});

describe('easy', () => {
  it('takes an immediate win', () => {
    for (const rng of RNGS) expect(chooseMove(board('11-00----'), 1, 'easy', rng)).toBe(2);
  });

  it('blocks a threat when the roll is below one half', () => {
    expect(chooseMove(board('00--1----'), 1, 'easy', () => 0)).toBe(2);
  });
});

describe('both levels', () => {
  it('only ever return an empty cell', () => {
    const current = board('01-0-1---');
    const empty = emptyCells(current);
    for (const difficulty of ['easy', 'hard'] as const) {
      for (const rng of RNGS) {
        expect(empty).toContain(chooseMove(current, 1, difficulty, rng));
      }
    }
  });
});
