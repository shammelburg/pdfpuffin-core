import type { DocumentElement } from './document-definition.js';
import { ElementAppearance } from './element-appearance.js';

export interface RepeaterElement extends ElementAppearance {
  type: 'repeater';
  name?: string;
  dataSource: string;
  elements: DocumentElement[];
  gap?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}
