'use client';

import React from 'react';
import type { CaseFilters as CaseFiltersType, CaseStatus, Priority } from '@/lib/cms-types';
import {
  COURTS,
  DEPARTMENTS,
  CATEGORIES,
  CASE_STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/lib/cms-types';

interface CaseFiltersProps {
  readonly filters: CaseFiltersType;
  readonly onFiltersChange: (filters: CaseFiltersType) => void;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: readonly { value: string; label: string }[];
  readonly onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[150px]">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#6C757D]">
        {label}
        {value ? (
          <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-[#4472C4] text-white font-bold">
            1
          </span>
        ) : null}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-9 px-3 pr-8 rounded-md border border-gray-300 bg-white
          text-sm text-[#333333] appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4]
          transition-colors
        "
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CaseFilters({ filters, onFiltersChange }: CaseFiltersProps) {
  const courtOptions = COURTS.map((c) => ({ value: c, label: c }));

  const statusOptions = (Object.entries(CASE_STATUS_LABELS) as [CaseStatus, string][]).map(
    ([value, label]) => ({ value, label })
  );

  const priorityOptions = (Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(
    ([value, label]) => ({ value, label })
  );

  const departmentOptions = DEPARTMENTS.map((d) => ({ value: d, label: d }));

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }));

  const hasActiveFilters =
    !!filters.court ||
    !!filters.status ||
    !!filters.department ||
    !!filters.priority ||
    !!filters.category ||
    !!filters.search;

  function handleChange(key: keyof CaseFiltersType, value: string) {
    const updated = { ...filters, [key]: value || undefined, page: 1 };
    onFiltersChange(updated);
  }

  function handleClear() {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          label="Court"
          value={filters.court || ''}
          options={courtOptions}
          onChange={(v) => handleChange('court', v)}
        />
        <FilterSelect
          label="Status"
          value={filters.status || ''}
          options={statusOptions}
          onChange={(v) => handleChange('status', v)}
        />
        <FilterSelect
          label="Department"
          value={filters.department || ''}
          options={departmentOptions}
          onChange={(v) => handleChange('department', v)}
        />
        <FilterSelect
          label="Priority"
          value={filters.priority || ''}
          options={priorityOptions}
          onChange={(v) => handleChange('priority', v)}
        />
        <FilterSelect
          label="Category"
          value={filters.category || ''}
          options={categoryOptions}
          onChange={(v) => handleChange('category', v)}
        />

        {/* Search input */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#6C757D]">
            Search
          </label>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6C757D"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search case no., title, party..."
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              className="
                w-full h-9 pl-9 pr-3 rounded-md border border-gray-300 bg-white
                text-sm text-[#333333] placeholder-[#999]
                focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4]
                transition-colors
              "
            />
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="
              h-9 px-4 rounded-md text-sm font-medium
              text-[#6C757D] border border-gray-300 bg-white
              hover:bg-gray-50 hover:text-[#333333]
              transition-colors whitespace-nowrap
            "
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
