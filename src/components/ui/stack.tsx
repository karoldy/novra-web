import { useRender } from '@base-ui/react/use-render';
import { cn } from '@/lib/utils';

const ALIGN = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const;

const JUSTIFY = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const;

// Renders a <div> by default; change the element with `render`, e.g. `render={<section />}`.
type StackProps = useRender.ComponentProps<'div'> & {
  align?: keyof typeof ALIGN;
  justify?: keyof typeof JUSTIFY;
  wrap?: boolean;
};

function useStack(
  direction: 'flex-row' | 'flex-col',
  slot: string,
  { align, justify, wrap, className, render, ...props }: StackProps,
) {
  return useRender({
    defaultTagName: 'div',
    // className is taken out above, so a plain spread merges nothing it could lose.
    props: {
      ...props,
      className: cn(
        'flex',
        direction,
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        wrap && 'flex-wrap',
        className,
      ),
    },
    render,
    state: { slot },
  });
}

function XStack(props: StackProps) {
  return useStack('flex-row', 'x-stack', props);
}

function YStack(props: StackProps) {
  return useStack('flex-col', 'y-stack', props);
}

export { XStack, YStack };
export type { StackProps };
