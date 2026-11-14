import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-full border border-input bg-background px-4 text-center font-bold text-foreground',
        'placeholder:font-normal placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  );
}
