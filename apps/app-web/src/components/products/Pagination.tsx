import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
}

export const Pagination = React.memo(({ pagination, onPageChange }: PaginationProps) => {
  const { page, totalPages } = pagination;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of the middle section
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Adjust if we're near the beginning or end
      if (page <= 3) {
        end = Math.min(totalPages - 1, 4);
      } else if (page >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </Button>

      {getPageNumbers().map((pageNum, index) => (
        <Button
          key={index}
          variant={pageNum === page ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            typeof pageNum === 'number' ? onPageChange(pageNum) : null
          }
          disabled={typeof pageNum !== 'number'}
          className={typeof pageNum !== 'number' ? 'cursor-default' : ''}
        >
          {pageNum}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </Button>
    </div>
  );
});