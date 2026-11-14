export async function fireConfetti(colors: string[]): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const { default: confetti } = await import('canvas-confetti');
  void confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors });
  window.setTimeout(() => {
    void confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
  }, 200);
  window.setTimeout(() => {
    void confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
  }, 350);
}
