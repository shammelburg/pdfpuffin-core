import type { TextElement } from './text-element.js';
import { ElementAppearance } from './element-appearance.js';

export interface InlineElement extends ElementAppearance {
  type: 'inline';
  name?: string;
  elements: TextElement[];
  gap?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}
