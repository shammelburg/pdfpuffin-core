import { TableElement } from '../models/table-element.js';
import { calculateRowHeight, cellText, rowCells } from './calculate-row-height.js';
import { drawTableHeader } from './draw-table-header.js';
import { ensureSpace } from './ensure-space.js';
import { withHorizontalMargins } from './with-horizontal-margins.js';
import { resolveFont } from './resolve-font.js';
export function renderTable(doc: PDFKit.PDFDocument, table: TableElement): void {
  withHorizontalMargins(doc, table.marginLeft, table.marginRight, () => {
  const startX = doc.page.margins.left; const headerHeight = table.showHeader === false ? 0 : (table.headerHeight ?? 30); const padding = table.cellPadding ?? 7;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const fixedTotal = table.columns.filter((column) => column.widthMode === 'fixed').reduce((sum, column) => sum + Math.max(column.width, 0), 0);
  const flexColumns = table.columns.filter((column) => column.widthMode !== 'fixed');
  const flexTotal = flexColumns.reduce((sum, column) => sum + Math.max(column.width || 1, 0), 0);
  const fixedScale = fixedTotal > width ? width / fixedTotal : 1;
  const remaining = Math.max(0, width - fixedTotal * fixedScale);
  const columns = table.columns.map((column) => ({ ...column, width: column.widthMode === 'fixed'
    ? column.width * fixedScale
    : flexColumns.length ? remaining * (Math.max(column.width || 1, 0) / Math.max(flexTotal, 1)) : width / Math.max(table.columns.length, 1) }));
  const fittedTable: TableElement = { ...table, columns };
  const marginTop = table.marginTop ?? 0;
  const requestedY = doc.y + marginTop;
  let y = table.y ?? ensureSpace(doc, requestedY, headerHeight + 30);
  if (table.y === undefined && y !== requestedY) y += marginTop;
  if (table.showHeader !== false) y = drawTableHeader(doc, fittedTable, startX, y, width, headerHeight, padding, true, table.rows.length > 0);
  for (const [rowIndex, row] of table.rows.entries()) {
    const height = calculateRowHeight(doc, fittedTable, row, padding); const nextY = ensureSpace(doc, y, height);
    if (nextY !== y) {
      y = table.showHeader === false
        ? nextY
        : drawTableHeader(doc, fittedTable, startX, nextY, width, headerHeight, padding, true, true);
    }
    let x = startX;
    const rowDefinition = Array.isArray(row) ? undefined : row;
    if (rowDefinition?.background) doc.save().fillColor(rowDefinition.background).rect(startX, y, width, height).fill().restore();
    const rowPadding = rowDefinition?.detail ? Math.min(padding, 3) : padding;
    rowCells(row).forEach((cell, index) => { const column = columns[index]; if (!column) return; const definition = typeof cell === 'string' ? undefined : cell;
      if (definition?.background) doc.save().fillColor(definition.background).rect(x, y, column.width, height).fill().restore();
      const bold = definition?.bold ?? rowDefinition?.bold ?? table.bold ?? false;
      doc.font(resolveFont(definition?.font ?? rowDefinition?.font ?? table.font, bold)).fontSize(definition?.fontSize ?? rowDefinition?.fontSize ?? table.fontSize ?? 11).fillColor(definition?.color ?? rowDefinition?.color ?? table.textColor ?? '#111827');
      const left = definition?.marginLeft ?? rowPadding; const right = definition?.marginRight ?? rowPadding;
      const top = definition?.marginTop ?? rowPadding; const bottom = definition?.marginBottom ?? rowPadding;
      const text = cellText(cell); const textWidth = Math.max(1, column.width - left - right);
      const textHeight = doc.heightOfString(text, { width: textWidth });
      const availableHeight = Math.max(0, height - top - bottom);
      const valign = definition?.valign ?? 'center';
      const textY = valign === 'top' ? y + top : valign === 'bottom' ? Math.max(y + top, y + height - bottom - textHeight) : y + top + Math.max(0, (availableHeight - textHeight) / 2);
      doc.text(text, x + left, textY, { width: textWidth, align: definition?.align ?? (rowDefinition?.detail ? 'center' : (column.align ?? 'left')), oblique: definition?.italic ?? rowDefinition?.italic ?? table.italic ?? false, underline: definition?.underline ?? rowDefinition?.underline ?? table.underline ?? false, strike: definition?.strike ?? rowDefinition?.strike ?? table.strike ?? false }); x += column.width; });
    if (table.borderStyle !== 'none' && (table.borderWidth ?? 0.5) > 0) {
      doc.save().strokeColor(table.borderColor ?? '#D1D5DB').lineWidth(table.borderWidth ?? 0.5);
      if (table.borderStyle === 'dashed') doc.dash(4, { space: 3 });
      const isFirstRow = rowIndex === 0;
      const isLastRow = rowIndex === table.rows.length - 1;
      if (table.showHeader === false && isFirstRow && table.borderTop !== false) doc.moveTo(startX, y).lineTo(startX + width, y).stroke();
      if ((!isLastRow && table.borderHorizontal !== false) || (isLastRow && table.borderBottom !== false)) doc.moveTo(startX, y + height).lineTo(startX + width, y + height).stroke();
      if (table.borderVertical !== false) {
        doc.moveTo(startX, y).lineTo(startX, y + height).stroke();
        let borderX = startX;
        for (const column of columns.slice(0, -1)) { borderX += column.width; doc.moveTo(borderX, y).lineTo(borderX, y + height).stroke(); }
        doc.moveTo(startX + width, y).lineTo(startX + width, y + height).stroke();
      }
      doc.restore();
    }
    y += height;
  }
  doc.x = startX; doc.y = y + (table.marginBottom ?? 0);
  });
}
