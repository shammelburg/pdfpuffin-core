import type { DocumentElement } from './document-definition.js';
import { ElementAppearance } from './element-appearance.js';

export interface RepeatingRegionElement extends ElementAppearance {
  type: 'region';
  name?: string;
  region: 'header' | 'footer';
  elements: DocumentElement[];
  gap?: number;
  margins?: { top: number; right: number; bottom: number; left: number };
}
