import { describe, expect, it } from 'vitest';
import { EMPTY_BOARD } from './game';
import { DEFAULT_PLAYERS, ZERO_SCORES, gameReducer, initialState, normalizeName } from './reducer';
import type { GameState, MatchSettings } from './types';

const start = (over: Partial<MatchSettings> = {}, from: GameState = initialState): GameState =>
  gameReducer(from, {
    type: 'START_MATCH',
    settings: { mode: 'two-player', difficulty: 'easy', players: DEFAULT_PLAYERS, ...over },
  });

const play = (state: GameState, ...indexes: number[]): GameState =>
  indexes.reduce((current, index) => gameReducer(current, { type: 'PLACE', index }), state);

const WIN_FOR_STARTER = [0, 3, 1, 4, 2];
const DRAW = [0, 1, 2, 4, 3, 5, 7, 6, 8];

describe('normalizeName', () => {
  it('trims and keeps a valid name', () => {
    expect(normalizeName('  Al  ', 0, 'two-player')).toBe('Al');
  });

  it('falls back to the seat default when empty', () => {
    expect(normalizeName('   ', 0, 'two-player')).toBe('Player 1');
    expect(normalizeName('', 1, 'two-player')).toBe('Player 2');
  });

  it('cuts names to 12 characters', () => {
    expect(normalizeName('ABCDEFGHIJKLMNOP', 0, 'two-player')).toBe('ABCDEFGHIJKL');
  });

  it('always names the second seat Computer in vs-computer mode', () => {
    expect(normalizeName('Sam', 1, 'vs-computer')).toBe('Computer');
    expect(normalizeName('Sam', 0, 'vs-computer')).toBe('Sam');
  });
});

describe('START_MATCH', () => {
  it('starts a game with player 1 to move on an empty board', () => {
    const state = start();
    expect(state.phase).toBe('playing');
    expect(state.turn).toBe(0);
    expect(state.starter).toBe(0);
    expect(state.board).toEqual(EMPTY_BOARD);
    expect(state.result).toBeNull();
  });

  it('normalizes player names', () => {
    const state = start({
      players: [
        { name: '  Al ', character: 'zest' },
        { name: '', character: 'minty' },
      ],
    });
    expect(state.players[0].name).toBe('Al');
    expect(state.players[1].name).toBe('Player 2');
  });

  it('is ignored when both players pick the same character', () => {
    const state = start({
      players: [
        { name: 'A', character: 'zest' },
        { name: 'B', character: 'zest' },
      ],
    });
    expect(state).toBe(initialState);
  });

  it('keeps scores when the mode is unchanged and resets them when it changes', () => {
    const afterWin = play(start(), ...WIN_FOR_STARTER);
    expect(afterWin.scores.wins).toEqual([1, 0]);

    const sameMode = start({}, gameReducer(afterWin, { type: 'CHANGE_CHARACTERS' }));
    expect(sameMode.scores.wins).toEqual([1, 0]);

    const newMode = start({ mode: 'vs-computer' }, gameReducer(afterWin, { type: 'CHANGE_CHARACTERS' }));
    expect(newMode.scores).toEqual(ZERO_SCORES);
    expect(newMode.players[1].name).toBe('Computer');
  });
});

describe('PLACE', () => {
  it('places a mark and passes the turn', () => {
    const state = play(start(), 4);
    expect(state.board[4]).toBe(0);
    expect(state.turn).toBe(1);
  });

  it('ignores a filled cell', () => {
    const once = play(start(), 4);
    expect(play(once, 4)).toBe(once);
  });

  it('ignores an index outside the board', () => {
    const state = start();
    expect(play(state, 9)).toBe(state);
    expect(play(state, -1)).toBe(state);
    expect(play(state, 1.5)).toBe(state);
  });

  it('is ignored during setup', () => {
    expect(play(initialState, 0)).toBe(initialState);
  });

  it('finishes the game on a win and counts it once', () => {
    const state = play(start(), ...WIN_FOR_STARTER);
    expect(state.phase).toBe('finished');
    expect(state.result).toEqual({ kind: 'win', winner: 0, line: [0, 1, 2] });
    expect(state.scores).toEqual({ wins: [1, 0], draws: 0 });
  });

  it('finishes the game on a draw and counts it once', () => {
    const state = play(start(), ...DRAW);
    expect(state.phase).toBe('finished');
    expect(state.result).toEqual({ kind: 'draw' });
    expect(state.scores).toEqual({ wins: [0, 0], draws: 1 });
  });

  it('is ignored after the game is finished', () => {
    const finished = play(start(), ...WIN_FOR_STARTER);
    expect(play(finished, 8)).toBe(finished);
  });
});

describe('NEW_GAME', () => {
  it('clears the board, keeps scores and alternates the starter', () => {
    const finished = play(start(), ...WIN_FOR_STARTER);
    const second = gameReducer(finished, { type: 'NEW_GAME' });
    expect(second.phase).toBe('playing');
    expect(second.board).toEqual(EMPTY_BOARD);
    expect(second.result).toBeNull();
    expect(second.scores.wins).toEqual([1, 0]);
    expect(second.starter).toBe(1);
    expect(second.turn).toBe(1);

    const third = gameReducer(second, { type: 'NEW_GAME' });
    expect(third.starter).toBe(0);
    expect(third.turn).toBe(0);
  });

  it('is ignored during setup', () => {
    expect(gameReducer(initialState, { type: 'NEW_GAME' })).toBe(initialState);
  });
});

describe('CHANGE_CHARACTERS', () => {
  it('returns to setup, clears the board and keeps scores', () => {
    const finished = play(start(), ...WIN_FOR_STARTER);
    const state = gameReducer(finished, { type: 'CHANGE_CHARACTERS' });
    expect(state.phase).toBe('setup');
    expect(state.board).toEqual(EMPTY_BOARD);
    expect(state.result).toBeNull();
    expect(state.scores.wins).toEqual([1, 0]);
  });
});

describe('RESET_SCORES', () => {
  it('zeroes the scores and starts a fresh game with player 1', () => {
    const second = gameReducer(play(start(), ...WIN_FOR_STARTER), { type: 'NEW_GAME' });
    const midGame = play(second, 4);
    const state = gameReducer(midGame, { type: 'RESET_SCORES' });
    expect(state.scores).toEqual(ZERO_SCORES);
    expect(state.phase).toBe('playing');
    expect(state.board).toEqual(EMPTY_BOARD);
    expect(state.starter).toBe(0);
    expect(state.turn).toBe(0);
  });
});

describe('HYDRATE', () => {
  it('applies saved settings and lands on an empty board in play', () => {
    const state = gameReducer(initialState, {
      type: 'HYDRATE',
      saved: {
        mode: 'vs-computer',
        difficulty: 'hard',
        players: [
          { name: 'Al', character: 'luna' },
          { name: 'Computer', character: 'drip' },
        ],
        scores: { wins: [3, 1], draws: 2 },
        starter: 1,
      },
    });
    expect(state.phase).toBe('playing');
    expect(state.mode).toBe('vs-computer');
    expect(state.difficulty).toBe('hard');
    expect(state.players[0]).toEqual({ name: 'Al', character: 'luna' });
    expect(state.scores).toEqual({ wins: [3, 1], draws: 2 });
    expect(state.starter).toBe(1);
    expect(state.turn).toBe(1);
    expect(state.board).toEqual(EMPTY_BOARD);
  });
});
