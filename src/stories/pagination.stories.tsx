import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationItems,
} from '@/components/ui/pagination';

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  args: { 'aria-label': 'Pagination' },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// shadcn-style composition with links (`href`). Labels and icons are the caller's.
export const Links: Story = {
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious aria-label="Previous page" href="?page=0" disabled>
            <ChevronLeftIcon />
          </PaginationPrevious>
        </PaginationItem>
        {getPaginationItems(1, 10).map((item) => (
          <PaginationItem key={item}>
            {typeof item === 'number' ? (
              <PaginationLink href={`?page=${item}`} isActive={item === 1}>
                {item}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext aria-label="Next page" href="?page=2">
            <ChevronRightIcon />
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
    const current = canvas.getByRole('link', { current: 'page' });
    await expect(current).toHaveTextContent('1');
    await expect(current.getBoundingClientRect().width).toBe(48);
    await expect(canvas.getByRole('link', { name: '2' })).toHaveAttribute('href', '?page=2');
    await expect(canvas.getByRole('link', { name: 'Next page' })).toBeVisible();
    // Links stay links (no role="button"); a disabled one has no href.
    await expect(current).not.toHaveAttribute('role');
    const previous = canvas.getByLabelText('Previous page');
    await expect(previous).not.toHaveAttribute('href');
    await expect(previous).toHaveAttribute('role', 'link');
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
  },
};

// Which pages are shown (7 slots: first, last, current ± 1), checked directly.
export const EllipsisRule: Story = {
  play: async () => {
    const show = (page: number, count: number) =>
      getPaginationItems(page, count)
        .map((i) => (typeof i === 'number' ? i : '…'))
        .join(' ');
    await expect(show(1, 1)).toBe('1');
    await expect(show(3, 5)).toBe('1 2 3 4 5');
    await expect(show(7, 7)).toBe('1 2 3 4 5 6 7');
    await expect(show(1, 10)).toBe('1 2 3 4 5 … 10');
    await expect(show(2, 10)).toBe('1 2 3 4 5 … 10');
    await expect(show(4, 10)).toBe('1 2 3 4 5 … 10');
    await expect(show(5, 10)).toBe('1 … 4 5 6 … 10');
    await expect(show(6, 10)).toBe('1 … 5 6 7 … 10');
    await expect(show(7, 10)).toBe('1 … 6 7 8 9 10');
    await expect(show(10, 10)).toBe('1 … 6 7 8 9 10');
    // Unique keys for React, even with two gaps.
    const items = getPaginationItems(50, 100);
    await expect(new Set(items).size).toBe(items.length);
  },
};
