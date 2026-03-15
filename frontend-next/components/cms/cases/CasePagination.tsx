'use client';

import React from 'react';

interface CasePaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly limit: number;
  readonly onPageChange: (page: number) => void;
  readonly onLimitChange: (limit: number) => void;
}

const PAGE_SIZES = [25, 50, 100] as const;

function buildPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function CasePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: CasePaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3">
      {/* Info + page size */}
      <div className="flex items-center gap-4 text-sm text-[#6C757D]">
        <span>
          Showing <span className="font-semibold text-[#333333]">{startItem}-{endItem}</span> of{' '}
          <span className="font-semibold text-[#333333]">{total}</span> cases
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs">Rows:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
            className="
              h-8 px-2 pr-6 rounded-md border border-gray-300 bg-white
              text-sm text-[#333333] appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4]
            "
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 6px center',
            }}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="
            flex items-center justify-center w-8 h-8 rounded-md
            text-[#6C757D] hover:bg-gray-100 hover:text-[#333333]
            transition-colors disabled:opacity-30 disabled:cursor-not-allowed
          "
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((item, idx) => {
          if (item === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex items-center justify-center w-8 h-8 text-sm text-[#6C757D]"
              >
                ...
              </span>
            );
          }

          const isActive = item === page;
          return (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`
                flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium
                transition-colors
                ${isActive
                  ? 'bg-[#4472C4] text-white'
                  : 'text-[#333333] hover:bg-gray-100'
                }
              `.trim()}
            >
              {item}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="
            flex items-center justify-center w-8 h-8 rounded-md
            text-[#6C757D] hover:bg-gray-100 hover:text-[#333333]
            transition-colors disabled:opacity-30 disabled:cursor-not-allowed
          "
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
