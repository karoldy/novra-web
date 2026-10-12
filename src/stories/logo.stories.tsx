import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Logo } from '@/components/molecules/logo';
import { XStack, YStack } from '@/components/ui/stack';

const meta = {
  title: 'Brand/Logo',
  component: Logo,
  args: { variant: 'horizontal' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvas }) => {
    const logo = canvas.getByRole('img', { name: 'Central Yards' });
    // Default size matches the source SVG (136×26).
    await expect(logo.getBoundingClientRect().height).toBe(26);
    await expect(Math.round(logo.getBoundingClientRect().width)).toBe(136);
  },
};

export const Vertical: Story = {
  args: { variant: 'vertical' },
  play: async ({ canvas }) => {
    const logo = canvas.getByRole('img', { name: 'Central Yards' });
    await expect(logo.getBoundingClientRect().width).toBe(160);
  },
};

export const ColorAndSize: Story = {
  render: () => (
    <YStack className="gap-4" align="start">
      <Logo className="h-10 text-primary" title="primary" />
      <Logo className="h-4 text-muted-foreground" title="muted" />
      <div className="rounded-lg bg-neutral-900 p-4">
        <Logo variant="vertical" className="size-24 text-white" title="on dark" />
      </div>
    </YStack>
  ),
  play: async ({ canvas }) => {
    const primary = canvas.getByRole('img', { name: 'primary' });
    // Height from className, width follows the aspect ratio.
    await expect(primary.getBoundingClientRect().height).toBe(40);
    await expect(Math.round(primary.getBoundingClientRect().width)).toBe(
      Math.round((40 * 136) / 26),
    );
    // Shapes use currentColor, so the text-* class sets the logo color.
    const path = primary.querySelector('path[fill="currentColor"]')!;
    await expect(getComputedStyle(path).color).toBe(getComputedStyle(primary).color);
    await expect(canvas.getByRole('img', { name: 'on dark' }).getBoundingClientRect().width).toBe(
      96,
    );
  },
};

// Regression: with shared ids, the visible copy used the hidden copy's masks and lost "CENTRAL".
export const FirstInstanceHidden: Story = {
  render: () => (
    <XStack className="gap-4">
      <div className="hidden">
        <Logo variant="vertical" className="size-24" title="hidden" />
      </div>
      <Logo variant="vertical" className="size-24" title="visible" />
    </XStack>
  ),
  play: async ({ canvasElement }) => {
    const [hidden, visible] = canvasElement.querySelectorAll('svg[data-slot=logo]');
    const refs = (svg: Element) =>
      [...svg.querySelectorAll('[mask],[clip-path]')].map(
        (el) => (el.getAttribute('mask') ?? el.getAttribute('clip-path'))!,
      );
    // Every url(#…) in the visible logo resolves to an element inside that same logo.
    for (const ref of refs(visible)) {
      const id = ref.slice('url(#'.length, -1);
      await expect(visible.querySelector(`[id="${id}"]`)).not.toBeNull();
      await expect(hidden.querySelector(`[id="${id}"]`)).toBeNull();
    }
  },
};

export const Decorative: Story = {
  args: { title: null },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('img')).toBeNull();
    await expect(canvasElement.querySelector('[data-slot=logo]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  },
};
