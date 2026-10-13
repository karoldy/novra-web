import type { ReactNode } from 'react';
import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  columnPinningFeature,
  columnSizingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type RowData,
} from '@tanstack/react-table';

/** Declared on a column. `pin` is read by DataTable; it is not toggled from the table. */
type DataTableColumnMeta = {
  pin?: 'start' | 'end';
  /** Cell alignment. Headers stay at the start. */
  align?: 'start' | 'center';
  /** Fixed column width in px. Pinned columns need this (or `size`) so sticky offsets match. */
  width?: number;
  /** Share of the space left after fixed columns. Ignored when `width` or `size` is set. */
  flex?: number;
  /** Floor for a flex column, in px. Defaults to 120. */
  minWidth?: number;
  className?: string;
  /** What the cell shows while `loading`; a text-height bar by default. */
  skeleton?: ReactNode;
};

const dataTableFeatures = tableFeatures({
  columnPinningFeature,
  columnSizingFeature,
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnMeta: {} as DataTableColumnMeta,
});

type DataTableFeatures = typeof dataTableFeatures;

function createDataTableColumns<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

export { createDataTableColumns, dataTableFeatures };
export type { DataTableColumnMeta, DataTableFeatures };
