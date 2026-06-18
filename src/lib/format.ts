// Compact a star count for display: 1200 -> "1.2k", 999 -> "999".
export function formatStars(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  // One decimal, but drop a trailing ".0" (e.g. 2000 -> "2k", 1200 -> "1.2k").
  return `${k.toFixed(1).replace(/\.0$/, "")}k`;
}
