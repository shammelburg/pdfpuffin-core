import type { DocumentElement } from './document-definition.js';
import { ElementAppearance } from './element-appearance.js';

export interface StackElement extends ElementAppearance {
  type: 'stack';
  name?: string;
  elements: DocumentElement[];
  gap?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}
