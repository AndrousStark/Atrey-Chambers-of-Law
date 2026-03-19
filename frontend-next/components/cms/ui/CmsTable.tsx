'use client';

import React from 'react';
import { ChevronUp } from 'lucide-react';

export interface CmsTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  /** If true, this column is shown in mobile card view. First 3 mobileVisible columns are used. */
  mobileVisible?: boolean;
  /** If true, this column is hidden on screens smaller than lg. */
  hiddenOnMobile?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

interface CmsTableProps<T> {
  columns: CmsTableColumn<T>[];
  data: T[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyMessage?: string;
  /** Custom mobile card renderer. If not provided, auto-generates cards from mobileVisible columns. */
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Custom row class name */
  rowClassName?: (row: T) => string;
}

export default function CmsTable<T extends Record<string, unknown>>({
  columns,
  data,
  sortBy,
  sortOrder = 'asc',
  onSort,
  emptyMessage = 'No records found.',
  renderMobileCard,
  onRowClick,
  rowClassName,
}: CmsTableProps<T>) {
  // Determine mobile-visible columns (first 4 with mobileVisible=true, or first 4 columns)
  const mobileColumns = columns.filter((c) => c.mobileVisible !== false).slice(0, 4);

  return (
    <>
      {/* ─── Desktop Table (hidden on mobile) ─── */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F0F2F5]">
              {columns.filter((c) => !c.hiddenOnMobile || true).map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-3 text-left font-semibold uppercase tracking-wider text-[#6C757D]
                    border-b border-gray-200 sticky top-0 bg-[#F0F2F5] z-10
                    ${col.sortable && onSort ? 'cursor-pointer select-none hover:text-[#1B2A4A]' : ''}
                    ${col.hiddenOnMobile ? 'hidden lg:table-cell' : ''}
                  `.trim()}
                  style={{ fontSize: '0.75em', width: col.width || 'auto' }}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <span className="inline-flex items-center gap-0.5">
                    {col.label}
                    {col.sortable && onSort && (
                      <ChevronUp
                        size={12}
                        className={`transition-transform ${
                          sortBy === col.key ? 'opacity-100' : 'opacity-30'
                        } ${sortBy === col.key && sortOrder === 'desc' ? 'rotate-180' : ''}`}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[#6C757D]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={(row.id as string) ?? rowIndex}
                  className={`
                    border-b border-gray-100 transition-colors
                    ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}
                    hover:bg-[#F0F2F5]
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${rowClassName ? rowClassName(row) : ''}
                  `.trim()}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm text-[#333333] ${col.hiddenOnMobile ? 'hidden lg:table-cell' : ''}`}
                      style={{ width: col.width || 'auto' }}
                    >
                      {col.render ? col.render(row, rowIndex) : (row[col.key] as React.ReactNode) ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Mobile Card View (visible only on mobile) ─── */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-12 text-center text-[#6C757D] text-sm">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, rowIndex) => {
            // Custom card renderer
            if (renderMobileCard) {
              return (
                <div key={(row.id as string) ?? rowIndex}>
                  {renderMobileCard(row, rowIndex)}
                </div>
              );
            }

            // Auto-generated card from columns
            return (
              <div
                key={(row.id as string) ?? rowIndex}
                className={`bg-white rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#4472C4]/30 ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${rowClassName ? rowClassName(row) : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {/* First column as card title */}
                {mobileColumns[0] && (
                  <div className="font-semibold text-sm text-[#1B2A4A] mb-2">
                    {mobileColumns[0].render
                      ? mobileColumns[0].render(row, rowIndex)
                      : (row[mobileColumns[0].key] as React.ReactNode) ?? '-'}
                  </div>
                )}
                {/* Remaining columns as label: value pairs */}
                <div className="space-y-1.5">
                  {mobileColumns.slice(1).map((col) => (
                    <div key={col.key} className="flex items-center justify-between text-xs">
                      <span className="text-[#6C757D] font-medium uppercase tracking-wider">
                        {col.label}
                      </span>
                      <span className="text-[#333333]">
                        {col.render ? col.render(row, rowIndex) : (row[col.key] as React.ReactNode) ?? '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
