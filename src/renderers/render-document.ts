import { DocumentDefinition } from '../models/document-definition.js';
import { renderRepeatingRegions } from './render-repeating-regions.js';
import { renderElement } from './render-element.js';
import { expandRepeaters } from './expand-repeaters.js';
import { documentDataContext } from '../models/document-data-context.js';
export function renderDocument(doc: PDFKit.PDFDocument, definition: DocumentDefinition): void {
  for (const element of expandRepeaters(definition.content, documentDataContext(definition))) {
    if (element.type === 'region' || (element.type === 'text' && (element.region === 'header' || element.region === 'footer'))) {
      continue;
    }
    renderElement(doc, element);
  }
  renderRepeatingRegions(doc, definition);
}
