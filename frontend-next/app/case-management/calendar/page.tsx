'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { cmsCases } from '@/lib/cms-api';
import type { Case, CaseStatus } from '@/lib/cms-types';
import { CASE_STATUS_LABELS } from '@/lib/cms-types';

// --- Constants ---

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

function formatDateShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

function getPillColor(status: CaseStatus): string {
  if (status === 'CounterNotFiled') return 'bg-[#FF4444] text-white';
  if (status === 'Disposed' || status === 'Dismissed') return 'bg-[#28A745] text-white';
  return 'bg-[#4472C4] text-white';
}

function getStatusBadgeClasses(status: CaseStatus): string {
  switch (status) {
    case 'CounterNotFiled':
      return 'bg-[#FF4444]/15 text-[#FF4444]';
    case 'Disposed':
    case 'Dismissed':
    case 'Allowed':
      return 'bg-[#28A745]/15 text-[#28A745]';
    case 'StayGranted':
    case 'LeaveGranted':
      return 'bg-[#4472C4]/15 text-[#4472C4]';
    case 'NoticeIssued':
    case 'ListedForHearing':
      return 'bg-[#FF8C00]/15 text-[#FF8C00]';
    case 'Active':
    case 'Pending':
      return 'bg-[#FFC107]/20 text-[#9A7B00]';
    default:
      return 'bg-[#6C757D]/15 text-[#6C757D]';
  }
}

// --- Calendar Logic ---

interface CalendarDay {
  readonly date: Date;
  readonly dayNumber: number;
  readonly isCurrentMonth: boolean;
  readonly isToday: boolean;
  readonly cases: readonly Case[];
}

function buildCalendarGrid(year: number, month: number, casesByDate: ReadonlyMap<string, Case[]>): readonly CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  // Get the day of week of the first day (0=Sunday, adjust for Monday start)
  let startDow = firstOfMonth.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1; // Convert to Monday=0

  const daysInMonth = lastOfMonth.getDate();

  // Calculate how many cells we need (always 6 rows = 42 cells for consistency)
  const totalCells = 42;

  const days: CalendarDay[] = [];

  // Previous month fill
  const prevMonth = new Date(year, month, 0); // last day of prev month
  const prevMonthDays = prevMonth.getDate();

  for (let i = startDow - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const date = new Date(year, month - 1, dayNum);
    const key = dateKey(date);
    days.push({
      date,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      cases: casesByDate.get(key) ?? [],
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = dateKey(date);
    days.push({
      date,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      cases: casesByDate.get(key) ?? [],
    });
  }

  // Next month fill
  const remaining = totalCells - days.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    const key = dateKey(date);
    days.push({
      date,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      cases: casesByDate.get(key) ?? [],
    });
  }

  return days;
}

// --- Component ---

export default function CalendarPage() {
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar navigation
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  // Selected day panel
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mobile: week offset from current week
  const [mobileWeekOffset, setMobileWeekOffset] = useState(0);

  // Fetch all cases with NDOH
  const fetchAllCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cmsCases.list({ limit: 500, page: 1 });
      const casesWithNdoh = result.data.filter((c) => c.ndoh !== null && c.ndoh !== '');
      setAllCases(casesWithNdoh);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar data.');
      setAllCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCases();
  }, [fetchAllCases]);

  // Build date-indexed map
  const casesByDate: ReadonlyMap<string, Case[]> = useMemo(() => {
    const map = new Map<string, Case[]>();
    for (const c of allCases) {
      const date = parseNdoh(c.ndoh);
      if (!date) continue;
      const key = dateKey(date);
      const existing = map.get(key);
      if (existing) {
        map.set(key, [...existing, c]);
      } else {
        map.set(key, [c]);
      }
    }
    return map;
  }, [allCases]);

  // Build calendar grid
  const calendarDays = useMemo(
    () => buildCalendarGrid(currentYear, currentMonth, casesByDate),
    [currentYear, currentMonth, casesByDate]
  );

  // Cases for selected date
  const selectedDayCases: readonly Case[] = useMemo(() => {
    if (!selectedDate) return [];
    const key = dateKey(selectedDate);
    return casesByDate.get(key) ?? [];
  }, [selectedDate, casesByDate]);

  // Mobile week view
  const mobileWeekDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Get Monday of the current week + offset
    const dow = today.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(today);
    monday.setDate(monday.getDate() + mondayOffset + mobileWeekOffset * 7);

    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const key = dateKey(date);
      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === currentMonth,
        isToday: isSameDay(date, today),
        cases: casesByDate.get(key) ?? [],
      });
    }
    return days;
  }, [mobileWeekOffset, casesByDate, currentMonth]);

  // Navigation
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
    setSelectedDate(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now);
    setMobileWeekOffset(0);
  }, []);

  const handleDayClick = useCallback((day: CalendarDay) => {
    setSelectedDate((prev) => {
      if (prev && isSameDay(prev, day.date)) return null; // Toggle off
      return day.date;
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Calendar View</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Monthly hearing schedule &mdash;{' '}
            {loading ? 'loading...' : `${allCases.length} cases with dates`}
          </p>
        </div>
        <button
          onClick={() => fetchAllCases()}
          disabled={loading}
          className="
            h-9 px-4 rounded-md text-sm font-medium
            text-[#6C757D] border border-gray-300 bg-white
            hover:bg-gray-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2 self-start sm:self-auto
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
          <p className="text-sm text-[#6C757D]">Loading calendar data...</p>
        </div>
      )}

      {/* Calendar */}
      {!loading && !error && (
        <>
          {/* Month Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={goToPrevMonth}
              className="h-8 w-8 rounded-md flex items-center justify-center text-[#6C757D] hover:bg-gray-100 transition-colors"
              title="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#1B2A4A]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToToday}
                className="h-7 px-3 rounded-md text-xs font-medium text-[#4472C4] border border-[#4472C4]/30 hover:bg-[#4472C4]/5 transition-colors"
              >
                Today
              </button>
            </div>

            <button
              onClick={goToNextMonth}
              className="h-8 w-8 rounded-md flex items-center justify-center text-[#6C757D] hover:bg-gray-100 transition-colors"
              title="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Desktop Calendar Grid */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-[#1B2A4A]">
              {WEEKDAY_HEADERS.map((day) => (
                <div
                  key={day}
                  className="px-2 py-2 text-center text-xs font-semibold text-white"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate !== null && isSameDay(selectedDate, day.date);
                const hasCases = day.cases.length > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    className={`
                      min-h-[100px] border-t border-r border-gray-100 p-1.5 cursor-pointer transition-colors
                      ${!day.isCurrentMonth ? 'bg-gray-50/70' : 'bg-white'}
                      ${isSelected ? 'bg-[#4472C4]/5 ring-2 ring-inset ring-[#4472C4]/30' : ''}
                      ${hasCases ? 'hover:bg-[#4472C4]/5' : 'hover:bg-gray-50'}
                      ${idx % 7 === 0 ? 'border-l' : ''}
                    `}
                  >
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                          ${day.isToday
                            ? 'bg-[#4472C4] text-white font-bold'
                            : day.isCurrentMonth
                              ? 'text-[#1B2A4A]'
                              : 'text-[#6C757D]/40'
                          }
                        `}
                      >
                        {day.dayNumber}
                      </span>
                      {day.cases.length > 3 && (
                        <span className="text-[10px] text-[#6C757D]">
                          +{day.cases.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Case Pills (max 3 visible) */}
                    <div className="flex flex-col gap-0.5">
                      {day.cases.slice(0, 3).map((c) => (
                        <div
                          key={c.id}
                          className={`
                            px-1.5 py-0.5 rounded text-[10px] font-medium truncate leading-tight
                            ${getPillColor(c.status)}
                          `}
                          title={`${c.caseNo} - ${c.caseTitle}`}
                        >
                          {truncate(c.caseNo, 15)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Week View */}
          <div className="md:hidden">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setMobileWeekOffset((o) => o - 1)}
                className="h-8 w-8 rounded-md flex items-center justify-center text-[#6C757D] bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="text-sm font-medium text-[#1B2A4A]">
                {formatDateShort(mobileWeekDays[0].date)} &ndash; {formatDateShort(mobileWeekDays[6].date)}
              </span>
              <button
                onClick={() => setMobileWeekOffset((o) => o + 1)}
                className="h-8 w-8 rounded-md flex items-center justify-center text-[#6C757D] bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Day List */}
            <div className="flex flex-col gap-2">
              {mobileWeekDays.map((day) => {
                const hasCases = day.cases.length > 0;
                const isSelected = selectedDate !== null && isSameDay(selectedDate, day.date);

                return (
                  <div key={dateKey(day.date)}>
                    <button
                      onClick={() => handleDayClick(day)}
                      className={`
                        w-full text-left rounded-lg border p-3 transition-colors
                        ${day.isToday
                          ? 'border-[#4472C4] bg-[#4472C4]/5'
                          : isSelected
                            ? 'border-[#4472C4]/30 bg-[#4472C4]/5'
                            : 'border-gray-200 bg-white'
                        }
                        ${hasCases ? 'hover:border-[#4472C4]/50' : 'hover:bg-gray-50'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`
                              inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                              ${day.isToday ? 'bg-[#4472C4] text-white' : 'bg-gray-100 text-[#1B2A4A]'}
                            `}
                          >
                            {day.dayNumber}
                          </span>
                          <div>
                            <span className="text-sm font-medium text-[#1B2A4A]">
                              {DAYS_OF_WEEK[day.date.getDay()]}
                            </span>
                            <span className="text-xs text-[#6C757D] ml-2">
                              {formatDateShort(day.date)}
                            </span>
                          </div>
                        </div>
                        {hasCases && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#4472C4] text-white text-[10px] font-bold">
                            {day.cases.length}
                          </span>
                        )}
                      </div>

                      {/* Inline pills on mobile */}
                      {hasCases && (
                        <div className="flex flex-wrap gap-1 mt-2 ml-9">
                          {day.cases.slice(0, 4).map((c) => (
                            <span
                              key={c.id}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPillColor(c.status)}`}
                            >
                              {truncate(c.caseNo, 15)}
                            </span>
                          ))}
                          {day.cases.length > 4 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-[#6C757D]">
                              +{day.cases.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Expanded detail on mobile when selected */}
                    {isSelected && day.cases.length > 0 && (
                      <div className="mt-1 ml-4 border-l-2 border-[#4472C4]/30 pl-3">
                        {day.cases.map((c) => (
                          <MobileCaseCard key={c.id} case_={c} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop: Selected Day Panel */}
          {selectedDate && (
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-[#1B2A4A] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <h3 className="text-sm font-semibold text-white">
                    {DAYS_OF_WEEK[selectedDate.getDay()]}, {formatDateShort(selectedDate)}
                  </h3>
                  <span className="text-xs text-white/60">
                    {selectedDayCases.length} hearing{selectedDayCases.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="h-6 w-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {selectedDayCases.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-[#6C757D]">No hearings scheduled for this date.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {selectedDayCases.map((c) => (
                    <div key={c.id} className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/case-management/cases/${c.id}`}
                          className="text-[#4472C4] hover:underline font-medium text-sm"
                        >
                          {c.caseNo}
                        </Link>
                        <p className="text-xs text-[#333] mt-0.5 truncate">{c.caseTitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[#6C757D]">{c.court}</p>
                        <span className={`
                          inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                          ${getStatusBadgeClasses(c.status)}
                        `}>
                          {CASE_STATUS_LABELS[c.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-[#6C757D] font-medium">Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#4472C4]" />
                <span className="text-[#6C757D]">Regular</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#FF4444]" />
                <span className="text-[#6C757D]">Counter Not Filed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#28A745]" />
                <span className="text-[#6C757D]">Disposed / Dismissed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-[#4472C4] flex items-center justify-center text-white text-[9px] font-bold">15</span>
                <span className="text-[#6C757D]">Today</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Sub-components ---

function MobileCaseCard({ case_ }: { readonly case_: Case }) {
  return (
    <div className="py-2">
      <Link
        href={`/case-management/cases/${case_.id}`}
        className="text-[#4472C4] hover:underline font-medium text-xs"
      >
        {case_.caseNo}
      </Link>
      <p className="text-[11px] text-[#333] mt-0.5 line-clamp-1">{case_.caseTitle}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] text-[#6C757D]">{case_.court}</span>
        <span className={`
          inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold
          ${getStatusBadgeClasses(case_.status)}
        `}>
          {CASE_STATUS_LABELS[case_.status]}
        </span>
      </div>
    </div>
  );
}
