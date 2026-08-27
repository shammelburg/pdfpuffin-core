export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type TextBaseline = number | 'svg-middle' | 'middle' | 'svg-central' | 'bottom' | 'ideographic' | 'alphabetic' | 'mathematical' | 'hanging' | 'top';

export interface PdfKitTextOptions {
  lineBreak?: boolean; height?: number; ellipsis?: boolean | string; columns?: number;
  columnGap?: number; indent?: number; indentAllLines?: boolean; paragraphGap?: number;
  lineGap?: number; wordSpacing?: number; characterSpacing?: number; fill?: boolean;
  stroke?: boolean; link?: string | null; underline?: boolean; strike?: boolean;
  continued?: boolean; oblique?: boolean | number; baseline?: TextBaseline; features?: string[];
  destination?: string; goTo?: string; structType?: string;
}

export interface TextElement extends ElementAppearance {
  type: 'text'; name?: string; text: string; width?: number | string; font?: string;
  style?: 'normal' | 'noSpacing' | 'paragraph' | 'title' | 'subtitle' | 'heading1' | 'heading2' | 'heading3' | 'quote' | 'caption';
  /** @deprecated Flow documents ignore absolute coordinates. */ x?: number; y?: number;
  region?: 'body' | 'header' | 'footer';
  fontSize?: number; bold?: boolean; color?: string; marginTop?: number; marginRight?: number; marginBottom?: number; marginLeft?: number;
  align?: TextAlignment; fillOpacity?: number; strokeColor?: string;
  strokeOpacity?: number; options?: PdfKitTextOptions;
  /** Display formatting applied to datasource expressions within this text. */
  valueFormat?: ValueFormat;
}
import { ElementAppearance } from './element-appearance.js';
import { ValueFormat } from './value-format.js';
