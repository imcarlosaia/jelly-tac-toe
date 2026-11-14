'use client';

import { useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { chooseMove } from '@/lib/ai';
import { getCharacter } from '@/lib/characters';
import { fireConfetti } from '@/lib/confetti';
import { moodFor, otherPlayer } from '@/lib/game';
import { gameReducer, initialState } from '@/lib/reducer';
import { isSoundSupported, playSound, type SoundName } from '@/lib/sound';
import { getBrowserStorage, loadSaved, saveData } from '@/lib/storage';
import type { GameState, PlayerIndex, SavedGame } from '@/lib/types';
import { Board } from './Board';
import { Controls } from './Controls';
import { Logo } from './Logo';
import { PlayerCard } from './PlayerCard';
import { SetupScreen } from './SetupScreen';
import { SoundToggle } from './SoundToggle';
import { StatusLine } from './StatusLine';

const COMPUTER_DELAY_MS = 500;
const HEADER = 'flex items-center justify-between py-4';

const subscribeToNothing = () => () => {};

function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

function loadInitialState(): GameState {
  const { game } = loadSaved(getBrowserStorage());
  return game ? gameReducer(initialState, { type: 'HYDRATE', saved: game }) : initialState;
}

function statusFor(state: GameState, computerThinking: boolean): { text: string; color?: string } {
  const { result, players, turn } = state;
  if (result?.kind === 'win') {
    const winner = players[result.winner];
    return { text: `${winner.name} wins`, color: getCharacter(winner.character).color };
  }
  if (result?.kind === 'draw') return { text: "It's a draw" };
  if (computerThinking) return { text: 'Computer is thinking…' };
  return { text: `${players[turn].name}'s turn` };
}

export function Game() {
  const hydrated = useHydrated();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 pb-10">
      {hydrated ? (
        <GameClient />
      ) : (
        <header className={HEADER}>
          <Logo />
          <span className="h-11 w-11" />
        </header>
      )}
    </div>
  );
}

function GameClient() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadInitialState);
  const [muted, setMuted] = useState(() => loadSaved(getBrowserStorage()).muted);
  const [soundSupported] = useState(isSoundSupported);

  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const play = useCallback((name: SoundName) => {
    if (!mutedRef.current) playSound(name);
  }, []);

  const { phase, mode, difficulty, players, board, starter, turn, result, scores } = state;
  const finished = phase === 'finished';
  const computerThinking = mode === 'vs-computer' && phase === 'playing' && turn === 1;
  const marks = board.filter((cell) => cell !== null).length;

  // Save settings and scores. During setup, keep whatever match was saved before.
  useEffect(() => {
    const storage = getBrowserStorage();
    const game: SavedGame | null =
      phase === 'setup' ? loadSaved(storage).game : { mode, difficulty, players, scores, starter };
    saveData(storage, { game, muted });
  }, [phase, mode, difficulty, players, scores, starter, muted]);

  // The computer moves after a short pause. Cleanup cancels a pending move
  // whenever the board changes or the game is restarted.
  useEffect(() => {
    if (!computerThinking) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'PLACE', index: chooseMove(board, 1, difficulty) });
    }, COMPUTER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [computerThinking, board, difficulty]);

  // A pop for every mark that does not end the game. The player who just moved
  // is the one whose turn it no longer is.
  useEffect(() => {
    if (marks === 0 || result) return;
    play(otherPlayer(turn) === 0 ? 'place0' : 'place1');
  }, [marks, result, turn, play]);

  useEffect(() => {
    if (!result) return;
    if (result.kind === 'draw') {
      play('draw');
      return;
    }
    play('win');
    void fireConfetti([getCharacter(players[result.winner].character).color, '#FFFFFF']);
  }, [result, players, play]);

  const selectCell = (index: number) => {
    if (!computerThinking) dispatch({ type: 'PLACE', index });
  };

  const winner = result?.kind === 'win' ? result.winner : null;
  const cardState = (seat: PlayerIndex) => ({
    highlighted: finished ? winner === seat : turn === seat,
    dimmed: finished ? winner !== null && winner !== seat : turn !== seat,
  });
  const status = statusFor(state, computerThinking);

  return (
    <>
      <header className={HEADER}>
        <Logo />
        {soundSupported ? (
          <SoundToggle muted={muted} onToggle={() => setMuted((value) => !value)} />
        ) : (
          <span className="h-11 w-11" />
        )}
      </header>

      <main
        key={phase === 'setup' ? 'setup' : 'play'}
        className="jelly-rise flex flex-1 flex-col items-center justify-center"
      >
        {phase === 'setup' ? (
          <SetupScreen
            initial={{ mode, difficulty, players }}
            onStart={(settings) => dispatch({ type: 'START_MATCH', settings })}
          />
        ) : (
          <>
            <div className="grid w-full max-w-[420px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 md:max-w-none md:grid-cols-[160px_minmax(0,420px)_160px] md:items-center md:justify-center md:gap-6">
              <PlayerCard
                player={players[0]}
                wins={scores.wins[0]}
                mood={moodFor(0, result)}
                {...cardState(0)}
                className="md:col-start-1 md:row-start-1"
              />
              <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-4 text-center md:hidden">
                <p className="font-display text-3xl font-semibold leading-tight">{scores.draws}</p>
                <p className="text-xs text-muted-foreground">{scores.draws === 1 ? 'draw' : 'draws'}</p>
              </div>
              <PlayerCard
                player={players[1]}
                wins={scores.wins[1]}
                mood={moodFor(1, result)}
                {...cardState(1)}
                className="md:col-start-3 md:row-start-1"
              />
              <div className="col-span-3 md:col-span-1 md:col-start-2 md:row-start-1">
                <StatusLine text={status.text} color={status.color} />
                <div className="mt-3">
                  <Board
                    board={board}
                    players={players}
                    turn={turn}
                    result={result}
                    locked={computerThinking}
                    onSelect={selectCell}
                  />
                </div>
                <p className="mt-3 hidden text-center text-sm text-muted-foreground md:block">
                  Draws: {scores.draws}
                </p>
              </div>
            </div>
            <Controls
              finished={finished}
              onNewGame={() => dispatch({ type: 'NEW_GAME' })}
              onChangeCharacters={() => dispatch({ type: 'CHANGE_CHARACTERS' })}
              onResetScores={() => dispatch({ type: 'RESET_SCORES' })}
            />
          </>
        )}
      </main>
    </>
  );
}
