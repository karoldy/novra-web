import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { XStack, YStack } from '@/components/ui/stack';
import { cn } from '@/lib/utils';

function Box({ label, className }: { label: string; className?: string }) {
  return (
    <XStack
      align="center"
      justify="center"
      className={cn('h-10 rounded-md border bg-muted px-3 text-body3', className)}
    >
      {label}
    </XStack>
  );
}

const meta = {
  title: 'UI/Stack',
  component: XStack,
  args: { align: 'center', justify: 'start', wrap: false },
  argTypes: {
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
  },
  render: (args) => (
    <XStack
      {...args}
      className="w-96 gap-2 rounded-lg border border-dashed p-2"
      data-testid="stack"
    >
      <Box label="A" />
      <Box label="B" className="h-16" />
      <Box label="C" />
    </XStack>
  ),
} satisfies Meta<typeof XStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvas }) => {
    const stack = canvas.getByTestId('stack');
    await expect(stack).toHaveAttribute('data-slot', 'x-stack');
    const style = getComputedStyle(stack);
    await expect(style.display).toBe('flex');
    await expect(style.flexDirection).toBe('row');
    await expect(style.alignItems).toBe('center');
  },
};

export const Vertical: Story = {
  render: (args) => (
    <YStack
      {...args}
      className="w-48 gap-2 rounded-lg border border-dashed p-2"
      data-testid="stack"
    >
      <Box label="A" />
      <Box label="B" />
      <Box label="C" />
    </YStack>
  ),
  args: { align: 'stretch' },
  play: async ({ canvas }) => {
    const stack = canvas.getByTestId('stack');
    await expect(stack).toHaveAttribute('data-slot', 'y-stack');
    await expect(getComputedStyle(stack).flexDirection).toBe('column');
  },
};

export const SpaceBetween: Story = {
  args: { justify: 'between' },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('stack')).justifyContent).toBe(
      'space-between',
    );
  },
};

export const Wrap: Story = {
  args: { wrap: true },
  render: (args) => (
    <XStack
      {...args}
      className="w-48 gap-2 rounded-lg border border-dashed p-2"
      data-testid="stack"
    >
      {['A', 'B', 'C', 'D', 'E', 'F'].map((label) => (
        <Box key={label} label={label} />
      ))}
    </XStack>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('stack')).flexWrap).toBe('wrap');
  },
};

// `render` swaps the element while keeping the stack classes.
export const CustomElement: Story = {
  render: (args) => (
    <XStack {...args} render={<ul />} className="gap-2" data-testid="stack">
      <li>
        <Box label="A" />
      </li>
      <li>
        <Box label="B" />
      </li>
    </XStack>
  ),
  play: async ({ canvas }) => {
    const stack = canvas.getByTestId('stack');
    await expect(stack.tagName).toBe('UL');
    await expect(getComputedStyle(stack).display).toBe('flex');
  },
};
