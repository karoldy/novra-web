import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { PaginationBar } from '@/components/molecules/pagination-bar';
import { YStack } from '@/components/ui/stack';

function Example({ total }: { total: number }) {
  const [page, setPage] = useState(1);
  return <PaginationBar page={page} total={total} pageSize={12} onPageChange={setPage} />;
}

const meta = {
  title: 'Molecules/PaginationBar',
  component: PaginationBar,
  args: { page: 1, total: 120, pageSize: 12, onPageChange: fn() },
  // Full-width bar: a centered canvas would shrink it to its content and hide wrapping.
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PaginationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The three Figma scenarios: 1 page, ≤ 5 pages, > 5 pages. Texts are built in (tc here).
export const Scenarios: Story = {
  globals: { locale: 'tc' },
  render: () => (
    <YStack className="w-full gap-10">
      <Example total={0} />
      <Example total={60} />
      <Example total={120} />
    </YStack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('第 1 頁，共 1 頁（顯示第0項內的 0 項）')).toBeVisible();
    await expect(canvas.getByText('第 1 頁，共 5 頁（顯示第60項內的 1–12 項）')).toBeVisible();
    await expect(canvas.getByText('第 1 頁，共 10 頁（顯示第120項內的 1–12 項）')).toBeVisible();
    // Only 1 page → no navigation; the other two have one each.
    await expect(canvas.getAllByRole('navigation', { name: '分頁' })).toHaveLength(2);
    await expect(canvas.getAllByRole('button', { name: '顯示12項' })).toHaveLength(3);
  },
};

// Click through pages: the summary and the ellipsis rule follow the current page.
export const Navigate: Story = {
  globals: { locale: 'tc' },
  render: () => <Example total={120} />,
  play: async ({ canvas, userEvent }) => {
    const nav = () => canvas.getByRole('navigation', { name: '分頁' });
    const current = () => canvas.getByRole('button', { current: 'page' });
    await expect(current()).toHaveTextContent('1');
    await expect(canvas.getByRole('button', { name: '上一頁' })).toBeDisabled();
    await expect(nav()).toHaveTextContent('12345…10');
    // Page 2: page 3 is visible (the original issue).
    await userEvent.click(canvas.getByRole('button', { name: '下一頁' }));
    await expect(canvas.getByRole('button', { name: '3' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '3' }));
    await expect(current()).toHaveTextContent('3');
    await expect(canvas.getByText('第 3 頁，共 10 頁（顯示第120項內的 25–36 項）')).toBeVisible();
    // Page 5: both neighbours visible.
    await userEvent.click(canvas.getByRole('button', { name: '5' }));
    await expect(nav()).toHaveTextContent('1…456…10');
    await userEvent.click(canvas.getByRole('button', { name: '10' }));
    await expect(nav()).toHaveTextContent('1…678910');
    await expect(
      canvas.getByText('第 10 頁，共 10 頁（顯示第120項內的 109–120 項）'),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: '下一頁' })).toBeDisabled();
  },
};

// Narrow container (448px; the widest navigation, 7 pages + 2 arrows, is 432px): the groups
// wrap, no overflow.
export const Narrow: Story = {
  globals: { locale: 'tc' },
  render: () => (
    <div className="w-112" data-testid="frame">
      <Example total={120} />
    </div>
  ),
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId('frame');
    const bar = frame.firstElementChild as HTMLElement;
    await expect(bar.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
    const nav = canvas.getByRole('navigation', { name: '分頁' }).getBoundingClientRect();
    const summary = canvas.getByText(/^第 1 頁/).getBoundingClientRect();
    await expect(nav.top).toBeGreaterThan(summary.bottom - 1);
  },
};

// Texts follow the locale.
export const English: Story = {
  globals: { locale: 'en' },
  args: { page: 2, total: 30, pageSize: 12 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Page 2 of 3 (13–24 of 30 items)')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Show 12' })).toBeVisible();
    await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
  },
};
