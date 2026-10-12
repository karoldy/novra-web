import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// AA Library Figma "Loading". viewBox = pixel size, so stroke widths are the Figma values.
// `arc` is the blue segment as a share of the circle (pathLength=100): 144° for sm/md, 302° for lg.
const sizes = {
  sm: { px: 16, stroke: 3, arc: 40, track: true, className: 'size-4' },
  md: { px: 24, stroke: 4.5, arc: 40, track: true, className: 'size-6' },
  lg: { px: 88, stroke: 10, arc: 83.9, track: false, className: 'size-22' },
} as const;

type SpinnerProps = Omit<ComponentProps<'svg'>, 'children'> & {
  size?: keyof typeof sizes;
};

/**
 * Loading indicator only, no text. Decorative (`aria-hidden`) unless you give it a name with
 * `aria-label` / `aria-labelledby`, in which case it is announced as `role="status"`.
 */
function Spinner({ size = 'sm', className, ...props }: SpinnerProps) {
  const { px, stroke, arc, track, className: sizeClass } = sizes[size];
  const center = px / 2;
  const radius = (px - stroke) / 2;
  const named = props['aria-label'] != null || props['aria-labelledby'] != null;

  return (
    <svg
      data-slot="spinner"
      data-size={size}
      viewBox={`0 0 ${px} ${px}`}
      fill="none"
      {...(named ? { role: 'status' } : { 'aria-hidden': true })}
      className={cn(
        // Figma: 4 × 90° steps of 180ms, linear → one turn every 720ms. Slower, not stopped,
        // with reduced motion: a frozen spinner would no longer say "loading".
        'shrink-0 animate-spin [animation-duration:720ms] motion-reduce:[animation-duration:2s]',
        // Inside a Button, follow the button's text color (white on Primary, gray when disabled).
        'in-data-[slot=button]:[--spinner-indicator:currentColor] in-data-[slot=button]:[--spinner-track:color-mix(in_oklab,currentColor_25%,transparent)]',
        sizeClass,
        className,
      )}
      {...props}
    >
      {track && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          className="stroke-spinner-track"
        />
      )}
      <circle
        cx={center}
        cy={center}
        r={radius}
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${arc} 100`}
        // Start at 9 o'clock like the Figma arc.
        transform={`rotate(180 ${center} ${center})`}
        className="stroke-spinner-indicator"
      />
    </svg>
  );
}

export { Spinner };
export type { SpinnerProps };
