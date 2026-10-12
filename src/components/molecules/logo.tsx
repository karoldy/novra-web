import type { ComponentProps } from 'react';
import LogoHorizontal from '@/assets/logo/Logo_horizontal.svg?react';
import LogoVertical from '@/assets/logo/Logo_vertical.svg?react';
import { cn } from '@/lib/utils';

// SVGs are imported as components (vite-plugin-svgr, width/height stripped). Visible shapes use
// `currentColor`, so color comes from `text-*` and size from `h-*` / `size-*` in className.

type LogoProps = Omit<ComponentProps<'svg'>, 'children'> & {
  variant?: 'horizontal' | 'vertical';
  /** Accessible name. Pass `null` when the logo is decorative. */
  title?: string | null;
};

const logos = {
  horizontal: { Svg: LogoHorizontal, size: 'h-6.5 w-auto' }, // 136×26
  vertical: { Svg: LogoVertical, size: 'size-40' }, // 160×160
} as const;

function Logo({ variant = 'horizontal', title = 'Central Yards', className, ...props }: LogoProps) {
  const { Svg, size } = logos[variant];
  const a11y =
    title === null ? { 'aria-hidden': true } : { role: 'img' as const, 'aria-label': title };

  return (
    <Svg
      data-slot="logo"
      data-variant={variant}
      className={cn('shrink-0', size, className)}
      {...a11y}
      {...props}
    />
  );
}

export { Logo };
export type { LogoProps };
