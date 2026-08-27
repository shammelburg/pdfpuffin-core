import { ImageElement } from '../models/image-element.js';
import { withHorizontalMargins } from './with-horizontal-margins.js';
export function renderImage(doc: PDFKit.PDFDocument, image: ImageElement): void {
  if (!image.source) return;
  withHorizontalMargins(doc, image.marginLeft, image.marginRight, () => {
  const options: PDFKit.Mixins.ImageOption = { align: image.align === 'left' ? undefined : image.align, valign: image.valign === 'top' ? undefined : image.valign, link: image.link, destination: image.destination };
  if (image.cover) options.cover = [image.width, image.height ?? image.width];
  else if (image.fit) options.fit = [image.width, image.height ?? image.width];
  else { options.width = image.width; options.height = image.height; }
  const height = image.height ?? image.width;
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + (image.marginTop ?? 0) + height > bottom) doc.addPage();
  doc.y += image.marginTop ?? 0;
  const available = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const x = image.align === 'center' ? doc.page.margins.left + (available - image.width) / 2
    : image.align === 'right' ? doc.page.width - doc.page.margins.right - image.width : doc.page.margins.left;
  doc.image(image.source, x, doc.y, options);
  doc.y += height + (image.marginBottom ?? 0);
  });
}
