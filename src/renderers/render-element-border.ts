import { DocumentElement } from '../models/document-definition.js';
import { ElementAppearance } from '../models/element-appearance.js';
import { estimateElementHeight } from './estimate-element-height.js';

export function renderBorder(
  doc: PDFKit.PDFDocument,
  element: ElementAppearance,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  if (
    element.borderStyle === 'none' ||
    (element.borderWidth ?? 0.5) <= 0 ||
    !(element.borderTop || element.borderRight || element.borderBottom || element.borderLeft) ||
    height <= 0
  ) return;
  const lineWidth = element.borderWidth ?? 0.5;
  const inset = lineWidth / 2;
  const left = x + inset;
  const right = x + width - inset;
  const top = y + inset;
  const bottom = y + height - inset;
  doc.save().strokeColor(element.borderColor ?? '#000000').lineWidth(lineWidth);
  if (element.borderStyle === 'dashed') doc.dash(4, { space: 3 });
  if (element.borderStyle === 'dotted') doc.dash(Math.max(1, lineWidth), { space: Math.max(2, lineWidth * 2) });
  if (
    (element.borderRadius ?? 0) > 0 &&
    element.borderTop &&
    element.borderRight &&
    element.borderBottom &&
    element.borderLeft
  ) {
    const radius = Math.min(element.borderRadius ?? 0, Math.max(0, width / 2), Math.max(0, height / 2));
    doc.roundedRect(left, top, Math.max(0, width - lineWidth), Math.max(0, height - lineWidth), radius).stroke();
    doc.restore();
    return;
  }
  if (element.borderTop) doc.moveTo(left, top).lineTo(right, top).stroke();
  if (element.borderRight) doc.moveTo(right, top).lineTo(right, bottom).stroke();
  if (element.borderBottom) doc.moveTo(right, bottom).lineTo(left, bottom).stroke();
  if (element.borderLeft) doc.moveTo(left, bottom).lineTo(left, top).stroke();
  doc.restore();
}

export function renderElementBorder(doc: PDFKit.PDFDocument, element: DocumentElement): void {
  if (
    element.type === 'region' ||
    element.type === 'repeater' ||
    element.type === 'table' ||
    element.borderStyle === 'none' ||
    (element.borderWidth ?? 0.5) <= 0 ||
    !(element.borderTop || element.borderRight || element.borderBottom || element.borderLeft)
  )
    return;

  const topMargin = 'marginTop' in element ? (element.marginTop ?? 0) : 0;
  const bottomMargin = 'marginBottom' in element ? (element.marginBottom ?? 0) : 0;
  const width = Math.max(1, doc.page.width - doc.page.margins.left - doc.page.margins.right);
  const height = topMargin + estimateElementHeight(doc, element, width) + bottomMargin;
  if (height <= 0) return;

  renderBorder(doc, element, doc.page.margins.left, doc.y, width, height);
}
