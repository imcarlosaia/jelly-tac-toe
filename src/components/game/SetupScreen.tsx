'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DEFAULT_NAMES } from '@/lib/reducer';
import type { CharacterId, Difficulty, MatchSettings, Mode } from '@/lib/types';
import { PlayerSetup } from './PlayerSetup';
import { SegmentedControl } from './SegmentedControl';

const MODES: readonly { value: Mode; label: string }[] = [
  { value: 'two-player', label: '2 players' },
  { value: 'vs-computer', label: 'vs computer' },
];

const DIFFICULTIES: readonly { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'hard', label: 'Hard' },
];

interface SetupScreenProps {
  initial: MatchSettings;
  onStart: (settings: MatchSettings) => void;
}

export function SetupScreen({ initial, onStart }: SetupScreenProps) {
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [names, setNames] = useState<readonly [string, string]>([
    initial.players[0].name,
    initial.mode === 'vs-computer' ? DEFAULT_NAMES[1] : initial.players[1].name,
  ]);
  const [characters, setCharacters] = useState<readonly [CharacterId, CharacterId]>([
    initial.players[0].character,
    initial.players[1].character,
  ]);

  const vsComputer = mode === 'vs-computer';

  const start = () =>
    onStart({
      mode,
      difficulty,
      players: [
        { name: names[0], character: characters[0] },
        { name: names[1], character: characters[1] },
      ],
    });

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5">
      <SegmentedControl label="Game mode" options={MODES} value={mode} onChange={setMode} />
      {vsComputer && (
        <SegmentedControl label="Difficulty" options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
      )}
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <PlayerSetup
          seat={0}
          heading="Player 1"
          name={names[0]}
          nameEditable
          character={characters[0]}
          taken={characters[1]}
          onNameChange={(name) => setNames([name, names[1]])}
          onCharacterChange={(id) => setCharacters([id, characters[1]])}
        />
        <PlayerSetup
          seat={1}
          heading={vsComputer ? 'Computer' : 'Player 2'}
          name={names[1]}
          nameEditable={!vsComputer}
          character={characters[1]}
          taken={characters[0]}
          onNameChange={(name) => setNames([names[0], name])}
          onCharacterChange={(id) => setCharacters([characters[0], id])}
        />
      </div>
      <Button size="lg" onClick={start}>
        Start game
      </Button>
    </div>
  );
}
