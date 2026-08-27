import { TextAlignment } from './text-element.js';
import { ElementAppearance } from './element-appearance.js';
import { ValueFormat } from './value-format.js';
export interface TableCell { text: string; valueFormat?: ValueFormat; color?: string; background?: string; font?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; align?: Exclude<TextAlignment, 'justify'>; valign?: 'top' | 'center' | 'bottom'; marginTop?: number; marginRight?: number; marginBottom?: number; marginLeft?: number }
export type TableCellValue = string | TableCell;
export interface TableRow { cells: TableCellValue[]; height?: number; color?: string; background?: string; font?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; detail?: boolean; position?: 'before' | 'after'; visibleWhen?: string }
export interface TableElement extends ElementAppearance {
  type: 'table'; name?: string; x?: number; y?: number; width?: number; headerBackground?: string; headerTextColor?: string; headerHeight?: number;
  borderColor?: string; textColor?: string; font?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; cellPadding?: number;
  borderWidth?: number; borderStyle?: 'solid' | 'dashed' | 'none';
  borderHorizontal?: boolean; borderVertical?: boolean; borderTop?: boolean; borderBottom?: boolean;
  showHeader?: boolean;
  dataSource?: string;
  detailRow?: TableRow;
  marginTop?: number; marginRight?: number; marginBottom?: number; marginLeft?: number;
  columns: Array<{ title: string; width: number; widthMode?: 'fixed' | 'flex'; align?: Exclude<TextAlignment, 'justify'>; valign?: 'top' | 'center' | 'bottom'; color?: string; background?: string; font?: string; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; marginTop?: number; marginRight?: number; marginBottom?: number; marginLeft?: number }>;
  /** Static rows rendered before or after datasource detail rows. */
  rows: Array<string[] | TableRow>;
}
