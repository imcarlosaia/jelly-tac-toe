import { describe, expect, it } from 'vitest';
import { EMPTY_SAVED, STORAGE_KEY, loadSaved, parseSaved, saveData } from './storage';
import type { StorageLike } from './storage';
import type { SavedData, SavedGame } from './types';

const memoryStorage = (): StorageLike => {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
  };
};

const validGame: SavedGame = {
  mode: 'two-player',
  difficulty: 'easy',
  players: [
    { name: 'Al', character: 'zest' },
    { name: 'Bo', character: 'luna' },
  ],
  scores: { wins: [2, 1], draws: 3 },
  starter: 1,
};

const withGame = (patch: Record<string, unknown>): string =>
  JSON.stringify({ game: { ...validGame, ...patch }, muted: false });

describe('saveData and loadSaved', () => {
  it('round-trips valid data', () => {
    const storage = memoryStorage();
    const data: SavedData = { game: validGame, muted: true };
    saveData(storage, data);
    expect(loadSaved(storage)).toEqual(data);
  });

  it('writes under the versioned key', () => {
    const storage = memoryStorage();
    saveData(storage, EMPTY_SAVED);
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('returns defaults when nothing is stored or storage is unavailable', () => {
    expect(loadSaved(memoryStorage())).toEqual(EMPTY_SAVED);
    expect(loadSaved(null)).toEqual(EMPTY_SAVED);
  });

  it('never throws when storage itself fails', () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    };
    expect(loadSaved(broken)).toEqual(EMPTY_SAVED);
    expect(() => saveData(broken, EMPTY_SAVED)).not.toThrow();
    expect(() => saveData(null, EMPTY_SAVED)).not.toThrow();
  });
});

describe('parseSaved', () => {
  it('returns defaults for malformed JSON and non-objects', () => {
    expect(parseSaved('{not json')).toEqual(EMPTY_SAVED);
    expect(parseSaved('42')).toEqual(EMPTY_SAVED);
    expect(parseSaved('[]')).toEqual(EMPTY_SAVED);
    expect(parseSaved(null)).toEqual(EMPTY_SAVED);
  });

  it('keeps the sound preference even when the game part is invalid', () => {
    expect(parseSaved(JSON.stringify({ game: 'nope', muted: true }))).toEqual({ game: null, muted: true });
  });

  it('treats a non-boolean sound preference as unmuted', () => {
    expect(parseSaved(JSON.stringify({ game: null, muted: 'yes' })).muted).toBe(false);
  });

  it('rejects an unknown character id', () => {
    const raw = withGame({
      players: [
        { name: 'Al', character: 'dragon' },
        { name: 'Bo', character: 'luna' },
      ],
    });
    expect(parseSaved(raw).game).toBeNull();
  });

  it('rejects duplicate characters', () => {
    const raw = withGame({
      players: [
        { name: 'Al', character: 'zest' },
        { name: 'Bo', character: 'zest' },
      ],
    });
    expect(parseSaved(raw).game).toBeNull();
  });

  it('rejects empty and over-long names', () => {
    const empty = withGame({
      players: [
        { name: '  ', character: 'zest' },
        { name: 'Bo', character: 'luna' },
      ],
    });
    const long = withGame({
      players: [
        { name: 'ABCDEFGHIJKLM', character: 'zest' },
        { name: 'Bo', character: 'luna' },
      ],
    });
    expect(parseSaved(empty).game).toBeNull();
    expect(parseSaved(long).game).toBeNull();
  });

  it('rejects negative, fractional and missing scores', () => {
    expect(parseSaved(withGame({ scores: { wins: [-1, 0], draws: 0 } })).game).toBeNull();
    expect(parseSaved(withGame({ scores: { wins: [1.5, 0], draws: 0 } })).game).toBeNull();
    expect(parseSaved(withGame({ scores: { wins: [1], draws: 0 } })).game).toBeNull();
    expect(parseSaved(withGame({ scores: { wins: [1, 0] } })).game).toBeNull();
  });

  it('rejects unknown mode, difficulty and starter values', () => {
    expect(parseSaved(withGame({ mode: 'online' })).game).toBeNull();
    expect(parseSaved(withGame({ difficulty: 'medium' })).game).toBeNull();
    expect(parseSaved(withGame({ starter: 2 })).game).toBeNull();
  });
});
