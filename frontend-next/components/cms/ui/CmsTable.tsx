'use client';

import React from 'react';

export interface CmsTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface CmsTableProps<T> {
  columns: CmsTableColumn<T>[];
  data: T[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyMessage?: string;
}

function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ml-1 transition-transform ${active ? 'opacity-100' : 'opacity-30'} ${active && direction === 'desc' ? 'rotate-180' : ''}`}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export default function CmsTable<T extends Record<string, unknown>>({
  columns,
  data,
  sortBy,
  sortOrder = 'asc',
  onSort,
  emptyMessage = 'No records found.',
}: CmsTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F0F2F5]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  px-4 py-3 text-left font-semibold uppercase tracking-wider text-[#6C757D]
                  border-b border-gray-200 sticky top-0 bg-[#F0F2F5] z-10
                  ${col.sortable && onSort ? 'cursor-pointer select-none hover:text-[#1B2A4A]' : ''}
                `.trim()}
                style={{
                  fontSize: '0.75em',
                  width: col.width || 'auto',
                }}
                onClick={() => {
                  if (col.sortable && onSort) {
                    onSort(col.key);
                  }
                }}
              >
                <span className="inline-flex items-center">
                  {col.label}
                  {col.sortable && onSort && (
                    <SortIcon
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortOrder : 'asc'}
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
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-[#6C757D]"
              >
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
                `.trim()}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm text-[#333333]"
                    style={{ width: col.width || 'auto' }}
                  >
                    {col.render
                      ? col.render(row, rowIndex)
                      : (row[col.key] as React.ReactNode) ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
