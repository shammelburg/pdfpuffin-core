import { TableCellValue, TableElement, TableRow } from '../models/table-element.js';
import { resolveFont } from './resolve-font.js';
export function rowCells(row: string[] | TableRow): TableCellValue[] { return Array.isArray(row) ? row : row.cells; }
export function cellText(cell: TableCellValue): string { return typeof cell === 'string' ? cell : cell.text; }
export function calculateRowHeight(doc: PDFKit.PDFDocument, table: TableElement, row: string[] | TableRow, padding: number): number {
  const rowDefinition = Array.isArray(row) ? undefined : row;
  const rowPadding = rowDefinition?.detail ? Math.min(padding, 3) : padding;
  const height = rowCells(row).reduce((max, cell, index) => {
    const column = table.columns[index];
    if (!column) return max;
    const definition = typeof cell === 'string' ? undefined : cell;
    const bold = definition?.bold ?? rowDefinition?.bold ?? table.bold ?? false;
    doc.font(resolveFont(definition?.font ?? rowDefinition?.font ?? table.font, bold)).fontSize(definition?.fontSize ?? rowDefinition?.fontSize ?? table.fontSize ?? 11);
    const left = definition?.marginLeft ?? rowPadding;
    const right = definition?.marginRight ?? rowPadding;
    const top = definition?.marginTop ?? rowPadding;
    const bottom = definition?.marginBottom ?? rowPadding;
    return Math.max(max, doc.heightOfString(cellText(cell), { width: Math.max(1, column.width - left - right) }) + top + bottom);
  }, 0);
  return Math.max(Array.isArray(row) ? 28 : (row.height ?? (row.detail ? 20 : 28)), height);
}
