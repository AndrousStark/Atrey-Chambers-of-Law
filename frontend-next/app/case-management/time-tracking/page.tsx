'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { cmsTimeEntries, cmsAuth, cmsCases, cmsUsers } from '@/lib/cms-api';
import type {
  TimeEntry,
  ActivityType,
  TimeEntryStatus,
  TimeSummaryReport,
  CmsUser,
  Case,
} from '@/lib/cms-types';
import { ACTIVITY_TYPE_LABELS, TIME_ENTRY_STATUS_LABELS } from '@/lib/cms-types';

// ============================================================
// Constants
// ============================================================

const ACTIVITY_TYPES: ActivityType[] = [
  'Research', 'Drafting', 'CourtAppearance', 'Travel', 'ClientMeeting',
  'PhoneCall', 'ReviewWork', 'FilingWork', 'Administrative', 'Consultation',
  'Conference', 'Other',
];

const TIME_ENTRY_STATUSES: TimeEntryStatus[] = [
  'Running', 'Draft', 'Submitted', 'Approved', 'Rejected',
];

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  Research: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  Drafting: 'bg-purple-50 text-purple-600 border-purple-600',
  CourtAppearance: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  Travel: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  ClientMeeting: 'bg-green-50 text-[#28A745] border-[#28A745]',
  PhoneCall: 'bg-teal-50 text-teal-600 border-teal-600',
  ReviewWork: 'bg-amber-50 text-amber-600 border-amber-600',
  FilingWork: 'bg-orange-50 text-[#FF8C00] border-[#FF8C00]',
  Administrative: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  Consultation: 'bg-indigo-50 text-indigo-600 border-indigo-600',
  Conference: 'bg-pink-50 text-pink-600 border-pink-600',
  Other: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
};

const STATUS_COLORS: Record<TimeEntryStatus, string> = {
  Running: 'bg-yellow-50 text-[#D97706] border-[#D97706]',
  Draft: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  Submitted: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  Approved: 'bg-green-50 text-[#28A745] border-[#28A745]',
  Rejected: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
};

const STATUS_ROW_BG: Partial<Record<TimeEntryStatus, string>> = {
  Rejected: 'bg-red-50/40',
  Submitted: 'bg-blue-50/30',
  Approved: 'bg-green-50/30',
};

const STAT_COLORS = {
  today: { bg: '#EBF2FF', border: '#4472C4', text: '#4472C4' },
  week: { bg: '#EAFBEF', border: '#28A745', text: '#28A745' },
  billable: { bg: '#FFF8EB', border: '#FF8C00', text: '#FF8C00' },
  entries: { bg: '#F8F9FA', border: '#6C757D', text: '#6C757D' },
};

const DURATION_PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '1.5h', minutes: 90 },
  { label: '2h', minutes: 120 },
  { label: '3h', minutes: 180 },
  { label: '4h', minutes: 240 },
];

type ViewMode = 'list' | 'timesheet';

// ============================================================
// Shared CSS Classes (matching design system)
// ============================================================

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors';

const SELECT_CLASS =
  'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors appearance-none cursor-pointer pr-8';

const SELECT_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 10px center' as const,
};

const LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wider text-[#6C757D]';
const BADGE_CLASS = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap';

// ============================================================
// Helpers
// ============================================================

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDateISO(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
}

function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function getWeekStartISO(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

function getWeekDates(weekStartISO: string): string[] {
  const dates: string[] = [];
  const start = new Date(weekStartISO);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function getDateRangePreset(preset: string): { from: string; to: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return { from: todayISO(), to: todayISO() };
    case 'thisWeek': {
      const ws = getWeekStartISO(todayISO());
      const we = new Date(ws);
      we.setDate(we.getDate() + 6);
      return { from: ws, to: we.toISOString().split('T')[0] };
    }
    case 'thisMonth': {
      const ms = new Date(today.getFullYear(), today.getMonth(), 1);
      const me = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: ms.toISOString().split('T')[0], to: me.toISOString().split('T')[0] };
    }
    case 'lastMonth': {
      const ms = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const me = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: ms.toISOString().split('T')[0], to: me.toISOString().split('T')[0] };
    }
    default:
      return { from: '', to: '' };
  }
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ============================================================
// Toast
// ============================================================

interface Toast {
  readonly id: string;
  readonly type: 'success' | 'error';
  readonly message: string;
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  readonly toasts: Toast[];
  readonly onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 border-[#28A745]/30 text-[#28A745]'
              : 'bg-red-50 border-[#FF4444]/30 text-[#FF4444]'
          }`}
        >
          {toast.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-0.5 rounded hover:bg-black/5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Confirm Dialog
// ============================================================

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{title}</h3>
        <p className="text-sm text-[#666] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-md text-sm font-medium text-[#333333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-9 px-4 rounded-md text-sm font-medium text-white bg-[#FF4444] border border-[#FF4444] hover:bg-[#E63939] transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Stats Cards
// ============================================================

function StatsCards({
  summary,
  todayMinutes,
  loading,
}: {
  readonly summary: TimeSummaryReport | null;
  readonly todayMinutes: number;
  readonly loading: boolean;
}) {
  const totalMinutes = summary?.totalMinutes ?? 0;
  const billableMinutes = summary?.billableMinutes ?? 0;
  const billablePercent = totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0;

  const items = [
    {
      key: 'today',
      label: 'Total Today',
      value: formatDuration(todayMinutes),
      color: STAT_COLORS.today,
    },
    {
      key: 'week',
      label: 'This Week',
      value: formatDuration(totalMinutes),
      color: STAT_COLORS.week,
    },
    {
      key: 'billable',
      label: 'Billable %',
      value: `${billablePercent}%`,
      color: STAT_COLORS.billable,
    },
    {
      key: 'entries',
      label: 'Entries',
      value: String(summary?.totalEntries ?? 0),
      color: STAT_COLORS.entries,
    },
  ];

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
      {items.map((item) => (
        <div
          key={item.key}
          className="bg-white rounded-xl p-4 transition-shadow hover:shadow-md"
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${item.color.border}`,
          }}
        >
          <p className={LABEL_CLASS}>{item.label}</p>
          {loading ? (
            <div className="h-7 w-12 bg-gray-200 rounded mt-1 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold mt-1" style={{ color: item.color.text }}>
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// View Toggle
// ============================================================

function ViewToggle({
  activeView,
  onViewChange,
}: {
  readonly activeView: ViewMode;
  readonly onViewChange: (v: ViewMode) => void;
}) {
  const views: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      key: 'list',
      label: 'List',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      ),
    },
    {
      key: 'timesheet',
      label: 'Timesheet',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
      {views.map((v) => (
        <button
          key={v.key}
          onClick={() => onViewChange(v.key)}
          className={`flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium transition-colors ${
            activeView === v.key
              ? 'bg-[#4472C4] text-white border-[#4472C4]'
              : 'bg-white text-[#6C757D] hover:bg-gray-50'
          }`}
        >
          {v.icon}
          <span className="hidden sm:inline">{v.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Filter Bar
// ============================================================

interface TimeFilters {
  dateFrom: string;
  dateTo: string;
  activityType: string;
  status: string;
  caseId: string;
  billable: string;
  userId: string;
}

const EMPTY_FILTERS: TimeFilters = {
  dateFrom: '',
  dateTo: '',
  activityType: '',
  status: '',
  caseId: '',
  billable: '',
  userId: '',
};

const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
];

function FilterBar({
  filters,
  onFiltersChange,
  cases,
  users,
  isSuperadmin,
}: {
  readonly filters: TimeFilters;
  readonly onFiltersChange: (f: TimeFilters) => void;
  readonly cases: { id: string; caseNo: string; caseTitle: string }[];
  readonly users: CmsUser[];
  readonly isSuperadmin: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasFilters =
    filters.activityType !== '' ||
    filters.status !== '' ||
    filters.caseId !== '' ||
    filters.billable !== '' ||
    filters.userId !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  const updateFilter = <K extends keyof TimeFilters>(key: K, value: TimeFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handlePreset = (preset: string) => {
    const range = getDateRangePreset(preset);
    onFiltersChange({ ...filters, dateFrom: range.from, dateTo: range.to });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Top row: presets + toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Date presets */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {DATE_PRESETS.map((p) => {
            const range = getDateRangePreset(p.key);
            const isActive = filters.dateFrom === range.from && filters.dateTo === range.to;
            return (
              <button
                key={p.key}
                onClick={() => handlePreset(p.key)}
                className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1B2A4A] text-white border border-[#1B2A4A]'
                    : 'bg-white text-[#6C757D] border border-gray-300 hover:border-[#4472C4] hover:text-[#4472C4]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className={`h-9 px-3 rounded-md text-sm font-medium border transition-colors flex items-center gap-1.5 ${
              expanded || hasFilters
                ? 'text-[#4472C4] border-[#4472C4] bg-blue-50'
                : 'text-[#6C757D] border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-[#4472C4] text-white text-[10px] font-bold flex items-center justify-center">
                {[filters.activityType, filters.status, filters.caseId, filters.billable, filters.userId, filters.dateFrom, filters.dateTo]
                  .filter(Boolean).length}
              </span>
            )}
          </button>

          {hasFilters && (
            <button
              onClick={() => onFiltersChange(EMPTY_FILTERS)}
              className="h-9 px-3 rounded-md text-sm font-medium text-[#FF4444] border border-[#FF4444]/30 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date From */}
          <div>
            <label className={LABEL_CLASS}>Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          {/* Date To */}
          <div>
            <label className={LABEL_CLASS}>Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          {/* Activity Type */}
          <div>
            <label className={LABEL_CLASS}>Activity Type</label>
            <select
              value={filters.activityType}
              onChange={(e) => updateFilter('activityType', e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              <option value="">All Activities</option>
              {ACTIVITY_TYPES.map((a) => (
                <option key={a} value={a}>{ACTIVITY_TYPE_LABELS[a]}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={LABEL_CLASS}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              <option value="">All Statuses</option>
              {TIME_ENTRY_STATUSES.map((s) => (
                <option key={s} value={s}>{TIME_ENTRY_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Case */}
          <div>
            <label className={LABEL_CLASS}>Case</label>
            <select
              value={filters.caseId}
              onChange={(e) => updateFilter('caseId', e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              <option value="">All Cases</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNo} - {truncate(c.caseTitle, 25)}</option>
              ))}
            </select>
          </div>

          {/* Billable */}
          <div>
            <label className={LABEL_CLASS}>Billable</label>
            <select
              value={filters.billable}
              onChange={(e) => updateFilter('billable', e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              <option value="">All</option>
              <option value="true">Billable Only</option>
              <option value="false">Non-billable Only</option>
            </select>
          </div>

          {/* User (superadmin only) */}
          {isSuperadmin && (
            <div>
              <label className={LABEL_CLASS}>User</label>
              <select
                value={filters.userId}
                onChange={(e) => updateFilter('userId', e.target.value)}
                className={SELECT_CLASS}
                style={SELECT_STYLE}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Quick-Add Time Entry Modal
// ============================================================

interface TimeEntryFormData {
  caseId: string;
  activityType: ActivityType;
  durationMinutes: number;
  customMinutes: string;
  date: string;
  description: string;
  billable: boolean;
}

function QuickAddModal({
  isOpen,
  editEntry,
  cases,
  saving,
  onSave,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly editEntry: TimeEntry | null;
  readonly cases: { id: string; caseNo: string; caseTitle: string }[];
  readonly saving: boolean;
  readonly onSave: (data: TimeEntryFormData) => void;
  readonly onClose: () => void;
}) {
  const [form, setForm] = useState<TimeEntryFormData>({
    caseId: '',
    activityType: 'Research',
    durationMinutes: 0,
    customMinutes: '',
    date: todayISO(),
    description: '',
    billable: true,
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [caseSearch, setCaseSearch] = useState('');

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      if (editEntry) {
        setForm({
          caseId: editEntry.caseId || '',
          activityType: editEntry.activityType,
          durationMinutes: editEntry.durationMinutes,
          customMinutes: String(editEntry.durationMinutes),
          date: formatDateISO(editEntry.date),
          description: editEntry.description || '',
          billable: editEntry.billable,
        });
      } else {
        setForm({
          caseId: '',
          activityType: 'Research',
          durationMinutes: 0,
          customMinutes: '',
          date: todayISO(),
          description: '',
          billable: true,
        });
      }
      setValidationError(null);
      setCaseSearch('');
    }
  }, [isOpen, editEntry]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const updateField = <K extends keyof TimeEntryFormData>(key: K, value: TimeEntryFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (validationError) setValidationError(null);
  };

  const handlePresetClick = (minutes: number) => {
    setForm((prev) => ({
      ...prev,
      durationMinutes: minutes,
      customMinutes: String(minutes),
    }));
  };

  const handleCustomMinutesChange = (val: string) => {
    const num = parseInt(val, 10);
    setForm((prev) => ({
      ...prev,
      customMinutes: val,
      durationMinutes: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const filteredCases = useMemo(() => {
    if (!caseSearch.trim()) return cases;
    const q = caseSearch.toLowerCase();
    return cases.filter(
      (c) =>
        c.caseNo.toLowerCase().includes(q) ||
        c.caseTitle.toLowerCase().includes(q)
    );
  }, [cases, caseSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      setValidationError('Description is required.');
      return;
    }
    if (form.durationMinutes <= 0) {
      setValidationError('Duration must be greater than 0.');
      return;
    }
    if (!form.date) {
      setValidationError('Date is required.');
      return;
    }
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1B2A4A]">
            {editEntry ? 'Edit Time Entry' : 'Log Time'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#6C757D] hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {validationError && (
            <div className="bg-red-50 border border-[#FF4444]/20 rounded-md px-3 py-2 text-sm text-[#FF4444]">
              {validationError}
            </div>
          )}

          {/* Case (searchable) */}
          <div>
            <label className={LABEL_CLASS}>Case (optional)</label>
            <input
              type="text"
              placeholder="Search cases..."
              value={caseSearch}
              onChange={(e) => setCaseSearch(e.target.value)}
              className={`${INPUT_CLASS} mb-1`}
            />
            <select
              value={form.caseId}
              onChange={(e) => updateField('caseId', e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
              size={Math.min(filteredCases.length + 1, 5)}
            >
              <option value="">No case linked</option>
              {filteredCases.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNo} - {truncate(c.caseTitle, 30)}</option>
              ))}
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className={LABEL_CLASS}>Activity Type *</label>
            <select
              value={form.activityType}
              onChange={(e) => updateField('activityType', e.target.value as ActivityType)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              {ACTIVITY_TYPES.map((a) => (
                <option key={a} value={a}>{ACTIVITY_TYPE_LABELS[a]}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className={LABEL_CLASS}>Duration *</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {DURATION_PRESETS.map((p) => {
                const isActive = form.durationMinutes === p.minutes;
                return (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() => handlePresetClick(p.minutes)}
                    className={`h-8 px-3 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#4472C4] text-white border border-[#4472C4]'
                        : 'bg-white text-[#6C757D] border border-gray-300 hover:border-[#4472C4] hover:text-[#4472C4]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="1440"
                placeholder="Custom minutes"
                value={form.customMinutes}
                onChange={(e) => handleCustomMinutesChange(e.target.value)}
                className={`${INPUT_CLASS} !w-36`}
              />
              <span className="text-sm text-[#6C757D]">
                minutes
                {form.durationMinutes > 0 && (
                  <> = <span className="font-semibold text-[#1B2A4A]">{formatDuration(form.durationMinutes)}</span></>
                )}
              </span>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className={LABEL_CLASS}>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          {/* Description */}
          <div>
            <label className={LABEL_CLASS}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="What did you work on?"
              rows={3}
              className={`${INPUT_CLASS} !h-auto py-2 resize-none`}
              autoFocus={!editEntry}
            />
          </div>

          {/* Billable toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => updateField('billable', !form.billable)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 ${
                  form.billable ? 'bg-[#28A745]' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={form.billable}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    form.billable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-[#333333]">
                {form.billable ? 'Billable' : 'Non-billable'}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#333333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'white', borderTopColor: 'transparent' }}
                />
              )}
              {editEntry ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// List View
// ============================================================

type SortKey = 'date' | 'activityType' | 'description' | 'case' | 'duration' | 'billable' | 'status';

function ListView({
  entries,
  sortBy,
  sortOrder,
  isSuperadmin,
  onSort,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
}: {
  readonly entries: TimeEntry[];
  readonly sortBy: SortKey;
  readonly sortOrder: 'asc' | 'desc';
  readonly isSuperadmin: boolean;
  readonly onSort: (key: SortKey) => void;
  readonly onEdit: (entry: TimeEntry) => void;
  readonly onDelete: (entry: TimeEntry) => void;
  readonly onSubmit: (entry: TimeEntry) => void;
  readonly onApprove: (entry: TimeEntry) => void;
  readonly onReject: (entry: TimeEntry) => void;
}) {
  const SortHeader = ({ label, sortKey, className }: { label: string; sortKey: SortKey; className?: string }) => {
    const isActive = sortBy === sortKey;
    return (
      <th
        className={`px-3 py-3 text-left cursor-pointer select-none group ${className || ''}`}
        onClick={() => onSort(sortKey)}
      >
        <div className="flex items-center gap-1">
          <span className={LABEL_CLASS}>{label}</span>
          <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
            {isActive && sortOrder === 'desc' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 15 12 9 18 15"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            )}
          </span>
        </div>
      </th>
    );
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <p className="text-sm text-[#6C757D] font-medium">No time entries found.</p>
        <p className="text-xs text-[#6C757D]/60 mt-1">Try adjusting your filters or log a new time entry.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <SortHeader label="Date" sortKey="date" />
              <SortHeader label="Activity" sortKey="activityType" />
              <SortHeader label="Description" sortKey="description" />
              <SortHeader label="Case" sortKey="case" />
              <SortHeader label="Duration" sortKey="duration" className="text-right" />
              <SortHeader label="Billable" sortKey="billable" className="text-center" />
              <SortHeader label="Status" sortKey="status" />
              <th className="px-3 py-3 text-right"><span className={LABEL_CLASS}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const rowBg = STATUS_ROW_BG[entry.status] || '';

              return (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${rowBg}`}
                >
                  {/* Date */}
                  <td className="px-3 py-2.5 text-[#333333] whitespace-nowrap text-xs">
                    {formatDate(entry.date)}
                  </td>

                  {/* Activity Type */}
                  <td className="px-3 py-2.5">
                    <span className={`${BADGE_CLASS} ${ACTIVITY_COLORS[entry.activityType]}`}>
                      {ACTIVITY_TYPE_LABELS[entry.activityType]}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-3 py-2.5 max-w-[250px]">
                    <p className="text-[#333333] text-xs truncate" title={entry.description}>
                      {truncate(entry.description, 50)}
                    </p>
                  </td>

                  {/* Case */}
                  <td className="px-3 py-2.5">
                    {entry.case ? (
                      <Link
                        href={`/case-management/cases/${entry.caseId}`}
                        className="text-xs text-[#4472C4] font-medium hover:underline"
                      >
                        {truncate(entry.case.caseNo, 20)}
                      </Link>
                    ) : (
                      <span className="text-[#999] text-xs">--</span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-sm font-semibold text-[#1B2A4A]">
                      {formatDuration(entry.durationMinutes)}
                    </span>
                  </td>

                  {/* Billable */}
                  <td className="px-3 py-2.5 text-center">
                    {entry.billable ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28A745" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <span className={`${BADGE_CLASS} ${STATUS_COLORS[entry.status]}`}>
                      {TIME_ENTRY_STATUS_LABELS[entry.status]}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit (only Draft/Rejected) */}
                      {(entry.status === 'Draft' || entry.status === 'Rejected') && (
                        <button
                          onClick={() => onEdit(entry)}
                          className="p-1.5 rounded-md text-[#6C757D] hover:text-[#4472C4] hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}

                      {/* Submit (only Draft) */}
                      {entry.status === 'Draft' && (
                        <button
                          onClick={() => onSubmit(entry)}
                          className="p-1.5 rounded-md text-[#6C757D] hover:text-[#4472C4] hover:bg-blue-50 transition-colors"
                          title="Submit for approval"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </button>
                      )}

                      {/* Approve/Reject (superadmin + Submitted) */}
                      {isSuperadmin && entry.status === 'Submitted' && (
                        <>
                          <button
                            onClick={() => onApprove(entry)}
                            className="p-1.5 rounded-md text-[#6C757D] hover:text-[#28A745] hover:bg-green-50 transition-colors"
                            title="Approve"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onReject(entry)}
                            className="p-1.5 rounded-md text-[#6C757D] hover:text-[#FF4444] hover:bg-red-50 transition-colors"
                            title="Reject"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </>
                      )}

                      {/* Delete (only Draft/Rejected) */}
                      {(entry.status === 'Draft' || entry.status === 'Rejected') && (
                        <button
                          onClick={() => onDelete(entry)}
                          className="p-1.5 rounded-md text-[#6C757D] hover:text-[#FF4444] hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// Weekly Timesheet View
// ============================================================

function TimesheetView({
  entries,
  weekStart,
  onWeekChange,
  onCellClick,
}: {
  readonly entries: TimeEntry[];
  readonly weekStart: string;
  readonly onWeekChange: (ws: string) => void;
  readonly onCellClick: (caseId: string | null, date: string) => void;
}) {
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  // Group entries by caseId -> date -> total minutes
  const { caseRows, dailyTotals, caseInfoMap } = useMemo(() => {
    const caseMap = new Map<string, Map<string, number>>();
    const infoMap = new Map<string, string>();
    const totals = new Map<string, number>();

    for (const entry of entries) {
      const cKey = entry.caseId || '__none__';
      const dateKey = formatDateISO(entry.date);

      if (!caseMap.has(cKey)) {
        caseMap.set(cKey, new Map());
      }
      const dayMap = caseMap.get(cKey)!;
      dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + entry.durationMinutes);

      // Track daily totals
      totals.set(dateKey, (totals.get(dateKey) || 0) + entry.durationMinutes);

      // Store case label
      if (!infoMap.has(cKey)) {
        infoMap.set(cKey, entry.case ? entry.case.caseNo : 'No Case');
      }
    }

    return {
      caseRows: Array.from(caseMap.entries()).map(([caseId, dayMap]) => ({
        caseId,
        label: infoMap.get(caseId) || 'No Case',
        dayMap,
      })),
      dailyTotals: totals,
      caseInfoMap: infoMap,
    };
  }, [entries]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    onWeekChange(d.toISOString().split('T')[0]);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    onWeekChange(d.toISOString().split('T')[0]);
  };

  const goToThisWeek = () => {
    onWeekChange(getWeekStartISO(todayISO()));
  };

  const isCurrentWeek = weekStart === getWeekStartISO(todayISO());

  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Week navigation header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
        <button
          onClick={prevWeek}
          className="p-1.5 rounded-md text-[#6C757D] hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[#1B2A4A]">
            {formatDate(weekStart)} &mdash; {formatDate(weekEndDate.toISOString().split('T')[0])}
          </h3>
          {!isCurrentWeek && (
            <button
              onClick={goToThisWeek}
              className="h-7 px-2.5 rounded-md text-xs font-medium text-[#4472C4] border border-[#4472C4]/30 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              This Week
            </button>
          )}
        </div>
        <button
          onClick={nextWeek}
          className="p-1.5 rounded-md text-[#6C757D] hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="px-3 py-3 text-left min-w-[180px]">
                <span className={LABEL_CLASS}>Case</span>
              </th>
              {weekDates.map((date, i) => {
                const isToday = date === todayISO();
                return (
                  <th
                    key={date}
                    className={`px-3 py-3 text-center min-w-[80px] ${isToday ? 'bg-blue-50/60' : ''}`}
                  >
                    <span className={`${LABEL_CLASS} block`}>{DAY_LABELS[i]}</span>
                    <span className={`text-[10px] block mt-0.5 ${isToday ? 'text-[#4472C4] font-bold' : 'text-[#999]'}`}>
                      {new Date(date).getDate()}
                    </span>
                  </th>
                );
              })}
              <th className="px-3 py-3 text-center min-w-[80px]">
                <span className={LABEL_CLASS}>Total</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {caseRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-[#6C757D]">
                  No time entries for this week.
                </td>
              </tr>
            )}
            {caseRows.map((row) => {
              const rowTotal = weekDates.reduce(
                (sum, d) => sum + (row.dayMap.get(d) || 0),
                0
              );

              return (
                <tr key={row.caseId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5">
                    {row.caseId === '__none__' ? (
                      <span className="text-xs text-[#999]">No Case</span>
                    ) : (
                      <Link
                        href={`/case-management/cases/${row.caseId}`}
                        className="text-xs text-[#4472C4] font-medium hover:underline"
                      >
                        {row.label}
                      </Link>
                    )}
                  </td>
                  {weekDates.map((date) => {
                    const minutes = row.dayMap.get(date) || 0;
                    const isToday = date === todayISO();
                    return (
                      <td
                        key={date}
                        className={`px-3 py-2.5 text-center cursor-pointer hover:bg-[#4472C4]/10 transition-colors ${
                          isToday ? 'bg-blue-50/40' : ''
                        }`}
                        onClick={() => onCellClick(row.caseId === '__none__' ? null : row.caseId, date)}
                        title={`Click to view/add entries${minutes > 0 ? ` (${formatDuration(minutes)})` : ''}`}
                      >
                        {minutes > 0 ? (
                          <span className="text-xs font-semibold text-[#1B2A4A]">
                            {formatDuration(minutes)}
                          </span>
                        ) : (
                          <span className="text-xs text-[#DDD]">&mdash;</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-center">
                    <span className="text-xs font-bold text-[#1B2A4A]">
                      {rowTotal > 0 ? formatDuration(rowTotal) : '--'}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Daily totals row */}
            {caseRows.length > 0 && (
              <tr className="border-t-2 border-gray-200 bg-gray-50/80 font-semibold">
                <td className="px-3 py-2.5">
                  <span className={LABEL_CLASS}>Daily Total</span>
                </td>
                {weekDates.map((date) => {
                  const total = dailyTotals.get(date) || 0;
                  const isToday = date === todayISO();
                  return (
                    <td key={date} className={`px-3 py-2.5 text-center ${isToday ? 'bg-blue-50/60' : ''}`}>
                      <span className={`text-xs font-bold ${total > 0 ? 'text-[#4472C4]' : 'text-[#CCC]'}`}>
                        {total > 0 ? formatDuration(total) : '--'}
                      </span>
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-center">
                  <span className="text-sm font-bold text-[#4472C4]">
                    {formatDuration(
                      weekDates.reduce((sum, d) => sum + (dailyTotals.get(d) || 0), 0)
                    )}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// Reject Note Dialog
// ============================================================

function RejectDialog({
  isOpen,
  onConfirm,
  onCancel,
}: {
  readonly isOpen: boolean;
  readonly onConfirm: (note: string) => void;
  readonly onCancel: () => void;
}) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) setNote('');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">Reject Time Entry</h3>
        <p className="text-sm text-[#666] mb-4">Provide a reason for rejection (optional).</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for rejection..."
          rows={3}
          className={`${INPUT_CLASS} !h-auto py-2 resize-none mb-4`}
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-md text-sm font-medium text-[#333333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note.trim())}
            className="h-9 px-4 rounded-md text-sm font-medium text-white bg-[#FF4444] border border-[#FF4444] hover:bg-[#E63939] transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function TimeTrackingPage() {
  // --- Core data ---
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<TimeSummaryReport | null>(null);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Reference data ---
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [caseList, setCaseList] = useState<{ id: string; caseNo: string; caseTitle: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(null);

  // --- UI state ---
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<TimeFilters>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [weekStart, setWeekStart] = useState(() => getWeekStartISO(todayISO()));

  // --- Modals ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimeEntry | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TimeEntry | null>(null);
  const [saving, setSaving] = useState(false);

  // --- Toasts ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  const isSuperadmin = currentUser?.role === 'superadmin';

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = generateToastId();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Load reference data ---
  useEffect(() => {
    const loadRef = async () => {
      try {
        const user = cmsAuth.getUser();
        setCurrentUser(user);

        const [usersData, casesData] = await Promise.all([
          cmsUsers.list().catch(() => []),
          cmsCases.list({ limit: 500 }).catch(() => ({ data: [] })),
        ]);
        setUsers(usersData);
        const caseItems = (casesData as { data: Case[] }).data || [];
        setCaseList(caseItems.map((c: Case) => ({ id: c.id, caseNo: c.caseNo, caseTitle: c.caseTitle })));
      } catch {
        // silently fail
      }
    };
    loadRef();
  }, []);

  // --- Fetch entries ---
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { limit: 500 };
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.activityType) params.activityType = filters.activityType;
      if (filters.status) params.status = filters.status;
      if (filters.caseId) params.caseId = filters.caseId;
      if (filters.billable) params.billable = filters.billable;
      if (filters.userId) params.userId = filters.userId;

      const result = await cmsTimeEntries.list(params);
      setEntries(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time entries.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // --- Fetch summary ---
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      // Fetch this week's summary
      const weekStartDate = getWeekStartISO(todayISO());
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      const params: Record<string, string> = {
        dateFrom: weekStartDate,
        dateTo: weekEndDate.toISOString().split('T')[0],
      };
      if (filters.userId) params.userId = filters.userId;

      const data = await cmsTimeEntries.reportSummary(params);
      setSummary(data);

      // Fetch today's total
      const todayParams: Record<string, string> = {
        dateFrom: todayISO(),
        dateTo: todayISO(),
      };
      if (filters.userId) todayParams.userId = filters.userId;

      const todayData = await cmsTimeEntries.reportSummary(todayParams);
      setTodayMinutes(todayData.totalMinutes);
    } catch {
      // summary failure is non-critical
    } finally {
      setSummaryLoading(false);
    }
  }, [filters.userId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // --- Sorted entries ---
  const sortedEntries = useMemo(() => {
    const sorted = [...entries];
    sorted.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortBy) {
        case 'date':
          aVal = a.date || '';
          bVal = b.date || '';
          break;
        case 'activityType':
          aVal = a.activityType;
          bVal = b.activityType;
          break;
        case 'description':
          aVal = a.description;
          bVal = b.description;
          break;
        case 'case':
          aVal = a.case?.caseNo || '';
          bVal = b.case?.caseNo || '';
          break;
        case 'duration':
          aVal = a.durationMinutes;
          bVal = b.durationMinutes;
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        case 'billable':
          aVal = a.billable ? 1 : 0;
          bVal = b.billable ? 1 : 0;
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
      }

      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [entries, sortBy, sortOrder]);

  // --- Timesheet entries (filtered to selected week) ---
  const timesheetEntries = useMemo(() => {
    const weekDates = getWeekDates(weekStart);
    const dateSet = new Set(weekDates);
    return entries.filter((e) => {
      const dateKey = formatDateISO(e.date);
      return dateSet.has(dateKey);
    });
  }, [entries, weekStart]);

  // --- Handlers ---

  const handleSort = useCallback((key: SortKey) => {
    setSortBy((prev) => {
      if (prev === key) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortOrder(key === 'date' ? 'desc' : 'asc');
      return key;
    });
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setEditEntry(null);
    setModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((entry: TimeEntry) => {
    setEditEntry(entry);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditEntry(null);
  }, []);

  const handleSaveEntry = useCallback(async (formData: TimeEntryFormData) => {
    setSaving(true);
    try {
      const payload = {
        caseId: formData.caseId || null,
        activityType: formData.activityType,
        durationMinutes: formData.durationMinutes,
        date: formData.date,
        description: formData.description.trim(),
        billable: formData.billable,
      };

      if (editEntry) {
        await cmsTimeEntries.update(editEntry.id, payload);
        showToast('success', 'Time entry updated.');
      } else {
        await cmsTimeEntries.create(payload as Parameters<typeof cmsTimeEntries.create>[0]);
        showToast('success', 'Time entry logged.');
      }

      setModalOpen(false);
      setEditEntry(null);
      await Promise.all([fetchEntries(), fetchSummary()]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save time entry.');
    } finally {
      setSaving(false);
    }
  }, [editEntry, fetchEntries, fetchSummary, showToast]);

  const handleDeleteEntry = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await cmsTimeEntries.remove(deleteTarget.id);
      showToast('success', 'Time entry deleted.');
      setDeleteTarget(null);
      await Promise.all([fetchEntries(), fetchSummary()]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete time entry.');
    }
  }, [deleteTarget, fetchEntries, fetchSummary, showToast]);

  const handleSubmitEntry = useCallback(async (entry: TimeEntry) => {
    try {
      await cmsTimeEntries.update(entry.id, { status: 'Submitted' } as Partial<TimeEntry>);
      showToast('success', 'Time entry submitted for approval.');
      await fetchEntries();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to submit time entry.');
    }
  }, [fetchEntries, showToast]);

  const handleApproveEntry = useCallback(async (entry: TimeEntry) => {
    try {
      await cmsTimeEntries.approve(entry.id);
      showToast('success', 'Time entry approved.');
      await fetchEntries();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to approve time entry.');
    }
  }, [fetchEntries, showToast]);

  const handleRejectEntry = useCallback(async (note: string) => {
    if (!rejectTarget) return;
    try {
      await cmsTimeEntries.reject(rejectTarget.id, note || undefined);
      showToast('success', 'Time entry rejected.');
      setRejectTarget(null);
      await fetchEntries();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to reject time entry.');
    }
  }, [rejectTarget, fetchEntries, showToast]);

  const handleTimesheetCellClick = useCallback((_caseId: string | null, date: string) => {
    // Open quick-add modal with the date pre-filled
    setEditEntry(null);
    setModalOpen(true);
    // We'll let the modal default to today, but ideally we'd pass the date
    // For now, we can update filters to show that day
    setFilters((prev) => ({ ...prev, dateFrom: date, dateTo: date }));
  }, []);

  // --- Render ---

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Time Tracking</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Track billable hours, log activities, and manage time entries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => { fetchEntries(); fetchSummary(); }}
            disabled={loading}
            className="h-9 px-4 rounded-md text-sm font-medium text-[#6C757D] border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

          {/* + Log Time */}
          <button
            onClick={handleOpenCreateModal}
            className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Log Time
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards summary={summary} todayMinutes={todayMinutes} loading={summaryLoading} />

      {/* View Toggle + Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
        <div className="flex-1">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            cases={caseList}
            users={users}
            isSuperadmin={isSuperadmin}
          />
        </div>
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
            onClick={fetchEntries}
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
          <p className="text-sm text-[#6C757D]">Loading time entries...</p>
        </div>
      )}

      {/* Views */}
      {!loading && viewMode === 'list' && (
        <ListView
          entries={sortedEntries}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isSuperadmin={isSuperadmin}
          onSort={handleSort}
          onEdit={handleOpenEditModal}
          onDelete={(e) => setDeleteTarget(e)}
          onSubmit={handleSubmitEntry}
          onApprove={handleApproveEntry}
          onReject={(e) => setRejectTarget(e)}
        />
      )}

      {!loading && viewMode === 'timesheet' && (
        <TimesheetView
          entries={timesheetEntries}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          onCellClick={handleTimesheetCellClick}
        />
      )}

      {/* Footer count */}
      {!loading && entries.length > 0 && (
        <div className="flex items-center justify-between text-xs text-[#6C757D] px-1">
          <span>
            Showing {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
            {summary?.totalEntries ? ` of ${summary.totalEntries} total` : ''}
          </span>
          <span>
            Total: <span className="font-semibold text-[#1B2A4A]">{formatDuration(entries.reduce((sum, e) => sum + e.durationMinutes, 0))}</span>
          </span>
        </div>
      )}

      {/* Quick-Add Modal */}
      <QuickAddModal
        isOpen={modalOpen}
        editEntry={editEntry}
        cases={caseList}
        saving={saving}
        onSave={handleSaveEntry}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Time Entry"
        message={`Are you sure you want to delete this time entry (${deleteTarget ? formatDuration(deleteTarget.durationMinutes) : ''} - ${deleteTarget ? truncate(deleteTarget.description, 40) : ''})? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteEntry}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Reject Dialog */}
      <RejectDialog
        isOpen={!!rejectTarget}
        onConfirm={handleRejectEntry}
        onCancel={() => setRejectTarget(null)}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
