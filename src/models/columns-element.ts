import type { DocumentElement } from './document-definition.js';
import { ElementAppearance } from './element-appearance.js';
export interface ColumnDefinition extends ElementAppearance {
  width: number;
  widthMode: 'fixed' | 'flex';
  elements: DocumentElement[];
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}
export interface ColumnsElement extends ElementAppearance {
  type: 'columns'; name?: string; x?: number; y?: number; width?: number; gap?: number; marginTop?: number; marginRight?: number; marginBottom?: number; marginLeft?: number;
  columns: ColumnDefinition[];
}
