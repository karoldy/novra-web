import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { createDataTableColumns } from '@/components/molecules/data-table-columns';
import { DataTable } from '@/components/molecules/data-table';

type Item = {
  name: string;
  status: string;
  owner: string;
  city: string;
  note: string;
};

const helper = createDataTableColumns<Item>();

const rows: Item[] = [
  { name: 'Cedar', status: 'Open', owner: 'Ada', city: 'Hong Kong', note: 'North block' },
  { name: 'Alder', status: 'Done', owner: 'Grace', city: 'Kowloon', note: 'Handed over' },
  { name: 'Birch', status: 'Open', owner: 'Lin', city: 'Macau', note: 'Waiting on site' },
];

const longNote =
  'North block is waiting on a site visit, then a second check of the handover notes before anyone can close it.';

const columns = helper.columns([
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('status', { header: 'Status' }),
  helper.accessor('owner', { header: 'Owner' }),
]);

const pinnedColumns = helper.columns([
  helper.accessor('name', { header: 'Name', size: 150, meta: { pin: 'start' } }),
  helper.accessor('status', { header: 'Status', size: 170 }),
  helper.accessor('owner', { header: 'Owner', size: 170 }),
  helper.accessor('city', { header: 'City', size: 170 }),
  helper.accessor('note', { header: 'Note', size: 170 }),
  helper.display({
    id: 'action',
    header: 'Action',
    size: 100,
    enableSorting: false,
    meta: { pin: 'end', align: 'center' },
    cell: () => 'On',
  }),
]);

const startColumns = helper.columns([
  helper.accessor('name', { header: 'Name', size: 150, meta: { pin: 'start' } }),
  helper.accessor('status', { header: 'Status', size: 140, meta: { pin: 'start' } }),
  helper.accessor('owner', { header: 'Owner', size: 220 }),
  helper.accessor('city', { header: 'City', size: 220 }),
  helper.accessor('note', { header: 'Note', size: 220 }),
]);

const endColumns = helper.columns([
  helper.accessor('name', { header: 'Name', size: 220 }),
  helper.accessor('status', { header: 'Status', size: 220 }),
  helper.accessor('owner', { header: 'Owner', size: 220 }),
  helper.display({
    id: 'action',
    header: 'Action',
    size: 100,
    enableSorting: false,
    meta: { pin: 'end' },
    cell: () => 'On',
  }),
]);

const meta = {
  title: 'Molecules/DataTable',
  component: DataTable<Item>,
  args: {
    columns,
    data: rows,
    'aria-label': 'Items',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable<Item>>;

export default meta;
type Story = StoryObj<typeof meta>;

function scrollerIn(frame: HTMLElement) {
  const scroller = frame.querySelector('[data-slot="table-container"]');
  if (!(scroller instanceof HTMLElement)) throw new Error('missing table scroller');
  return scroller;
}

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const name = canvas.getByRole('columnheader', { name: 'Name' });
    const nameButton = canvas.getByRole('button', { name: 'Name' });
    await expect(nameButton.firstElementChild?.tagName).toBe('svg');
    await expect(name).toHaveAttribute('aria-sort', 'none');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Cedar');

    await userEvent.click(nameButton);
    await expect(name).toHaveAttribute('aria-sort', 'ascending');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Alder');
    await userEvent.click(nameButton);
    await expect(name).toHaveAttribute('aria-sort', 'descending');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Cedar');

    const status = canvas.getByRole('columnheader', { name: 'Status' });
    await userEvent.click(canvas.getByRole('button', { name: 'Status' }));
    await expect(status).toHaveAttribute('aria-sort', 'ascending');
    await expect(name).toHaveAttribute('aria-sort', 'none');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent('Alder');
  },
};

// `enableSorting: false` leaves the header as text: no button, no aria-sort.
export const NotSortable: Story = {
  args: {
    columns: helper.columns([
      helper.accessor('name', { header: 'Name' }),
      helper.accessor('status', { header: 'Status', enableSorting: false }),
    ]),
  },
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole('columnheader', { name: 'Status' });
    await expect(status).not.toHaveAttribute('aria-sort');
    await expect(canvas.queryByRole('button', { name: 'Status' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Name' }));
    await expect(canvas.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await expect(status).not.toHaveAttribute('aria-sort');
  },
};

// First column pinned to the start, last column pinned to the end; the middle scrolls.
export const Pinned: Story = {
  args: { columns: pinnedColumns },
  render: (args) => (
    <div className="w-160" data-testid="frame">
      <DataTable {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const name = canvas.getByRole('columnheader', { name: 'Name' });
    const action = canvas.getByRole('columnheader', { name: 'Action' });
    const status = canvas.getByRole('columnheader', { name: 'Status' });
    await expect(name).toHaveAttribute('data-pin', 'start');
    await expect(action).toHaveAttribute('data-pin', 'end');
    await expect(status).not.toHaveAttribute('data-pin');
    await expect(canvas.queryByRole('button', { name: 'Action' })).toBeNull();
    await expect(getComputedStyle(action).borderInlineStartWidth).toBe('1px');

    const scroller = scrollerIn(canvas.getByTestId('frame'));
    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
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

// Caller pins only the start. The second pinned column sits after the first.
export const PinnedStart: Story = {
  args: { columns: startColumns },
  render: (args) => (
    <div className="w-160" data-testid="frame">
      <DataTable {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const name = canvas.getByRole('columnheader', { name: 'Name' });
    const status = canvas.getByRole('columnheader', { name: 'Status' });
    const owner = canvas.getByRole('columnheader', { name: 'Owner' });
    await expect(name).toHaveAttribute('data-pin', 'start');
    await expect(status).toHaveAttribute('data-pin', 'start');
    await expect(owner).not.toHaveAttribute('data-pin');
    await expect(
      Math.abs(status.getBoundingClientRect().left - name.getBoundingClientRect().right),
    ).toBeLessThan(1);

    const scroller = scrollerIn(canvas.getByTestId('frame'));
    const nameLeft = name.getBoundingClientRect().left;
    const statusLeft = status.getBoundingClientRect().left;
    const ownerLeft = owner.getBoundingClientRect().left;
    scroller.scrollLeft = 160;
    await expect(Math.abs(name.getBoundingClientRect().left - nameLeft)).toBeLessThan(1);
    await expect(Math.abs(status.getBoundingClientRect().left - statusLeft)).toBeLessThan(1);
    await expect(owner.getBoundingClientRect().left).toBeLessThan(ownerLeft);
  },
};

// Caller pins only the end. The divider is on that column.
export const PinnedEnd: Story = {
  args: { columns: endColumns },
  render: (args) => (
    <div className="w-160" data-testid="frame">
      <DataTable {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const name = canvas.getByRole('columnheader', { name: 'Name' });
    const action = canvas.getByRole('columnheader', { name: 'Action' });
    await expect(name).not.toHaveAttribute('data-pin');
    await expect(action).toHaveAttribute('data-pin', 'end');
    await expect(getComputedStyle(action).borderInlineStartWidth).toBe('1px');

    const scroller = scrollerIn(canvas.getByTestId('frame'));
    const nameLeft = name.getBoundingClientRect().left;
    const actionRight = action.getBoundingClientRect().right;
    scroller.scrollLeft = 160;
    await expect(name.getBoundingClientRect().left).toBeLessThan(nameLeft);
    await expect(Math.abs(action.getBoundingClientRect().right - actionRight)).toBeLessThan(1);
  },
};

// Plain cells clamp at two lines. A custom cell is left to the caller.
export const Clamped: Story = {
  args: {
    columns: helper.columns([
      helper.accessor('name', { header: 'Name', size: 140 }),
      helper.accessor('note', { header: 'Note', size: 180 }),
    ]),
    data: rows.map((row) => ({ ...row, note: longNote })),
  },
  play: async ({ canvas }) => {
    const note = canvas.getAllByText(longNote)[0];
    if (!(note instanceof HTMLElement)) throw new Error('missing note');
    await expect(note).toHaveClass('line-clamp-2');
    await expect(note.scrollHeight).toBeGreaterThan(note.clientHeight);
    await expect(getComputedStyle(note).webkitLineClamp).toBe('2');
  },
};

// `meta.align: 'center'` centers the cell. The header stays at the start.
export const Centered: Story = {
  args: {
    columns: helper.columns([
      helper.accessor('name', { header: 'Name' }),
      helper.display({
        id: 'select',
        header: 'Select',
        size: 120,
        enableSorting: false,
        meta: { align: 'center' },
        cell: () => <span>On</span>,
      }),
    ]),
  },
  play: async ({ canvas }) => {
    const head = canvas.getByRole('columnheader', { name: 'Select' });
    const headBox = head.getBoundingClientRect();
    const label = head.querySelector('span');
    if (!(label instanceof HTMLElement)) throw new Error('missing header label');
    await expect(label.getBoundingClientRect().left).toBeLessThan(headBox.left + headBox.width / 2);

    const cell = canvas.getAllByRole('cell', { name: 'On' })[0];
    if (!cell) throw new Error('missing cell');
    await expect(cell).toHaveClass(/text-center/);
    const mark = cell.querySelector('span');
    if (!(mark instanceof HTMLElement)) throw new Error('missing centered label');
    const cellBox = cell.getBoundingClientRect();
    const markBox = mark.getBoundingClientRect();
    await expect(
      Math.abs(cellBox.left + cellBox.width / 2 - (markBox.left + markBox.width / 2)),
    ).toBeLessThan(1);
  },
};

// `defaultPageSize` slices the rows and renders PaginationBar. The chip shows the size only.
export const Paginated: Story = {
  args: { defaultPageSize: 2 },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByRole('row')).toHaveLength(3);
    await expect(canvas.getByRole('cell', { name: 'Cedar' })).toBeVisible();
    await expect(canvas.queryByRole('cell', { name: 'Birch' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: '下一页' }));
    await expect(canvas.getByRole('cell', { name: 'Birch' })).toBeVisible();
    await expect(canvas.queryByRole('cell', { name: 'Cedar' })).toBeNull();
    await expect(canvas.getByRole('button', { name: '显示2项' })).toBeVisible();
  },
};

export const Loading: Story = {
  args: { loading: true, loadingRows: 2 },
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: 'Items' });
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(table.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6);
    await expect(canvas.queryByRole('cell', { name: 'Cedar' })).toBeNull();
  },
};

export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: 'Items' })).toBeVisible();
    await expect(canvas.getAllByRole('row')).toHaveLength(1);
    await expect(canvas.queryByRole('cell')).toBeNull();
    await expect(canvas.getByRole('columnheader', { name: 'Name' })).toBeVisible();
  },
};
