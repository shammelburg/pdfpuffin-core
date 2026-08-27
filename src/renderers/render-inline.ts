import { InlineElement } from '../models/inline-element.js';
import { withHorizontalMargins } from './with-horizontal-margins.js';
import { resolveFont } from './resolve-font.js';

export function renderInline(doc: PDFKit.PDFDocument, inline: InlineElement): void {
  withHorizontalMargins(doc, inline.marginLeft, inline.marginRight, () => {
  const width = doc.page.width - doc.page.margins.right - doc.x;
  const segments = inline.elements.map((element) => ({ element, text: element.text }));
  doc.y += inline.marginTop ?? 0;
  segments.forEach(({ element, text }, index) => {
    if (index) doc.x += inline.gap ?? 0;
    doc.font(resolveFont(element.font, element.bold ?? false))
      .fontSize(element.fontSize ?? 11)
      .fillColor(element.color ?? '#111827', element.fillOpacity ?? 1)
      .text(text, {
        ...element.options,
        width,
        align: element.align ?? 'left',
        continued: index < segments.length - 1,
        features: element.options?.features as PDFKit.Mixins.OpenTypeFeatures[] | undefined,
      });
  });
  doc.y += inline.marginBottom ?? 0;
  });
}
