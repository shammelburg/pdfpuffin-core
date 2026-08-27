import { DocumentDefinition } from './document-definition.js';
const ELEMENT_TYPES = ['text', 'inline', 'stack', 'columns', 'region', 'repeater', 'table', 'image', 'qr', 'rectangle', 'roundedRectangle', 'ellipse', 'circle', 'line', 'path', 'pageBreak'];
export function parseDocumentDefinition(value: string): DocumentDefinition {
  const candidate: unknown = JSON.parse(value);
  if (!candidate || typeof candidate !== 'object') throw new Error('The document definition must be a JSON object.');
  const definition = candidate as Partial<DocumentDefinition>;
  if (!definition.page || !Array.isArray(definition.content)) throw new Error('The document definition requires page and content properties.');
  if (!definition.page.margins || (!Array.isArray(definition.page.size) && typeof definition.page.size !== 'string')) throw new Error('page requires a size and margins.');
  for (const [index, element] of definition.content.entries()) {
    if (!element || !ELEMENT_TYPES.includes(element.type)) throw new Error(`content[${index}] has an unsupported element type.`);
  }
  return definition as DocumentDefinition;
}
