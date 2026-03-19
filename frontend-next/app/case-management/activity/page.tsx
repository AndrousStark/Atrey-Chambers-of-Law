'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { cmsTimeEntries, cmsNotifications, cmsAuth, cmsCases, cmsUsers } from '@/lib/cms-api';
import type {
  TimeEntry,
  ActivityType,
  TimeEntryStatus,
  TimeSummaryReport,
  Notification,
  NotificationSeverity,
  NotificationPreference,
  CmsUser,
  Case,
  UserRole,
} from '@/lib/cms-types';
import { ACTIVITY_TYPE_LABELS, TIME_ENTRY_STATUS_LABELS, NOTIFICATION_TYPE_LABELS } from '@/lib/cms-types';

// ============================================================
// Constants
// ============================================================

const ACTIVITY_TYPES: readonly ActivityType[] = [
  'Research', 'Drafting', 'CourtAppearance', 'Travel', 'ClientMeeting',
  'PhoneCall', 'ReviewWork', 'FilingWork', 'Administrative', 'Consultation',
  'Conference', 'Other',
];

const TIME_ENTRY_STATUSES: readonly TimeEntryStatus[] = [
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

const SEVERITY_COLORS: Record<
  NotificationSeverity,
  { readonly border: string; readonly bg: string; readonly text: string; readonly label: string }
> = {
  info: { border: '#4472C4', bg: 'bg-blue-50', text: 'text-[#4472C4]', label: 'Info' },
  warning: { border: '#FF8C00', bg: 'bg-orange-50', text: 'text-[#FF8C00]', label: 'Warning' },
  urgent: { border: '#FF4444', bg: 'bg-red-50', text: 'text-[#FF4444]', label: 'Urgent' },
  critical: { border: '#DC2626', bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
};

const SEVERITY_OPTIONS: readonly NotificationSeverity[] = ['info', 'warning', 'urgent', 'critical'];

const NOTIFICATION_TYPE_OPTIONS = Object.keys(NOTIFICATION_TYPE_LABELS) as readonly string[];

const SNOOZE_OPTIONS: readonly { readonly label: string; readonly getDate: () => string }[] = [
  { label: '1 hour', getDate: () => new Date(Date.now() + 60 * 60 * 1000).toISOString() },
  { label: '3 hours', getDate: () => new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
  {
    label: 'Tomorrow 9 AM',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d.toISOString();
    },
  },
];

const CHANNELS: readonly { readonly key: string; readonly label: string }[] = [
  { key: 'in_app', label: 'In-App' },
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
];

const STAT_COLORS = {
  today: { bg: '#EBF2FF', border: '#4472C4', text: '#4472C4' },
  week: { bg: '#EAFBEF', border: '#28A745', text: '#28A745' },
  billable: { bg: '#FFF8EB', border: '#FF8C00', text: '#FF8C00' },
  alerts: { bg: '#FFF0F0', border: '#FF4444', text: '#FF4444' },
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

const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const NOTIF_PAGE_LIMIT = 20;
const NOTIF_POLL_INTERVAL = 30_000;

type ViewMode = 'list' | 'timesheet';
type MobileTab = 'time' | 'alerts';
type SortKey = 'date' | 'activityType' | 'description' | 'case' | 'duration' | 'billable' | 'status';

// ============================================================
// Design System Classes
// ============================================================

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors';

const SELECT_CLASS =
  'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors appearance-none cursor-pointer pr-8';

const SELECT_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 10px center' as const,
};

const LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wider text-[#6C757D]';
const BADGE_CLASS = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap';

// ============================================================
// SVG Icons
// ============================================================

function IconPlus({ size = 16 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconRefresh({ size = 16, spinning = false }: { readonly size?: number; readonly spinning?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={spinning ? 'animate-spin' : ''}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconClose({ size = 14 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCheck({ size = 14 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconEdit({ size = 14 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ size = 14 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconSend({ size = 14 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconFilter({ size = 16 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function IconClock({ size = 16 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconBell({ size = 16 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconEye({ size = 14 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconShield({ size = 14 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconChevronLeft({ size = 18 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight({ size = 18 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconChevronDown({ size = 12 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconChevronUp({ size = 12 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 15 12 9 18 15" />
    </svg>
  );
}

function IconGrid({ size = 16 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function IconCalendar({ size = 16 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconAlert({ size = 16 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconSuccess({ size = 18 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconError({ size = 18 }: { readonly size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

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

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
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

function formatSnoozeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (60 * 60 * 1000));
  if (diffHours < 1) return 'Soon';
  if (diffHours < 24) return `in ${diffHours}h`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

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
  readonly toasts: readonly Toast[];
  readonly onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-50 border-[#28A745]/30 text-[#28A745]'
              : 'bg-red-50 border-[#FF4444]/30 text-[#FF4444]'
          }`}
        >
          {toast.type === 'success' ? <IconSuccess /> : <IconError />}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-0.5 rounded hover:bg-black/5 transition-colors cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center"
          >
            <IconClose />
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
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{title}</h3>
        <p className="text-sm text-[#666] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-md text-sm font-medium text-[#333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-9 px-4 rounded-md text-sm font-medium text-white bg-[#FF4444] border border-[#FF4444] hover:bg-[#E63939] transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Reject Dialog
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
            className="h-9 px-4 rounded-md text-sm font-medium text-[#333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note.trim())}
            className="h-9 px-4 rounded-md text-sm font-medium text-white bg-[#FF4444] border border-[#FF4444] hover:bg-[#E63939] transition-colors cursor-pointer"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Stats Cards (shared across panels)
// ============================================================

function StatsCards({
  summary,
  todayMinutes,
  summaryLoading,
  unreadCount,
  alertsLoading,
}: {
  readonly summary: TimeSummaryReport | null;
  readonly todayMinutes: number;
  readonly summaryLoading: boolean;
  readonly unreadCount: number;
  readonly alertsLoading: boolean;
}) {
  const totalMinutes = summary?.totalMinutes ?? 0;
  const billableMinutes = summary?.billableMinutes ?? 0;
  const billablePercent = totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0;

  const items = [
    {
      key: 'today',
      label: 'Today',
      value: formatDuration(todayMinutes),
      color: STAT_COLORS.today,
      loading: summaryLoading,
    },
    {
      key: 'week',
      label: 'This Week',
      value: formatDuration(totalMinutes),
      color: STAT_COLORS.week,
      loading: summaryLoading,
    },
    {
      key: 'billable',
      label: 'Billable %',
      value: `${billablePercent}%`,
      color: STAT_COLORS.billable,
      loading: summaryLoading,
    },
    {
      key: 'alerts',
      label: 'Alerts',
      value: String(unreadCount),
      color: STAT_COLORS.alerts,
      loading: alertsLoading,
      pulse: unreadCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="bg-white rounded-xl p-4 transition-shadow hover:shadow-md"
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${item.color.border}`,
          }}
        >
          <div className="flex items-center justify-between">
            <p className={LABEL_CLASS}>{item.label}</p>
            {'pulse' in item && item.pulse && (
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: item.color.border }}
              />
            )}
          </div>
          {item.loading ? (
            <div className="h-7 w-16 bg-gray-200 rounded mt-1 animate-pulse" />
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
// Time Entry Filter / View UI
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

function ViewToggle({
  activeView,
  onViewChange,
}: {
  readonly activeView: ViewMode;
  readonly onViewChange: (v: ViewMode) => void;
}) {
  const views: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'list', label: 'List', icon: <IconGrid /> },
    { key: 'timesheet', label: 'Timesheet', icon: <IconCalendar /> },
  ];

  return (
    <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
      {views.map((v) => (
        <button
          key={v.key}
          onClick={() => onViewChange(v.key)}
          className={`flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium transition-colors cursor-pointer ${
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

function TimeFilterBar({
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
    <div className="bg-white rounded-lg border border-gray-200 p-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {DATE_PRESETS.map((p) => {
            const range = getDateRangePreset(p.key);
            const isActive = filters.dateFrom === range.from && filters.dateTo === range.to;
            return (
              <button
                key={p.key}
                onClick={() => handlePreset(p.key)}
                className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
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

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className={`h-8 px-2.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              expanded || hasFilters
                ? 'text-[#4472C4] border-[#4472C4] bg-blue-50'
                : 'text-[#6C757D] border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <IconFilter size={14} />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="w-4 h-4 rounded-full bg-[#4472C4] text-white text-[9px] font-bold flex items-center justify-center">
                {[filters.activityType, filters.status, filters.caseId, filters.billable, filters.userId, filters.dateFrom, filters.dateTo].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasFilters && (
            <button
              onClick={() => onFiltersChange(EMPTY_FILTERS)}
              className="h-8 px-2.5 rounded-md text-xs font-medium text-[#FF4444] border border-[#FF4444]/30 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <div>
            <label className={LABEL_CLASS}>Date From</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => updateFilter('dateFrom', e.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Date To</label>
            <input type="date" value={filters.dateTo} onChange={(e) => updateFilter('dateTo', e.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Activity Type</label>
            <select value={filters.activityType} onChange={(e) => updateFilter('activityType', e.target.value)} className={SELECT_CLASS} style={SELECT_STYLE}>
              <option value="">All Activities</option>
              {ACTIVITY_TYPES.map((a) => (
                <option key={a} value={a}>{ACTIVITY_TYPE_LABELS[a]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Status</label>
            <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className={SELECT_CLASS} style={SELECT_STYLE}>
              <option value="">All Statuses</option>
              {TIME_ENTRY_STATUSES.map((s) => (
                <option key={s} value={s}>{TIME_ENTRY_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Case</label>
            <select value={filters.caseId} onChange={(e) => updateFilter('caseId', e.target.value)} className={SELECT_CLASS} style={SELECT_STYLE}>
              <option value="">All Cases</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNo} - {truncate(c.caseTitle, 20)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Billable</label>
            <select value={filters.billable} onChange={(e) => updateFilter('billable', e.target.value)} className={SELECT_CLASS} style={SELECT_STYLE}>
              <option value="">All</option>
              <option value="true">Billable Only</option>
              <option value="false">Non-billable Only</option>
            </select>
          </div>
          {isSuperadmin && (
            <div>
              <label className={LABEL_CLASS}>User</label>
              <select value={filters.userId} onChange={(e) => updateFilter('userId', e.target.value)} className={SELECT_CLASS} style={SELECT_STYLE}>
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
  prefill,
  onSave,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly editEntry: TimeEntry | null;
  readonly cases: { id: string; caseNo: string; caseTitle: string }[];
  readonly saving: boolean;
  readonly prefill: { caseId?: string; activityType?: ActivityType; date?: string; description?: string } | null;
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
      } else if (prefill) {
        setForm({
          caseId: prefill.caseId || '',
          activityType: prefill.activityType || 'CourtAppearance',
          durationMinutes: 0,
          customMinutes: '',
          date: prefill.date || todayISO(),
          description: prefill.description || '',
          billable: true,
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
  }, [isOpen, editEntry, prefill]);

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
    setForm((prev) => ({ ...prev, durationMinutes: minutes, customMinutes: String(minutes) }));
  };

  const handleCustomMinutesChange = (val: string) => {
    const num = parseInt(val, 10);
    setForm((prev) => ({ ...prev, customMinutes: val, durationMinutes: isNaN(num) || num < 0 ? 0 : num }));
  };

  const filteredCases = useMemo(() => {
    if (!caseSearch.trim()) return cases;
    const q = caseSearch.toLowerCase();
    return cases.filter((c) => c.caseNo.toLowerCase().includes(q) || c.caseTitle.toLowerCase().includes(q));
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
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1B2A4A]">
            {editEntry ? 'Edit Time Entry' : 'Log Time'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-[#6C757D] hover:bg-gray-100 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center">
            <IconClose size={20} />
          </button>
        </div>

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
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.minutes}
                  type="button"
                  onClick={() => handlePresetClick(p.minutes)}
                  className={`h-8 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    form.durationMinutes === p.minutes
                      ? 'bg-[#4472C4] text-white border border-[#4472C4]'
                      : 'bg-white text-[#6C757D] border border-gray-300 hover:border-[#4472C4] hover:text-[#4472C4]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
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
            <input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} className={INPUT_CLASS} />
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
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 cursor-pointer ${
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
              <span className="text-sm font-medium text-[#333]">
                {form.billable ? 'Billable' : 'Non-billable'}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
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
// Time Entry List View
// ============================================================

function TimeListView({
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
      <th className={`px-3 py-2.5 text-left cursor-pointer select-none group ${className || ''}`} onClick={() => onSort(sortKey)}>
        <div className="flex items-center gap-1">
          <span className={LABEL_CLASS}>{label}</span>
          <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
            {isActive && sortOrder === 'desc' ? <IconChevronUp /> : <IconChevronDown />}
          </span>
        </div>
      </th>
    );
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
        <IconClock size={40} />
        <p className="text-sm text-[#6C757D] font-medium mt-3">No time entries found.</p>
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
              <th className="px-3 py-2.5 text-right"><span className={LABEL_CLASS}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const rowBg = STATUS_ROW_BG[entry.status] || '';
              return (
                <tr key={entry.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${rowBg}`}>
                  <td className="px-3 py-2 text-[#333] whitespace-nowrap text-xs">{formatDate(entry.date)}</td>
                  <td className="px-3 py-2">
                    <span className={`${BADGE_CLASS} ${ACTIVITY_COLORS[entry.activityType]}`}>
                      {ACTIVITY_TYPE_LABELS[entry.activityType]}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-[200px]">
                    <p className="text-[#333] text-xs truncate" title={entry.description}>{truncate(entry.description, 40)}</p>
                  </td>
                  <td className="px-3 py-2">
                    {entry.case ? (
                      <Link href={`/case-management/cases/${entry.caseId}`} className="text-xs text-[#4472C4] font-medium hover:underline cursor-pointer">
                        {truncate(entry.case.caseNo, 18)}
                      </Link>
                    ) : (
                      <span className="text-[#999] text-xs">--</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="text-sm font-semibold text-[#1B2A4A]">{formatDuration(entry.durationMinutes)}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {entry.billable ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28A745" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`${BADGE_CLASS} ${STATUS_COLORS[entry.status]}`}>
                      {TIME_ENTRY_STATUS_LABELS[entry.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {(entry.status === 'Draft' || entry.status === 'Rejected') && (
                        <button onClick={() => onEdit(entry)} className="p-1.5 rounded-md text-[#6C757D] hover:text-[#4472C4] hover:bg-blue-50 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center" title="Edit">
                          <IconEdit />
                        </button>
                      )}
                      {entry.status === 'Draft' && (
                        <button onClick={() => onSubmit(entry)} className="p-1.5 rounded-md text-[#6C757D] hover:text-[#4472C4] hover:bg-blue-50 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center" title="Submit for approval">
                          <IconSend />
                        </button>
                      )}
                      {isSuperadmin && entry.status === 'Submitted' && (
                        <>
                          <button onClick={() => onApprove(entry)} className="p-1.5 rounded-md text-[#6C757D] hover:text-[#28A745] hover:bg-green-50 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center" title="Approve">
                            <IconCheck />
                          </button>
                          <button onClick={() => onReject(entry)} className="p-1.5 rounded-md text-[#6C757D] hover:text-[#FF4444] hover:bg-red-50 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center" title="Reject">
                            <IconClose />
                          </button>
                        </>
                      )}
                      {(entry.status === 'Draft' || entry.status === 'Rejected') && (
                        <button onClick={() => onDelete(entry)} className="p-1.5 rounded-md text-[#6C757D] hover:text-[#FF4444] hover:bg-red-50 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center" title="Delete">
                          <IconTrash />
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

  const { caseRows, dailyTotals } = useMemo(() => {
    const caseMap = new Map<string, Map<string, number>>();
    const infoMap = new Map<string, string>();
    const totals = new Map<string, number>();

    for (const entry of entries) {
      const cKey = entry.caseId || '__none__';
      const dateKey = formatDateISO(entry.date);

      if (!caseMap.has(cKey)) caseMap.set(cKey, new Map());
      const dayMap = caseMap.get(cKey)!;
      dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + entry.durationMinutes);
      totals.set(dateKey, (totals.get(dateKey) || 0) + entry.durationMinutes);

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

  const goToThisWeek = () => onWeekChange(getWeekStartISO(todayISO()));
  const isCurrentWeek = weekStart === getWeekStartISO(todayISO());

  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
        <button onClick={prevWeek} className="p-1.5 rounded-md text-[#6C757D] hover:bg-gray-100 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center">
          <IconChevronLeft />
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[#1B2A4A]">
            {formatDate(weekStart)} &mdash; {formatDate(weekEndDate.toISOString().split('T')[0])}
          </h3>
          {!isCurrentWeek && (
            <button onClick={goToThisWeek} className="h-7 px-2.5 rounded-md text-xs font-medium text-[#4472C4] border border-[#4472C4]/30 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
              This Week
            </button>
          )}
        </div>
        <button onClick={nextWeek} className="p-1.5 rounded-md text-[#6C757D] hover:bg-gray-100 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center">
          <IconChevronRight />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left min-w-[140px]"><span className={LABEL_CLASS}>Case</span></th>
              {weekDates.map((date, i) => {
                const isToday = date === todayISO();
                return (
                  <th key={date} className={`px-3 py-2.5 text-center min-w-[70px] ${isToday ? 'bg-blue-50/60' : ''}`}>
                    <span className={`${LABEL_CLASS} block`}>{DAY_LABELS[i]}</span>
                    <span className={`text-[10px] block mt-0.5 ${isToday ? 'text-[#4472C4] font-bold' : 'text-[#999]'}`}>
                      {new Date(date).getDate()}
                    </span>
                  </th>
                );
              })}
              <th className="px-3 py-2.5 text-center min-w-[70px]"><span className={LABEL_CLASS}>Total</span></th>
            </tr>
          </thead>
          <tbody>
            {caseRows.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-6 text-center text-sm text-[#6C757D]">No time entries for this week.</td></tr>
            )}
            {caseRows.map((row) => {
              const rowTotal = weekDates.reduce((sum, d) => sum + (row.dayMap.get(d) || 0), 0);
              return (
                <tr key={row.caseId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2">
                    {row.caseId === '__none__' ? (
                      <span className="text-xs text-[#999]">No Case</span>
                    ) : (
                      <Link href={`/case-management/cases/${row.caseId}`} className="text-xs text-[#4472C4] font-medium hover:underline cursor-pointer">
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
                        className={`px-3 py-2 text-center cursor-pointer hover:bg-[#4472C4]/10 transition-colors ${isToday ? 'bg-blue-50/40' : ''}`}
                        onClick={() => onCellClick(row.caseId === '__none__' ? null : row.caseId, date)}
                        title={`Click to add entry${minutes > 0 ? ` (${formatDuration(minutes)})` : ''}`}
                      >
                        {minutes > 0 ? (
                          <span className="text-xs font-semibold text-[#1B2A4A]">{formatDuration(minutes)}</span>
                        ) : (
                          <span className="text-xs text-[#DDD]">&mdash;</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    <span className="text-xs font-bold text-[#1B2A4A]">{rowTotal > 0 ? formatDuration(rowTotal) : '--'}</span>
                  </td>
                </tr>
              );
            })}

            {caseRows.length > 0 && (
              <tr className="border-t-2 border-gray-200 bg-gray-50/80 font-semibold">
                <td className="px-3 py-2"><span className={LABEL_CLASS}>Daily Total</span></td>
                {weekDates.map((date) => {
                  const total = dailyTotals.get(date) || 0;
                  const isToday = date === todayISO();
                  return (
                    <td key={date} className={`px-3 py-2 text-center ${isToday ? 'bg-blue-50/60' : ''}`}>
                      <span className={`text-xs font-bold ${total > 0 ? 'text-[#4472C4]' : 'text-[#CCC]'}`}>
                        {total > 0 ? formatDuration(total) : '--'}
                      </span>
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center">
                  <span className="text-sm font-bold text-[#4472C4]">
                    {formatDuration(weekDates.reduce((sum, d) => sum + (dailyTotals.get(d) || 0), 0))}
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
// Notification Card
// ============================================================

function NotificationCard({
  notification,
  onMarkRead,
  onAcknowledge,
  onSnooze,
  onDismiss,
  onLogTime,
}: {
  readonly notification: Notification;
  readonly onMarkRead: (id: string) => void;
  readonly onAcknowledge: (id: string) => void;
  readonly onSnooze: (id: string, until: string) => void;
  readonly onDismiss: (id: string) => void;
  readonly onLogTime: (notification: Notification) => void;
}) {
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const snoozeRef = useRef<HTMLDivElement>(null);

  const severity = SEVERITY_COLORS[notification.severity] ?? SEVERITY_COLORS.info;
  const isUnread = !notification.readAt;
  const isAcknowledged = !!notification.acknowledgedAt;
  const isSnoozed = !!notification.snoozedUntil && new Date(notification.snoozedUntil) > new Date();
  const isDismissed = !!notification.dismissedAt;
  const isCritical = notification.severity === 'critical' || notification.severity === 'urgent';
  const isHearingReminder = notification.type === 'hearing_reminder';

  useEffect(() => {
    if (!snoozeOpen) return;
    function handleClick(e: MouseEvent) {
      if (snoozeRef.current && !snoozeRef.current.contains(e.target as Node)) {
        setSnoozeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [snoozeOpen]);

  const [expandedBody, setExpandedBody] = useState(false);
  const bodyText = notification.body || '';
  const isBodyLong = bodyText.length > 120;

  return (
    <div
      className={`bg-white rounded-lg border transition-all duration-200 hover:shadow-sm ${
        isUnread ? 'border-gray-200 ring-1 ring-blue-100' : 'border-gray-200'
      } ${isDismissed ? 'opacity-50' : ''}`}
      style={{ borderLeftWidth: '4px', borderLeftColor: severity.border }}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          {/* Unread dot */}
          <div className="flex-shrink-0 mt-1.5">
            {isUnread ? (
              <span
                className={`block w-2 h-2 rounded-full ${notification.severity === 'critical' ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: severity.border }}
              />
            ) : (
              <span className="block w-2 h-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1 mb-1">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${severity.bg} ${severity.text}`}>
                {severity.label}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-[#6C757D]">
                {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
              </span>
              {isSnoozed && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-50 text-amber-600">
                  <IconClock size={9} />
                  {formatSnoozeTime(notification.snoozedUntil!)}
                </span>
              )}
              {isAcknowledged && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-green-50 text-[#28A745]">
                  <IconCheck size={9} />
                  Acked
                </span>
              )}
            </div>

            {/* Title */}
            <h4 className={`text-xs leading-snug ${isUnread ? 'font-semibold text-[#1B2A4A]' : 'font-medium text-[#333]'}`}>
              {notification.title}
            </h4>

            {/* Body */}
            {bodyText && (
              <p
                className={`text-xs text-[#6C757D] mt-0.5 leading-relaxed ${!expandedBody && isBodyLong ? 'line-clamp-2' : ''}`}
                onClick={() => isBodyLong && setExpandedBody(!expandedBody)}
                style={isBodyLong ? { cursor: 'pointer' } : undefined}
              >
                {bodyText}
              </p>
            )}

            {/* Timestamp */}
            <p className="text-[10px] text-[#6C757D]/70 mt-1">{formatTimeAgo(notification.createdAt)}</p>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-1 mt-2 ml-4">
          {isUnread && !isDismissed && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="h-7 px-2 rounded-md text-[10px] font-medium text-[#4472C4] border border-[#4472C4]/30 bg-white hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1 min-h-[28px]"
              title="Mark as read"
            >
              <IconEye size={11} />
              Read
            </button>
          )}

          {/* Snooze */}
          {!isDismissed && !isAcknowledged && (
            <div className="relative" ref={snoozeRef}>
              <button
                onClick={() => setSnoozeOpen((prev) => !prev)}
                className="h-7 px-2 rounded-md text-[10px] font-medium text-[#FF8C00] border border-[#FF8C00]/30 bg-white hover:bg-orange-50 transition-colors cursor-pointer flex items-center gap-1 min-h-[28px]"
                title="Snooze"
              >
                <IconClock size={11} />
                Snooze
              </button>
              {snoozeOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {SNOOZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        onSnooze(notification.id, opt.getDate());
                        setSnoozeOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-[#333] hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Acknowledge */}
          {isCritical && !isAcknowledged && !isDismissed && (
            <button
              onClick={() => onAcknowledge(notification.id)}
              className="h-7 px-2 rounded-md text-[10px] font-medium text-[#28A745] border border-[#28A745]/30 bg-white hover:bg-green-50 transition-colors cursor-pointer flex items-center gap-1 min-h-[28px]"
              title="Acknowledge"
            >
              <IconShield size={11} />
              Ack
            </button>
          )}

          {/* Log Time (hearing_reminder special) */}
          {isHearingReminder && !isDismissed && (
            <button
              onClick={() => onLogTime(notification)}
              className="h-7 px-2 rounded-md text-[10px] font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors cursor-pointer flex items-center gap-1 min-h-[28px]"
              title="Log time for this hearing"
            >
              <IconClock size={11} />
              Log Time
            </button>
          )}

          {/* Dismiss */}
          {!isDismissed && (
            <button
              onClick={() => onDismiss(notification.id)}
              className="h-7 w-7 flex items-center justify-center rounded-md text-[#6C757D] border border-gray-200 bg-white hover:bg-gray-50 hover:text-[#FF4444] transition-colors cursor-pointer min-h-[28px]"
              title="Dismiss"
            >
              <IconClose size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Notification Preferences (Collapsible)
// ============================================================

function NotificationPreferencesSection({
  preferences,
  saving,
  onSave,
}: {
  readonly preferences: NotificationPreference[];
  readonly saving: boolean;
  readonly onSave: (prefs: Partial<NotificationPreference>[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const [localPrefs, setLocalPrefs] = useState<
    Record<string, Record<string, { enabled: boolean; advanceDays: number[] }>>
  >({});

  useEffect(() => {
    const map: Record<string, Record<string, { enabled: boolean; advanceDays: number[] }>> = {};
    for (const type of NOTIFICATION_TYPE_OPTIONS) {
      map[type] = {};
      for (const ch of CHANNELS) {
        const found = preferences.find((p) => p.notificationType === type && p.channel === ch.key);
        map[type][ch.key] = { enabled: found ? found.enabled : true, advanceDays: found ? found.advanceDays : [1, 3, 7] };
      }
    }
    setLocalPrefs(map);
  }, [preferences]);

  const togglePref = (type: string, channel: string) => {
    setLocalPrefs((prev) => {
      const updated = { ...prev };
      const typePrefs = { ...updated[type] };
      const current = typePrefs[channel];
      typePrefs[channel] = { ...current, enabled: !current.enabled };
      updated[type] = typePrefs;
      return updated;
    });
  };

  const handleSave = () => {
    const prefsToSave: Partial<NotificationPreference>[] = [];
    for (const type of NOTIFICATION_TYPE_OPTIONS) {
      for (const ch of CHANNELS) {
        const pref = localPrefs[type]?.[ch.key];
        if (pref) {
          const existing = preferences.find((p) => p.notificationType === type && p.channel === ch.key);
          prefsToSave.push({
            ...(existing?.id ? { id: existing.id } : {}),
            notificationType: type,
            channel: ch.key,
            enabled: pref.enabled,
            advanceDays: pref.advanceDays,
          });
        }
      }
    }
    onSave(prefsToSave);
  };

  return (
    <div className="border-t border-gray-200 mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#6C757D] uppercase tracking-wider hover:text-[#1B2A4A] transition-colors cursor-pointer"
      >
        <span>Preferences</span>
        {expanded ? <IconChevronUp /> : <IconChevronDown />}
      </button>

      {expanded && (
        <div className="pb-3">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 px-1 font-semibold text-[#1B2A4A] min-w-[120px]">Type</th>
                  {CHANNELS.map((ch) => (
                    <th key={ch.key} className="text-center py-1.5 px-1 font-semibold text-[#1B2A4A] min-w-[50px]">{ch.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_TYPE_OPTIONS.map((type) => (
                  <tr key={type} className="border-b border-gray-50">
                    <td className="py-1.5 px-1 font-medium text-[#333]">
                      {NOTIFICATION_TYPE_LABELS[type] ?? type}
                    </td>
                    {CHANNELS.map((ch) => {
                      const pref = localPrefs[type]?.[ch.key];
                      const isEnabled = pref?.enabled ?? true;
                      return (
                        <td key={ch.key} className="py-1.5 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => togglePref(type, ch.key)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                              isEnabled ? 'bg-[#4472C4]' : 'bg-gray-200'
                            }`}
                            role="switch"
                            aria-checked={isEnabled}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-7 px-3 rounded-md text-xs font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Loading Skeletons
// ============================================================

function TimeEntriesSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
          <div className="flex-1 h-3 bg-gray-200 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="h-3 w-10 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 flex gap-2" style={{ borderLeftWidth: '4px', borderLeftColor: '#e5e7eb' }}>
          <div className="w-2 h-2 bg-gray-200 rounded-full mt-1.5" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-3/4 bg-gray-200 rounded" />
            <div className="h-2 w-1/2 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function ActivityHubPage() {
  // --- Auth & Reference Data ---
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(null);
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [caseList, setCaseList] = useState<{ id: string; caseNo: string; caseTitle: string }[]>([]);

  const isSuperadmin = currentUser?.role === 'superadmin';

  // --- Time Tracking State ---
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeSummary, setTimeSummary] = useState<TimeSummaryReport | null>(null);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [timeLoading, setTimeLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [timeError, setTimeError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [timeFilters, setTimeFilters] = useState<TimeFilters>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [weekStart, setWeekStart] = useState(() => getWeekStartISO(todayISO()));

  // --- Notification State ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifMeta, setNotifMeta] = useState({ total: 0, unreadCount: 0, page: 1, limit: NOTIF_PAGE_LIMIT, totalPages: 0 });
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [notifTypeFilter, setNotifTypeFilter] = useState('');
  const [notifPage, setNotifPage] = useState(1);

  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [prefsSaving, setPrefsSaving] = useState(false);

  // --- Modals ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [modalPrefill, setModalPrefill] = useState<{ caseId?: string; activityType?: ActivityType; date?: string; description?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimeEntry | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TimeEntry | null>(null);
  const [saving, setSaving] = useState(false);

  // --- Mobile ---
  const [mobileTab, setMobileTab] = useState<MobileTab>('time');

  // --- Toasts ---
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  // ============================================================
  // Data Loading
  // ============================================================

  // Reference data
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

  // Fetch time entries
  const fetchTimeEntries = useCallback(async () => {
    setTimeLoading(true);
    setTimeError(null);
    try {
      const params: Record<string, string | number> = { limit: 500 };
      if (timeFilters.dateFrom) params.dateFrom = timeFilters.dateFrom;
      if (timeFilters.dateTo) params.dateTo = timeFilters.dateTo;
      if (timeFilters.activityType) params.activityType = timeFilters.activityType;
      if (timeFilters.status) params.status = timeFilters.status;
      if (timeFilters.caseId) params.caseId = timeFilters.caseId;
      if (timeFilters.billable) params.billable = timeFilters.billable;
      if (timeFilters.userId) params.userId = timeFilters.userId;

      const result = await cmsTimeEntries.list(params);
      setTimeEntries(result.data || []);
    } catch (err) {
      setTimeError(err instanceof Error ? err.message : 'Failed to load time entries.');
      setTimeEntries([]);
    } finally {
      setTimeLoading(false);
    }
  }, [timeFilters]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const weekStartDate = getWeekStartISO(todayISO());
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      const params: Record<string, string> = {
        dateFrom: weekStartDate,
        dateTo: weekEndDate.toISOString().split('T')[0],
      };
      if (timeFilters.userId) params.userId = timeFilters.userId;

      const data = await cmsTimeEntries.reportSummary(params);
      setTimeSummary(data);

      const todayParams: Record<string, string> = { dateFrom: todayISO(), dateTo: todayISO() };
      if (timeFilters.userId) todayParams.userId = timeFilters.userId;
      const todayData = await cmsTimeEntries.reportSummary(todayParams);
      setTodayMinutes(todayData.totalMinutes);
    } catch {
      // non-critical
    } finally {
      setSummaryLoading(false);
    }
  }, [timeFilters.userId]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const params: Record<string, string | number> = { page: notifPage, limit: NOTIF_PAGE_LIMIT };
      if (notifFilter === 'unread') params.unreadOnly = 1;
      if (notifTypeFilter) params.type = notifTypeFilter;

      const result = await cmsNotifications.list(params);
      setNotifications(result.data);
      setNotifMeta(result.meta);
    } catch (err) {
      setNotifError(err instanceof Error ? err.message : 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }, [notifPage, notifFilter, notifTypeFilter]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const prefs = await cmsNotifications.getPreferences();
      setPreferences(prefs);
    } catch {
      // silently fail
    }
  }, []);

  // Load time entries on filter change
  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  // Load summary on mount and user filter change
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Load notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Load preferences
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Poll unread count every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await cmsNotifications.unreadCount();
        setNotifMeta((prev) => ({ ...prev, unreadCount: result.count }));
      } catch {
        // silently fail
      }
    }, NOTIF_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // Computed / Memoized
  // ============================================================

  const sortedTimeEntries = useMemo(() => {
    const sorted = [...timeEntries];
    sorted.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortBy) {
        case 'date': aVal = a.date || ''; bVal = b.date || ''; break;
        case 'activityType': aVal = a.activityType; bVal = b.activityType; break;
        case 'description': aVal = a.description; bVal = b.description; break;
        case 'case': aVal = a.case?.caseNo || ''; bVal = b.case?.caseNo || ''; break;
        case 'duration':
          return sortOrder === 'asc' ? a.durationMinutes - b.durationMinutes : b.durationMinutes - a.durationMinutes;
        case 'billable':
          return sortOrder === 'asc' ? (a.billable ? 1 : 0) - (b.billable ? 1 : 0) : (b.billable ? 1 : 0) - (a.billable ? 1 : 0);
        case 'status': aVal = a.status; bVal = b.status; break;
      }

      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [timeEntries, sortBy, sortOrder]);

  const timesheetEntries = useMemo(() => {
    const weekDates = getWeekDates(weekStart);
    const dateSet = new Set(weekDates);
    return timeEntries.filter((e) => {
      const dateKey = formatDateISO(e.date);
      return dateSet.has(dateKey);
    });
  }, [timeEntries, weekStart]);

  // ============================================================
  // Time Entry Handlers
  // ============================================================

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
    setModalPrefill(null);
    setModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((entry: TimeEntry) => {
    setEditEntry(entry);
    setModalPrefill(null);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditEntry(null);
    setModalPrefill(null);
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
      setModalPrefill(null);
      await Promise.all([fetchTimeEntries(), fetchSummary()]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save time entry.');
    } finally {
      setSaving(false);
    }
  }, [editEntry, fetchTimeEntries, fetchSummary, showToast]);

  const handleDeleteEntry = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await cmsTimeEntries.remove(deleteTarget.id);
      showToast('success', 'Time entry deleted.');
      setDeleteTarget(null);
      await Promise.all([fetchTimeEntries(), fetchSummary()]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete time entry.');
    }
  }, [deleteTarget, fetchTimeEntries, fetchSummary, showToast]);

  const handleSubmitEntry = useCallback(async (entry: TimeEntry) => {
    try {
      await cmsTimeEntries.update(entry.id, { status: 'Submitted' } as Partial<TimeEntry>);
      showToast('success', 'Time entry submitted for approval.');
      await fetchTimeEntries();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to submit time entry.');
    }
  }, [fetchTimeEntries, showToast]);

  const handleApproveEntry = useCallback(async (entry: TimeEntry) => {
    try {
      await cmsTimeEntries.approve(entry.id);
      showToast('success', 'Time entry approved.');
      await fetchTimeEntries();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to approve time entry.');
    }
  }, [fetchTimeEntries, showToast]);

  const handleRejectEntry = useCallback(async (note: string) => {
    if (!rejectTarget) return;
    try {
      await cmsTimeEntries.reject(rejectTarget.id, note || undefined);
      showToast('success', 'Time entry rejected.');
      setRejectTarget(null);
      await fetchTimeEntries();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to reject time entry.');
    }
  }, [rejectTarget, fetchTimeEntries, showToast]);

  const handleTimesheetCellClick = useCallback((_caseId: string | null, date: string) => {
    setEditEntry(null);
    setModalPrefill({ date });
    setModalOpen(true);
  }, []);

  // ============================================================
  // Notification Handlers
  // ============================================================

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await cmsNotifications.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      setNotifMeta((prev) => ({ ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }));
      showToast('success', 'Marked as read.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to mark as read.');
    }
  }, [showToast]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      const result = await cmsNotifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
      setNotifMeta((prev) => ({ ...prev, unreadCount: 0 }));
      showToast('success', `${result.updated} notification${result.updated !== 1 ? 's' : ''} marked as read.`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to mark all as read.');
    }
  }, [showToast]);

  const handleAcknowledge = useCallback(async (id: string) => {
    try {
      await cmsNotifications.acknowledge(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, acknowledgedAt: new Date().toISOString(), readAt: n.readAt ?? new Date().toISOString() } : n)
      );
      showToast('success', 'Notification acknowledged.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to acknowledge.');
    }
  }, [showToast]);

  const handleSnooze = useCallback(async (id: string, snoozedUntil: string) => {
    try {
      await cmsNotifications.snooze(id, snoozedUntil);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, snoozedUntil } : n));
      showToast('success', 'Notification snoozed.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to snooze.');
    }
  }, [showToast]);

  const handleDismissNotif = useCallback(async (id: string) => {
    try {
      await cmsNotifications.dismiss(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, dismissedAt: new Date().toISOString() } : n));
      showToast('success', 'Notification dismissed.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to dismiss.');
    }
  }, [showToast]);

  const handleSweep = useCallback(async () => {
    try {
      await cmsNotifications.sweep();
      showToast('success', 'Notification sweep triggered. New notifications will appear shortly.');
      setTimeout(() => fetchNotifications(), 2000);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to run sweep.');
    }
  }, [fetchNotifications, showToast]);

  const handleSavePreferences = useCallback(async (prefs: Partial<NotificationPreference>[]) => {
    setPrefsSaving(true);
    try {
      const saved = await cmsNotifications.updatePreferences(prefs);
      setPreferences(saved);
      showToast('success', 'Preferences saved.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save preferences.');
    } finally {
      setPrefsSaving(false);
    }
  }, [showToast]);

  // Contextual linking: hearing_reminder -> open quick-add with prefill
  const handleLogTimeFromNotification = useCallback((notification: Notification) => {
    const data = notification.data || {};
    const caseId = (data.caseId as string) || '';
    const ndoh = (data.ndoh as string) || '';
    const description = `Court Appearance - ${notification.title}`;

    setEditEntry(null);
    setModalPrefill({
      caseId,
      activityType: 'CourtAppearance',
      date: ndoh ? formatDateISO(ndoh) || todayISO() : todayISO(),
      description,
    });
    setModalOpen(true);
  }, []);

  const handleLoadMoreNotifs = useCallback(() => {
    setNotifPage((prev) => prev + 1);
  }, []);

  const handleRefreshAll = useCallback(() => {
    fetchTimeEntries();
    fetchSummary();
    fetchNotifications();
  }, [fetchTimeEntries, fetchSummary, fetchNotifications]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Activity Hub</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Track time, manage alerts, and stay on top of your workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <IconPlus />
            Log Time
          </button>
          <button
            onClick={handleRefreshAll}
            disabled={timeLoading && notifLoading}
            className="h-9 px-4 rounded-md text-sm font-medium text-[#6C757D] border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            title="Refresh all data"
          >
            <IconRefresh spinning={timeLoading || notifLoading} />
            Refresh
          </button>
        </div>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <StatsCards
        summary={timeSummary}
        todayMinutes={todayMinutes}
        summaryLoading={summaryLoading}
        unreadCount={notifMeta.unreadCount}
        alertsLoading={notifLoading}
      />

      {/* ==================== MOBILE TAB TOGGLE ==================== */}
      <div className="lg:hidden sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm -mx-1 px-1 py-2">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => setMobileTab('time')}
            className={`flex-1 flex items-center justify-center gap-2 h-11 text-sm font-medium transition-colors cursor-pointer ${
              mobileTab === 'time' ? 'bg-[#4472C4] text-white' : 'bg-white text-[#6C757D] hover:bg-gray-50'
            }`}
          >
            <IconClock />
            Time Tracking
          </button>
          <button
            onClick={() => setMobileTab('alerts')}
            className={`flex-1 flex items-center justify-center gap-2 h-11 text-sm font-medium transition-colors cursor-pointer relative ${
              mobileTab === 'alerts' ? 'bg-[#4472C4] text-white' : 'bg-white text-[#6C757D] hover:bg-gray-50'
            }`}
          >
            <IconBell />
            Alerts
            {notifMeta.unreadCount > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                mobileTab === 'alerts' ? 'bg-white text-[#4472C4]' : 'bg-[#FF4444] text-white'
              }`}>
                {notifMeta.unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ==================== SPLIT PANEL LAYOUT ==================== */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* ==================== LEFT PANEL: TIME TRACKING ==================== */}
        <div className={`lg:w-[65%] flex flex-col gap-3 ${mobileTab !== 'time' ? 'hidden lg:flex' : 'flex'}`}>

          {/* View Toggle + Filter */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
            <div className="flex-1">
              <TimeFilterBar
                filters={timeFilters}
                onFiltersChange={setTimeFilters}
                cases={caseList}
                users={users}
                isSuperadmin={isSuperadmin}
              />
            </div>
          </div>

          {/* Error */}
          {timeError && (
            <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-3 text-sm text-[#FF4444] flex items-center gap-2">
              <IconAlert />
              {timeError}
              <button onClick={fetchTimeEntries} className="ml-auto text-xs font-medium underline hover:no-underline cursor-pointer">Retry</button>
            </div>
          )}

          {/* Loading */}
          {timeLoading && <TimeEntriesSkeleton />}

          {/* List View */}
          {!timeLoading && viewMode === 'list' && (
            <TimeListView
              entries={sortedTimeEntries}
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

          {/* Timesheet View */}
          {!timeLoading && viewMode === 'timesheet' && (
            <TimesheetView
              entries={timesheetEntries}
              weekStart={weekStart}
              onWeekChange={setWeekStart}
              onCellClick={handleTimesheetCellClick}
            />
          )}

          {/* Footer count */}
          {!timeLoading && timeEntries.length > 0 && (
            <div className="flex items-center justify-between text-xs text-[#6C757D] px-1">
              <span>
                Showing {timeEntries.length} entr{timeEntries.length !== 1 ? 'ies' : 'y'}
              </span>
              <span>
                Total: <span className="font-semibold text-[#1B2A4A]">{formatDuration(timeEntries.reduce((sum, e) => sum + e.durationMinutes, 0))}</span>
              </span>
            </div>
          )}
        </div>

        {/* ==================== RIGHT PANEL: ALERTS & NOTIFICATIONS ==================== */}
        <div className={`lg:w-[35%] flex flex-col gap-3 ${mobileTab !== 'alerts' ? 'hidden lg:flex' : 'flex'}`}>

          {/* Notification Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-3" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {/* Filter tabs: All / Unread */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => { setNotifFilter('all'); setNotifPage(1); }}
                  className={`h-8 px-3 text-xs font-medium transition-colors cursor-pointer ${
                    notifFilter === 'all' ? 'bg-[#4472C4] text-white' : 'bg-white text-[#6C757D] hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { setNotifFilter('unread'); setNotifPage(1); }}
                  className={`h-8 px-3 text-xs font-medium transition-colors cursor-pointer relative ${
                    notifFilter === 'unread' ? 'bg-[#4472C4] text-white' : 'bg-white text-[#6C757D] hover:bg-gray-50'
                  }`}
                >
                  Unread
                  {notifMeta.unreadCount > 0 && (
                    <span className={`ml-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold ${
                      notifFilter === 'unread' ? 'bg-white text-[#4472C4]' : 'bg-[#FF4444] text-white'
                    }`}>
                      {notifMeta.unreadCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {notifMeta.unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="h-8 px-2 rounded-md text-xs font-medium text-[#4472C4] border border-[#4472C4]/30 bg-white hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <IconCheck size={12} />
                    <span className="hidden md:inline">All Read</span>
                  </button>
                )}
                {isSuperadmin && (
                  <button
                    onClick={handleSweep}
                    className="h-8 px-2 rounded-md text-xs font-medium text-[#4472C4] border border-[#4472C4]/30 bg-white hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1"
                    title="Run notification sweep"
                  >
                    <IconRefresh size={12} />
                    <span className="hidden md:inline">Sweep</span>
                  </button>
                )}
              </div>
            </div>

            {/* Type filter */}
            <select
              value={notifTypeFilter}
              onChange={(e) => { setNotifTypeFilter(e.target.value); setNotifPage(1); }}
              className="w-full h-8 px-2 rounded-md border border-gray-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 text-[#333] cursor-pointer"
              style={SELECT_STYLE}
            >
              <option value="">All Types</option>
              {NOTIFICATION_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>{NOTIFICATION_TYPE_LABELS[type] ?? type}</option>
              ))}
            </select>
          </div>

          {/* Notification Error */}
          {notifError && (
            <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-3 text-xs text-[#FF4444] flex items-center gap-2">
              <IconAlert size={14} />
              {notifError}
              <button onClick={fetchNotifications} className="ml-auto text-xs font-medium underline hover:no-underline cursor-pointer">Retry</button>
            </div>
          )}

          {/* Notification Loading */}
          {notifLoading && <NotificationsSkeleton />}

          {/* Notification Empty */}
          {!notifLoading && !notifError && notifications.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="flex justify-center mb-3">
                <IconBell size={36} />
              </div>
              <p className="text-sm font-medium text-[#1B2A4A]">
                {notifFilter === 'unread' || notifTypeFilter ? 'No matching notifications' : 'No notifications yet'}
              </p>
              <p className="text-xs text-[#6C757D] mt-1">
                {notifFilter === 'unread' || notifTypeFilter
                  ? 'Try adjusting your filters.'
                  : 'Notifications about hearings, deadlines, and tasks will appear here.'}
              </p>
            </div>
          )}

          {/* Notification Cards */}
          {!notifLoading && !notifError && notifications.length > 0 && (
            <div className="flex flex-col gap-2">
              {notifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onAcknowledge={handleAcknowledge}
                  onSnooze={handleSnooze}
                  onDismiss={handleDismissNotif}
                  onLogTime={handleLogTimeFromNotification}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {!notifLoading && notifMeta.totalPages > notifPage && (
            <button
              onClick={handleLoadMoreNotifs}
              className="w-full h-9 rounded-md text-sm font-medium text-[#4472C4] border border-[#4472C4]/30 bg-white hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Load More ({notifMeta.total - notifications.length} remaining)
            </button>
          )}

          {/* Preferences */}
          <NotificationPreferencesSection
            preferences={preferences}
            saving={prefsSaving}
            onSave={handleSavePreferences}
          />
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      <QuickAddModal
        isOpen={modalOpen}
        editEntry={editEntry}
        cases={caseList}
        saving={saving}
        prefill={modalPrefill}
        onSave={handleSaveEntry}
        onClose={handleCloseModal}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Time Entry"
        message={`Are you sure you want to delete this time entry (${deleteTarget ? formatDuration(deleteTarget.durationMinutes) : ''} - ${deleteTarget ? truncate(deleteTarget.description, 40) : ''})? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteEntry}
        onCancel={() => setDeleteTarget(null)}
      />

      <RejectDialog
        isOpen={!!rejectTarget}
        onConfirm={handleRejectEntry}
        onCancel={() => setRejectTarget(null)}
      />

      {/* ==================== TOASTS ==================== */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
