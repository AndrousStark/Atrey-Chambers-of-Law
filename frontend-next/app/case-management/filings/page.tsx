'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cmsFilings, cmsCases, cmsAuth } from '@/lib/cms-api';
import type {
  FilingItem,
  FilingType,
  FilingStatus,
  Case,
  UserRole,
} from '@/lib/cms-types';
import {
  FILING_TYPE_LABELS,
  FILING_STATUS_LABELS,
} from '@/lib/cms-types';

// ============================================================
// Constants
// ============================================================

const FILING_STATUSES: readonly FilingStatus[] = [
  'NotStarted',
  'Drafting',
  'UnderReview',
  'ReadyForFiling',
  'Filed',
  'RejectedRefiled',
] as const;

const STATUS_BADGE_STYLES: Record<FilingStatus, { bg: string; text: string }> = {
  NotStarted: { bg: '#E9ECEF', text: '#6C757D' },
  Drafting: { bg: '#D6E4F0', text: '#4472C4' },
  UnderReview: { bg: '#FFE8CC', text: '#FF8C00' },
  ReadyForFiling: { bg: '#FFF3CD', text: '#856404' },
  Filed: { bg: '#D4EDDA', text: '#28A745' },
  RejectedRefiled: { bg: '#FFE0E0', text: '#FF4444' },
};

const KANBAN_COLUMN_HEADERS: Record<FilingStatus, string> = {
  NotStarted: 'Not Started',
  Drafting: 'Drafting',
  UnderReview: 'Under Review',
  ReadyForFiling: 'Ready',
  Filed: 'Filed',
  RejectedRefiled: 'Rejected',
};

// ============================================================
// Helpers
// ============================================================

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes('.')) {
    const [day, month, year] = dateStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysDiff(dateStr: string | null): number | null {
  const d = parseDate(dateStr);
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function toInputDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromInputDate(isoStr: string): string {
  if (!isoStr) return '';
  const [year, month, day] = isoStr.split('-');
  return `${day}.${month}.${year}`;
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
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
            text-sm font-medium
            ${
              toast.type === 'success'
                ? 'bg-green-50 border-[#28A745]/30 text-[#28A745]'
                : 'bg-red-50 border-[#FF4444]/30 text-[#FF4444]'
            }
          `.trim()}
        >
          {toast.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          )}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} className="p-0.5 rounded hover:bg-black/5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{title}</h3>
        <p className="text-sm text-[#666] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="h-9 px-4 rounded-md text-sm font-medium text-[#333333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="h-9 px-4 rounded-md text-sm font-medium text-white bg-[#FF4444] border border-[#FF4444] hover:bg-[#E63939] transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Filing Modal
// ============================================================

interface FilingFormData {
  caseId: string;
  filingType: FilingType;
  status: FilingStatus;
  dueDate: string;
  filedDate: string;
  filedBy: string;
  filingNumber: string;
  defects: string;
  notes: string;
}

const EMPTY_FORM: FilingFormData = {
  caseId: '',
  filingType: 'CounterAffidavit',
  status: 'NotStarted',
  dueDate: '',
  filedDate: '',
  filedBy: '',
  filingNumber: '',
  defects: '',
  notes: '',
};

function FilingModal({
  isOpen,
  title,
  initialData,
  cases,
  onSave,
  onClose,
  saving,
}: {
  readonly isOpen: boolean;
  readonly title: string;
  readonly initialData: FilingFormData | null;
  readonly cases: Case[];
  readonly onSave: (data: FilingFormData) => void;
  readonly onClose: () => void;
  readonly saving: boolean;
}) {
  const [form, setForm] = useState<FilingFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FilingFormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ?? EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const updateField = <K extends keyof FilingFormData>(key: K, value: FilingFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FilingFormData, string>> = {};
    if (!form.caseId) errs.caseId = 'Case is required';
    if (!form.filingType) errs.filingType = 'Filing type is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1B2A4A]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Case */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
              Case No. <span className="text-[#FF4444]">*</span>
            </label>
            <select
              value={form.caseId}
              onChange={(e) => updateField('caseId', e.target.value)}
              className={`w-full h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 ${errors.caseId ? 'border-[#FF4444]' : 'border-gray-300'}`}
            >
              <option value="">Select a case...</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNo}
                </option>
              ))}
            </select>
            {errors.caseId && <p className="text-xs text-[#FF4444] mt-1">{errors.caseId}</p>}
          </div>

          {/* Filing Type */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
              Filing Type <span className="text-[#FF4444]">*</span>
            </label>
            <select
              value={form.filingType}
              onChange={(e) => updateField('filingType', e.target.value as FilingType)}
              className={`w-full h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 ${errors.filingType ? 'border-[#FF4444]' : 'border-gray-300'}`}
            >
              {(Object.entries(FILING_TYPE_LABELS) as [FilingType, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
            {errors.filingType && <p className="text-xs text-[#FF4444] mt-1">{errors.filingType}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => updateField('status', e.target.value as FilingStatus)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            >
              {(Object.entries(FILING_STATUS_LABELS) as [FilingStatus, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Due Date</label>
            <input
              type="date"
              value={toInputDate(form.dueDate)}
              onChange={(e) => updateField('dueDate', fromInputDate(e.target.value))}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            />
          </div>

          {/* Edit-only fields */}
          {isEdit && (
            <>
              {/* Filed Date */}
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Filed Date</label>
                <input
                  type="date"
                  value={toInputDate(form.filedDate)}
                  onChange={(e) => updateField('filedDate', fromInputDate(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
                />
              </div>

              {/* Filed By + Filing Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Filed By</label>
                  <input
                    type="text"
                    value={form.filedBy}
                    onChange={(e) => updateField('filedBy', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
                    placeholder="Name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Filing Number</label>
                  <input
                    type="text"
                    value={form.filingNumber}
                    onChange={(e) => updateField('filingNumber', e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
                    placeholder="e.g. 12345/2026"
                  />
                </div>
              </div>

              {/* Defects */}
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Defects</label>
                <textarea
                  rows={2}
                  value={form.defects}
                  onChange={(e) => updateField('defects', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 resize-y"
                  placeholder="List any filing defects..."
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 resize-y"
              placeholder="Optional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
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
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Loading Skeleton
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-2">
        <div className="h-9 w-28 bg-gray-200 rounded-md" />
        <div className="h-9 w-28 bg-gray-200 rounded-md" />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================

function EmptyState() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
      <p className="text-sm font-medium text-[#1B2A4A]">No filing items yet</p>
      <p className="text-xs text-[#6C757D]">
        Add a new filing to start tracking submissions.
      </p>
    </div>
  );
}

// ============================================================
// Kanban Card
// ============================================================

function KanbanCard({
  item,
  caseNo,
  userRole,
  onMoveStatus,
  onEdit,
  onDelete,
}: {
  readonly item: FilingItem;
  readonly caseNo: string;
  readonly userRole: UserRole;
  readonly onMoveStatus: (id: string, status: FilingStatus) => void;
  readonly onEdit: (item: FilingItem) => void;
  readonly onDelete: (item: FilingItem) => void;
}) {
  const dd = daysDiff(item.dueDate);
  const isOverdue = dd !== null && dd < 0 && item.status !== 'Filed';
  const isDueSoon = dd !== null && dd >= 0 && dd <= 7 && item.status !== 'Filed';

  let borderColor = '#E5E7EB';
  if (isOverdue) borderColor = '#FF4444';
  else if (isDueSoon) borderColor = '#FFC107';

  const otherStatuses = FILING_STATUSES.filter((s) => s !== item.status);

  return (
    <div
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {/* Case No */}
      <p className="text-xs font-semibold text-[#1B2A4A] truncate mb-1" title={caseNo}>
        {caseNo}
      </p>

      {/* Filing Type */}
      <p className="text-xs text-[#6C757D] mb-1.5">
        {FILING_TYPE_LABELS[item.filingType]}
      </p>

      {/* Due Date */}
      {item.dueDate && (
        <div className="flex items-center gap-1 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span
            className="text-xs"
            style={{
              color: isOverdue ? '#FF4444' : isDueSoon ? '#FF8C00' : '#6C757D',
              fontWeight: isOverdue || isDueSoon ? 600 : 400,
            }}
          >
            {formatDate(item.dueDate)}
            {isOverdue && ` (${Math.abs(dd!)}d overdue)`}
            {isDueSoon && dd === 0 && ' (today)'}
            {isDueSoon && dd !== null && dd > 0 && ` (${dd}d left)`}
          </span>
        </div>
      )}

      {/* Move to + actions */}
      <div className="flex items-center gap-1">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              onMoveStatus(item.id, e.target.value as FilingStatus);
            }
          }}
          className="flex-1 h-7 px-2 pr-6 rounded border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#4472C4]/30 appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 4px center',
          }}
        >
          <option value="">Move to...</option>
          {otherStatuses.map((s) => (
            <option key={s} value={s}>
              {FILING_STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        {/* Edit */}
        {(userRole === 'superadmin' || userRole === 'editor') && (
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4472C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}

        {/* Delete */}
        {userRole === 'superadmin' && (
          <button
            onClick={() => onDelete(item)}
            className="p-1 rounded hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Kanban View
// ============================================================

function KanbanView({
  items,
  caseMap,
  userRole,
  onMoveStatus,
  onEdit,
  onDelete,
}: {
  readonly items: FilingItem[];
  readonly caseMap: Map<string, Case>;
  readonly userRole: UserRole;
  readonly onMoveStatus: (id: string, status: FilingStatus) => void;
  readonly onEdit: (item: FilingItem) => void;
  readonly onDelete: (item: FilingItem) => void;
}) {
  const columns: Record<FilingStatus, FilingItem[]> = {
    NotStarted: [],
    Drafting: [],
    UnderReview: [],
    ReadyForFiling: [],
    Filed: [],
    RejectedRefiled: [],
  };

  for (const item of items) {
    columns[item.status].push(item);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2" style={{ minHeight: '400px' }}>
      {FILING_STATUSES.map((status) => {
        const colItems = columns[status];
        const badge = STATUS_BADGE_STYLES[status];

        return (
          <div
            key={status}
            className="flex-shrink-0 flex flex-col rounded-lg border border-gray-200 bg-[#F8F9FA]"
            style={{ width: '220px', maxHeight: 'calc(100vh - 280px)' }}
          >
            {/* Column header */}
            <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-lg">
              <span className="text-xs font-semibold text-[#1B2A4A]">
                {KANBAN_COLUMN_HEADERS[status]}
              </span>
              <span
                className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: badge.bg, color: badge.text }}
              >
                {colItems.length}
              </span>
            </div>

            {/* Column body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {colItems.length === 0 && (
                <p className="text-xs text-[#6C757D] text-center py-4">No items</p>
              )}
              {colItems.map((item) => (
                <KanbanCard
                  key={item.id}
                  item={item}
                  caseNo={caseMap.get(item.caseId)?.caseNo ?? item.caseId}
                  userRole={userRole}
                  onMoveStatus={onMoveStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Table View
// ============================================================

function TableView({
  items,
  caseMap,
  userRole,
  onEdit,
  onDelete,
}: {
  readonly items: FilingItem[];
  readonly caseMap: Map<string, Case>;
  readonly userRole: UserRole;
  readonly onEdit: (item: FilingItem) => void;
  readonly onDelete: (item: FilingItem) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200" style={{ backgroundColor: '#F8F9FA' }}>
            <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Case No.</th>
            <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Filing Type</th>
            <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Due Date</th>
            <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Filed Date</th>
            <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Filed By</th>
            <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Filing No.</th>
            <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Defects</th>
            <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap min-w-[120px]">Notes</th>
            <th className="text-right px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const relatedCase = caseMap.get(item.caseId);
            const badge = STATUS_BADGE_STYLES[item.status];

            return (
              <tr
                key={item.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
              >
                {/* Case No */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="text-sm font-medium text-[#1B2A4A] max-w-[180px] block truncate"
                    title={relatedCase?.caseNo ?? item.caseId}
                  >
                    {relatedCase?.caseNo ?? item.caseId}
                  </span>
                </td>

                {/* Filing Type */}
                <td className="px-4 py-3 whitespace-nowrap text-[#333]">
                  {FILING_TYPE_LABELS[item.filingType]}
                </td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {FILING_STATUS_LABELS[item.status]}
                  </span>
                </td>

                {/* Due Date */}
                <td className="px-4 py-3 whitespace-nowrap text-[#6C757D]">
                  {formatDate(item.dueDate)}
                </td>

                {/* Filed Date */}
                <td className="px-4 py-3 whitespace-nowrap text-[#6C757D]">
                  {formatDate(item.filedDate)}
                </td>

                {/* Filed By */}
                <td className="px-4 py-3 whitespace-nowrap text-[#6C757D]">
                  {item.filedBy ?? '-'}
                </td>

                {/* Filing Number */}
                <td className="px-4 py-3 whitespace-nowrap text-[#6C757D]">
                  {item.filingNumber ?? '-'}
                </td>

                {/* Defects */}
                <td className="px-4 py-3 whitespace-nowrap text-[#6C757D]">
                  {item.defects ?? '-'}
                </td>

                {/* Notes */}
                <td className="px-4 py-3">
                  <p
                    className="text-xs text-[#6C757D] max-w-[160px]"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    title={item.notes ?? ''}
                  >
                    {item.notes ?? '-'}
                  </p>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    {(userRole === 'superadmin' || userRole === 'editor') && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4472C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                    {userRole === 'superadmin' && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  );
}

// ============================================================
// Main Page
// ============================================================

type ViewMode = 'table' | 'kanban';

export default function FilingsTrackerPage() {
  // Data state
  const [items, setItems] = useState<FilingItem[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('viewer');

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FilingItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FilingItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `toast-${++toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- Data fetching ----

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [filingItems, caseResult] = await Promise.all([
        cmsFilings.list(),
        cmsCases.list({ limit: 200 }),
      ]);
      setItems(filingItems);
      setCases(caseResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load filings data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const user = cmsAuth.getUser();
    if (user) setUserRole(user.role);
  }, []);

  // ---- Derived data ----

  const caseMap = new Map(cases.map((c) => [c.id, c]));

  // ---- Handlers ----

  const handleOpenAdd = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: FilingItem) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  const handleSave = useCallback(
    async (formData: FilingFormData) => {
      setSaving(true);
      try {
        if (editItem) {
          await cmsFilings.update(editItem.id, {
            caseId: formData.caseId,
            filingType: formData.filingType,
            status: formData.status,
            dueDate: formData.dueDate || null,
            filedDate: formData.filedDate || null,
            filedBy: formData.filedBy || null,
            filingNumber: formData.filingNumber || null,
            defects: formData.defects || null,
            notes: formData.notes || null,
          });
          showToast('success', 'Filing item updated.');
        } else {
          await cmsFilings.create({
            caseId: formData.caseId,
            filingType: formData.filingType,
            status: formData.status,
            dueDate: formData.dueDate || null,
            notes: formData.notes || null,
          });
          showToast('success', 'Filing item created.');
        }
        handleCloseModal();
        await fetchData();
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to save.');
      } finally {
        setSaving(false);
      }
    },
    [editItem, fetchData, showToast]
  );

  const handleMoveStatus = useCallback(
    async (id: string, newStatus: FilingStatus) => {
      try {
        await cmsFilings.update(id, { status: newStatus });
        showToast('success', `Moved to ${FILING_STATUS_LABELS[newStatus]}.`);
        await fetchData();
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to update status.');
      }
    },
    [fetchData, showToast]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await cmsFilings.remove(deleteTarget.id);
      showToast('success', 'Filing item deleted.');
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete.');
    }
  }, [deleteTarget, fetchData, showToast]);

  // ---- Build edit form data ----

  const editFormData: FilingFormData | null = editItem
    ? {
        caseId: editItem.caseId,
        filingType: editItem.filingType,
        status: editItem.status,
        dueDate: editItem.dueDate ?? '',
        filedDate: editItem.filedDate ?? '',
        filedBy: editItem.filedBy ?? '',
        filingNumber: editItem.filingNumber ?? '',
        defects: editItem.defects ?? '',
        notes: editItem.notes ?? '',
      }
    : null;

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Filings Tracker</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Track filing submissions and their statuses
            {!loading && ` \u2014 ${items.length} total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
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
          {(userRole === 'superadmin' || userRole === 'editor') && (
            <button
              onClick={handleOpenAdd}
              className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Filing
            </button>
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      {!loading && items.length > 0 && (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewMode('table')}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'table' ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-[#6C757D] hover:text-[#1B2A4A]'}
            `.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Table View
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${viewMode === 'kanban' ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-[#6C757D] hover:text-[#1B2A4A]'}
            `.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Kanban View
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm text-[#FF4444] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button onClick={fetchData} className="ml-auto text-xs font-medium underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Empty */}
      {!loading && !error && items.length === 0 && <EmptyState />}

      {/* Content */}
      {!loading && !error && items.length > 0 && viewMode === 'table' && (
        <TableView
          items={items}
          caseMap={caseMap}
          userRole={userRole}
          onEdit={handleOpenEdit}
          onDelete={(item) => setDeleteTarget(item)}
        />
      )}

      {!loading && !error && items.length > 0 && viewMode === 'kanban' && (
        <KanbanView
          items={items}
          caseMap={caseMap}
          userRole={userRole}
          onMoveStatus={handleMoveStatus}
          onEdit={handleOpenEdit}
          onDelete={(item) => setDeleteTarget(item)}
        />
      )}

      {/* Add / Edit Modal */}
      <FilingModal
        isOpen={modalOpen}
        title={editItem ? 'Edit Filing' : 'Add Filing'}
        initialData={editFormData}
        cases={cases}
        onSave={handleSave}
        onClose={handleCloseModal}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Filing"
        message="Are you sure you want to delete this filing item? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
