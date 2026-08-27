import { StackElement } from '../models/stack-element.js';
import { renderElement } from './render-element.js';
import { withHorizontalMargins } from './with-horizontal-margins.js';

export function renderStack(doc: PDFKit.PDFDocument, stack: StackElement): void {
  withHorizontalMargins(doc, stack.marginLeft, stack.marginRight, () => {
  doc.y += stack.marginTop ?? 0;
  stack.elements.forEach((element, index) => {
    if (index) doc.y += stack.gap ?? 0;
    renderElement(doc, element);
  });
  doc.y += stack.marginBottom ?? 0;
  });
}
