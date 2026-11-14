import { EMPTY_BOARD, evaluate, otherPlayer, placeMark } from './game';
import type { GameAction, GameState, Mode, Player, PlayerIndex, Scores } from './types';

export const MAX_NAME_LENGTH = 12;
export const COMPUTER_NAME = 'Computer';
export const DEFAULT_NAMES = ['Player 1', 'Player 2'] as const;

export const DEFAULT_PLAYERS: readonly [Player, Player] = [
  { name: DEFAULT_NAMES[0], character: 'zest' },
  { name: DEFAULT_NAMES[1], character: 'minty' },
];

export const ZERO_SCORES: Scores = { wins: [0, 0], draws: 0 };

export const initialState: GameState = {
  phase: 'setup',
  mode: 'two-player',
  difficulty: 'easy',
  players: DEFAULT_PLAYERS,
  board: EMPTY_BOARD,
  starter: 0,
  turn: 0,
  result: null,
  scores: ZERO_SCORES,
};

export function normalizeName(raw: string, seat: PlayerIndex, mode: Mode): string {
  if (mode === 'vs-computer' && seat === 1) return COMPUTER_NAME;
  const name = raw.trim().slice(0, MAX_NAME_LENGTH).trim();
  return name === '' ? DEFAULT_NAMES[seat] : name;
}

function freshGame(state: GameState, starter: PlayerIndex): GameState {
  return { ...state, phase: 'playing', board: EMPTY_BOARD, starter, turn: starter, result: null };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_MATCH': {
      const { mode, difficulty, players } = action.settings;
      if (players[0].character === players[1].character) return state;
      const normalized: readonly [Player, Player] = [
        { name: normalizeName(players[0].name, 0, mode), character: players[0].character },
        { name: normalizeName(players[1].name, 1, mode), character: players[1].character },
      ];
      const scores = mode === state.mode ? state.scores : ZERO_SCORES;
      return freshGame({ ...state, mode, difficulty, players: normalized, scores }, 0);
    }

    case 'PLACE': {
      const { index } = action;
      if (state.phase !== 'playing') return state;
      if (!Number.isInteger(index) || index < 0 || index > 8) return state;
      if (state.board[index] !== null) return state;

      const board = placeMark(state.board, index, state.turn);
      const result = evaluate(board);
      if (!result) return { ...state, board, turn: otherPlayer(state.turn) };

      const [first, second] = state.scores.wins;
      const scores: Scores =
        result.kind === 'draw'
          ? { ...state.scores, draws: state.scores.draws + 1 }
          : { ...state.scores, wins: result.winner === 0 ? [first + 1, second] : [first, second + 1] };
      return { ...state, board, result, scores, phase: 'finished' };
    }

    case 'NEW_GAME':
      if (state.phase === 'setup') return state;
      return freshGame(state, otherPlayer(state.starter));

    case 'CHANGE_CHARACTERS':
      return { ...state, phase: 'setup', board: EMPTY_BOARD, result: null };

    case 'RESET_SCORES':
      if (state.phase === 'setup') return { ...state, scores: ZERO_SCORES };
      return freshGame({ ...state, scores: ZERO_SCORES }, 0);

    case 'HYDRATE': {
      const { mode, difficulty, players, scores, starter } = action.saved;
      return freshGame({ ...state, mode, difficulty, players, scores }, starter);
    }
  }
}
