import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type DividerProps = ComponentProps<typeof Separator> & { inset?: boolean };

function Divider({ inset = false, className, ...props }: DividerProps) {
  return (
    <Separator
      data-slot="divider"
      className={cn(
        inset &&
          'data-[orientation=horizontal]:mx-4 data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-4',
        className,
      )}
      {...props}
    />
  );
}

export { Divider };
export type { DividerProps };
