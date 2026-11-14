import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg' | 'icon';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:brightness-110',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
  ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
};

const SIZES: Record<Size, string> = {
  md: 'min-h-11 px-6',
  lg: 'min-h-12 px-10 text-base',
  icon: 'h-11 w-11',
};

export function Button({ variant = 'primary', size = 'md', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-full font-bold transition',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring active:scale-[0.97]',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
