export type CharacterId = 'zest' | 'minty' | 'twinkle' | 'puff' | 'drip' | 'luna';
export type PlayerIndex = 0 | 1;
export type Cell = PlayerIndex | null;
export type Board = readonly Cell[];
export type Mode = 'two-player' | 'vs-computer';
export type Difficulty = 'easy' | 'hard';
export type Phase = 'setup' | 'playing' | 'finished';
export type Line = readonly [number, number, number];
export type Mood = 'idle' | 'happy' | 'sad' | 'shrug';

export type Result =
  | { kind: 'win'; winner: PlayerIndex; line: Line }
  | { kind: 'draw' };

export interface Player {
  name: string;
  character: CharacterId;
}

export interface Scores {
  wins: readonly [number, number];
  draws: number;
}

export interface GameState {
  phase: Phase;
  mode: Mode;
  difficulty: Difficulty;
  players: readonly [Player, Player];
  board: Board;
  starter: PlayerIndex;
  turn: PlayerIndex;
  result: Result | null;
  scores: Scores;
}

export interface MatchSettings {
  mode: Mode;
  difficulty: Difficulty;
  players: readonly [Player, Player];
}

export interface SavedGame {
  mode: Mode;
  difficulty: Difficulty;
  players: readonly [Player, Player];
  scores: Scores;
  starter: PlayerIndex;
}

export interface SavedData {
  game: SavedGame | null;
  muted: boolean;
}

export type GameAction =
  | { type: 'START_MATCH'; settings: MatchSettings }
  | { type: 'PLACE'; index: number }
  | { type: 'NEW_GAME' }
  | { type: 'CHANGE_CHARACTERS' }
  | { type: 'RESET_SCORES' }
  | { type: 'HYDRATE'; saved: SavedGame };
