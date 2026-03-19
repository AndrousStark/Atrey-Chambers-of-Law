'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cmsTasks, cmsClients, cmsUsers, cmsAuth, cmsCases } from '@/lib/cms-api';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskStats,
  CmsUser,
  Case,
} from '@/lib/cms-types';
import { TASK_STATUS_LABELS, TASK_CATEGORY_LABELS } from '@/lib/cms-types';

// ============================================================
// Constants
// ============================================================

const TASK_STATUSES: TaskStatus[] = ['Todo', 'InProgress', 'Done', 'Blocked'];
const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const TASK_CATEGORIES: TaskCategory[] = [
  'Research', 'Drafting', 'Filing', 'CourtAppearance',
  'ClientCommunication', 'Internal', 'Review', 'Other',
];

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  Critical: 'Critical',
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  Todo: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  InProgress: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  Done: 'bg-green-50 text-[#28A745] border-[#28A745]',
  Blocked: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  Critical: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  High: 'bg-orange-50 text-[#FF8C00] border-[#FF8C00]',
  Medium: 'bg-yellow-50 text-[#D97706] border-[#D97706]',
  Low: 'bg-green-50 text-[#28A745] border-[#28A745]',
};

const PRIORITY_BORDER_COLORS: Record<TaskPriority, string> = {
  Critical: '#FF4444',
  High: '#FF8C00',
  Medium: '#D97706',
  Low: '#28A745',
};

const STATUS_STAT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  todo: { bg: '#F8F9FA', border: '#6C757D', text: '#6C757D' },
  inProgress: { bg: '#EBF2FF', border: '#4472C4', text: '#4472C4' },
  done: { bg: '#EAFBEF', border: '#28A745', text: '#28A745' },
  blocked: { bg: '#FFF5F5', border: '#FF4444', text: '#FF4444' },
  overdue: { bg: '#FFF8EB', border: '#FF8C00', text: '#FF8C00' },
};

type ViewMode = 'table' | 'kanban' | 'calendar';

// ============================================================
// Shared CSS class strings (from design system)
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
// Utility Helpers
// ============================================================

function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
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

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'Done') return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function isDueToday(task: Task): boolean {
  if (!task.dueDate || task.status === 'Done') return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
}

function getInitial(name: string | undefined | null): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
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

function StatsCards({ stats, loading }: { readonly stats: TaskStats | null; readonly loading: boolean }) {
  const items = [
    { key: 'todo', label: 'To Do', value: stats?.todo ?? 0, color: STATUS_STAT_COLORS.todo },
    { key: 'inProgress', label: 'In Progress', value: stats?.inProgress ?? 0, color: STATUS_STAT_COLORS.inProgress },
    { key: 'done', label: 'Done', value: stats?.done ?? 0, color: STATUS_STAT_COLORS.done },
    { key: 'blocked', label: 'Blocked', value: stats?.blocked ?? 0, color: STATUS_STAT_COLORS.blocked },
    { key: 'overdue', label: 'Overdue', value: stats?.overdue ?? 0, color: STATUS_STAT_COLORS.overdue },
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
            <div className="h-7 w-10 bg-gray-200 rounded mt-1 animate-pulse" />
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
      key: 'table',
      label: 'Table',
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
      key: 'kanban',
      label: 'Kanban',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="5" height="18" rx="1" />
          <rect x="10" y="3" width="5" height="12" rx="1" />
          <rect x="17" y="3" width="5" height="15" rx="1" />
        </svg>
      ),
    },
    {
      key: 'calendar',
      label: 'Calendar',
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

interface TaskFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  assignedTo: string;
  dueDateFrom: string;
  dueDateTo: string;
  overdueOnly: boolean;
}

const EMPTY_FILTERS: TaskFilters = {
  search: '',
  status: '',
  priority: '',
  category: '',
  assignedTo: '',
  dueDateFrom: '',
  dueDateTo: '',
  overdueOnly: false,
};

function FilterBar({
  filters,
  onFiltersChange,
  users,
}: {
  readonly filters: TaskFilters;
  readonly onFiltersChange: (f: TaskFilters) => void;
  readonly users: CmsUser[];
}) {
  const [expanded, setExpanded] = useState(false);

  const hasFilters =
    filters.status !== '' ||
    filters.priority !== '' ||
    filters.category !== '' ||
    filters.assignedTo !== '' ||
    filters.dueDateFrom !== '' ||
    filters.dueDateTo !== '' ||
    filters.overdueOnly;

  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Top row: Search + toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999"
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
            placeholder="Search tasks by title or description..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className={`${INPUT_CLASS} !pl-10`}
          />
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
                {[filters.status, filters.priority, filters.category, filters.assignedTo, filters.dueDateFrom, filters.dueDateTo]
                  .filter(Boolean).length + (filters.overdueOnly ? 1 : 0)}
              </span>
            )}
          </button>

          {hasFilters && (
            <button
              onClick={() => onFiltersChange({ ...EMPTY_FILTERS, search: filters.search })}
              className="h-9 px-3 rounded-md text-sm font-medium text-[#FF4444] border border-[#FF4444]/30 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expanded filter row */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className={LABEL_CLASS}>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              <option value="">All Priorities</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className={LABEL_CLASS}>Category</label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              <option value="">All Categories</option>
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{TASK_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className={LABEL_CLASS}>Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => updateFilter('assignedTo', e.target.value)}
              className={SELECT_CLASS}
              style={SELECT_STYLE}
            >
              <option value="">All Assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Due Date From */}
          <div>
            <label className={LABEL_CLASS}>Due From</label>
            <input
              type="date"
              value={filters.dueDateFrom}
              onChange={(e) => updateFilter('dueDateFrom', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          {/* Due Date To */}
          <div>
            <label className={LABEL_CLASS}>Due To</label>
            <input
              type="date"
              value={filters.dueDateTo}
              onChange={(e) => updateFilter('dueDateTo', e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          {/* Overdue Toggle */}
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.overdueOnly}
                onChange={(e) => updateFilter('overdueOnly', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#FF8C00] focus:ring-[#FF8C00] cursor-pointer"
              />
              <span className="text-sm font-medium text-[#333333]">Overdue Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Bulk Actions Bar
// ============================================================

function BulkActionsBar({
  selectedCount,
  onBulkStatusUpdate,
  onBulkPriorityUpdate,
  onBulkDelete,
  onClearSelection,
}: {
  readonly selectedCount: number;
  readonly onBulkStatusUpdate: (status: TaskStatus) => void;
  readonly onBulkPriorityUpdate: (priority: TaskPriority) => void;
  readonly onBulkDelete: () => void;
  readonly onClearSelection: () => void;
}) {
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkPriority, setBulkPriority] = useState('');

  if (selectedCount === 0) return null;

  return (
    <div className="bg-[#1B2A4A] rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 text-white shadow-lg">
      <span className="text-sm font-medium">
        {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <div className="h-5 w-px bg-white/20" />

      {/* Bulk status */}
      <div className="flex items-center gap-2">
        <select
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value)}
          className="h-8 px-2 pr-6 rounded-md border border-white/30 bg-white/10 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center',
          }}
        >
          <option value="">Set Status...</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s} className="text-[#333]">{TASK_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (bulkStatus) {
              onBulkStatusUpdate(bulkStatus as TaskStatus);
              setBulkStatus('');
            }
          }}
          disabled={!bulkStatus}
          className="h-8 px-3 rounded-md text-xs font-medium bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>

      <div className="h-5 w-px bg-white/20" />

      {/* Bulk priority */}
      <div className="flex items-center gap-2">
        <select
          value={bulkPriority}
          onChange={(e) => setBulkPriority(e.target.value)}
          className="h-8 px-2 pr-6 rounded-md border border-white/30 bg-white/10 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center',
          }}
        >
          <option value="">Set Priority...</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p} className="text-[#333]">{PRIORITY_LABELS[p]}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (bulkPriority) {
              onBulkPriorityUpdate(bulkPriority as TaskPriority);
              setBulkPriority('');
            }
          }}
          disabled={!bulkPriority}
          className="h-8 px-3 rounded-md text-xs font-medium bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>

      <div className="h-5 w-px bg-white/20" />

      {/* Delete */}
      <button
        onClick={onBulkDelete}
        className="h-8 px-3 rounded-md text-xs font-medium bg-[#FF4444] border border-[#FF4444] hover:bg-[#E63939] transition-colors"
      >
        Delete Selected
      </button>

      <div className="flex-1" />

      <button
        onClick={onClearSelection}
        className="text-xs text-white/70 hover:text-white transition-colors"
      >
        Clear selection
      </button>
    </div>
  );
}

// ============================================================
// Add/Edit Task Modal
// ============================================================

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
  assignedToId: string;
  caseId: string;
  clientId: string;
  tags: string;
}

function TaskModal({
  isOpen,
  task,
  users,
  cases,
  clients,
  saving,
  onSave,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly task: Task | null;
  readonly users: CmsUser[];
  readonly cases: { id: string; caseNo: string; caseTitle: string }[];
  readonly clients: { id: string; name: string }[];
  readonly saving: boolean;
  readonly onSave: (data: TaskFormData) => void;
  readonly onClose: () => void;
}) {
  const [form, setForm] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    category: 'Other',
    dueDate: '',
    assignedToId: '',
    caseId: '',
    clientId: '',
    tags: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset form when modal opens/task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setForm({
          title: task.title || '',
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          category: task.category,
          dueDate: formatDateISO(task.dueDate),
          assignedToId: task.assignedToId || '',
          caseId: task.caseId || '',
          clientId: task.clientId || '',
          tags: (task.tags || []).join(', '),
        });
      } else {
        setForm({
          title: '',
          description: '',
          status: 'Todo',
          priority: 'Medium',
          category: 'Other',
          dueDate: '',
          assignedToId: '',
          caseId: '',
          clientId: '',
          tags: '',
        });
      }
      setValidationError(null);
    }
  }, [isOpen, task]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const updateField = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (validationError) setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setValidationError('Title is required.');
      return;
    }
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1B2A4A]">
            {task ? 'Edit Task' : 'New Task'}
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

          {/* Title */}
          <div>
            <label className={LABEL_CLASS}>Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Task title"
              className={INPUT_CLASS}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className={LABEL_CLASS}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Task description..."
              rows={3}
              className={`${INPUT_CLASS} !h-auto py-2 resize-none`}
            />
          </div>

          {/* Status + Priority + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={LABEL_CLASS}>Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value as TaskStatus)}
                className={SELECT_CLASS}
                style={SELECT_STYLE}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value as TaskPriority)}
                className={SELECT_CLASS}
                style={SELECT_STYLE}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value as TaskCategory)}
                className={SELECT_CLASS}
                style={SELECT_STYLE}
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{TASK_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date + Assigned To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Assigned To</label>
              <select
                value={form.assignedToId}
                onChange={(e) => updateField('assignedToId', e.target.value)}
                className={SELECT_CLASS}
                style={SELECT_STYLE}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Case + Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Link to Case (optional)</label>
              <select
                value={form.caseId}
                onChange={(e) => updateField('caseId', e.target.value)}
                className={SELECT_CLASS}
                style={SELECT_STYLE}
              >
                <option value="">No case linked</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.caseNo} - {truncate(c.caseTitle, 30)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Client (optional)</label>
              <select
                value={form.clientId}
                onChange={(e) => updateField('clientId', e.target.value)}
                className={SELECT_CLASS}
                style={SELECT_STYLE}
              >
                <option value="">No client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={LABEL_CLASS}>Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
              placeholder="e.g. urgent, SCI, compliance"
              className={INPUT_CLASS}
            />
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
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// TABLE VIEW
// ============================================================

type SortKey = 'title' | 'status' | 'priority' | 'category' | 'dueDate' | 'assignedTo' | 'createdAt';

function TableView({
  tasks,
  selectedIds,
  sortBy,
  sortOrder,
  onSort,
  onToggleSelect,
  onToggleAll,
  onEdit,
  onDelete,
}: {
  readonly tasks: Task[];
  readonly selectedIds: Set<string>;
  readonly sortBy: SortKey;
  readonly sortOrder: 'asc' | 'desc';
  readonly onSort: (key: SortKey) => void;
  readonly onToggleSelect: (id: string) => void;
  readonly onToggleAll: () => void;
  readonly onEdit: (task: Task) => void;
  readonly onDelete: (task: Task) => void;
}) {
  const allSelected = tasks.length > 0 && tasks.every((t) => selectedIds.has(t.id));
  const someSelected = tasks.some((t) => selectedIds.has(t.id)) && !allSelected;

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => {
    const isActive = sortBy === sortKey;
    return (
      <th
        className="px-3 py-3 text-left cursor-pointer select-none group"
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

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <p className="text-sm text-[#6C757D]">No tasks match your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={onToggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#4472C4] focus:ring-[#4472C4] cursor-pointer"
                />
              </th>
              <SortHeader label="Title" sortKey="title" />
              <SortHeader label="Status" sortKey="status" />
              <SortHeader label="Priority" sortKey="priority" />
              <SortHeader label="Category" sortKey="category" />
              <SortHeader label="Due Date" sortKey="dueDate" />
              <SortHeader label="Assigned To" sortKey="assignedTo" />
              <th className="px-3 py-3 text-left"><span className={LABEL_CLASS}>Case</span></th>
              <th className="px-3 py-3 text-right"><span className={LABEL_CLASS}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const overdue = isOverdue(task);
              const dueToday = isDueToday(task);
              const rowBg = overdue ? 'bg-red-50/60' : dueToday ? 'bg-yellow-50/60' : '';

              return (
                <tr
                  key={task.id}
                  className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${rowBg}`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(task.id)}
                      onChange={() => onToggleSelect(task.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#4472C4] focus:ring-[#4472C4] cursor-pointer"
                    />
                  </td>

                  {/* Title */}
                  <td className="px-3 py-2.5 max-w-[250px]">
                    <p className="font-semibold text-[#1B2A4A] truncate" title={task.title}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-[#6C757D] truncate mt-0.5" title={task.description}>
                        {truncate(task.description, 60)}
                      </p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <span className={`${BADGE_CLASS} ${STATUS_COLORS[task.status]}`}>
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-2.5">
                    <span className={`${BADGE_CLASS} ${PRIORITY_COLORS[task.priority]}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-2.5 text-[#333333]">
                    {TASK_CATEGORY_LABELS[task.category]}
                  </td>

                  {/* Due Date */}
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-sm font-medium ${
                        overdue
                          ? 'text-[#FF4444]'
                          : dueToday
                            ? 'text-[#FF8C00]'
                            : 'text-[#333333]'
                      }`}
                    >
                      {formatDate(task.dueDate)}
                      {overdue && (
                        <span className="block text-[10px] text-[#FF4444] font-semibold uppercase">Overdue</span>
                      )}
                      {dueToday && (
                        <span className="block text-[10px] text-[#FF8C00] font-semibold uppercase">Today</span>
                      )}
                    </span>
                  </td>

                  {/* Assigned To */}
                  <td className="px-3 py-2.5">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: '#4472C4' }}
                        >
                          {getInitial(task.assignedTo.name)}
                        </div>
                        <span className="text-[#333333] truncate text-xs">{task.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-[#999] text-xs">Unassigned</span>
                    )}
                  </td>

                  {/* Case */}
                  <td className="px-3 py-2.5">
                    {task.case ? (
                      <span className="text-xs text-[#4472C4] font-medium">{task.case.caseNo}</span>
                    ) : (
                      <span className="text-[#999] text-xs">--</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 rounded-md text-[#6C757D] hover:text-[#4472C4] hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(task)}
                        className="p-1.5 rounded-md text-[#6C757D] hover:text-[#FF4444] hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
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
// KANBAN VIEW
// ============================================================

function KanbanView({
  tasks,
  onStatusChange,
  onEdit,
}: {
  readonly tasks: Task[];
  readonly onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  readonly onEdit: (task: Task) => void;
}) {
  const columns: TaskStatus[] = ['Todo', 'InProgress', 'Done', 'Blocked'];
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { Todo: [], InProgress: [], Done: [], Blocked: [] };
    for (const task of tasks) {
      map[task.status].push(task);
    }
    return map;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetStatus) {
        onStatusChange(taskId, targetStatus);
      }
    }
    setDraggedTaskId(null);
  };

  const columnHeaderColors: Record<TaskStatus, string> = {
    Todo: '#6C757D',
    InProgress: '#4472C4',
    Done: '#28A745',
    Blocked: '#FF4444',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((status) => {
        const columnTasks = tasksByStatus[status];
        const isDragOver = dragOverColumn === status;

        return (
          <div
            key={status}
            className={`bg-gray-50 rounded-lg border-2 transition-colors min-h-[300px] flex flex-col ${
              isDragOver ? 'border-[#4472C4] bg-blue-50/30' : 'border-gray-200'
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className="px-3 py-2.5 border-b border-gray-200 flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: columnHeaderColors[status] }}
              />
              <span className="text-sm font-semibold text-[#1B2A4A]">{TASK_STATUS_LABELS[status]}</span>
              <span
                className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: columnHeaderColors[status] }}
              >
                {columnTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-400px)]">
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-[#999]">
                  No tasks
                </div>
              )}
              {columnTasks.map((task) => {
                const overdue = isOverdue(task);
                const dueToday = isDueToday(task);
                const isDragging = draggedTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    onClick={() => onEdit(task)}
                    className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none ${
                      isDragging ? 'opacity-50 scale-95' : ''
                    }`}
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: PRIORITY_BORDER_COLORS[task.priority],
                    }}
                  >
                    {/* Title */}
                    <p className="text-sm font-semibold text-[#1B2A4A] leading-tight mb-1.5">
                      {truncate(task.title, 50)}
                    </p>

                    {/* Due date */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={overdue ? '#FF4444' : dueToday ? '#FF8C00' : '#6C757D'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span className={`text-[11px] font-medium ${
                          overdue ? 'text-[#FF4444]' : dueToday ? 'text-[#FF8C00]' : 'text-[#6C757D]'
                        }`}>
                          {formatDate(task.dueDate)}
                          {overdue && ' (Overdue)'}
                          {dueToday && ' (Today)'}
                        </span>
                      </div>
                    )}

                    {/* Bottom row: assignee + category + case */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {/* Category tag */}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-[#6C757D] border border-gray-200">
                        {TASK_CATEGORY_LABELS[task.category]}
                      </span>

                      {/* Case link */}
                      {task.case && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-[#4472C4] border border-[#4472C4]/20">
                          {task.case.caseNo}
                        </span>
                      )}

                      <div className="flex-1" />

                      {/* Assignee initial */}
                      {task.assignedTo && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: '#4472C4' }}
                          title={task.assignedTo.name}
                        >
                          {getInitial(task.assignedTo.name)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// CALENDAR VIEW
// ============================================================

function CalendarView({
  tasks,
  onEdit,
}: {
  readonly tasks: Task[];
  readonly onEdit: (task: Task) => void;
}) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      try {
        const d = new Date(task.dueDate);
        if (isNaN(d.getTime())) continue;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const existing = map.get(key) || [];
        map.set(key, [...existing, task]);
      } catch {
        // skip invalid dates
      }
    }
    return map;
  }, [tasks]);

  const { year, month } = currentDate;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0=Sunday
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => {
    setCurrentDate((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentDate((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const goToToday = () => {
    setCurrentDate({ year: today.getFullYear(), month: today.getMonth() });
  };

  const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build calendar grid cells
  const cells: { day: number | null; key: string }[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ day: null, key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: `day-${d}` });
  }
  // Pad to complete the last row
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, key: `empty-end-${cells.length}` });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Calendar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-md text-[#6C757D] hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-[#1B2A4A]">{monthName}</h3>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="h-7 px-2.5 rounded-md text-xs font-medium text-[#4472C4] border border-[#4472C4]/30 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-md text-[#6C757D] hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayLabels.map((label) => (
          <div key={label} className="px-2 py-2 text-center">
            <span className={LABEL_CLASS}>{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          if (cell.day === null) {
            return <div key={cell.key} className="min-h-[100px] border-b border-r border-gray-100 bg-gray-50/30" />;
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
          const dayTasks = tasksByDate.get(dateKey) || [];
          const isTodayCell = isCurrentMonth && today.getDate() === cell.day;

          return (
            <div
              key={cell.key}
              className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 ${
                isTodayCell ? 'bg-blue-50/40' : ''
              }`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    isTodayCell
                      ? 'bg-[#4472C4] text-white'
                      : 'text-[#333333]'
                  }`}
                >
                  {cell.day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[9px] font-bold text-[#6C757D]">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Task pills */}
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onEdit(task)}
                    className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: `${PRIORITY_BORDER_COLORS[task.priority]}15`,
                      color: PRIORITY_BORDER_COLORS[task.priority],
                      borderLeft: `2px solid ${PRIORITY_BORDER_COLORS[task.priority]}`,
                    }}
                    title={`${task.title} (${TASK_STATUS_LABELS[task.status]})`}
                  >
                    {truncate(task.title, 18)}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="block text-[9px] text-[#6C757D] font-medium pl-1.5">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function TaskManagementPage() {
  // --- Core data ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Reference data ---
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [caseList, setCaseList] = useState<{ id: string; caseNo: string; caseTitle: string }[]>([]);
  const [clientList, setClientList] = useState<{ id: string; name: string }[]>([]);

  // --- UI state ---
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortKey>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // --- Modals ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // --- Fetch reference data once ---
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [usersData, clientsData, casesData] = await Promise.all([
          cmsUsers.list().catch(() => []),
          cmsClients.listAll().catch(() => []),
          cmsCases.list({ limit: 500 }).catch(() => ({ data: [] })),
        ]);
        setUsers(usersData);
        setClientList(clientsData.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        const caseItems = (casesData as { data: Case[] }).data || [];
        setCaseList(caseItems.map((c: Case) => ({ id: c.id, caseNo: c.caseNo, caseTitle: c.caseTitle })));
      } catch {
        // silently fail reference data, tasks still work
      }
    };
    loadReferenceData();
  }, []);

  // --- Fetch tasks ---
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { limit: 500 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.assignedTo) params.assignedToId = filters.assignedTo;
      if (filters.search) params.search = filters.search;
      if (filters.dueDateFrom) params.dueDateFrom = filters.dueDateFrom;
      if (filters.dueDateTo) params.dueDateTo = filters.dueDateTo;
      if (filters.overdueOnly) params.overdueOnly = '1';

      const result = await cmsTasks.list(params);
      setTasks(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // --- Fetch stats ---
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await cmsTasks.stats();
      setStats(data);
    } catch {
      // stats failure is non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // --- Client-side filtering for overdue + search on already-fetched data ---
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Client-side search (in case the API doesn't support it)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }

    // Client-side overdue filter
    if (filters.overdueOnly) {
      result = result.filter((t) => isOverdue(t));
    }

    return result;
  }, [tasks, filters.search, filters.overdueOnly]);

  // --- Sorted tasks (for table view) ---
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];
    sorted.sort((a, b) => {
      let aVal: string | null = '';
      let bVal: string | null = '';

      switch (sortBy) {
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'priority': {
          const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          const diff = (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
          return sortOrder === 'asc' ? diff : -diff;
        }
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'dueDate':
          aVal = a.dueDate;
          bVal = b.dueDate;
          break;
        case 'assignedTo':
          aVal = a.assignedTo?.name || '';
          bVal = b.assignedTo?.name || '';
          break;
        case 'createdAt':
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
      }

      const cmp = String(aVal || '').localeCompare(String(bVal || ''), undefined, { numeric: true });
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredTasks, sortBy, sortOrder]);

  // --- Handlers ---

  const handleSort = useCallback((key: SortKey) => {
    setSortBy((prev) => {
      if (prev === key) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortOrder('asc');
      return key;
    });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allIds = sortedTasks.map((t) => t.id);
      const allSelected = allIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(allIds);
    });
  }, [sortedTasks]);

  const handleOpenCreateModal = useCallback(() => {
    setEditTask(null);
    setModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditTask(null);
  }, []);

  const handleSaveTask = useCallback(async (formData: TaskFormData) => {
    setSaving(true);
    try {
      const payload: Partial<Task> & { tags?: string[] } = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate || null,
        assignedToId: formData.assignedToId || null,
        caseId: formData.caseId || null,
        clientId: formData.clientId || null,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editTask) {
        await cmsTasks.update(editTask.id, payload);
        showToast('success', 'Task updated successfully.');
      } else {
        await cmsTasks.create(payload);
        showToast('success', 'Task created successfully.');
      }

      setModalOpen(false);
      setEditTask(null);
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  }, [editTask, fetchTasks, fetchStats, showToast]);

  const handleDeleteTask = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await cmsTasks.remove(deleteTarget.id);
      showToast('success', `Task "${truncate(deleteTarget.title, 30)}" deleted.`);
      setDeleteTarget(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete task.');
    }
  }, [deleteTarget, fetchTasks, fetchStats, showToast]);

  const handleKanbanStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    try {
      await cmsTasks.update(taskId, { status: newStatus });
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
        )
      );
      showToast('success', `Task moved to ${TASK_STATUS_LABELS[newStatus]}.`);
      fetchStats(); // refresh stats in background
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update task status.');
      fetchTasks(); // revert
    }
  }, [fetchTasks, fetchStats, showToast]);

  // Bulk handlers
  const handleBulkStatusUpdate = useCallback(async (status: TaskStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      await cmsTasks.bulkUpdate(ids, { status });
      showToast('success', `Updated ${ids.length} task(s) to "${TASK_STATUS_LABELS[status]}".`);
      setSelectedIds(new Set());
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Bulk status update failed.');
    }
  }, [selectedIds, fetchTasks, fetchStats, showToast]);

  const handleBulkPriorityUpdate = useCallback(async (priority: TaskPriority) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      await cmsTasks.bulkUpdate(ids, { priority });
      showToast('success', `Updated ${ids.length} task(s) to "${PRIORITY_LABELS[priority]}" priority.`);
      setSelectedIds(new Set());
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Bulk priority update failed.');
    }
  }, [selectedIds, fetchTasks, fetchStats, showToast]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      for (const id of ids) {
        await cmsTasks.remove(id);
      }
      showToast('success', `Deleted ${ids.length} task(s).`);
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Bulk delete failed.');
    }
  }, [selectedIds, fetchTasks, fetchStats, showToast]);

  // --- Render ---

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Task Management</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Track, organize, and manage all tasks across cases and team members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => { fetchTasks(); fetchStats(); }}
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

          {/* + New Task */}
          <button
            onClick={handleOpenCreateModal}
            className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* View Toggle + Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
        <div className="flex-1">
          <FilterBar filters={filters} onFiltersChange={setFilters} users={users} />
        </div>
      </div>

      {/* Bulk Actions */}
      {viewMode === 'table' && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkPriorityUpdate={handleBulkPriorityUpdate}
          onBulkDelete={() => setBulkDeleteConfirm(true)}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}

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
            onClick={fetchTasks}
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
            className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#4472C4', borderTopColor: 'transparent', borderWidth: '3px' }}
          />
          <p className="text-sm text-[#6C757D]">Loading tasks...</p>
        </div>
      )}

      {/* Views */}
      {!loading && viewMode === 'table' && (
        <TableView
          tasks={sortedTasks}
          selectedIds={selectedIds}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onEdit={handleOpenEditModal}
          onDelete={(t) => setDeleteTarget(t)}
        />
      )}

      {!loading && viewMode === 'kanban' && (
        <KanbanView
          tasks={filteredTasks}
          onStatusChange={handleKanbanStatusChange}
          onEdit={handleOpenEditModal}
        />
      )}

      {!loading && viewMode === 'calendar' && (
        <CalendarView
          tasks={filteredTasks}
          onEdit={handleOpenEditModal}
        />
      )}

      {/* Total count footer */}
      {!loading && filteredTasks.length > 0 && (
        <div className="flex items-center justify-between text-xs text-[#6C757D] px-1">
          <span>
            Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            {stats?.total ? ` of ${stats.total} total` : ''}
          </span>
          {viewMode === 'table' && selectedIds.size > 0 && (
            <span>{selectedIds.size} selected</span>
          )}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        task={editTask}
        users={users}
        cases={caseList}
        clients={clientList}
        saving={saving}
        onSave={handleSaveTask}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget ? truncate(deleteTarget.title, 40) : ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Selected Tasks"
        message={`Are you sure you want to delete ${selectedIds.size} selected task(s)? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} task(s)`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
