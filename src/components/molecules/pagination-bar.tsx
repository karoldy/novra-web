import type { ComponentProps } from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FilterChip } from '@/components/molecules/filter-chip';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationItems,
} from '@/components/ui/pagination';
import { XStack } from '@/components/ui/stack';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

type PaginationBarProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Current page, 1-based. */
  page: number;
  /** Total number of items. */
  total: number;
  /** Items per page. */
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Landmark name. Set this when more than one bar is on the page. */
  label?: string;
};

/**
 * AA Library Figma "Pagination": page summary and page-size chip on the left, page navigation
 * on the right; the navigation is left out when there is only one page (Figma "If only 1 page").
 * Everything is built in: texts from i18n (`pagination.*`), icons from lucide.
 */
function PaginationBar({
  page,
  total,
  pageSize,
  onPageChange,
  label,
  className,
  ...props
}: PaginationBarProps) {
  const { t } = useTranslation();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const goTo = (target: number) => {
    if (target !== page && target >= 1 && target <= pageCount) onPageChange(target);
  };

  return (
    <XStack
      data-slot="pagination-bar"
      align="center"
      justify="between"
      wrap
      // Full width of its container; the two groups wrap onto separate lines when it is narrow.
      className={cn('w-full gap-4', className)}
      {...props}
    >
      <XStack align="center" wrap className="gap-3">
        <Typography variant="body2" className="text-pagination-muted">
          {t('pagination.summary', {
            page,
            pageCount,
            total,
            // A single number when the range is one item (or empty, Figma "0 項內的 0 項").
            range: from === to ? String(to) : `${from}–${to}`,
          })}
        </Typography>
        {/* Page-size menu has no design yet; the chip shows the current size. */}
        <FilterChip filtered>
          {t('pagination.pageSize', { count: pageSize })}
          <ChevronDownIcon data-icon="inline-end" />
        </FilterChip>
      </XStack>
      {pageCount > 1 && (
        <Pagination aria-label={label ?? t('pagination.label')}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-label={t('pagination.previous')}
                disabled={page <= 1}
                onClick={() => goTo(page - 1)}
              >
                <ChevronLeftIcon />
              </PaginationPrevious>
            </PaginationItem>
            {getPaginationItems(page, pageCount).map((item) => (
              <PaginationItem key={item}>
                {typeof item === 'number' ? (
                  <PaginationLink isActive={item === page} onClick={() => goTo(item)}>
                    {item}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                aria-label={t('pagination.next')}
                disabled={page >= pageCount}
                onClick={() => goTo(page + 1)}
              >
                <ChevronRightIcon />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </XStack>
  );
}

export { PaginationBar };
export type { PaginationBarProps };
