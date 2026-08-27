import { TableElement } from '../models/table-element.js';
import { resolveFont } from './resolve-font.js';

export function drawTableHeader(
  doc: PDFKit.PDFDocument,
  table: TableElement,
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number,
  drawTopBorder = true,
  hasRows = true,
): number {
  doc.save().fillColor(table.headerBackground ?? '#E5E7EB').rect(x, y, width, height).fill();
  doc.restore();

  let cellX = x;
  for (const column of table.columns) {
    if (column.background) doc.save().fillColor(column.background).rect(cellX, y, column.width, height).fill().restore();
    doc
      .font(resolveFont(column.font ?? table.font, column.bold ?? true))
      .fontSize(column.fontSize ?? table.fontSize ?? 11)
      .fillColor(column.color ?? table.headerTextColor ?? table.textColor ?? '#111827');
    const left = column.marginLeft ?? padding;
    const right = column.marginRight ?? padding;
    const top = column.marginTop ?? padding;
    const bottom = column.marginBottom ?? padding;
    const textWidth = Math.max(1, column.width - left - right);
    const textHeight = doc.heightOfString(column.title, { width: textWidth });
    const availableHeight = Math.max(0, height - top - bottom);
    const textY = column.valign === 'top' ? y + top
      : column.valign === 'bottom' ? Math.max(y + top, y + height - bottom - textHeight)
      : y + top + Math.max(0, (availableHeight - textHeight) / 2);
    doc.text(column.title, cellX + left, textY, {
        width: textWidth,
        align: column.align ?? 'left',
        oblique: column.italic ?? table.italic ?? false,
        underline: column.underline ?? table.underline ?? false,
        strike: column.strike ?? table.strike ?? false,
      });
    cellX += column.width;
  }

  if (table.borderStyle !== 'none' && (table.borderWidth ?? 0.5) > 0) {
    doc.save().strokeColor(table.borderColor ?? '#D1D5DB').lineWidth(table.borderWidth ?? 0.5);
    if (table.borderStyle === 'dashed') doc.dash(4, { space: 3 });
    if (drawTopBorder && table.borderTop !== false) doc.moveTo(x, y).lineTo(x + width, y).stroke();
    if ((hasRows && table.borderHorizontal !== false) || (!hasRows && table.borderBottom !== false)) doc.moveTo(x, y + height).lineTo(x + width, y + height).stroke();
    if (table.borderVertical !== false) {
      doc.moveTo(x, y).lineTo(x, y + height).stroke();
      let borderX = x;
      for (const column of table.columns.slice(0, -1)) { borderX += column.width; doc.moveTo(borderX, y).lineTo(borderX, y + height).stroke(); }
      doc.moveTo(x + width, y).lineTo(x + width, y + height).stroke();
    }
    doc.restore();
  }

  return y + height;
}
