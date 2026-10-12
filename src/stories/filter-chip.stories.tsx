import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDownIcon, MapPinIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { FilterChip } from '@/components/molecules/filter-chip';
import { XStack, YStack } from '@/components/ui/stack';
import { Typography } from '@/components/ui/typography';

const meta = {
  title: 'Molecules/FilterChip',
  component: FilterChip,
  args: { children: 'Result', onClick: fn() },
  argTypes: {
    filtered: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const chip = canvas.getByRole('button', { name: 'Result' });
    await expect(chip.getBoundingClientRect().height).toBe(40);
    await userEvent.click(chip);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

// Figma styles composed from FilterChip + your own icons, in each state row.
// Hover and press them to see Figma "Hover" / "Pressed".
export const Styles: Story = {
  render: () => (
    <YStack className="gap-4">
      {(
        [
          ['Default', {}],
          ['Filtered', { filtered: true }],
          ['Disable', { disabled: true }],
        ] as const
      ).map(([state, props]) => (
        <XStack key={state} align="center" className="gap-4">
          <span className="w-20 text-body3 text-muted-foreground">{state}</span>
          {/* Criteria and Result */}
          <FilterChip {...props} label="Criteria">
            Result
          </FilterChip>
          {/* Text Dropdown */}
          <FilterChip {...props}>
            Result
            <ChevronDownIcon data-icon="inline-end" />
          </FilterChip>
          {/* Quick key */}
          <FilterChip {...props}>Result</FilterChip>
          {/* Dropdown with icon */}
          <FilterChip {...props}>
            <MapPinIcon data-icon="inline-start" />
            Result
            <ChevronDownIcon data-icon="inline-end" />
          </FilterChip>
        </XStack>
      ))}
    </YStack>
  ),
};

// `label` renders as Typography `label3`. For other styling, skip `label` and compose children.
export const Label: Story = {
  render: () => (
    <XStack align="center" className="gap-4">
      <FilterChip label="Criteria">Result</FilterChip>
      <FilterChip>
        <Typography variant="body3">Criteria</Typography>
        Result
      </FilterChip>
    </XStack>
  ),
  play: async ({ canvas }) => {
    const [label3, custom] = canvas.getAllByText('Criteria');
    await expect(label3).toHaveAttribute('data-variant', 'label3');
    await expect(getComputedStyle(label3).fontWeight).toBe('400');
    await expect(getComputedStyle(label3).fontSize).toBe('16px');
    await expect(getComputedStyle(custom).fontSize).toBe('14px');
  },
};

// Icon sizes follow Figma: leading 24px, trailing 16px.
export const IconSizes: Story = {
  render: () => (
    <FilterChip>
      <MapPinIcon data-icon="inline-start" data-testid="start" />
      Result
      <ChevronDownIcon data-icon="inline-end" data-testid="end" />
    </FilterChip>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('start').getBoundingClientRect().width).toBe(24);
    await expect(canvas.getByTestId('end').getBoundingClientRect().width).toBe(16);
  },
};

// Figma "Pressed" for dropdowns: while open (aria-expanded) the trailing icon flips.
export const DropdownOpen: Story = {
  render: () => (
    <FilterChip aria-expanded>
      Result
      <ChevronDownIcon data-icon="inline-end" data-testid="chevron" />
    </FilterChip>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('chevron')).rotate).toBe('180deg');
  },
};

// Figma "Quick key": a toggle. Filtered while pressed.
export const QuickKeyToggle: Story = {
  render: () => {
    function Toggle() {
      const [on, setOn] = useState(false);
      return (
        <FilterChip aria-pressed={on} filtered={on} onClick={() => setOn((v) => !v)}>
          Today
        </FilterChip>
      );
    }
    return <Toggle />;
  },
  play: async ({ canvas, userEvent }) => {
    const chip = canvas.getByRole('button', { name: 'Today' });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(chip).toHaveAttribute('data-filtered');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas }) => {
    const chip = canvas.getByRole('button', { name: 'Result' });
    await expect(chip).toBeDisabled();
    await expect(getComputedStyle(chip).opacity).toBe('0.3');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
