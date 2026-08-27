import { DocumentDefinition, DocumentElement } from '../models/document-definition.js';
import { renderElement } from './render-element.js';
import { resolvePageTokens } from './resolve-page-tokens.js';
import { expandRepeaters } from './expand-repeaters.js';
import { documentDataContext } from '../models/document-data-context.js';
import { estimateElementHeight } from './estimate-element-height.js';
import { renderBorder } from './render-element-border.js';

function renderedElementHeight(doc: PDFKit.PDFDocument, element: DocumentElement, width: number): number {
  const horizontalMargins = 'marginLeft' in element
    ? (element.marginLeft ?? 0) + (element.marginRight ?? 0)
    : 0;
  const innerWidth = Math.max(1, width - horizontalMargins);
  const verticalMargins = 'marginTop' in element
    ? (element.marginTop ?? 0) + (element.marginBottom ?? 0)
    : 0;
  if (element.type === 'stack' || element.type === 'repeater') {
    const heights = element.elements.map((child) => renderedElementHeight(doc, child, innerWidth));
    return verticalMargins + heights.reduce((sum, height) => sum + height, 0)
      + Math.max(0, heights.length - 1) * (element.gap ?? 0);
  }
  if (element.type === 'columns') {
    const gap = element.gap ?? 0;
    const columnWidth = (innerWidth - Math.max(0, element.columns.length - 1) * gap)
      / Math.max(1, element.columns.length);
    return verticalMargins + Math.max(0, ...element.columns.map((column) =>
      column.elements.reduce((sum, child) => sum + renderedElementHeight(doc, child, columnWidth), 0)));
  }
  if (element.type === 'inline') {
    return verticalMargins + Math.max(0, ...element.elements.map((child) =>
      renderedElementHeight(doc, child, innerWidth)));
  }
  if (element.type === 'table') return estimateElementHeight(doc, element, width);
  return verticalMargins + estimateElementHeight(doc, element, width);
}

function resolveTokens(element: DocumentElement, page: number, count: number): DocumentElement {
  const clone = structuredClone(element);
  if (clone.type === 'text') clone.text = resolvePageTokens(clone.text, page, count);
  if (clone.type === 'stack' || clone.type === 'inline' || clone.type === 'region') clone.elements = clone.elements.map((child) => resolveTokens(child, page, count)) as typeof clone.elements;
  if (clone.type === 'columns') clone.columns.forEach((column) => column.elements = column.elements.map((child) => resolveTokens(child, page, count)));
  return clone;
}

export function renderRepeatingRegions(doc: PDFKit.PDFDocument, definition: DocumentDefinition): void {
  const repeating = definition.content.filter((element) => element.type === 'region');
  if (!repeating.length) return;
  const range = doc.bufferedPageRange();
  const addPage = doc.addPage.bind(doc);
  doc.addPage = (() => doc) as typeof doc.addPage;
  for (let page = range.start; page < range.start + range.count; page++) {
    doc.switchToPage(page);
    const originalMargins = { ...doc.page.margins };
    for (const region of repeating) {
      if (region.type !== 'region') continue;
      const regionMargins = region.margins ?? { top: 0, right: 0, bottom: 0, left: 0 };
      const expandedElements = expandRepeaters(region.elements, documentDataContext(definition))
        .map((element) => resolveTokens(element, page - range.start + 1, range.count));
      doc.page.margins.left = regionMargins.left;
      doc.page.margins.right = regionMargins.right;
      doc.page.margins.top = 0;
      doc.page.margins.bottom = 0;
      doc.x = doc.page.margins.left;
      const regionWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const measuredElementHeights = expandedElements.map((element) =>
        renderedElementHeight(doc, element, regionWidth));
      const regionHeight = regionMargins.top
        + measuredElementHeights.reduce((sum, height) => sum + height, 0)
        + Math.max(0, measuredElementHeights.length - 1) * (region.gap ?? 0)
        + regionMargins.bottom;
      const regionTop = region.region === 'header'
        ? 0
        : doc.page.height - regionHeight;
      doc.y = regionTop + regionMargins.top;
      if (region.backgroundColor) {
        doc.save().fillColor(region.backgroundColor).rect(0, regionTop, doc.page.width, regionHeight).fill().restore();
      }
      renderBorder(
        doc,
        region,
        0,
        regionTop,
        doc.page.width,
        regionHeight,
      );
      expandedElements.forEach((element, index) => {
        if (index) doc.y += region.gap ?? 0;
        renderElement(doc, element);
      });
    }
    Object.assign(doc.page.margins, originalMargins);
  }
  doc.addPage = addPage;
}
