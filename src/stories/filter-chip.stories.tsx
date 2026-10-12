import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapPinIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { FilterChip, FilterChipStepper } from '@/components/molecules/filter-chip';
import { XStack, YStack } from '@/components/ui/stack';

const meta = {
  title: 'Molecules/FilterChip',
  component: FilterChip,
  args: { children: 'Result', onClick: fn() },
  argTypes: {
    filtered: { control: 'boolean' },
    dropdown: { control: 'boolean' },
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

// The five Figma styles, in each state row (Default / Filtered / Disable).
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
          <FilterChip {...props} label="Criteria">
            Result
          </FilterChip>
          <FilterChip {...props} dropdown>
            Result
          </FilterChip>
          <FilterChipStepper {...props} prevLabel="Previous day" nextLabel="Next day">
            Result
          </FilterChipStepper>
          <FilterChip {...props}>Result</FilterChip>
          <FilterChip {...props} icon={<MapPinIcon />} dropdown>
            Result
          </FilterChip>
        </XStack>
      ))}
    </YStack>
  ),
};

// Figma "Pressed" for dropdowns: while open (aria-expanded) the chevron points up.
export const DropdownOpen: Story = {
  args: { dropdown: true, 'aria-expanded': true },
  play: async ({ canvas }) => {
    const chip = canvas.getByRole('button', { name: 'Result' });
    const chevron = chip.querySelector('svg')!;
    await expect(getComputedStyle(chevron).rotate).toBe('180deg');
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

// Figma "Date Selection": arrow labels are passed in (not built in).
export const DateStepper: Story = {
  render: () => {
    function Stepper() {
      const [day, setDay] = useState(12);
      return (
        <FilterChipStepper
          prevLabel="Previous day"
          nextLabel="Next day"
          onPrev={() => setDay((d) => d - 1)}
          onNext={() => setDay((d) => d + 1)}
          nextDisabled={day >= 13}
        >
          2026-10-{day}
        </FilterChipStepper>
      );
    }
    return <Stepper />;
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('group')).toHaveTextContent('2026-10-12');
    await userEvent.click(canvas.getByRole('button', { name: 'Previous day' }));
    await expect(canvas.getByRole('group')).toHaveTextContent('2026-10-11');
    await userEvent.click(canvas.getByRole('button', { name: 'Next day' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next day' }));
    await expect(canvas.getByRole('group')).toHaveTextContent('2026-10-13');
    await expect(canvas.getByRole('button', { name: 'Next day' })).toBeDisabled();
  },
};
