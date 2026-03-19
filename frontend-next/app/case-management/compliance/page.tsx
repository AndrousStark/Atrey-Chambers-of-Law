'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cmsCompliance, cmsCases, cmsUsers, cmsAuth } from '@/lib/cms-api';
import type {
  ComplianceItem,
  ComplianceStatus,
  Case,
  CmsUser,
  UserRole,
} from '@/lib/cms-types';
import { COMPLIANCE_STATUS_LABELS } from '@/lib/cms-types';
import { CmsToastProvider, useToast, CmsConfirmDialog, CmsLoadingState } from '@/components/cms/ui';

// ============================================================
// Constants
// ============================================================

const STATUS_TABS: readonly ('All' | ComplianceStatus)[] = [
  'All',
  'Pending',
  'InProgress',
  'Overdue',
  'Completed',
  'Waived',
] as const;

const STATUS_BADGE_STYLES: Record<ComplianceStatus, { bg: string; text: string }> = {
  Pending: { bg: '#E9ECEF', text: '#6C757D' },
  InProgress: { bg: '#D6E4F0', text: '#4472C4' },
  Completed: { bg: '#D4EDDA', text: '#28A745' },
  Overdue: { bg: '#FFE0E0', text: '#FF4444' },
  Waived: { bg: '#E9ECEF', text: '#6C757D' },
};

// ============================================================
// Helpers
// ============================================================

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  // Handle DD.MM.YYYY format
  if (dateStr.includes('.')) {
    const [day, month, year] = dateStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  // Handle ISO / YYYY-MM-DD
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

function todayString(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
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
// Compliance Modal
// ============================================================

interface ComplianceFormData {
  caseId: string;
  direction: string;
  directionDate: string;
  dueDate: string;
  status: ComplianceStatus;
  assignedToId: string;
  notes: string;
}

const EMPTY_FORM: ComplianceFormData = {
  caseId: '',
  direction: '',
  directionDate: '',
  dueDate: '',
  status: 'Pending',
  assignedToId: '',
  notes: '',
};

function ComplianceModal({
  isOpen,
  title,
  initialData,
  cases,
  users,
  onSave,
  onClose,
  saving,
}: {
  readonly isOpen: boolean;
  readonly title: string;
  readonly initialData: ComplianceFormData | null;
  readonly cases: Case[];
  readonly users: CmsUser[];
  readonly onSave: (data: ComplianceFormData) => void;
  readonly onClose: () => void;
  readonly saving: boolean;
}) {
  const [form, setForm] = useState<ComplianceFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ComplianceFormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ?? EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen, initialData]);

  // ESC to close + lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = <K extends keyof ComplianceFormData>(key: K, value: ComplianceFormData[K]) => {
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
    const errs: Partial<Record<keyof ComplianceFormData, string>> = {};
    if (!form.caseId) errs.caseId = 'Case is required';
    if (!form.direction.trim()) errs.direction = 'Direction is required';
    if (!form.dueDate) errs.dueDate = 'Due date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
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

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
              Direction <span className="text-[#FF4444]">*</span>
            </label>
            <textarea
              rows={3}
              value={form.direction}
              onChange={(e) => updateField('direction', e.target.value)}
              className={`w-full px-3 py-2 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 resize-y ${errors.direction ? 'border-[#FF4444]' : 'border-gray-300'}`}
              placeholder="Court direction / compliance requirement..."
            />
            {errors.direction && <p className="text-xs text-[#FF4444] mt-1">{errors.direction}</p>}
          </div>

          {/* Direction Date + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Direction Date</label>
              <input
                type="date"
                value={toInputDate(form.directionDate)}
                onChange={(e) => updateField('directionDate', fromInputDate(e.target.value))}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                Due Date <span className="text-[#FF4444]">*</span>
              </label>
              <input
                type="date"
                value={toInputDate(form.dueDate)}
                onChange={(e) => updateField('dueDate', fromInputDate(e.target.value))}
                className={`w-full h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 ${errors.dueDate ? 'border-[#FF4444]' : 'border-gray-300'}`}
              />
              {errors.dueDate && <p className="text-xs text-[#FF4444] mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => updateField('status', e.target.value as ComplianceStatus)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            >
              {(Object.entries(COMPLIANCE_STATUS_LABELS) as [ComplianceStatus, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Assigned To</label>
            <select
              value={form.assignedToId}
              onChange={(e) => updateField('assignedToId', e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

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
// Empty State
// ============================================================

function EmptyState({ filterActive }: { readonly filterActive: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      <p className="text-sm font-medium text-[#1B2A4A]">
        {filterActive ? 'No compliance items match this filter' : 'No compliance items yet'}
      </p>
      <p className="text-xs text-[#6C757D]">
        {filterActive
          ? 'Try selecting a different status tab.'
          : 'Add a new compliance item to start tracking court directions.'}
      </p>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function ComplianceTrackerPage() {
  return (
    <CmsToastProvider>
      <ComplianceTrackerInner />
    </CmsToastProvider>
  );
}

function ComplianceTrackerInner() {
  // Data state
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('viewer');

  // Filter
  const [activeTab, setActiveTab] = useState<'All' | ComplianceStatus>('All');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ComplianceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ComplianceItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Toast (shared)
  const { showToast } = useToast();

  // ---- Data fetching ----

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [complianceItems, caseResult, userList] = await Promise.all([
        cmsCompliance.list(),
        cmsCases.list({ limit: 200 }),
        cmsUsers.list(),
      ]);
      setItems(complianceItems);
      setCases(caseResult.data);
      setUsers(userList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance data.');
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
  const userMap = new Map(users.map((u) => [u.id, u]));

  const statusCounts: Record<'All' | ComplianceStatus, number> = {
    All: items.length,
    Pending: items.filter((i) => i.status === 'Pending').length,
    InProgress: items.filter((i) => i.status === 'InProgress').length,
    Overdue: items.filter((i) => i.status === 'Overdue').length,
    Completed: items.filter((i) => i.status === 'Completed').length,
    Waived: items.filter((i) => i.status === 'Waived').length,
  };

  const filteredItems =
    activeTab === 'All' ? items : items.filter((i) => i.status === activeTab);

  // ---- Handlers ----

  const handleOpenAdd = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ComplianceItem) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditItem(null);
  };

  const handleSave = useCallback(
    async (formData: ComplianceFormData) => {
      setSaving(true);
      try {
        if (editItem) {
          await cmsCompliance.update(editItem.id, {
            caseId: formData.caseId,
            direction: formData.direction,
            directionDate: formData.directionDate || null,
            dueDate: formData.dueDate,
            status: formData.status,
            assignedToId: formData.assignedToId || null,
            notes: formData.notes || null,
          });
          showToast('success', 'Compliance item updated.');
        } else {
          await cmsCompliance.create({
            caseId: formData.caseId,
            direction: formData.direction,
            directionDate: formData.directionDate || null,
            dueDate: formData.dueDate,
            status: formData.status,
            assignedToId: formData.assignedToId || null,
            notes: formData.notes || null,
          });
          showToast('success', 'Compliance item created.');
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

  const handleMarkComplete = useCallback(
    async (item: ComplianceItem) => {
      try {
        await cmsCompliance.update(item.id, {
          status: 'Completed',
          completionDate: todayString(),
        });
        showToast('success', 'Marked as completed.');
        await fetchData();
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to update.');
      }
    },
    [fetchData, showToast]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await cmsCompliance.remove(deleteTarget.id);
      showToast('success', 'Compliance item deleted.');
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete.');
    }
  }, [deleteTarget, fetchData, showToast]);

  // ---- Build edit form data ----

  const editFormData: ComplianceFormData | null = editItem
    ? {
        caseId: editItem.caseId,
        direction: editItem.direction,
        directionDate: editItem.directionDate ?? '',
        dueDate: editItem.dueDate,
        status: editItem.status,
        assignedToId: editItem.assignedToId ?? '',
        notes: editItem.notes ?? '',
      }
    : null;

  // ---- Row styling helpers ----

  const getRowBg = (item: ComplianceItem): string => {
    if (item.status === 'Overdue') return '#FFF5F5';
    const dd = daysDiff(item.dueDate);
    if (dd !== null && dd >= 0 && dd <= 7 && item.status !== 'Completed' && item.status !== 'Waived') {
      return '#FFFDF0';
    }
    return 'transparent';
  };

  const getDaysBadge = (item: ComplianceItem): React.ReactNode => {
    if (item.status === 'Completed' || item.status === 'Waived') {
      return <span className="text-xs text-[#6C757D]">-</span>;
    }
    const dd = daysDiff(item.dueDate);
    if (dd === null) return <span className="text-xs text-[#6C757D]">-</span>;

    if (dd < 0) {
      return (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#FFE0E0', color: '#FF4444' }}
        >
          {Math.abs(dd)}d overdue
        </span>
      );
    }
    if (dd === 0) {
      return (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#FFE0E0', color: '#FF4444' }}
        >
          Due today
        </span>
      );
    }
    if (dd <= 7) {
      return (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: '#FFF3CD', color: '#FF8C00' }}
        >
          {dd}d left
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: '#D4EDDA', color: '#28A745' }}
      >
        {dd}d left
      </span>
    );
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Compliance Tracker</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Track court directions and compliance deadlines
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
              Add Compliance
            </button>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count = statusCounts[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                  transition-colors border
                  ${
                    isActive
                      ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                      : 'bg-white text-[#6C757D] border-gray-300 hover:bg-gray-50'
                  }
                `.trim()}
              >
                {tab === 'All' ? 'All' : COMPLIANCE_STATUS_LABELS[tab]}
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold
                    ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#6C757D]'}
                  `.trim()}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
      {loading && <CmsLoadingState text="Loading compliance..." />}

      {/* Empty */}
      {!loading && !error && filteredItems.length === 0 && (
        <EmptyState filterActive={activeTab !== 'All'} />
      )}

      {/* Table */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200" style={{ backgroundColor: '#F8F9FA' }}>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Case No.</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap min-w-[200px]">Direction</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Direction Date</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Due Date</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Assigned To</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Days</th>
                <th className="text-right px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const relatedCase = caseMap.get(item.caseId);
                const assignedUser = item.assignedToId ? userMap.get(item.assignedToId) : null;
                const badge = STATUS_BADGE_STYLES[item.status];

                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                    style={{ backgroundColor: getRowBg(item) }}
                  >
                    {/* Case No */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#1B2A4A] max-w-[180px] block truncate" title={relatedCase?.caseNo ?? item.caseId}>
                        {relatedCase?.caseNo ?? item.caseId}
                      </span>
                    </td>

                    {/* Direction */}
                    <td className="px-4 py-3">
                      <p
                        className="text-sm text-[#333] max-w-[300px]"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                        title={item.direction}
                      >
                        {item.direction}
                      </p>
                    </td>

                    {/* Direction Date */}
                    <td className="px-4 py-3 whitespace-nowrap text-[#6C757D]">
                      {formatDate(item.directionDate)}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-[#1B2A4A]">
                      {formatDate(item.dueDate)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {COMPLIANCE_STATUS_LABELS[item.status]}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="px-4 py-3 whitespace-nowrap text-[#6C757D]">
                      {assignedUser?.name ?? '-'}
                    </td>

                    {/* Days */}
                    <td className="px-4 py-3 whitespace-nowrap">{getDaysBadge(item)}</td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        {(userRole === 'superadmin' || userRole === 'editor') && (
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4472C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        )}

                        {/* Mark Complete */}
                        {(userRole === 'superadmin' || userRole === 'editor') &&
                          item.status !== 'Completed' &&
                          item.status !== 'Waived' && (
                            <button
                              onClick={() => handleMarkComplete(item)}
                              className="p-1.5 rounded hover:bg-green-50 transition-colors"
                              title="Mark Complete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#28A745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          )}

                        {/* Delete (admin only) */}
                        {userRole === 'superadmin' && (
                          <button
                            onClick={() => setDeleteTarget(item)}
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
      )}

      {/* Add / Edit Modal */}
      <ComplianceModal
        isOpen={modalOpen}
        title={editItem ? 'Edit Compliance Item' : 'Add Compliance Item'}
        initialData={editFormData}
        cases={cases}
        users={users}
        onSave={handleSave}
        onClose={handleCloseModal}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <CmsConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Compliance Item"
        message="Are you sure you want to delete this compliance item? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
}
