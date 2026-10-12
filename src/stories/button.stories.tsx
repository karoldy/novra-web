import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRightIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { Button } from '@/components/ui/button';
import { XStack, YStack } from '@/components/ui/stack';

// Figma style → variant
const figmaStyles = [
  ['Primary', 'default'],
  ['Secondary', 'outline'],
  ['Tertiary', 'ghost'],
  ['Danger', 'destructive'],
  ['Danger Secondary', 'destructive-outline'],
] as const;

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: (
      <>
        Button
        <ArrowRightIcon data-icon="inline-end" />
      </>
    ),
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'outline',
        'ghost',
        'destructive',
        'destructive-outline',
        'secondary',
        'link',
      ],
    },
    size: { control: 'inline-radio', options: ['default', 'sm'] },
    onDark: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Button' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// Every Figma style in both sizes. Hover / press them to see the Figma states.
export const Styles: Story = {
  render: (args) => (
    <YStack className="gap-4">
      {figmaStyles.map(([label, variant]) => (
        <XStack key={variant} align="center" className="gap-4">
          <span className="w-36 text-body3 text-muted-foreground">{label}</span>
          <Button {...args} variant={variant} data-testid={`${variant}-default`} />
          <Button {...args} variant={variant} size="sm" data-testid={`${variant}-sm`} />
        </XStack>
      ))}
    </YStack>
  ),
  play: async ({ canvas }) => {
    for (const [, variant] of figmaStyles) {
      const big = canvas.getByTestId(`${variant}-default`).getBoundingClientRect();
      const small = canvas.getByTestId(`${variant}-sm`).getBoundingClientRect();
      // Figma: Default 48px high, min 140 wide; Small 40px high, min 132 wide.
      await expect(big.height).toBe(48);
      await expect(big.width).toBeGreaterThanOrEqual(140);
      await expect(small.height).toBe(40);
      await expect(small.width).toBeGreaterThanOrEqual(132);
      // Figma icons are 24px on both sizes.
      for (const size of ['default', 'sm']) {
        const icon = canvas.getByTestId(`${variant}-${size}`).querySelector('svg')!;
        await expect(icon.getBoundingClientRect().width).toBe(24);
      }
    }
  },
};

export const Disabled: Story = {
  render: (args) => (
    <XStack align="center" className="gap-4">
      {figmaStyles.map(([, variant]) => (
        <Button key={variant} {...args} variant={variant} disabled />
      ))}
    </XStack>
  ),
  play: async ({ args, canvas }) => {
    for (const button of canvas.getAllByRole('button', { name: 'Button' })) {
      await expect(button).toBeDisabled();
    }
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// Figma "State=Skeleton": a placeholder of the button's size while it loads.
export const Skeleton: Story = {
  render: (args) => (
    <XStack align="center" className="gap-4">
      {figmaStyles.map(([, variant]) => (
        <Button key={variant} {...args} variant={variant} skeleton />
      ))}
    </XStack>
  ),
  play: async ({ args, canvas, userEvent }) => {
    for (const button of canvas.getAllByRole('button', { name: 'Button' })) {
      await expect(button).toHaveAttribute('aria-busy', 'true');
      // Natively disabled: skipped by Tab, so Enter / Space can't submit twice.
      await expect(button).toBeDisabled();
    }
    await userEvent.tab();
    await expect(canvas.getAllByRole('button', { name: 'Button' })).not.toContain(
      document.activeElement,
    );
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// `loading`: a Spinner replaces the leading icon, the text stays, clicks are ignored, and the
// button keeps its normal colors (unlike `disabled`).
export const Loading: Story = {
  render: (args) => (
    <XStack align="center" className="gap-4">
      {figmaStyles.map(([, variant]) => (
        <Button key={variant} {...args} variant={variant} loading data-testid={variant} />
      ))}
      <Button {...args} loading data-testid="leading-icon">
        <ArrowRightIcon data-icon="inline-start" data-testid="leading-arrow" />
        Button
      </Button>
    </XStack>
  ),
  play: async ({ args, canvas }) => {
    const button = canvas.getByTestId('default');
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    // Not natively disabled, so it keeps its colors and stays focusable.
    await expect(button).not.toBeDisabled();
    await expect(button.querySelector('[data-slot=spinner]')).not.toBeNull();
    // Native click bypasses pointer-events, so this checks that Base UI blocks the handler.
    button.click();
    await expect(args.onClick).not.toHaveBeenCalled();
    // The spinner takes the leading icon's place.
    await expect(canvas.getByTestId('leading-arrow')).not.toBeVisible();
  },
};

// Figma "On White=no": outline / ghost turn white on dark or colored surfaces.
export const OnDark: Story = {
  render: (args) => (
    <XStack align="center" className="gap-4 rounded-xl bg-button-primary p-6">
      <Button {...args} variant="outline" onDark />
      <Button {...args} variant="ghost" onDark />
    </XStack>
  ),
};

export const IconPosition: Story = {
  render: (args) => (
    <XStack align="center" className="gap-4">
      <Button {...args}>
        Button
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button {...args} variant="outline">
        <ArrowRightIcon data-icon="inline-start" />
        Button
      </Button>
      <Button {...args} variant="ghost">
        Button
      </Button>
    </XStack>
  ),
};

// Not in Figma; kept because shadcn components use them.
export const OtherVariants: Story = {
  render: (args) => (
    <XStack align="center" className="gap-4">
      <Button {...args} variant="secondary" />
      <Button {...args} variant="link" />
    </XStack>
  ),
};
