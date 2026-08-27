import { DocumentDefinition, DocumentElement } from '../models/document-definition.js';
import { TableRow } from '../models/table-element.js';
import { expandRepeaters } from './expand-repeaters.js';
import { documentDataContext } from '../models/document-data-context.js';

const PAGE_SIZES: Record<string, [number, number]> = { A3: [841.89, 1190.55], A4: [595.28, 841.89], A5: [419.53, 595.28], LETTER: [612, 792], LEGAL: [612, 1008], TABLOID: [792, 1224] };

function sequenceHeight(elements: DocumentElement[], width: number, gap = 0): number {
  const heights = elements.map((child) => elementHeight(child, width)).filter((height) => height > 0);
  return heights.reduce((sum, height) => sum + height, 0) + Math.max(0, heights.length - 1) * gap;
}

function elementHeight(element: DocumentElement, width: number): number {
  const innerWidth = element.type === 'region' || element.type === 'pageBreak'
    ? width
    : Math.max(1, width - (element.marginLeft ?? 0) - (element.marginRight ?? 0));
  switch (element.type) {
    case 'pageBreak': return 0;
    case 'text': {
      const size = element.fontSize ?? 11;
      const textWidth = typeof element.width === 'number' ? Math.min(innerWidth, element.width) : innerWidth;
      const lines = Math.max(1, element.text.split('\n').reduce((count, line) => count + Math.max(1, Math.ceil(line.length * size * 0.52 / Math.max(textWidth, 1))), 0));
      return (element.marginTop ?? 0) + lines * (size * 1.25 + (element.options?.lineGap ?? 0)) + (element.marginBottom ?? 0);
    }
    // Match renderImage: an image without a source renders nothing and must not
    // reserve header/footer space merely because its placeholder has dimensions.
    case 'image': return element.source
      ? (element.marginTop ?? 0) + (element.height ?? element.width) + (element.marginBottom ?? 0)
      : 0;
    case 'qr': return (element.marginTop ?? 0) + element.size + (element.marginBottom ?? 0);
    case 'line': return (element.marginTop ?? 0) + Math.max(element.lineWidth ?? 1, 1) + (element.marginBottom ?? 0);
    case 'table': return (element.marginTop ?? 0) + (element.showHeader === false ? 0 : (element.headerHeight ?? 30)) + element.rows.reduce((sum, row) => sum + (Array.isArray(row) ? 28 : ((row as TableRow).height ?? 28)), 0) + (element.marginBottom ?? 0);
    case 'stack': return (element.marginTop ?? 0) + sequenceHeight(element.elements, innerWidth, element.gap ?? 0) + (element.marginBottom ?? 0);
    case 'inline': return (element.marginTop ?? 0) + Math.max(0, ...element.elements.map((child) => elementHeight(child, innerWidth))) + (element.marginBottom ?? 0);
    case 'columns': {
      const usable = innerWidth - Math.max(0, element.columns.length - 1) * (element.gap ?? 0);
      const fixedTotal = element.columns.filter((column) => column.widthMode === 'fixed').reduce((sum, column) => sum + Math.max(column.width, 0), 0);
      const flexTotal = element.columns.filter((column) => column.widthMode === 'flex').reduce((sum, column) => sum + Math.max(column.width, 0.1), 0);
      const fixedScale = fixedTotal > usable ? usable / fixedTotal : 1;
      const remaining = Math.max(0, usable - fixedTotal * fixedScale);
      return (element.marginTop ?? 0) + Math.max(0, ...element.columns.map((column) => {
        const columnWidth = column.widthMode === 'fixed' ? column.width * fixedScale : remaining * (Math.max(column.width, 0.1) / Math.max(flexTotal, 0.1));
        return (column.marginTop ?? 0)
          + sequenceHeight(column.elements, Math.max(1, columnWidth - (column.marginLeft ?? 0) - (column.marginRight ?? 0)))
          + (column.marginBottom ?? 0);
      })) + (element.marginBottom ?? 0);
    }
    case 'region': {
      const margins = element.margins ?? { top: 0, right: 0, bottom: 0, left: 0 };
      const innerWidth = Math.max(1, width - margins.left - margins.right);
      return margins.top + sequenceHeight(element.elements, innerWidth, element.gap ?? 0) + margins.bottom;
    }
    case 'repeater': return (element.marginTop ?? 0) + sequenceHeight(element.elements, innerWidth) + (element.marginBottom ?? 0);
    default: return (element.marginTop ?? 0) + (element.type === 'circle' ? (element.radius ?? 40) * 2 : (element.height ?? 60)) + (element.marginBottom ?? 0);
  }
}

export function calculateRepeatingRegionHeights(definition: DocumentDefinition): { header: number; footer: number } {
  const raw = Array.isArray(definition.page.size) ? definition.page.size : (PAGE_SIZES[definition.page.size.toUpperCase()] ?? PAGE_SIZES['A4']);
  const pageWidth = definition.page.layout === 'landscape' ? raw[1] : raw[0];
  const margins = definition.page.margins;
  const width = pageWidth - margins.left - margins.right;
  const header = definition.content.find((element) => element.type === 'region' && element.region === 'header');
  const footer = definition.content.find((element) => element.type === 'region' && element.region === 'footer');
  const expandedHeight = (region: DocumentElement | undefined): number => {
    if (!region || region.type !== 'region') return 0;
    return elementHeight({ ...region, elements: expandRepeaters(region.elements, documentDataContext(definition)) }, width);
  };
  return { header: expandedHeight(header), footer: expandedHeight(footer) };
}

export function calculateRepeatingRegionMargins(definition: DocumentDefinition): DocumentDefinition['page']['margins'] {
  const margins = definition.page.margins;
  const heights = calculateRepeatingRegionHeights(definition);
  return {
    ...margins,
    top: margins.top + heights.header,
    bottom: margins.bottom + heights.footer,
  };
}
