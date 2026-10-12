import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

// Styles follow the AA Library Figma "Button" set. Variant names stay shadcn's so shadcn
// components keep working: default = Primary, outline = Secondary, ghost = Tertiary,
// destructive = Danger, destructive-outline = Danger Secondary.
const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary
        default:
          'bg-button-primary text-button-primary-foreground hover:bg-button-primary-hover active:bg-button-primary-pressed disabled:bg-button-disabled disabled:text-button-disabled-foreground',
        // Secondary
        outline:
          'border-button-accent text-button-accent hover:border-button-subtle-foreground hover:bg-button-subtle-hover hover:text-button-subtle-foreground active:bg-button-subtle-pressed active:text-button-subtle-foreground aria-expanded:bg-button-subtle-hover aria-expanded:text-button-subtle-foreground disabled:border-button-disabled-foreground disabled:text-button-disabled-foreground',
        // Tertiary
        ghost:
          'text-button-accent hover:bg-button-subtle-hover hover:text-button-subtle-foreground active:bg-button-subtle-pressed active:text-button-subtle-foreground aria-expanded:bg-button-subtle-hover aria-expanded:text-button-subtle-foreground disabled:text-button-disabled-foreground',
        // Danger
        destructive:
          'text-button-danger hover:bg-button-danger-subtle-hover hover:text-button-danger-hover active:bg-button-danger-subtle-pressed active:text-button-danger-pressed focus-visible:border-destructive/40 focus-visible:ring-destructive/20 disabled:text-button-disabled-foreground',
        // Danger Secondary
        'destructive-outline':
          'border-button-danger text-button-danger hover:bg-button-danger-subtle-hover hover:text-button-danger-hover active:bg-button-danger-subtle-pressed active:text-button-danger-pressed focus-visible:ring-destructive/20 disabled:border-button-disabled-foreground disabled:text-button-disabled-foreground',
        // Not in Figma; kept because shadcn components use them.
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground disabled:opacity-50',
        link: 'text-primary underline-offset-4 hover:underline disabled:opacity-50',
      },
      size: {
        // Figma "Default": 48px, button1 text, 24px icon, min width 140
        default: "h-12 min-w-35 gap-2 px-3 text-button1 [&_svg:not([class*='size-'])]:size-6",
        // Figma "Small": 40px, button2 text, 24px icon, min width 132
        sm: "h-10 min-w-33 gap-2 px-2 text-button2 [&_svg:not([class*='size-'])]:size-6",
        // Not in Figma; shadcn sizes kept for shadcn components.
        lg: "h-9 gap-1.5 px-2.5 text-sm font-medium [&_svg:not([class*='size-'])]:size-4",
        xs: "h-6 gap-1 px-2 text-xs font-medium in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        icon: "size-8 [&_svg:not([class*='size-'])]:size-4",
        'icon-xs':
          "size-6 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          "size-7 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-4",
        'icon-lg': "size-9 [&_svg:not([class*='size-'])]:size-4",
      },
      // Figma "On White=no": outline/ghost text and border turn white for dark or colored surfaces.
      onDark: {
        true: '[--button-accent:var(--color-white)]',
      },
      // Figma "State=Skeleton": placeholder while the action is loading. Not interactive.
      skeleton: {
        true: 'pointer-events-none border-transparent bg-button-skeleton text-transparent disabled:border-transparent disabled:bg-button-skeleton disabled:text-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /**
     * Shows a Spinner in place of the leading icon (text stays) and ignores clicks. Keeps its
     * normal colors and focus (`aria-disabled`, not native `disabled`), unlike `disabled`.
     */
    loading?: boolean;
  };

function Button({
  className,
  variant = 'default',
  size = 'default',
  onDark,
  skeleton,
  loading = false,
  disabled,
  focusableWhenDisabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={loading || undefined}
      aria-busy={skeleton || loading || undefined}
      disabled={disabled || loading || Boolean(skeleton)}
      // Loading alone: block interaction but keep enabled styling and focus.
      focusableWhenDisabled={focusableWhenDisabled || (loading && !disabled && !skeleton)}
      className={cn(
        buttonVariants({ variant, size, onDark, skeleton }),
        // The spinner replaces the leading icon.
        loading &&
          'pointer-events-none [&>[data-icon=inline-start]:not([data-slot=spinner])]:hidden',
        className,
      )}
      {...props}
    >
      {/* 16px on every size: a 24px spinner (icon size) looks too heavy next to the text. */}
      {loading && <Spinner size="sm" data-icon="inline-start" />}
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
