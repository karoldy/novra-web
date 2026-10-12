import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { XStack } from '@/components/ui/stack';

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  args: { size: 'sm' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// Figma: Base 16px, Medium 24px, Large 88px (no track).
export const Sizes: Story = {
  render: () => (
    <XStack align="center" className="gap-8">
      <Spinner size="sm" data-testid="sm" />
      <Spinner size="md" data-testid="md" />
      <Spinner size="lg" data-testid="lg" />
    </XStack>
  ),
  play: async ({ canvas }) => {
    for (const [size, px] of [
      ['sm', 16],
      ['md', 24],
      ['lg', 88],
    ] as const) {
      const spinner = canvas.getByTestId(size);
      await expect(spinner.getBoundingClientRect().width).toBe(px);
      // Decorative by default: no name given.
      await expect(spinner).toHaveAttribute('aria-hidden', 'true');
    }
    await expect(canvas.getByTestId('lg').querySelectorAll('circle')).toHaveLength(1);
  },
};

// Give it a name and it is announced as a status.
export const Labelled: Story = {
  args: { 'aria-label': 'Loading' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status', { name: 'Loading' })).toBeVisible();
  },
};

// Spinner has no text. To show a message (Figma "Inline"), compose it yourself.
export const WithMessage: Story = {
  render: () => (
    <XStack role="status" align="center" className="gap-2">
      <Spinner />
      <span className="text-body2 text-muted-foreground">Loading message...</span>
    </XStack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading message...');
  },
};

// Use Button's `loading` prop; the spinner takes the button's text color.
export const InButton: Story = {
  render: () => (
    <XStack align="center" className="gap-4">
      {(['default', 'outline', 'ghost', 'destructive'] as const).map((variant) => (
        <Button key={variant} variant={variant} loading data-testid={variant}>
          Button
        </Button>
      ))}
    </XStack>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByTestId('default');
    const arc = button.querySelector('circle.stroke-spinner-indicator')!;
    await expect(getComputedStyle(arc).stroke).toBe(getComputedStyle(button).color);
  },
};
