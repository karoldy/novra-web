import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Typography } from '@/components/ui/typography';
import { typographyVariantNames } from '@/tokens';
import { XStack, YStack } from '@/components/ui/stack';

const meta = {
  title: 'UI/Typography',
  component: Typography,
  args: {
    variant: 'body1',
    children: 'Almost before we knew it, we had left the ground. 你現在閱讀的，並不是真的文案。',
  },
  argTypes: {
    variant: { control: 'select', options: typographyVariantNames },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold', 'bold'] },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// Expected values from the Figma spec: [font-size px, font-weight].
const spec: Record<(typeof typographyVariantNames)[number], [number, number]> = {
  heading1: [36, 600],
  heading2: [32, 600],
  subtitle1: [28, 600],
  subtitle2: [24, 600],
  subtitle3: [20, 600],
  body1: [18, 400],
  body2: [16, 400],
  body3: [14, 400],
  button1: [18, 600],
  button2: [16, 600],
  'icon-button': [18, 600],
  link: [18, 600],
  'tab-highlight': [20, 600],
  'tab-default': [18, 400],
  'input-title': [16, 400],
  'input-placeholder': [18, 400],
  label1: [24, 600],
  label2: [16, 600],
  label3: [16, 400],
  number1: [56, 700],
  number2: [48, 700],
  number3: [40, 700],
};

export const AllVariants: Story = {
  render: () => (
    <YStack className="gap-4">
      {typographyVariantNames.map((variant) => (
        <XStack key={variant} className="gap-6" align="baseline">
          <span className="w-40 shrink-0 text-xs text-muted-foreground">{variant}</span>
          <Typography variant={variant} data-testid={variant}>
            Almost before we knew it 你現在閱讀的
          </Typography>
        </XStack>
      ))}
    </YStack>
  ),
  play: async ({ canvas }) => {
    for (const variant of typographyVariantNames) {
      const style = getComputedStyle(canvas.getByTestId(variant));
      const [size, weight] = spec[variant];
      await expect(style.fontSize, variant).toBe(`${size}px`);
      await expect(style.fontWeight, variant).toBe(String(weight));
      await expect(parseFloat(style.lineHeight), variant).toBeCloseTo(size * 1.2, 1);
    }
  },
};

// Figma "Highlight" styles: same variant with weight="semibold".
export const Highlight: Story = {
  render: () => (
    <YStack className="gap-2">
      {(['body1', 'body2', 'body3'] as const).map((variant) => (
        <XStack key={variant} className="gap-6">
          <Typography variant={variant} data-testid={variant}>
            {variant}
          </Typography>
          <Typography variant={variant} weight="semibold" data-testid={`${variant}-highlight`}>
            {variant} highlight
          </Typography>
        </XStack>
      ))}
    </YStack>
  ),
  play: async ({ canvas }) => {
    for (const [variant, size] of [
      ['body1', 18],
      ['body2', 16],
      ['body3', 14],
    ] as const) {
      await expect(getComputedStyle(canvas.getByTestId(variant)).fontWeight).toBe('400');
      const highlighted = getComputedStyle(canvas.getByTestId(`${variant}-highlight`));
      await expect(highlighted.fontWeight).toBe('600');
      await expect(highlighted.fontSize).toBe(`${size}px`);
    }
  },
};

export const SemanticTags: Story = {
  render: () => (
    <YStack className="gap-2">
      <Typography variant="heading1">Heading 1</Typography>
      <Typography variant="heading2">Heading 2</Typography>
      <Typography variant="subtitle1">Subtitle 1</Typography>
      <Typography variant="subtitle2" render={<p />}>
        Subtitle 2 rendered as p
      </Typography>
      <Typography variant="body1">Body 1</Typography>
    </YStack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Heading 1').tagName).toBe('H1');
    await expect(canvas.getByText('Heading 2').tagName).toBe('H2');
    await expect(canvas.getByText('Subtitle 1').tagName).toBe('H3');
    await expect(canvas.getByText('Subtitle 2 rendered as p').tagName).toBe('P');
    await expect(canvas.getByText('Body 1').tagName).toBe('SPAN');
  },
};

export const WithColorAndWeight: Story = {
  args: {
    variant: 'heading2',
    weight: 'regular',
    className: 'text-primary',
    children: 'Heading 2, regular, primary color',
  },
  play: async ({ canvas }) => {
    const el = canvas.getByText('Heading 2, regular, primary color');
    // A color class must not drop the size class during cn() merging.
    await expect(el).toHaveClass('text-heading2', 'text-primary', 'font-normal');
    await expect(el).toHaveAttribute('data-slot', 'typography');
    await expect(el).toHaveAttribute('data-variant', 'heading2');
    const style = getComputedStyle(el);
    await expect(style.fontSize).toBe('32px');
    await expect(style.fontWeight).toBe('400');
  },
};
