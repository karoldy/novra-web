import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDownIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { Button } from '@/components/ui/button';
import { XStack, YStack } from '@/components/ui/stack';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Base button',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: { control: 'inline-radio', options: ['lg', 'default', 'xs'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Type=Default"
export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Base button' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// Figma "Type=Outline"
export const Outline: Story = {
  args: { variant: 'outline' },
};

// Figma sizes: large (lg, 36px), Small (default, 32px), Component button (xs, 24px).
export const Sizes: Story = {
  render: (args) => (
    <YStack className="gap-4" align="start">
      {(['lg', 'default', 'xs'] as const).map((size) => (
        <XStack key={size} className="gap-4" align="center">
          <Button {...args} size={size} data-testid={`default-${size}`} />
          <Button {...args} size={size} variant="outline" />
        </XStack>
      ))}
    </YStack>
  ),
  play: async ({ canvas }) => {
    for (const [size, height] of [
      ['lg', 36],
      ['default', 32],
      ['xs', 24],
    ] as const) {
      await expect(canvas.getByTestId(`default-${size}`).getBoundingClientRect().height).toBe(
        height,
      );
    }
  },
};

// Icons go inside the button with data-icon; padding tightens when an icon is present.
export const WithIcons: Story = {
  render: (args) => (
    <YStack className="gap-4" align="start">
      {(['default', 'outline'] as const).map((variant) => (
        <XStack key={variant} className="gap-4" align="center">
          <Button {...args} variant={variant}>
            Base button
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
          <Button {...args} variant={variant}>
            <ChevronDownIcon data-icon="inline-start" />
            Base button
          </Button>
        </XStack>
      ))}
    </YStack>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <XStack className="gap-4" align="center">
      <Button {...args} disabled />
      <Button {...args} variant="outline" disabled />
    </XStack>
  ),
  play: async ({ args, canvas }) => {
    for (const button of canvas.getAllByRole('button', { name: 'Base button' })) {
      await expect(button).toBeDisabled();
    }
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

// Other shadcn variants, kept because shadcn components use them internally.
export const OtherVariants: Story = {
  render: (args) => (
    <XStack className="gap-4" align="center">
      {(['secondary', 'ghost', 'destructive', 'link'] as const).map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </XStack>
  ),
};
