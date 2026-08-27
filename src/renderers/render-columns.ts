import { ColumnsElement } from '../models/columns-element.js';
import { renderElement } from './render-element.js';
import { withHorizontalMargins } from './with-horizontal-margins.js';
import { estimateElementHeight } from './estimate-element-height.js';
import { renderBorder } from './render-element-border.js';
export function renderColumns(doc: PDFKit.PDFDocument, element: ColumnsElement): void {
  withHorizontalMargins(doc, element.marginLeft, element.marginRight, () => {
  doc.y += element.marginTop ?? 0;
  const available = element.width ?? doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = element.gap ?? 0; const usable = available - gap * Math.max(0, element.columns.length - 1);
  const fixedTotal = element.columns
    .filter((column) => column.widthMode === 'fixed')
    .reduce((sum, column) => sum + Math.max(column.width, 0), 0);
  const flexColumns = element.columns.filter((column) => column.widthMode === 'flex');
  const flexTotal = flexColumns.reduce((sum, column) => sum + Math.max(column.width, 0.1), 0);
  const fixedScale = fixedTotal > usable ? usable / fixedTotal : 1;
  const remaining = Math.max(0, usable - fixedTotal * fixedScale);
  let x = element.x ?? doc.page.margins.left;
  const startY = element.y ?? doc.y; let bottom = startY;
  const layouts = element.columns.map((column) => {
    const width = column.widthMode === 'fixed'
      ? column.width * fixedScale
      : flexColumns.length
        ? remaining * (Math.max(column.width, 0.1) / flexTotal)
        : usable / Math.max(element.columns.length, 1);
    const marginTop = Math.max(0, column.marginTop ?? 0);
    const marginRight = Math.max(0, column.marginRight ?? 0);
    const marginBottom = Math.max(0, column.marginBottom ?? 0);
    const marginLeft = Math.max(0, column.marginLeft ?? 0);
    const innerWidth = Math.max(1, width - marginLeft - marginRight);
    const height = marginTop + column.elements.reduce(
      (height, child) => height + estimateElementHeight(doc, child, innerWidth),
      0,
    ) + marginBottom;
    const layout = { column, x, width, marginTop, marginRight, marginBottom, marginLeft, height };
    x += width + gap;
    return layout;
  });
  const equalHeight = Math.max(0, ...layouts.map((layout) => layout.height));
  for (const layout of layouts) {
    const { column, x, width, marginTop, marginRight, marginBottom, marginLeft } = layout;
    let y = startY;
    if (column.backgroundColor && equalHeight > 0)
      doc.save().fillColor(column.backgroundColor).rect(x, startY, width, equalHeight).fill().restore();
    const originalLeft = doc.page.margins.left; const originalRight = doc.page.margins.right;
    doc.page.margins.left = x + marginLeft;
    doc.page.margins.right = doc.page.width - x - width + marginRight;
    doc.x = doc.page.margins.left; doc.y = y + marginTop;
    for (const child of column.elements) renderElement(doc, child);
    y = doc.y + marginBottom;
    doc.page.margins.left = originalLeft; doc.page.margins.right = originalRight;
    bottom = Math.max(bottom, y, startY + equalHeight);
  }
  const renderedHeight = Math.max(0, bottom - startY);
  layouts.forEach(({ column, x, width }) => renderBorder(doc, column, x, startY, width, renderedHeight));
  doc.x = element.x ?? doc.page.margins.left; doc.y = bottom + (element.marginBottom ?? 0);
  });
}
