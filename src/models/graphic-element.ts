import { ElementAppearance } from './element-appearance.js';

export interface GraphicElement extends ElementAppearance {
  type: 'rectangle' | 'roundedRectangle' | 'ellipse' | 'circle' | 'line' | 'path';
  name?: string;
  width?: number | string; height?: number; radius?: number; path?: string; align?: 'left' | 'center' | 'right';
  marginTop?: number; marginRight?: number; marginBottom?: number; marginLeft?: number;
  /** @deprecated Flow documents ignore absolute coordinates. */ x?: number; y?: number;
  fillColor?: string; strokeColor?: string; lineWidth?: number; opacity?: number;
  dash?: number; dashSpace?: number;
}
