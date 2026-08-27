export function resolveWidth(width: number | string | undefined, total: number, fallback: number): number {
  if (typeof width === 'number') return width;
  if (typeof width === 'string' && width.endsWith('%')) {
    const percentage = Number.parseFloat(width);
    if (Number.isFinite(percentage)) return total * (percentage / 100);
  }
  return fallback;
}
