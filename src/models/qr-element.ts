import { ElementAppearance } from './element-appearance.js';

export interface QrElement extends ElementAppearance {
  type: 'qr';
  name?: string;
  value: string;
  size: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  foreground?: string;
  background?: string;
  quietZone?: number;
  align?: 'left' | 'center' | 'right';
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}
