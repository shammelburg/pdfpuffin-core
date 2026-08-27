export interface ElementAppearance {
  /** Background painted behind the element's rendered PDF area. */
  backgroundColor?: string;
  /** Optional border painted around selected sides of the element's rendered area. */
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  /** Corner radius used when all four border sides are enabled. */
  borderRadius?: number;
  borderTop?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
  borderLeft?: boolean;
  /** Data expression that controls whether this element is included in the PDF. */
  visibleWhen?: string;
}
