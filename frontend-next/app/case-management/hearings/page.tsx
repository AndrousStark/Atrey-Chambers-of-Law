'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { cmsCases } from '@/lib/cms-api';
import type { Case } from '@/lib/cms-types';

// --- Constants ---

const FILTER_OPTIONS = [
  { key: 'thisWeek', label: 'This Week' },
  { key: 'next7', label: 'Next 7 Days' },
  { key: 'next30', label: 'Next 30 Days' },
  { key: 'allUpcoming', label: 'All Upcoming' },
  { key: 'overdue', label: 'Overdue' },
] as const;

type FilterKey = (typeof FILTER_OPTIONS)[number]['key'];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- Helpers ---

function parseNdoh(ndoh: string | null): Date | null {
  if (!ndoh) return null;
  const parts = ndoh.split('.');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function getDaysLeft(hearingDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(hearingDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysLeftBadgeClasses(daysLeft: number): string {
  if (daysLeft < 0) return 'bg-[#6C757D]/15 text-[#6C757D]';
  if (daysLeft <= 3) return 'bg-[#FF4444]/15 text-[#FF4444]';
  if (daysLeft <= 7) return 'bg-[#FF8C00]/15 text-[#FF8C00]';
  if (daysLeft <= 14) return 'bg-[#FFC107]/20 text-[#9A7B00]';
  return 'bg-[#28A745]/15 text-[#28A745]';
}

function getUrgencyLabel(daysLeft: number): string {
  if (daysLeft < 0) return 'Overdue';
  if (daysLeft <= 1) return 'Critical';
  if (daysLeft <= 7) return 'Upcoming';
  if (daysLeft <= 30) return 'Scheduled';
  return 'Scheduled';
}

function getUrgencyBadgeClasses(daysLeft: number): string {
  if (daysLeft < 0) return 'bg-[#6C757D]/15 text-[#6C757D]';
  if (daysLeft <= 1) return 'bg-[#FF4444]/15 text-[#FF4444]';
  if (daysLeft <= 7) return 'bg-[#FF8C00]/15 text-[#FF8C00]';
  return 'bg-[#4472C4]/15 text-[#4472C4]';
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

// --- Processed Case Type ---

interface HearingEntry {
  readonly case_: Case;
  readonly hearingDate: Date;
  readonly daysLeft: number;
}

// --- Component ---

export default function HearingDiaryPage() {
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('next7');

  // Fetch all cases with NDOH
  const fetchAllCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch with a large limit to get all cases
      const result = await cmsCases.list({ limit: 500, page: 1 });
      // Filter to only cases with NDOH set
      const casesWithNdoh = result.data.filter((c) => c.ndoh !== null && c.ndoh !== '');
      setAllCases(casesWithNdoh);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hearing data.');
      setAllCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCases();
  }, [fetchAllCases]);

  // Build hearing entries with computed fields
  const hearingEntries: readonly HearingEntry[] = useMemo(() => {
    return allCases
      .map((c) => {
        const hearingDate = parseNdoh(c.ndoh);
        if (!hearingDate) return null;
        const daysLeft = getDaysLeft(hearingDate);
        return { case_: c, hearingDate, daysLeft } as HearingEntry;
      })
      .filter((entry): entry is HearingEntry => entry !== null);
  }, [allCases]);

  // Apply filter
  const filteredEntries: readonly HearingEntry[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = hearingEntries.filter((entry) => {
      switch (activeFilter) {
        case 'thisWeek': {
          const weekStart = getStartOfWeek(today);
          const weekEnd = getEndOfWeek(today);
          return entry.hearingDate >= weekStart && entry.hearingDate <= weekEnd;
        }
        case 'next7': {
          const end = new Date(today);
          end.setDate(end.getDate() + 7);
          return entry.hearingDate >= today && entry.hearingDate <= end;
        }
        case 'next30': {
          const end = new Date(today);
          end.setDate(end.getDate() + 30);
          return entry.hearingDate >= today && entry.hearingDate <= end;
        }
        case 'allUpcoming':
          return entry.daysLeft >= 0;
        case 'overdue':
          return entry.daysLeft < 0;
        default:
          return true;
      }
    });

    // Sort by NDOH soonest first (overdue sort by most recent overdue first)
    return [...filtered].sort((a, b) => {
      if (activeFilter === 'overdue') {
        return b.hearingDate.getTime() - a.hearingDate.getTime();
      }
      return a.hearingDate.getTime() - b.hearingDate.getTime();
    });
  }, [hearingEntries, activeFilter]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .hearing-print-area, .hearing-print-area * { visibility: visible; }
          .hearing-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
          .hearing-table { font-size: 10px; }
          .hearing-table th, .hearing-table td { padding: 4px 6px; }
        }
      `}</style>

      <div className="flex flex-col gap-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Hearing Diary</h1>
            <p className="text-sm text-[#6C757D] mt-0.5">
              Upcoming court dates and hearing schedule &mdash;{' '}
              {loading ? 'loading...' : `${filteredEntries.length} hearings`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAllCases()}
              disabled={loading}
              className="
                h-9 px-4 rounded-md text-sm font-medium
                text-[#6C757D] border border-gray-300 bg-white
                hover:bg-gray-50 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              "
              title="Refresh data"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={loading ? 'animate-spin' : ''}
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={handlePrint}
              className="
                h-9 px-4 rounded-md text-sm font-medium
                text-white bg-[#4472C4] border border-[#4472C4]
                hover:bg-[#3A62A8] transition-colors
                flex items-center gap-2
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 no-print">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setActiveFilter(opt.key)}
                className={`
                  h-8 px-4 rounded-full text-sm font-medium transition-colors
                  ${isActive
                    ? opt.key === 'overdue'
                      ? 'bg-[#FF4444] text-white border border-[#FF4444]'
                      : 'bg-[#1B2A4A] text-white border border-[#1B2A4A]'
                    : 'bg-white text-[#6C757D] border border-gray-300 hover:border-[#4472C4] hover:text-[#4472C4]'
                  }
                `}
              >
                {opt.label}
                {!loading && (
                  <span className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                    ({getFilterCount(hearingEntries, opt.key)})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm text-[#FF4444] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button
              onClick={() => fetchAllCases()}
              className="ml-auto text-xs font-medium underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full animate-spin"
              style={{ borderWidth: '3px', borderColor: '#4472C4', borderTopColor: 'transparent' }}
            />
            <p className="text-sm text-[#6C757D]">Loading hearing data...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEntries.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-sm text-[#6C757D] font-medium">
              {activeFilter === 'overdue'
                ? 'No overdue hearings found.'
                : 'No hearings found for this period.'}
            </p>
            <p className="text-xs text-[#6C757D]/60">
              Try selecting a different time filter above.
            </p>
          </div>
        )}

        {/* Table (Desktop) */}
        {!loading && filteredEntries.length > 0 && (
          <div className="hearing-print-area">
            {/* Print Header */}
            <div className="hidden print:block mb-4">
              <h1 className="text-xl font-bold text-[#1B2A4A]">
                Hearing Diary &mdash; {FILTER_OPTIONS.find((o) => o.key === activeFilter)?.label}
              </h1>
              <p className="text-xs text-[#6C757D] mt-1">
                Generated on {formatDate(new Date())} &mdash; {filteredEntries.length} hearings
              </p>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="hearing-table w-full text-sm">
                  <thead>
                    <tr className="bg-[#1B2A4A] text-white text-left">
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap">S.No.</th>
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap">Case No.</th>
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap">Court</th>
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap">Client</th>
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap">Title</th>
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap">Next Date</th>
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap">Day</th>
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap text-center">Days Left</th>
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap text-center">Urgency</th>
                      <th className="px-3 py-3 font-semibold text-xs whitespace-nowrap">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry, index) => (
                      <tr
                        key={entry.case_.id}
                        className={`
                          border-t border-gray-100 hover:bg-[#4472C4]/5 transition-colors
                          ${index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}
                        `}
                      >
                        <td className="px-3 py-2.5 text-[#6C757D] whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <Link
                            href={`/case-management/cases/${entry.case_.id}`}
                            className="text-[#4472C4] hover:underline font-medium text-xs"
                          >
                            {truncate(entry.case_.caseNo, 30)}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-[#333] text-xs whitespace-nowrap">
                          {entry.case_.court}
                        </td>
                        <td className="px-3 py-2.5 text-[#333] text-xs whitespace-nowrap">
                          {entry.case_.client}
                        </td>
                        <td className="px-3 py-2.5 text-[#333] text-xs" title={entry.case_.caseTitle}>
                          {truncate(entry.case_.caseTitle, 35)}
                        </td>
                        <td className="px-3 py-2.5 text-[#1B2A4A] font-medium text-xs whitespace-nowrap">
                          {formatDate(entry.hearingDate)}
                        </td>
                        <td className="px-3 py-2.5 text-[#6C757D] text-xs whitespace-nowrap">
                          {DAYS_OF_WEEK[entry.hearingDate.getDay()]}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`
                            inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                            ${getDaysLeftBadgeClasses(entry.daysLeft)}
                          `}>
                            {entry.daysLeft < 0
                              ? `${Math.abs(entry.daysLeft)}d ago`
                              : entry.daysLeft === 0
                                ? 'Today'
                                : `${entry.daysLeft}d`
                            }
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`
                            inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                            ${getUrgencyBadgeClasses(entry.daysLeft)}
                          `}>
                            {getUrgencyLabel(entry.daysLeft)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#6C757D] text-xs max-w-[200px]" title={entry.case_.remarks || ''}>
                          {truncate(entry.case_.remarks || '-', 40)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {filteredEntries.map((entry, index) => (
                <div
                  key={entry.case_.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[#6C757D] font-medium">#{index + 1}</span>
                        <span className={`
                          inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                          ${getUrgencyBadgeClasses(entry.daysLeft)}
                        `}>
                          {getUrgencyLabel(entry.daysLeft)}
                        </span>
                      </div>
                      <Link
                        href={`/case-management/cases/${entry.case_.id}`}
                        className="text-[#4472C4] hover:underline font-medium text-sm block truncate"
                      >
                        {entry.case_.caseNo}
                      </Link>
                    </div>
                    <span className={`
                      inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap
                      ${getDaysLeftBadgeClasses(entry.daysLeft)}
                    `}>
                      {entry.daysLeft < 0
                        ? `${Math.abs(entry.daysLeft)}d ago`
                        : entry.daysLeft === 0
                          ? 'Today'
                          : `${entry.daysLeft}d left`
                      }
                    </span>
                  </div>

                  <p className="text-xs text-[#333] mb-2 line-clamp-2">
                    {entry.case_.caseTitle}
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-[#6C757D]">Court: </span>
                      <span className="text-[#333] font-medium">{entry.case_.court}</span>
                    </div>
                    <div>
                      <span className="text-[#6C757D]">Client: </span>
                      <span className="text-[#333] font-medium">{entry.case_.client}</span>
                    </div>
                    <div>
                      <span className="text-[#6C757D]">Date: </span>
                      <span className="text-[#1B2A4A] font-semibold">{formatDate(entry.hearingDate)}</span>
                    </div>
                    <div>
                      <span className="text-[#6C757D]">Day: </span>
                      <span className="text-[#333]">{DAYS_OF_WEEK[entry.hearingDate.getDay()]}</span>
                    </div>
                  </div>

                  {entry.case_.remarks && (
                    <p className="text-xs text-[#6C757D] mt-2 pt-2 border-t border-gray-100 line-clamp-2">
                      {entry.case_.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Footer */}
        {!loading && filteredEntries.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 no-print">
            <div className="flex flex-wrap gap-4 text-xs">
              <SummaryBadge
                label="Critical (0-1d)"
                count={filteredEntries.filter((e) => e.daysLeft >= 0 && e.daysLeft <= 1).length}
                colorClass="bg-[#FF4444]/15 text-[#FF4444]"
              />
              <SummaryBadge
                label="Upcoming (2-7d)"
                count={filteredEntries.filter((e) => e.daysLeft >= 2 && e.daysLeft <= 7).length}
                colorClass="bg-[#FF8C00]/15 text-[#FF8C00]"
              />
              <SummaryBadge
                label="Scheduled (8-30d)"
                count={filteredEntries.filter((e) => e.daysLeft >= 8 && e.daysLeft <= 30).length}
                colorClass="bg-[#4472C4]/15 text-[#4472C4]"
              />
              <SummaryBadge
                label="Later (30d+)"
                count={filteredEntries.filter((e) => e.daysLeft > 30).length}
                colorClass="bg-[#28A745]/15 text-[#28A745]"
              />
              <SummaryBadge
                label="Overdue"
                count={filteredEntries.filter((e) => e.daysLeft < 0).length}
                colorClass="bg-[#6C757D]/15 text-[#6C757D]"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// --- Sub-components ---

function SummaryBadge({
  label,
  count,
  colorClass,
}: {
  readonly label: string;
  readonly count: number;
  readonly colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${colorClass}`}>
        {count}
      </span>
      <span className="text-[#6C757D]">{label}</span>
    </div>
  );
}

// --- Utility to count entries per filter ---

function getFilterCount(entries: readonly HearingEntry[], filterKey: FilterKey): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filterKey) {
    case 'thisWeek': {
      const weekStart = getStartOfWeek(today);
      const weekEnd = getEndOfWeek(today);
      return entries.filter((e) => e.hearingDate >= weekStart && e.hearingDate <= weekEnd).length;
    }
    case 'next7': {
      const end = new Date(today);
      end.setDate(end.getDate() + 7);
      return entries.filter((e) => e.hearingDate >= today && e.hearingDate <= end).length;
    }
    case 'next30': {
      const end = new Date(today);
      end.setDate(end.getDate() + 30);
      return entries.filter((e) => e.hearingDate >= today && e.hearingDate <= end).length;
    }
    case 'allUpcoming':
      return entries.filter((e) => e.daysLeft >= 0).length;
    case 'overdue':
      return entries.filter((e) => e.daysLeft < 0).length;
    default:
      return 0;
  }
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}
