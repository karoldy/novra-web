/**
 * Text styles from the AA Library Figma typography spec.
 * Sizes, line heights and weights are defined as `--text-*` tokens in `src/index.css`;
 * each name here becomes a `text-<name>` utility.
 */
export const typographyVariantNames = [
  // Heading / Subtitle
  'heading1',
  'heading2',
  'subtitle1',
  'subtitle2',
  'subtitle3',
  // Body
  'body1',
  'body2',
  'body3',
  // CTA
  'button1',
  'button2',
  'icon-button',
  'link',
  // Tab
  'tab-highlight',
  'tab-default',
  // Input field
  'input-title',
  'input-placeholder',
  // Label
  'label1',
  'label2',
  'label3',
  // Number (fixed px, does not scale with root font size)
  'number1',
  'number2',
  'number3',
] as const;

export type TypographyVariant = (typeof typographyVariantNames)[number];
