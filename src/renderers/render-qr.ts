import QRCode from 'qrcode';
import { QrElement } from '../models/qr-element.js';
import { withHorizontalMargins } from './with-horizontal-margins.js';

export function renderQr(doc: PDFKit.PDFDocument, element: QrElement): void {
  if (!element.value) return;
  withHorizontalMargins(doc, element.marginLeft, element.marginRight, () => {
  const size = Math.max(1, element.size);
  const quietZone = Math.max(0, Math.round(element.quietZone ?? 4));
  const qr = QRCode.create(element.value, { errorCorrectionLevel: element.errorCorrectionLevel ?? 'M' });
  const moduleCount = qr.modules.size;
  const cellSize = size / (moduleCount + quietZone * 2);
  const available = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const x = element.align === 'center' ? doc.page.margins.left + (available - size) / 2
    : element.align === 'right' ? doc.page.width - doc.page.margins.right - size : doc.page.margins.left;

  if (doc.y + (element.marginTop ?? 0) + size > doc.page.height - doc.page.margins.bottom) doc.addPage();
  doc.y += element.marginTop ?? 0;
  const y = doc.y;
  doc.save().fillColor(element.background ?? '#ffffff').rect(x, y, size, size).fill();
  doc.fillColor(element.foreground ?? '#000000');
  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (qr.modules.get(row, column)) {
        doc.rect(x + (column + quietZone) * cellSize, y + (row + quietZone) * cellSize, cellSize, cellSize);
      }
    }
  }
  doc.fill().restore();
  doc.x = doc.page.margins.left;
  doc.y = y + size + (element.marginBottom ?? 0);
  });
}
