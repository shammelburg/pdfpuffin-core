import { DocumentElement } from '../models/document-definition.js';
import { renderColumns } from './render-columns.js';
import { renderGraphic } from './render-graphic.js';
import { renderImage } from './render-image.js';
import { renderInline } from './render-inline.js';
import { renderStack } from './render-stack.js';
import { renderTable } from './render-table.js';
import { renderText } from './render-text.js';
import { renderQr } from './render-qr.js';
import { renderElementBackground } from './render-element-background.js';
import { renderElementBorder } from './render-element-border.js';

export function renderElement(doc: PDFKit.PDFDocument, element: DocumentElement): void {
  renderElementBackground(doc, element);
  renderElementBorder(doc, element);
  switch (element.type) {
    case 'region': return;
    case 'repeater': return;
    case 'pageBreak': doc.addPage(); break;
    case 'text': renderText(doc, element); break;
    case 'inline': renderInline(doc, element); break;
    case 'stack': renderStack(doc, element); break;
    case 'columns': renderColumns(doc, element); break;
    case 'table': renderTable(doc, element); break;
    case 'image': renderImage(doc, element); break;
    case 'qr': renderQr(doc, element); break;
    default: renderGraphic(doc, element);
  }
}
