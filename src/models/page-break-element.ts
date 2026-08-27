import { ElementAppearance } from './element-appearance.js';

/** Starts a new PDF page at this position in the document flow. */
export interface PageBreakElement extends ElementAppearance {
  type: 'pageBreak';
  name?: string;
}
