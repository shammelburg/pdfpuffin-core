export function resolveFont(font: string | undefined, bold: boolean, fallback = 'Helvetica'): string {
  const selected = font ?? fallback;
  if (!bold || selected.includes('Bold')) return selected;
  if (selected === 'Helvetica') return 'Helvetica-Bold';
  if (selected === 'Courier') return 'Courier-Bold';
  if (selected === 'Times-Roman') return 'Times-Bold';
  if (selected === 'Times-Italic') return 'Times-BoldItalic';
  return selected;
}
