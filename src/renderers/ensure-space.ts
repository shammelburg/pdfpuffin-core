export function ensureSpace(doc: PDFKit.PDFDocument, y: number, height: number): number {
  if (y + height <= doc.page.height - doc.page.margins.bottom) return y;
  doc.addPage();
  return doc.page.margins.top;
}
