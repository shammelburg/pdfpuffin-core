export function withHorizontalMargins<T>(
  doc: PDFKit.PDFDocument,
  marginLeft: number | undefined,
  marginRight: number | undefined,
  render: () => T,
): T {
  const originalLeft = doc.page.margins.left;
  const originalRight = doc.page.margins.right;
  const left = Math.max(0, marginLeft ?? 0);
  const right = Math.max(0, marginRight ?? 0);
  doc.page.margins.left = originalLeft + left;
  doc.page.margins.right = originalRight + right;
  doc.x = doc.page.margins.left;
  try {
    return render();
  } finally {
    doc.page.margins.left = originalLeft;
    doc.page.margins.right = originalRight;
    doc.x = originalLeft;
  }
}
