import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import {
  useTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type SortingState,
} from '@tanstack/react-table';
import { PaginationBar } from '@/components/molecules/pagination-bar';
import {
  dataTableFeatures,
  type DataTableColumnMeta,
  type DataTableFeatures,
} from '@/components/molecules/data-table-columns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
  type TablePin,
  type TableSortDirection,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { YStack } from '@/components/ui/stack';
import { cn } from '@/lib/utils';

const DEFAULT_FLEX_MIN_WIDTH = 120;
const PIN_WIDTH = 150;

const ARIA_SORT = { asc: 'ascending', desc: 'descending', false: 'none' } as const;

const CELL_SKELETON = <Skeleton className="h-5 w-full max-w-28" />;

type PinColumn = {
  id?: string;
  accessorKey?: unknown;
  size?: number;
  cell?: unknown;
  meta?: DataTableColumnMeta;
  columns?: readonly PinColumn[];
};

function columnId(column: PinColumn) {
  if (typeof column.id === 'string' && column.id) return column.id;
  if (typeof column.accessorKey === 'string') return column.accessorKey;
  return undefined;
}

/** Pixel width the caller declared. TanStack's default size (150) is not a declaration. */
function declaredWidth(column: PinColumn) {
  if (column.meta?.width != null) return column.meta.width;
  if (typeof column.size === 'number') return column.size;
  return undefined;
}

function columnPlan(columns: readonly PinColumn[]) {
  const widths = new Map<string, number>();
  const customCells = new Set<string>();
  const start: string[] = [];
  const end: string[] = [];
  const walk = (defs: readonly PinColumn[]) => {
    for (const column of defs) {
      if (column.columns) {
        walk(column.columns);
        continue;
      }
      const id = columnId(column);
      if (!id) continue;
      const width = declaredWidth(column);
      if (width != null) widths.set(id, width);
      // The resolved column def always has TanStack's default cell. Only a cell on the
      // caller's def is custom, and those skip the two-line clamp.
      if (column.cell != null) customCells.add(id);
      if (column.meta?.pin === 'start') start.push(id);
      else if (column.meta?.pin === 'end') end.push(id);
    }
  };
  walk(columns);
  return { widths, customCells, pinning: { start, end } };
}

type LayoutColumn = { width?: number; flex?: number; minWidth?: number };

function columnLayout(columns: LayoutColumn[]) {
  const fixed = columns.reduce((sum, column) => sum + (column.width ?? 0), 0);
  const flex = columns.map((column) => (column.width == null ? (column.flex ?? 1) : 0));
  const totalFlex = flex.reduce((sum, share) => sum + share, 0);
  const floor = columns.reduce(
    (sum, column, index) => sum + (flex[index] ? (column.minWidth ?? DEFAULT_FLEX_MIN_WIDTH) : 0),
    fixed,
  );
  return {
    cols: columns.map((column, index) => {
      if (column.width != null) return `${column.width}px`;
      if (totalFlex === 0) return `${column.minWidth ?? DEFAULT_FLEX_MIN_WIDTH}px`;
      return `calc((100% - ${fixed}px) * ${flex[index]} / ${totalFlex})`;
    }),
    table: totalFlex > 0 ? { minWidth: floor } : { width: fixed },
  };
}

function sortDirection(columnId: string, sorting: SortingState): TableSortDirection {
  const match = sorting.find((item) => item.id === columnId);
  if (!match) return false;
  return match.desc ? 'desc' : 'asc';
}

function pinStyle(
  id: string,
  meta: DataTableColumnMeta | undefined,
  widths: Map<string, number>,
  pinning: { start: string[]; end: string[] },
): { pin?: TablePin; edge: boolean; style?: CSSProperties } {
  const pin = meta?.pin;
  const width = widths.get(id) ?? (pin ? PIN_WIDTH : undefined);
  if (pin !== 'start' && pin !== 'end') {
    return { edge: false, style: width != null ? { width, minWidth: width } : undefined };
  }
  const size = width ?? PIN_WIDTH;
  if (pin === 'start') {
    const index = pinning.start.indexOf(id);
    if (index < 0) return { edge: false, style: { width: size, minWidth: size } };
    let offset = 0;
    for (let i = 0; i < index; i++) offset += widths.get(pinning.start[i] ?? '') ?? PIN_WIDTH;
    return { pin, edge: false, style: { width: size, minWidth: size, insetInlineStart: offset } };
  }
  const index = pinning.end.indexOf(id);
  if (index < 0) return { edge: false, style: { width: size, minWidth: size } };
  let offset = 0;
  for (let i = index + 1; i < pinning.end.length; i++) {
    offset += widths.get(pinning.end[i] ?? '') ?? PIN_WIDTH;
  }
  return {
    pin,
    edge: index === 0,
    style: { width: size, minWidth: size, insetInlineEnd: offset },
  };
}

type DataTableProps<TData extends RowData> = {
  columns: Array<ColumnDef<DataTableFeatures, TData, unknown>>;
  data: TData[];
  /** Name of the table. Not built in; pass localized text. */
  'aria-label': string;
  getRowId?: (row: TData, index: number) => string;
  /** Controlled sorting. Leave both out and the table keeps its own state. */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  /** Sort on the server. Off by default, so the table sorts `data` itself. */
  manualSorting?: boolean;
  /** Controlled pagination. Leave this and `defaultPageSize` out for one page. */
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  defaultPageSize?: number;
  /** Page on the server. Off by default, so `defaultPageSize` slices `data`. */
  manualPagination?: boolean;
  /** Total rows on the server, for manual pagination. */
  rowCount?: number;
  /** Makes each row a click and Enter target. */
  onRowClick?: (row: TData) => void;
  /** Shown in one full-width row when `data` is empty. */
  empty?: ReactNode;
  /** Skeleton rows instead of data. */
  loading?: boolean;
  loadingRows?: number;
  /** Landmark name for the page navigation, when more than one bar is on the page. */
  label?: string;
  className?: string;
};

function DataTable<TData extends RowData>({
  columns,
  data,
  'aria-label': ariaLabel,
  getRowId,
  sorting: sortingProp,
  onSortingChange,
  manualSorting = false,
  pagination: paginationProp,
  onPaginationChange,
  defaultPageSize,
  manualPagination = false,
  rowCount,
  onRowClick,
  empty,
  loading = false,
  loadingRows = 3,
  label,
  className,
}: DataTableProps<TData>) {
  const [innerSorting, setInnerSorting] = useState<SortingState>([]);
  const sorting = sortingProp ?? innerSorting;

  const paginated = paginationProp != null || defaultPageSize != null;
  const [innerPagination, setInnerPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize ?? Number.POSITIVE_INFINITY,
  });
  const pagination = paginationProp ?? innerPagination;
  const plan = columnPlan(columns as readonly PinColumn[]);

  const resetPage = () => {
    if (!paginated) return;
    setInnerPagination((current) => ({ ...current, pageIndex: 0 }));
    onPaginationChange?.((current) => ({ ...current, pageIndex: 0 }));
  };

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    manualSorting,
    sortDescFirst: false,
    enableMultiSort: false,
    // Unpaginated tables stay manual so every row renders.
    manualPagination: paginated ? manualPagination : true,
    rowCount,
    state: { sorting, pagination, columnPinning: plan.pinning },
    onSortingChange: (updater) => {
      setInnerSorting(updater);
      onSortingChange?.(updater);
      resetPage();
    },
    onPaginationChange: (updater) => {
      setInnerPagination(updater);
      onPaginationChange?.(updater);
    },
    // Pinning is declared on columns, so this slice stays controlled by the caller.
    onColumnPinningChange: () => undefined,
  });

  const rows = table.getRowModel().rows;
  const leafColumns = [
    ...table.getStartLeafColumns(),
    ...table.getCenterLeafColumns(),
    ...table.getEndLeafColumns(),
  ];
  const layout = columnLayout(
    leafColumns.map((column) => {
      const meta = column.columnDef.meta;
      const pinned = meta?.pin === 'start' || meta?.pin === 'end';
      const width = plan.widths.get(column.id) ?? (pinned ? PIN_WIDTH : undefined);
      return { width, flex: meta?.flex, minWidth: meta?.minWidth };
    }),
  );

  const headerRows = () => {
    const start = table.getStartHeaderGroups();
    const center = table.getCenterHeaderGroups();
    const end = table.getEndHeaderGroups();
    const count = Math.max(start.length, center.length, end.length);
    return Array.from({ length: count }, (_, index) => [
      ...(start[index]?.headers ?? []),
      ...(center[index]?.headers ?? []),
      ...(end[index]?.headers ?? []),
    ]);
  };

  const content = (
    <Table
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={className}
      style={layout.table}
    >
      <colgroup>
        {leafColumns.map((column, index) => (
          <col key={column.id} style={{ width: layout.cols[index] }} />
        ))}
      </colgroup>
      <TableHeader>
        {headerRows().map((headers, index) => (
          <TableRow key={index}>
            {headers.map((header) => {
              const { column } = header;
              const meta = column.columnDef.meta;
              const { pin, edge, style } = pinStyle(column.id, meta, plan.widths, plan.pinning);
              const canSort = column.getCanSort();
              const direction = sortDirection(column.id, sorting);
              return (
                <TableHead
                  key={header.id}
                  scope="col"
                  colSpan={header.colSpan}
                  pin={pin}
                  edge={edge}
                  style={style}
                  aria-sort={canSort ? ARIA_SORT[`${direction}`] : undefined}
                  className={meta?.className}
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <TableSortButton
                      direction={direction}
                      onClick={column.getToggleSortingHandler()}
                    >
                      <table.FlexRender header={header} />
                    </TableSortButton>
                  ) : (
                    <span className="inline-flex min-w-0">
                      <table.FlexRender header={header} />
                    </span>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: loadingRows }, (_, index) => (
              <TableRow key={index} aria-hidden>
                {leafColumns.map((column) => {
                  const meta = column.columnDef.meta;
                  const { pin, edge, style } = pinStyle(column.id, meta, plan.widths, plan.pinning);
                  return (
                    <TableCell
                      key={column.id}
                      pin={pin}
                      edge={edge}
                      style={style}
                      className={meta?.className}
                    >
                      {meta?.skeleton ?? CELL_SKELETON}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          : rows.length > 0
            ? rows.map((row) => (
                <TableRow
                  key={row.id}
                  {...(onRowClick && {
                    tabIndex: 0,
                    className: 'cursor-pointer',
                    onClick: () => onRowClick(row.original),
                    onKeyDown: (event: KeyboardEvent) => {
                      if (event.key === 'Enter' && event.target === event.currentTarget) {
                        onRowClick(row.original);
                      }
                    },
                  })}
                >
                  {[
                    ...row.getStartVisibleCells(),
                    ...row.getCenterVisibleCells(),
                    ...row.getEndVisibleCells(),
                  ].map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    const { pin, edge, style } = pinStyle(
                      cell.column.id,
                      meta,
                      plan.widths,
                      plan.pinning,
                    );
                    const centered = meta?.align === 'center';
                    const plain = !plan.customCells.has(cell.column.id);
                    return (
                      <TableCell
                        key={cell.id}
                        pin={pin}
                        edge={edge}
                        style={style}
                        className={cn(meta?.className, centered && 'text-center')}
                      >
                        {plain ? (
                          <span className={cn('line-clamp-2', centered && 'text-center')}>
                            <table.FlexRender cell={cell} />
                          </span>
                        ) : (
                          <div className={cn('min-w-0', centered && 'flex justify-center')}>
                            <table.FlexRender cell={cell} />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            : empty != null && (
                <TableRow>
                  <TableCell colSpan={leafColumns.length} className="text-center">
                    {empty}
                  </TableCell>
                </TableRow>
              )}
      </TableBody>
    </Table>
  );

  const total = table.getRowCount();
  if (!paginated || total === 0) return content;

  return (
    <YStack className="min-w-0 gap-6">
      {content}
      <PaginationBar
        page={pagination.pageIndex + 1}
        total={total}
        pageSize={pagination.pageSize}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        label={label}
      />
    </YStack>
  );
}

export { DataTable };
export type { DataTableProps };
