import type { ComponentProps } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cn } from '@/lib/utils';

// Based on shadcn/ui "pagination" (same parts and names), changed for this project:
// - AA Library Figma "Pagination" styling: 48px round items, no gap, theme-primary current page.
// - No built-in text or icons: `aria-label`s and arrow icons come from the caller.
// - PaginationLink is a <button> (onClick) or, with `href`, a plain <a> (keeps link semantics).
// - getPaginationItems() decides which pages to show (7 slots, current page with neighbours).
// Don't `shadcn add pagination`: it would also overwrite the customised button.tsx.

/**
 * Pages to show, at most 7 slots (the Figma "Pagination" component has 7 page items): first and
 * last page always, the current page with both neighbours, `…` for the gaps.
 * - ≤ 7 pages: all of them
 * - near the start: `1 2 3 4 5 … 10`
 * - in the middle:  `1 … 4 5 6 … 10`
 * - near the end:   `1 … 6 7 8 9 10`
 */
function getPaginationItems(
  page: number,
  pageCount: number,
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (pageCount <= 7) return range(1, pageCount);
  if (page <= 4) return [...range(1, 5), 'ellipsis-end', pageCount];
  if (page >= pageCount - 3) return [1, 'ellipsis-start', ...range(pageCount - 4, pageCount)];
  return [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', pageCount];
}

type PaginationProps = ComponentProps<'nav'> & {
  /** Name of the navigation landmark; not built in, pass localized text. */
  'aria-label': string;
};

function Pagination({ className, ...props }: PaginationProps) {
  return <nav data-slot="pagination" className={cn('flex', className)} {...props} />;
}

function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul data-slot="pagination-content" className={cn('flex items-center', className)} {...props} />
  );
}

function PaginationItem(props: ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

// Figma "base/Page_Item" / "base/Chevron": 48px circles.
const itemClasses = cn(
  'inline-flex size-12 shrink-0 items-center justify-center rounded-full text-body2 outline-none select-none transition-colors',
  'focus-visible:ring-2 focus-visible:ring-primary',
  "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
);
const interactiveClasses = 'hover:bg-button-subtle-hover active:bg-button-subtle-pressed';

type PaginationLinkProps = { isActive?: boolean } & (
  | (Omit<ButtonPrimitive.Props, 'render' | 'nativeButton'> & { href?: undefined })
  | (ComponentProps<'a'> & { href: string; disabled?: boolean })
);

/**
 * A page. `isActive` marks the current page (Figma "Current", `aria-current="page"`).
 * Without `href` it is a `<button>` (onClick); with `href` a real `<a>`, so it keeps link
 * semantics (Base UI Button would add `role="button"` to an `<a>`).
 */
function PaginationLink({ isActive = false, className, ...props }: PaginationLinkProps) {
  const shared = {
    'data-slot': 'pagination-link',
    'data-active': isActive || undefined,
    'aria-current': isActive ? ('page' as const) : undefined,
    className: cn(
      itemClasses,
      isActive
        ? 'bg-primary text-primary-foreground'
        : cn('text-pagination-foreground', interactiveClasses),
      className,
    ),
  };

  if (props.href != null) {
    const { disabled, href, ...anchorProps } = props;
    return (
      <a
        {...shared}
        // A disabled link has no href: not focusable, not followable.
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        {...anchorProps}
      />
    );
  }
  return <ButtonPrimitive {...shared} {...props} />;
}

type PaginationArrowProps = PaginationLinkProps & {
  /** Icon-only control: a localized name is required. */
  'aria-label': string;
};

const arrowClasses =
  'text-pagination-muted data-disabled:pointer-events-none data-disabled:text-pagination-disabled';

/** Figma "base/Chevron" (Previous Page). Pass the icon as children. */
function PaginationPrevious({ className, ...props }: PaginationArrowProps) {
  return (
    <PaginationLink
      data-slot="pagination-previous"
      className={cn(arrowClasses, className)}
      {...props}
    />
  );
}

/** Figma "base/Chevron" (Next Page). Pass the icon as children. */
function PaginationNext({ className, ...props }: PaginationArrowProps) {
  return (
    <PaginationLink
      data-slot="pagination-next"
      className={cn(arrowClasses, className)}
      {...props}
    />
  );
}

/** Figma "More". Hidden from screen readers: the page links say it all. */
function PaginationEllipsis({ className, children = '…', ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(itemClasses, 'text-pagination-foreground', className)}
      {...props}
    >
      {children}
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationItems,
};
export type { PaginationArrowProps, PaginationLinkProps, PaginationProps };
