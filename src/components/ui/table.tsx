import type { ComponentProps, CSSProperties } from 'react';
import { ArrowRightIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// AA Library Figma "Table": body2 text, 24×16 padding, 63px rows on a rounded blue strip.
// Sort and the row arrow are built in (lucide). Callers still pass the labels.

type TablePin = 'start' | 'end';

type TableCellProps = ComponentProps<'td'> & {
  /** Logical pin. `start` sticks to the inline start, `end` to the inline end. */
  pin?: TablePin;
  /** The end-pinned column that sits against the scrolling cells. */
  edge?: boolean;
  style?: CSSProperties;
};

function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      tabIndex={0}
      className="relative w-full min-w-0 overflow-x-auto focus-visible:outline-none"
    >
      <table
        data-slot="table"
        className={cn(
          // 8px between rows. The top edge of border-spacing is cancelled so the header sits flush.
          'w-max min-w-full -mt-2 table-fixed border-separate border-spacing-x-0 border-spacing-y-2 text-body2',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn(className)} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn(className)} {...props} />;
}

function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('text-body2 text-table-header', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn('outline-none focus-visible:ring-2 focus-visible:ring-primary', className)}
      {...props}
    />
  );
}

function TableHead({
  className,
  pin,
  edge = false,
  style,
  ...props
}: ComponentProps<'th'> & Pick<TableCellProps, 'pin' | 'edge' | 'style'>) {
  return (
    <th
      data-slot="table-head"
      data-pin={pin}
      style={style}
      className={cn(
        'bg-background px-6 py-4 text-start align-middle font-normal wrap-break-word text-table-header',
        pin && 'sticky z-20',
        edge && 'border-s border-table-pin-header',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, pin, edge = false, style, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      data-pin={pin}
      style={style}
      className={cn(
        'h-[63px] bg-table-row px-6 py-4 align-middle wrap-break-word text-table-foreground',
        'first:rounded-s-[4px] last:rounded-e-[4px]',
        pin && 'sticky z-10',
        edge && 'border-s border-table-pin',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-body2 text-table-header', className)}
      {...props}
    />
  );
}

type TableSortDirection = 'asc' | 'desc' | false;

function TableSortButton({
  direction,
  className,
  children,
  ...props
}: ComponentProps<'button'> & { direction: TableSortDirection }) {
  const Icon = direction === 'desc' ? ChevronDownIcon : ChevronUpIcon;
  return (
    <button
      type="button"
      data-slot="table-sort-button"
      data-sorted={direction || undefined}
      className={cn(
        'inline-flex w-full max-w-full cursor-pointer items-center gap-1 rounded-sm text-start text-table-header outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
      {...props}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      <span className="min-w-0 wrap-break-word">{children}</span>
    </button>
  );
}

function TableRowArrow({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <ArrowRightIcon
      aria-hidden
      data-slot="table-row-arrow"
      className={cn('size-6 text-table-header', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableSortButton,
  TableRowArrow,
};

export type { TablePin, TableSortDirection };
