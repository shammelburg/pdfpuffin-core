import { GraphicElement } from '../models/graphic-element.js';
import { resolveWidth } from './resolve-width.js';
import { withHorizontalMargins } from './with-horizontal-margins.js';
export function renderGraphic(doc: PDFKit.PDFDocument, graphic: GraphicElement): void {
  withHorizontalMargins(doc, graphic.marginLeft, graphic.marginRight, () => {
  const available = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const width = graphic.type === 'circle' ? (graphic.radius ?? 40) * 2 : resolveWidth(graphic.width ?? (graphic.type === 'line' ? '100%' : 100), available, available);
  const height = graphic.type === 'circle' ? (graphic.radius ?? 40) * 2 : Math.max(graphic.height ?? (graphic.type === 'line' ? 1 : 60), 1);
  if (doc.y + (graphic.marginTop ?? 0) + height > doc.page.height - doc.page.margins.bottom) doc.addPage();
  doc.y += graphic.marginTop ?? 0;
  const x = graphic.align === 'center' ? doc.page.margins.left + (available - width) / 2
    : graphic.align === 'right' ? doc.page.width - doc.page.margins.right - width : doc.page.margins.left;
  const y = doc.y;
  doc.save().lineWidth(graphic.lineWidth ?? 1).opacity(graphic.opacity ?? 1);
  if (graphic.dash) doc.dash(graphic.dash, { space: graphic.dashSpace ?? graphic.dash });
  switch (graphic.type) {
    case 'rectangle': doc.rect(x, y, width, height); break;
    case 'roundedRectangle': doc.roundedRect(x, y, width, height, graphic.radius ?? 8); break;
    case 'ellipse': doc.ellipse(x + width / 2, y + height / 2, width / 2, height / 2); break;
    case 'circle': doc.circle(x + width / 2, y + height / 2, graphic.radius ?? 40); break;
    case 'line': doc.moveTo(x, y).lineTo(x + width, y + (graphic.height ?? 0)); break;
    case 'path': doc.translate(x, y).scale(width / 120, height / 70).path(graphic.path ?? 'M 0 0 L 100 0'); break;
  }
  if (graphic.fillColor && graphic.strokeColor) doc.fillAndStroke(graphic.fillColor, graphic.strokeColor);
  else if (graphic.fillColor) doc.fill(graphic.fillColor); else doc.stroke(graphic.strokeColor ?? '#111827');
  doc.restore();
  doc.x = doc.page.margins.left;
  doc.y = y + height + (graphic.marginBottom ?? 0);
  });
}
