import { DocumentElement } from '../models/document-definition.js';
import { estimateElementHeight } from './estimate-element-height.js';

export function renderElementBackground(doc: PDFKit.PDFDocument, element: DocumentElement): void {
  if (!element.backgroundColor || element.type === 'region' || element.type === 'repeater') return;
  const top = 'marginTop' in element ? element.marginTop ?? 0 : 0;
  const bottom = 'marginBottom' in element ? element.marginBottom ?? 0 : 0;
  const width = Math.max(1, doc.page.width - doc.page.margins.left - doc.page.margins.right);
  const height = top + estimateElementHeight(doc, element, width) + bottom;
  if (height <= 0) return;
  const x = doc.page.margins.left;
  const y = doc.y;
  doc.save().fillColor(element.backgroundColor).rect(x, y, width, height).fill().restore();
}
