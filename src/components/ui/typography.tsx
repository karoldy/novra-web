import type { JSX } from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { TypographyVariant } from '@/tokens';

const variantClass = {
  heading1: 'text-heading1',
  heading2: 'text-heading2',
  subtitle1: 'text-subtitle1',
  subtitle2: 'text-subtitle2',
  subtitle3: 'text-subtitle3',
  body1: 'text-body1',
  body2: 'text-body2',
  body3: 'text-body3',
  button1: 'text-button1',
  button2: 'text-button2',
  'icon-button': 'text-icon-button',
  link: 'text-link',
  'tab-highlight': 'text-tab-highlight',
  'tab-default': 'text-tab-default',
  'input-title': 'text-input-title',
  'input-placeholder': 'text-input-placeholder',
  label1: 'text-label1',
  label2: 'text-label2',
  label3: 'text-label3',
  number1: 'text-number1',
  number2: 'text-number2',
  number3: 'text-number3',
} satisfies { [V in TypographyVariant]: `text-${V}` };

const typographyVariants = cva('', {
  variants: {
    variant: variantClass,
    // Overrides the weight that comes with the variant.
    // Figma "Highlight" styles (e.g. Body1 Highlight) = the variant + weight="semibold".
    weight: {
      regular: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: { variant: 'body1' },
});

const defaultTag: Partial<Record<TypographyVariant, keyof JSX.IntrinsicElements>> = {
  heading1: 'h1',
  heading2: 'h2',
  subtitle1: 'h3',
  subtitle2: 'h4',
  subtitle3: 'h5',
};

function Typography({
  className,
  variant = 'body1',
  weight,
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof typographyVariants>) {
  return useRender({
    defaultTagName: (variant && defaultTag[variant]) ?? 'span',
    props: mergeProps<'span'>(
      { className: cn(typographyVariants({ variant, weight }), className) },
      props,
    ),
    render,
    // Emitted as data-slot / data-variant attributes.
    state: { slot: 'typography', variant },
  });
}

export { Typography, typographyVariants };
