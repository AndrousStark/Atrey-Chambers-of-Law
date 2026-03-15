'use client';

import React from 'react';

interface CmsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

function buildPageNumbers(current: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < totalPages - 2) {
    pages.push('...');
  }

  pages.push(totalPages);

  return pages;
}

export default function CmsPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: CmsPaginationProps) {
  if (totalPages <= 1) return null;

  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);
  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
      <p className="text-sm text-[#6C757D]">
        Showing{' '}
        <span className="font-semibold text-[#333333]">{rangeStart}</span>
        {' - '}
        <span className="font-semibold text-[#333333]">{rangeEnd}</span>
        {' of '}
        <span className="font-semibold text-[#333333]">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 text-[#6C757D] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((p, idx) =>
          p === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1.5 text-sm text-[#6C757D]"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={p === page}
              className={`
                min-w-[34px] px-2.5 py-1.5 text-sm rounded-lg border transition-colors
                ${
                  p === page
                    ? 'bg-[#4472C4] text-white border-[#4472C4] font-semibold'
                    : 'border-gray-300 text-[#333333] hover:bg-[#F0F2F5]'
                }
              `.trim()}
            >
              {p}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 text-[#6C757D] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
