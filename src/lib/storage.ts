import { isCharacterId } from './characters';
import { MAX_NAME_LENGTH } from './reducer';
import type { Player, SavedData, SavedGame } from './types';

export const STORAGE_KEY = 'jelly-tac-toe:v1';
export const EMPTY_SAVED: SavedData = { game: null, muted: false };

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function parsePlayer(value: unknown): Player | null {
  if (!isRecord(value)) return null;
  const { name, character } = value;
  if (typeof name !== 'string' || !isCharacterId(character)) return null;
  const trimmed = name.trim();
  if (trimmed === '' || trimmed.length > MAX_NAME_LENGTH) return null;
  return { name: trimmed, character };
}

function parseGame(value: unknown): SavedGame | null {
  if (!isRecord(value)) return null;
  const { mode, difficulty, players, scores, starter } = value;

  if (mode !== 'two-player' && mode !== 'vs-computer') return null;
  if (difficulty !== 'easy' && difficulty !== 'hard') return null;
  if (starter !== 0 && starter !== 1) return null;

  if (!Array.isArray(players) || players.length !== 2) return null;
  const first = parsePlayer(players[0]);
  const second = parsePlayer(players[1]);
  if (!first || !second || first.character === second.character) return null;

  if (!isRecord(scores)) return null;
  const { wins, draws } = scores;
  if (!Array.isArray(wins) || wins.length !== 2) return null;
  const [winsFirst, winsSecond]: unknown[] = wins;
  if (!isCount(winsFirst) || !isCount(winsSecond) || !isCount(draws)) return null;

  return {
    mode,
    difficulty,
    players: [first, second],
    scores: { wins: [winsFirst, winsSecond], draws },
    starter,
  };
}

export function parseSaved(raw: string | null): SavedData {
  if (raw === null) return EMPTY_SAVED;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return EMPTY_SAVED;
    return { game: parseGame(data.game), muted: data.muted === true };
  } catch {
    return EMPTY_SAVED;
  }
}

export function loadSaved(storage: StorageLike | null): SavedData {
  if (!storage) return EMPTY_SAVED;
  try {
    return parseSaved(storage.getItem(STORAGE_KEY));
  } catch {
    return EMPTY_SAVED;
  }
}

export function saveData(storage: StorageLike | null, data: SavedData): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage is full or blocked: the game carries on without saving.
  }
}

export function getBrowserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
