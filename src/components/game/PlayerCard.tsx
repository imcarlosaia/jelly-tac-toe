import type { Mood, Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Character } from './Character';

interface PlayerCardProps {
  player: Player;
  wins: number;
  mood: Mood;
  highlighted: boolean;
  dimmed: boolean;
  className?: string;
}

export function PlayerCard({ player, wins, mood, highlighted, dimmed, className }: PlayerCardProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col items-center rounded-2xl bg-card px-3 py-3 text-center transition-opacity md:py-5',
        highlighted && 'ring-4 ring-white',
        dimmed && 'opacity-60',
        className,
      )}
    >
      <Character
        id={player.character}
        mood={mood}
        className={cn('h-12 w-12 md:h-16 md:w-16', highlighted && 'jelly-bob')}
      />
      <p className="mt-2 max-w-full truncate font-bold">{player.name}</p>
      <p className="font-display text-3xl font-semibold leading-tight">{wins}</p>
      <p className="text-xs text-muted-foreground">{wins === 1 ? 'win' : 'wins'}</p>
    </div>
  );
}
