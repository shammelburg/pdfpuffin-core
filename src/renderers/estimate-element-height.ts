import { DocumentElement } from '../models/document-definition.js';
import { resolveFont } from './resolve-font.js';

export function estimateElementHeight(doc: PDFKit.PDFDocument, element: DocumentElement, width: number): number {
  const innerWidth = Math.max(1, width - ('marginLeft' in element ? element.marginLeft ?? 0 : 0) - ('marginRight' in element ? element.marginRight ?? 0 : 0));
  switch (element.type) {
    case 'pageBreak': return 0;
    case 'text': {
      doc.font(resolveFont(element.font, element.bold ?? false)).fontSize(element.fontSize ?? 11);
      return doc.heightOfString(element.text || ' ', { ...element.options, width: innerWidth, features: element.options?.features as PDFKit.Mixins.OpenTypeFeatures[] | undefined });
    }
    case 'image': return element.source ? element.height ?? element.width : 0;
    case 'qr': return element.value ? element.size : 0;
    case 'line': return Math.max(element.lineWidth ?? 1, 1);
    case 'circle': return (element.radius ?? 40) * 2;
    case 'rectangle': case 'roundedRectangle': case 'ellipse': case 'path': return Math.max(element.height ?? 60, 1);
    case 'table': return (element.marginTop ?? 0) + (element.showHeader === false ? 0 : (element.headerHeight ?? 30)) + element.rows.reduce((sum, row) => sum + (Array.isArray(row) ? 28 : row.height ?? 28), 0) + (element.marginBottom ?? 0);
    case 'inline': return Math.max(0, ...element.elements.map((child) => estimateElementHeight(doc, child, innerWidth)));
    case 'stack': case 'repeater': case 'region': {
      const children = element.elements.map((child) => estimateElementHeight(doc, child, innerWidth));
      return children.reduce((sum, height) => sum + height, 0) + Math.max(0, children.length - 1) * (element.gap ?? 0);
    }
    case 'columns': {
      const gap = element.gap ?? 0;
      const usable = innerWidth - Math.max(0, element.columns.length - 1) * gap;
      const fixedTotal = element.columns.filter((column) => column.widthMode === 'fixed').reduce((sum, column) => sum + Math.max(column.width, 0), 0);
      const flexTotal = element.columns.filter((column) => column.widthMode === 'flex').reduce((sum, column) => sum + Math.max(column.width, 0.1), 0);
      const fixedScale = fixedTotal > usable ? usable / fixedTotal : 1;
      const remaining = Math.max(0, usable - fixedTotal * fixedScale);
      return Math.max(0, ...element.columns.map((column) => {
        const columnWidth = column.widthMode === 'fixed' ? column.width * fixedScale : remaining * (Math.max(column.width, 0.1) / Math.max(flexTotal, 0.1));
        const contentWidth = Math.max(1, columnWidth - (column.marginLeft ?? 0) - (column.marginRight ?? 0));
        return (column.marginTop ?? 0)
          + column.elements.reduce((sum, child) => sum + estimateElementHeight(doc, child, contentWidth), 0)
          + (column.marginBottom ?? 0);
      }));
    }
  }
}
