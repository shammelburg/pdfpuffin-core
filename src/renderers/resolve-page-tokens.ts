export function resolvePageTokens(text: string, pageNumber: number, pageCount: number): string {
  return text
    .replaceAll('{{pageNumber}}', String(pageNumber))
    .replaceAll('{{pageCount}}', String(pageCount));
}
