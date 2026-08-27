import { TextElement } from '../models/text-element.js';
import { resolveWidth } from './resolve-width.js';
import { withHorizontalMargins } from './with-horizontal-margins.js';
import { resolveFont } from './resolve-font.js';
export function renderText(doc: PDFKit.PDFDocument, element: TextElement): void {
  withHorizontalMargins(doc, element.marginLeft, element.marginRight, () => {
  const availableWidth = doc.page.width - doc.page.margins.right - doc.x;
  const width = Math.max(
    1,
    Math.min(resolveWidth(element.width ?? '100%', availableWidth, availableWidth), availableWidth),
  );
  const options: PDFKit.Mixins.TextOptions = { ...element.options, align: element.align ?? 'left', width, features: element.options?.features as PDFKit.Mixins.OpenTypeFeatures[] | undefined };
  doc.font(resolveFont(element.font, element.bold ?? false)).fontSize(element.fontSize ?? 11);
  doc.fillColor(element.color ?? '#111827', element.fillOpacity ?? 1);
  if (element.strokeColor) doc.strokeColor(element.strokeColor, element.strokeOpacity ?? 1);
  doc.y += element.marginTop ?? 0;
  doc.text(element.text, options);
  doc.y += element.marginBottom ?? 0;
  });
}
