import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
  type TablePin,
} from '@/components/ui/table';

const meta = {
  title: 'UI/Table',
  component: Table,
  args: { 'aria-label': 'Items' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  ['Cedar', 'Open', 'Ada'],
  ['Alder', 'Done', 'Grace'],
  ['Birch', 'Open', 'Lin'],
];

// Unsorted and ascending use the up chevron; descending flips it. The icon sits before the label.
export const Sort: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead aria-sort="none">
            <TableSortButton direction={false}>Name</TableSortButton>
          </TableHead>
          <TableHead aria-sort="ascending">
            <TableSortButton direction="asc">Status</TableSortButton>
          </TableHead>
          <TableHead aria-sort="descending">
            <TableSortButton direction="desc">Owner</TableSortButton>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Cedar</TableCell>
          <TableCell>Open</TableCell>
          <TableCell>Ada</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  play: async ({ canvas }) => {
    const name = canvas.getByRole('button', { name: 'Name' });
    await expect(name.firstElementChild?.tagName).toBe('svg');
    await expect(name.querySelector('svg')?.getBoundingClientRect().width).toBeCloseTo(16, 0);
    await expect(canvas.getByRole('columnheader', { name: 'Status' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await expect(canvas.getByRole('columnheader', { name: 'Owner' })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  },
};

// Figma "Horizontal Scroll = False": columns share the width, nothing sticks.
export const Content: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row[0]}>
            {row.map((value) => (
              <TableCell key={value}>{value}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: 'Items' })).toBeVisible();
    const head = canvas.getByRole('columnheader', { name: 'Name' });
    const cell = canvas.getByRole('cell', { name: 'Cedar' });
    await expect(head).not.toHaveAttribute('data-pin');
    await expect(cell.getBoundingClientRect().height).toBeCloseTo(63, 0);
    const cellStyle = getComputedStyle(cell);
    await expect(cellStyle.paddingTop).toBe('16px');
    await expect(cellStyle.paddingLeft).toBe('24px');
    await expect(cellStyle.borderTopLeftRadius).toBe('4px');
    await expect(cellStyle.borderTopRightRadius).toBe('0px');
    const owner = canvas.getByRole('cell', { name: 'Ada' });
    await expect(getComputedStyle(owner).borderTopRightRadius).toBe('4px');
    await expect(getComputedStyle(head).backgroundColor).not.toBe(cellStyle.backgroundColor);
  },
};

function pinStyle(pin: TablePin, size: number): CSSProperties {
  return {
    width: size,
    minWidth: size,
    ...(pin === 'start' ? { insetInlineStart: 0 } : { insetInlineEnd: 0 }),
  };
}

// Figma "Horizontal Scroll = True": first column sticks to the start, last to the end
// with the divider. Offsets are the caller's; Table only sticks what it is given.
export const HorizontalScroll: Story = {
  render: (args) => (
    <div className="w-160" data-testid="frame">
      <Table {...args}>
        <TableHeader>
          <TableRow>
            <TableHead pin="start" style={pinStyle('start', 150)}>
              Name
            </TableHead>
            <TableHead style={{ width: 220, minWidth: 220 }}>Status</TableHead>
            <TableHead style={{ width: 220, minWidth: 220 }}>Owner</TableHead>
            <TableHead style={{ width: 220, minWidth: 220 }}>City</TableHead>
            <TableHead pin="end" edge style={pinStyle('end', 100)}>
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row[0]}>
              <TableCell pin="start" style={pinStyle('start', 150)}>
                {row[0]}
              </TableCell>
              <TableCell style={{ width: 220, minWidth: 220 }}>{row[1]}</TableCell>
              <TableCell style={{ width: 220, minWidth: 220 }}>{row[2]}</TableCell>
              <TableCell style={{ width: 220, minWidth: 220 }}>Hong Kong</TableCell>
              <TableCell pin="end" edge style={pinStyle('end', 100)} className="text-center">
                On
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId('frame');
    const scroller = frame.querySelector('[data-slot="table-container"]');
    if (!(scroller instanceof HTMLElement)) throw new Error('missing table scroller');
    await expect(scroller.tabIndex).toBe(0);
    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);

    const name = canvas.getByRole('columnheader', { name: 'Name' });
    const action = canvas.getByRole('columnheader', { name: 'Action' });
    const status = canvas.getByRole('columnheader', { name: 'Status' });
    await expect(name).toHaveAttribute('data-pin', 'start');
    await expect(action).toHaveAttribute('data-pin', 'end');
    await expect(status).not.toHaveAttribute('data-pin');
    await expect(getComputedStyle(name).position).toBe('sticky');
    await expect(getComputedStyle(action).borderInlineStartWidth).toBe('1px');

    const nameLeft = name.getBoundingClientRect().left;
    const actionRight = action.getBoundingClientRect().right;
    const statusLeft = status.getBoundingClientRect().left;
    scroller.scrollLeft = 180;
    await expect(scroller.scrollLeft).toBeGreaterThan(0);
    await expect(Math.abs(name.getBoundingClientRect().left - nameLeft)).toBeLessThan(1);
    await expect(Math.abs(action.getBoundingClientRect().right - actionRight)).toBeLessThan(1);
    await expect(status.getBoundingClientRect().left).toBeLessThan(statusLeft);
  },
};

// Figma element "Radio": Table does not draw it. Center the caller's own mark.
export const Centered: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Select</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row[0]}>
            <TableCell>{row[0]}</TableCell>
            <TableCell className="text-center">
              <span
                aria-hidden
                className="inline-block size-6 rounded-full border border-current"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvas }) => {
    const head = canvas.getByRole('columnheader', { name: 'Select' });
    const headBox = head.getBoundingClientRect();
    const label = head.firstElementChild;
    if (!(label instanceof HTMLElement)) throw new Error('missing header label');
    await expect(label.getBoundingClientRect().left).toBeLessThan(headBox.left + headBox.width / 2);

    const row = canvas.getAllByRole('row')[1];
    if (!row) throw new Error('missing row');
    const cell = row.querySelectorAll('td')[1];
    const mark = cell?.querySelector('span');
    if (!(cell instanceof HTMLElement) || !(mark instanceof HTMLElement)) {
      throw new Error('missing centered mark');
    }
    const cellBox = cell.getBoundingClientRect();
    const markBox = mark.getBoundingClientRect();
    const cellMid = cellBox.left + cellBox.width / 2;
    const markMid = markBox.left + markBox.width / 2;
    await expect(Math.abs(cellMid - markMid)).toBeLessThan(1);
    await expect(markBox.width).toBeCloseTo(24, 0);
  },
};
