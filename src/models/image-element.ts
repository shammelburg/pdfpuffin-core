import { ElementAppearance } from './element-appearance.js';

export interface ImageElement extends ElementAppearance {
  type: 'image'; name?: string; source: string; width: number; height?: number; marginTop?: number; marginRight?: number; marginBottom?: number; marginLeft?: number;
  maintainAspectRatio?: boolean; aspectRatio?: number;
  /** @deprecated Flow documents ignore absolute coordinates. */ x?: number; y?: number;
  fit?: boolean; cover?: boolean; align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'center' | 'bottom'; link?: string; destination?: string;
}
