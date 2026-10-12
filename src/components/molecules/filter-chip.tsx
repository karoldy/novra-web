import type { ReactNode } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

// AA Library Figma "Chips/Filter". Colors use the theme primary (see AGENTS.md "Theme Color"):
// hover / pressed = --button-primary-hover / -pressed, filtered = subtle tint with navy text.
// No icons are built in: pass them as children.
const chipClasses = cn(
  'group/chip inline-flex h-10 shrink-0 items-center rounded-[0.25rem] border px-3 py-2 whitespace-nowrap select-none',
  'border-chip-border bg-chip text-body2 font-semibold text-chip-foreground transition-colors outline-none',
  'focus-visible:ring-3 focus-visible:ring-ring/50',
  // Figma "Filtered": a value is applied.
  'data-filtered:border-chip-filtered-foreground data-filtered:bg-chip-filtered data-filtered:text-chip-filtered-foreground',
  // Figma "Hover" / "Pressed" (pressed = held, or its dropdown is open).
  'hover:border-button-primary-hover hover:text-button-primary-hover',
  'active:border-button-primary-pressed active:text-button-primary-pressed',
  'aria-expanded:border-button-primary-pressed aria-expanded:text-button-primary-pressed',
  // Figma "Disable": the whole chip at 30%.
  'data-disabled:pointer-events-none data-disabled:opacity-30',
);

type FilterChipProps = ButtonPrimitive.Props & {
  /**
   * Criteria name shown before the value ("Criteria and Result"), as Typography `label3`
   * (16px regular, as in Figma). For other styling, leave it out and put your own element in
   * the children.
   */
  label?: ReactNode;
  /** A filter value is applied. */
  filtered?: boolean;
};

/**
 * Filter chip button. Children are the bold value plus any icons you pass:
 * `data-icon="inline-start"` (24px, e.g. a location pin) and `data-icon="inline-end"`
 * (16px, e.g. a dropdown chevron, which flips while `aria-expanded` is true).
 */
function FilterChip({ label, filtered = false, className, children, ...props }: FilterChipProps) {
  return (
    <ButtonPrimitive
      data-slot="filter-chip"
      data-filtered={filtered || undefined}
      className={cn(
        chipClasses,
        // Figma: 8px between icon / criteria / value, 16px before the trailing icon.
        'gap-2 [&>svg]:shrink-0',
        "[&>[data-icon=inline-start]:not([class*='size-'])]:size-6",
        "[&>[data-icon=inline-end]:not([class*='size-'])]:size-4",
        '[&>[data-icon=inline-end]]:ml-2 [&>[data-icon=inline-end]]:transition-transform',
        'aria-expanded:[&>[data-icon=inline-end]]:rotate-180',
        className,
      )}
      {...props}
    >
      {label != null && <Typography variant="label3">{label}</Typography>}
      {children}
    </ButtonPrimitive>
  );
}

export { FilterChip };
export type { FilterChipProps };
