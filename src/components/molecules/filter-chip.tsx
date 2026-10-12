import type { ComponentProps, ReactNode } from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// AA Library Figma "Chips/Filter". Colors use the theme primary (see AGENTS.md "Theme Color"):
// hover / pressed = --button-primary-hover / -pressed, filtered = subtle tint with navy text.
const chipClasses = cn(
  'group/chip inline-flex h-10 shrink-0 items-center gap-4 rounded-[0.25rem] border px-3 py-2 whitespace-nowrap select-none',
  'border-chip-border bg-chip text-chip-foreground transition-colors outline-none',
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

const valueClasses = 'text-body2 font-semibold';

type FilterChipProps = Omit<ButtonPrimitive.Props, 'children'> & {
  /** The value shown in bold ("Result"). */
  children: ReactNode;
  /** Criteria name shown before the value in regular weight ("Criteria and Result"). */
  label?: ReactNode;
  /** Leading 24px icon ("Dropdown with icon"). Takes the chip's text color. */
  icon?: ReactNode;
  /** Trailing chevron for dropdown triggers; it flips up while `aria-expanded` is true. */
  dropdown?: boolean;
  /** A filter value is applied. */
  filtered?: boolean;
};

/**
 * Filter chip button. Use it as a dropdown trigger (`dropdown`), a quick toggle
 * (`aria-pressed` + `filtered`), or to show a "Criteria Result" pair (`label`).
 */
function FilterChip({
  children,
  label,
  icon,
  dropdown = false,
  filtered = false,
  className,
  ...props
}: FilterChipProps) {
  return (
    <ButtonPrimitive
      data-slot="filter-chip"
      data-filtered={filtered || undefined}
      className={cn(chipClasses, className)}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {icon && (
          <span aria-hidden className="inline-flex [&_svg]:size-6 [&_svg]:shrink-0">
            {icon}
          </span>
        )}
        {label && <span className="text-body2">{label}</span>}
        <span className={valueClasses}>{children}</span>
      </span>
      {dropdown && (
        <ChevronDownIcon
          aria-hidden
          className="size-4 shrink-0 transition-transform group-aria-expanded/chip:rotate-180"
        />
      )}
    </ButtonPrimitive>
  );
}

type FilterChipStepperProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The current value, e.g. a date. Announced politely when it changes. */
  children: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  /** Accessible names for the arrow buttons; not built in, pass localized text. */
  prevLabel: string;
  nextLabel: string;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  filtered?: boolean;
  disabled?: boolean;
};

const stepButtonClasses =
  'inline-flex size-6 -m-1 items-center justify-center rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:opacity-30';

/** Figma "Date Selection": ‹ value ›, stepping to the previous / next value. */
function FilterChipStepper({
  children,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  prevDisabled = false,
  nextDisabled = false,
  filtered = false,
  disabled = false,
  className,
  ...props
}: FilterChipStepperProps) {
  return (
    <div
      role="group"
      data-slot="filter-chip-stepper"
      data-filtered={filtered || undefined}
      data-disabled={disabled || undefined}
      className={cn(chipClasses, 'focus-within:border-button-primary-hover', className)}
      {...props}
    >
      <ButtonPrimitive
        aria-label={prevLabel}
        disabled={disabled || prevDisabled}
        onClick={onPrev}
        className={stepButtonClasses}
      >
        <ChevronLeftIcon aria-hidden className="size-4" />
      </ButtonPrimitive>
      <span aria-live="polite" className={valueClasses}>
        {children}
      </span>
      <ButtonPrimitive
        aria-label={nextLabel}
        disabled={disabled || nextDisabled}
        onClick={onNext}
        className={stepButtonClasses}
      >
        <ChevronRightIcon aria-hidden className="size-4" />
      </ButtonPrimitive>
    </div>
  );
}

export { FilterChip, FilterChipStepper };
export type { FilterChipProps, FilterChipStepperProps };
