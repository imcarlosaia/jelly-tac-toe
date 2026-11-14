'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface ControlsProps {
  finished: boolean;
  onNewGame: () => void;
  onChangeCharacters: () => void;
  onResetScores: () => void;
}

export function Controls({ finished, onNewGame, onChangeCharacters, onResetScores }: ControlsProps) {
  const newGameRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (finished) newGameRef.current?.focus();
  }, [finished]);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Button ref={newGameRef} variant={finished ? 'primary' : 'secondary'} onClick={onNewGame}>
        New game
      </Button>
      <Button variant="secondary" onClick={onChangeCharacters}>
        Change characters
      </Button>
      <Button variant="ghost" onClick={onResetScores}>
        Reset scores
      </Button>
    </div>
  );
}
