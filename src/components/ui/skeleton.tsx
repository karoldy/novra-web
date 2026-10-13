import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      className={cn('animate-pulse rounded-lg bg-muted motion-reduce:animate-none', className)}
      {...props}
    />
  );
}

export { Skeleton };
