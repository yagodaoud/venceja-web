import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages?: number;
  total?: number;
  size?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const PaginationControls = ({
  currentPage,
  totalPages: providedTotalPages,
  total,
  size,
  onPageChange,
  className,
}: PaginationControlsProps) => {
  const { t } = useTranslation();

  // Calculate totalPages from total and size if not provided
  // Use providedTotalPages if available, otherwise calculate from total and size
  let totalPages: number;

  if (providedTotalPages !== undefined) {
    totalPages = providedTotalPages;
  } else if (total !== undefined && size !== undefined && size > 0) {
    totalPages = Math.ceil(total / size);
  } else {
    // Neither totalPages nor (total and size) provided, or invalid size
    return null;
  }

  // Guard against invalid values
  if (!totalPages || totalPages <= 1 || isNaN(totalPages) || !isFinite(totalPages)) {
    return null;
  }

  // Ensure currentPage is valid
  const safeCurrentPage = Math.max(0, Math.min(currentPage, totalPages - 1));

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);

      // Determine which pages to show around current page
      let start: number;
      let end: number;

      if (safeCurrentPage <= 2) {
        // Near the start: show pages 1, 2, 3
        start = 1;
        end = Math.min(3, totalPages - 2);
      } else if (safeCurrentPage >= totalPages - 3) {
        // Near the end: show last few pages before the last one
        start = Math.max(1, totalPages - 4);
        end = totalPages - 2;
      } else {
        // In the middle: show current - 1, current, current + 1
        start = safeCurrentPage - 1;
        end = safeCurrentPage + 1;
      }

      // Add ellipsis before middle pages if there's a gap
      if (start > 2) {
        pages.push('ellipsis');
      }

      // Add pages around current
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after middle pages if there's a gap
      if (end < totalPages - 3) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages - 1);
    }

    // Remove duplicates and filter out invalid page numbers
    const uniquePages: (number | 'ellipsis')[] = [];
    const seen = new Set<number>();

    for (const page of pages) {
      if (page === 'ellipsis') {
        uniquePages.push(page);
      } else if (typeof page === 'number' && !isNaN(page) && page >= 0 && page < totalPages && !seen.has(page)) {
        seen.add(page);
        uniquePages.push(page);
      }
    }

    return uniquePages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (safeCurrentPage > 0) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (safeCurrentPage < totalPages - 1) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  const handlePageClick = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof page === 'number' && !isNaN(page)) {
      onPageChange(page);
    }
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={handlePrevious}
            size="icon"
            aria-label={t('anterior')}
            className={cn(safeCurrentPage === 0 && 'pointer-events-none opacity-50')}
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>

        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          if (typeof page !== 'number' || isNaN(page)) {
            return null;
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={handlePageClick(page)}
                isActive={safeCurrentPage === page}
                aria-label={`${t('pagina')} ${page + 1}`}
                className="h-10 min-w-[2.5rem] px-3"
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={handleNext}
            size="icon"
            aria-label={t('proxima')}
            className={cn(safeCurrentPage >= totalPages - 1 && 'pointer-events-none opacity-50')}
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

