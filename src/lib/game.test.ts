import { describe, expect, it } from 'vitest';
import { EMPTY_BOARD, LINES, emptyCells, evaluate, moodFor, otherPlayer, placeMark } from './game';
import type { Board, Cell } from './types';

const board = (cells: string): Board =>
  [...cells].map((ch): Cell => (ch === '0' ? 0 : ch === '1' ? 1 : null));

describe('board helpers', () => {
  it('starts with nine empty cells', () => {
    expect(EMPTY_BOARD).toHaveLength(9);
    expect(emptyCells(EMPTY_BOARD)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('places a mark without changing the original board', () => {
    const next = placeMark(EMPTY_BOARD, 4, 1);
    expect(next[4]).toBe(1);
    expect(EMPTY_BOARD[4]).toBeNull();
    expect(emptyCells(next)).toEqual([0, 1, 2, 3, 5, 6, 7, 8]);
  });

  it('swaps players', () => {
    expect(otherPlayer(0)).toBe(1);
    expect(otherPlayer(1)).toBe(0);
  });
});

describe('evaluate', () => {
  it('has eight winning lines', () => {
    expect(LINES).toHaveLength(8);
  });

  it('returns null for an empty board', () => {
    expect(evaluate(EMPTY_BOARD)).toBeNull();
  });

  it.each([0, 1] as const)('detects a win on every line for player %i', (player) => {
    for (const line of LINES) {
      let current: Board = EMPTY_BOARD;
      for (const index of line) current = placeMark(current, index, player);
      expect(evaluate(current)).toEqual({ kind: 'win', winner: player, line });
    }
  });

  it('returns null while the game is undecided', () => {
    expect(evaluate(board('01-10----'))).toBeNull();
  });

  it('reports a draw on a full board with no line', () => {
    expect(evaluate(board('010011100'))).toEqual({ kind: 'draw' });
  });

  it('reports a win, not a draw, when the board is full and a line exists', () => {
    expect(evaluate(board('000110101'))).toEqual({ kind: 'win', winner: 0, line: [0, 1, 2] });
  });

  it('reports the first line in fixed order when two lines complete at once', () => {
    expect(evaluate(board('000011011'))).toEqual({ kind: 'win', winner: 0, line: [0, 1, 2] });
  });
});

describe('moodFor', () => {
  it('is idle while the game is undecided', () => {
    expect(moodFor(0, null)).toBe('idle');
  });

  it('is happy for the winner and sad for the loser', () => {
    const result = { kind: 'win', winner: 1, line: [0, 1, 2] } as const;
    expect(moodFor(1, result)).toBe('happy');
    expect(moodFor(0, result)).toBe('sad');
  });

  it('is a shrug for both players on a draw', () => {
    expect(moodFor(0, { kind: 'draw' })).toBe('shrug');
    expect(moodFor(1, { kind: 'draw' })).toBe('shrug');
  });
});
