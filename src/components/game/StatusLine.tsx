interface StatusLineProps {
  text: string;
  color?: string;
}

export function StatusLine({ text, color }: StatusLineProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="flex min-h-10 items-center justify-center text-center font-display text-2xl font-semibold"
      style={color ? { color } : undefined}
    >
      {text}
    </p>
  );
}
