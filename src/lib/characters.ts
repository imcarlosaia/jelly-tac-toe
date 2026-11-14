import type { CharacterId } from './types';

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  color: string;
}

export const CHARACTERS: readonly CharacterInfo[] = [
  { id: 'zest', name: 'Zest', color: '#FF7A45' },
  { id: 'minty', name: 'Minty', color: '#2ED3B0' },
  { id: 'twinkle', name: 'Twinkle', color: '#FFC93C' },
  { id: 'puff', name: 'Puff', color: '#B69CFF' },
  { id: 'drip', name: 'Drip', color: '#4DA3FF' },
  { id: 'luna', name: 'Luna', color: '#FF7EB6' },
];

export function isCharacterId(value: unknown): value is CharacterId {
  return CHARACTERS.some((character) => character.id === value);
}

export function getCharacter(id: CharacterId): CharacterInfo {
  const found = CHARACTERS.find((character) => character.id === id);
  if (!found) throw new Error(`Unknown character: ${id}`);
  return found;
}
