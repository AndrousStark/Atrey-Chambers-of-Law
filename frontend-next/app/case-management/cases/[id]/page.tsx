'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cmsCases, cmsCompliance, cmsFilings, cmsHearings } from '@/lib/cms-api';
import type {
  Case,
  ComplianceItem,
  FilingItem,
  HearingRecord,
  ComplianceStatus,
  FilingType,
  FilingStatus,
} from '@/lib/cms-types';
import {
  CASE_STATUS_LABELS,
  PRIORITY_LABELS,
  COMPLIANCE_STATUS_LABELS,
  FILING_TYPE_LABELS,
  FILING_STATUS_LABELS,
} from '@/lib/cms-types';

// ============================================================
// Design tokens
// ============================================================
const NAVY = '#1B2A4A';
const ACCENT = '#4472C4';
const RED = '#FF4444';
const ORANGE = '#FF8C00';
const GREEN = '#28A745';
const YELLOW = '#FFC107';
const GREY = '#6C757D';

// ============================================================
// Helpers
// ============================================================

function statusBadgeStyle(status: string): { bg: string; text: string } {
  const s = status.toLowerCase();
  if (['active', 'listendforhearing', 'admitted', 'leavegranted'].includes(s.replace(/\s/g, '').toLowerCase()))
    return { bg: `${GREEN}15`, text: GREEN };
  if (['disposed', 'dismissed', 'withdrawn'].includes(s.toLowerCase()))
    return { bg: `${GREY}15`, text: GREY };
  if (['staygranted', 'reservedforjudgment', 'partheard'].includes(s.replace(/\s/g, '').toLowerCase()))
    return { bg: `${ACCENT}15`, text: ACCENT };
  if (['counternotfiled', 'pending'].includes(s.replace(/\s/g, '').toLowerCase()))
    return { bg: `${ORANGE}15`, text: ORANGE };
  if (['counterfiled', 'noticeissued', 'adjourned'].includes(s.replace(/\s/g, '').toLowerCase()))
    return { bg: `${NAVY}12`, text: NAVY };
  return { bg: `${GREY}15`, text: GREY };
}

function priorityBadgeStyle(priority: string): { bg: string; text: string } {
  switch (priority) {
    case 'Critical': return { bg: `${RED}15`, text: RED };
    case 'High': return { bg: `${ORANGE}15`, text: ORANGE };
    case 'Medium': return { bg: `${YELLOW}18`, text: '#B8860B' };
    case 'Low': return { bg: `${GREEN}15`, text: GREEN };
    default: return { bg: `${GREY}15`, text: GREY };
  }
}

function complianceStatusStyle(status: ComplianceStatus): { bg: string; text: string } {
  switch (status) {
    case 'Completed': return { bg: `${GREEN}15`, text: GREEN };
    case 'InProgress': return { bg: `${ACCENT}15`, text: ACCENT };
    case 'Pending': return { bg: `${YELLOW}18`, text: '#B8860B' };
    case 'Overdue': return { bg: `${RED}15`, text: RED };
    case 'Waived': return { bg: `${GREY}15`, text: GREY };
    default: return { bg: `${GREY}15`, text: GREY };
  }
}

function filingStatusStyle(status: FilingStatus): { bg: string; text: string } {
  switch (status) {
    case 'Filed': return { bg: `${GREEN}15`, text: GREEN };
    case 'ReadyForFiling': return { bg: `${ACCENT}15`, text: ACCENT };
    case 'UnderReview': return { bg: `${YELLOW}18`, text: '#B8860B' };
    case 'Drafting': return { bg: `${ORANGE}15`, text: ORANGE };
    case 'NotStarted': return { bg: `${GREY}15`, text: GREY };
    case 'RejectedRefiled': return { bg: `${RED}15`, text: RED };
    default: return { bg: `${GREY}15`, text: GREY };
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  // Handle ISO dates
  if (dateStr.includes('T') || dateStr.includes('-')) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  return dateStr;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()} ${hours}:${mins}`;
}

// ============================================================
// Loading Skeleton
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-32 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-7 w-80 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Info card skeleton */}
      <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Sections skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div className="h-5 w-44 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 404 Not Found
// ============================================================

function NotFound() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${ORANGE}15` }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: NAVY }}>Case Not Found</h2>
      <p className="text-sm mb-6" style={{ color: GREY }}>The case you are looking for does not exist or has been removed.</p>
      <button
        onClick={() => router.push('/case-management/cases')}
        className="h-9 px-5 rounded-md text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: ACCENT }}
      >
        Back to Cases
      </button>
    </div>
  );
}

// ============================================================
// Collapsible Section
// ============================================================

function CollapsibleSection({
  title,
  count,
  defaultOpen,
  actions,
  children,
}: {
  readonly title: string;
  readonly count: number;
  readonly defaultOpen?: boolean;
  readonly actions?: React.ReactNode;
  readonly children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform ${open ? 'rotate-90' : ''}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <h3 className="text-sm font-bold" style={{ color: NAVY }}>{title}</h3>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}
          >
            {count}
          </span>
        </div>
        {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ============================================================
// Info Field
// ============================================================

function InfoField({ label, value }: { readonly label: string; readonly value: string | null | undefined }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>{label}</p>
      <p className="text-sm" style={{ color: value ? NAVY : GREY }}>{value || '\u2014'}</p>
    </div>
  );
}

// ============================================================
// Add Hearing Form (inline)
// ============================================================

interface HearingFormData {
  hearingDate: string;
  courtBench: string;
  judge: string;
  orderSummary: string;
}

function AddHearingForm({
  caseId,
  onSave,
  onCancel,
  saving,
}: {
  readonly caseId: string;
  readonly onSave: (data: HearingFormData) => void;
  readonly onCancel: () => void;
  readonly saving: boolean;
}) {
  const [form, setForm] = useState<HearingFormData>({
    hearingDate: '',
    courtBench: '',
    judge: '',
    orderSummary: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.hearingDate) return;
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 bg-gray-50 space-y-3">
      <p className="text-xs font-semibold" style={{ color: NAVY }}>Add New Hearing</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Date *</label>
          <input
            type="date"
            value={form.hearingDate}
            onChange={(e) => setForm({ ...form, hearingDate: e.target.value })}
            className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Court/Bench</label>
          <input
            type="text"
            value={form.courtBench}
            onChange={(e) => setForm({ ...form, courtBench: e.target.value })}
            className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            placeholder="e.g. Court No. 5"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Judge</label>
          <input
            type="text"
            value={form.judge}
            onChange={(e) => setForm({ ...form, judge: e.target.value })}
            className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            placeholder="Presiding judge"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Order Summary</label>
        <textarea
          value={form.orderSummary}
          onChange={(e) => setForm({ ...form, orderSummary: e.target.value })}
          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 resize-y"
          rows={2}
          placeholder="Brief summary of the order..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-3 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          style={{ color: GREY }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !form.hearingDate}
          className="h-8 px-4 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          style={{ backgroundColor: ACCENT }}
        >
          {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Save
        </button>
      </div>
    </form>
  );
}

// ============================================================
// Add Compliance Form (inline)
// ============================================================

interface ComplianceFormData {
  direction: string;
  dueDate: string;
  notes: string;
}

function AddComplianceForm({
  onSave,
  onCancel,
  saving,
}: {
  readonly onSave: (data: ComplianceFormData) => void;
  readonly onCancel: () => void;
  readonly saving: boolean;
}) {
  const [form, setForm] = useState<ComplianceFormData>({ direction: '', dueDate: '', notes: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.direction.trim() || !form.dueDate) return;
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 bg-gray-50 space-y-3">
      <p className="text-xs font-semibold" style={{ color: NAVY }}>Add Compliance Item</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Direction *</label>
          <input
            type="text"
            value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
            className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            placeholder="Court direction or compliance requirement"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Due Date *</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            placeholder="Optional notes"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-8 px-3 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors" style={{ color: GREY }}>Cancel</button>
        <button type="submit" disabled={saving || !form.direction.trim() || !form.dueDate} className="h-8 px-4 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5" style={{ backgroundColor: ACCENT }}>
          {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Save
        </button>
      </div>
    </form>
  );
}

// ============================================================
// Add Filing Form (inline)
// ============================================================

interface FilingFormData {
  filingType: FilingType;
  dueDate: string;
  notes: string;
}

function AddFilingForm({
  onSave,
  onCancel,
  saving,
}: {
  readonly onSave: (data: FilingFormData) => void;
  readonly onCancel: () => void;
  readonly saving: boolean;
}) {
  const [form, setForm] = useState<FilingFormData>({ filingType: 'CounterAffidavit', dueDate: '', notes: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.dueDate) return;
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 bg-gray-50 space-y-3">
      <p className="text-xs font-semibold" style={{ color: NAVY }}>Add Filing Item</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Filing Type *</label>
          <select
            value={form.filingType}
            onChange={(e) => setForm({ ...form, filingType: e.target.value as FilingType })}
            className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
          >
            {(Object.entries(FILING_TYPE_LABELS) as [FilingType, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Due Date *</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold mb-1" style={{ color: GREY }}>Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            placeholder="Optional notes"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-8 px-3 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors" style={{ color: GREY }}>Cancel</button>
        <button type="submit" disabled={saving || !form.dueDate} className="h-8 px-4 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5" style={{ backgroundColor: ACCENT }}>
          {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Save
        </button>
      </div>
    </form>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = typeof params.id === 'string' ? params.id : '';

  // State
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [filings, setFilings] = useState<FilingItem[]>([]);
  const [hearings, setHearings] = useState<HearingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline form states
  const [showAddHearing, setShowAddHearing] = useState(false);
  const [showAddCompliance, setShowAddCompliance] = useState(false);
  const [showAddFiling, setShowAddFiling] = useState(false);
  const [savingHearing, setSavingHearing] = useState(false);
  const [savingCompliance, setSavingCompliance] = useState(false);
  const [savingFiling, setSavingFiling] = useState(false);

  // --- Fetch Data ---

  const fetchData = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const [caseResult, complianceResult, filingsResult, hearingsResult] = await Promise.all([
        cmsCases.get(caseId).catch((err: Error) => {
          if (err.message === 'Case not found') return null;
          throw err;
        }),
        cmsCompliance.forCase(caseId),
        cmsFilings.forCase(caseId),
        cmsHearings.forCase(caseId),
      ]);

      if (!caseResult) {
        setNotFound(true);
        return;
      }

      setCaseData(caseResult);
      setCompliance(complianceResult);
      setFilings(filingsResult);
      setHearings(
        [...hearingsResult].sort((a, b) =>
          new Date(b.hearingDate).getTime() - new Date(a.hearingDate).getTime()
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load case data.');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---

  const handleAddHearing = useCallback(async (data: HearingFormData) => {
    setSavingHearing(true);
    try {
      await cmsHearings.create({
        caseId,
        hearingDate: data.hearingDate,
        courtBench: data.courtBench || null,
        judge: data.judge || null,
        orderSummary: data.orderSummary || null,
      });
      setShowAddHearing(false);
      const updated = await cmsHearings.forCase(caseId);
      setHearings([...updated].sort((a, b) => new Date(b.hearingDate).getTime() - new Date(a.hearingDate).getTime()));
    } catch {
      // Error handled silently for inline form
    } finally {
      setSavingHearing(false);
    }
  }, [caseId]);

  const handleAddCompliance = useCallback(async (data: ComplianceFormData) => {
    setSavingCompliance(true);
    try {
      await cmsCompliance.create({
        caseId,
        direction: data.direction,
        dueDate: data.dueDate,
        notes: data.notes || null,
        status: 'Pending',
      });
      setShowAddCompliance(false);
      const updated = await cmsCompliance.forCase(caseId);
      setCompliance(updated);
    } catch {
      // Error handled silently
    } finally {
      setSavingCompliance(false);
    }
  }, [caseId]);

  const handleAddFiling = useCallback(async (data: FilingFormData) => {
    setSavingFiling(true);
    try {
      await cmsFilings.create({
        caseId,
        filingType: data.filingType,
        dueDate: data.dueDate,
        notes: data.notes || null,
        status: 'NotStarted',
      });
      setShowAddFiling(false);
      const updated = await cmsFilings.forCase(caseId);
      setFilings(updated);
    } catch {
      // Error handled silently
    } finally {
      setSavingFiling(false);
    }
  }, [caseId]);

  // --- Loading ---
  if (loading) return <LoadingSkeleton />;

  // --- 404 ---
  if (notFound) return <NotFound />;

  // --- Error ---
  if (error) {
    return (
      <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm flex items-center gap-2" style={{ color: RED }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {error}
        <button onClick={fetchData} className="ml-auto text-xs font-medium underline hover:no-underline">Retry</button>
      </div>
    );
  }

  if (!caseData) return null;

  const sBadge = statusBadgeStyle(caseData.status);
  const pBadge = priorityBadgeStyle(caseData.priority);

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button + Title */}
      <div>
        <button
          onClick={() => router.push('/case-management/cases')}
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-3 hover:opacity-80 transition-opacity"
          style={{ color: ACCENT }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Cases
        </button>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>{caseData.caseNo}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: sBadge.bg, color: sBadge.text }}
          >
            {CASE_STATUS_LABELS[caseData.status] || caseData.status}
          </span>
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: pBadge.bg, color: pBadge.text }}
          >
            {PRIORITY_LABELS[caseData.priority] || caseData.priority}
          </span>
        </div>
      </div>

      {/* Case Info Card */}
      <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: NAVY }}>Case Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoField label="Case No." value={caseData.caseNo} />
          <InfoField label="CNR Number" value={caseData.cnrNumber} />
          <InfoField label="Court" value={caseData.court} />
          <InfoField label="Bench" value={caseData.bench} />
          <InfoField label="Client" value={caseData.client} />
          <InfoField label="Case Title" value={caseData.caseTitle} />
          <InfoField label="Petitioner" value={caseData.petitioner} />
          <InfoField label="Respondent" value={caseData.respondent} />
          <InfoField label="Our Role" value={caseData.ourRole} />
          <InfoField label="Respondent No." value={caseData.respondentNumber} />
          <InfoField label="Category" value={caseData.category} />
          <InfoField label="Subject Matter" value={caseData.subjectMatter} />
          <InfoField label="Department" value={caseData.department} />
          <InfoField label="Filing Date" value={formatDate(caseData.filingDate)} />
          <InfoField label="Registration Date" value={formatDate(caseData.registrationDate)} />
          <InfoField label="Status" value={CASE_STATUS_LABELS[caseData.status] || caseData.status} />
          <InfoField label="NDOH (Next Date of Hearing)" value={formatDate(caseData.ndoh)} />
          <InfoField label="Previous Hearing" value={formatDate(caseData.previousHearing)} />
          <InfoField label="Bench Number" value={caseData.benchNumber} />
          <InfoField label="Presiding Judge" value={caseData.presidingJudge} />
          <InfoField label="Priority" value={PRIORITY_LABELS[caseData.priority]} />
          <InfoField label="Assigned To" value={caseData.assignedTo?.name || null} />
          <div className="md:col-span-2 space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Remarks</p>
            <p className="text-sm whitespace-pre-wrap" style={{ color: caseData.remarks ? NAVY : GREY }}>
              {caseData.remarks || '\u2014'}
            </p>
          </div>
          <InfoField label="Created" value={formatDateTime(caseData.createdAt)} />
          <InfoField label="Last Modified" value={formatDateTime(caseData.updatedAt)} />
        </div>
      </div>

      {/* Hearing History */}
      <CollapsibleSection
        title="Hearing History"
        count={hearings.length}
        defaultOpen={true}
        actions={
          !showAddHearing ? (
            <button
              onClick={() => setShowAddHearing(true)}
              className="h-7 px-3 rounded-md text-[11px] font-medium text-white transition-colors"
              style={{ backgroundColor: ACCENT }}
            >
              + Add Hearing
            </button>
          ) : null
        }
      >
        {showAddHearing && (
          <AddHearingForm
            caseId={caseId}
            onSave={handleAddHearing}
            onCancel={() => setShowAddHearing(false)}
            saving={savingHearing}
          />
        )}

        {hearings.length === 0 && !showAddHearing ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm" style={{ color: GREY }}>No hearing records yet.</p>
          </div>
        ) : (
          <div className="px-6 py-4">
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              {hearings.length > 0 && (
                <div
                  className="absolute left-[7px] top-2 bottom-2 w-0.5"
                  style={{ backgroundColor: `${ACCENT}30` }}
                />
              )}

              <div className="space-y-6">
                {hearings.map((hearing) => {
                  const sourceBadge = hearing.source === 'auto'
                    ? { bg: `${GREEN}15`, text: GREEN, label: 'Auto' }
                    : { bg: `${ACCENT}15`, text: ACCENT, label: 'Manual' };

                  return (
                    <div key={hearing.id} className="relative pl-7">
                      {/* Dot */}
                      <div
                        className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 bg-white"
                        style={{ borderColor: ACCENT }}
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: NAVY }}>
                            {formatDate(hearing.hearingDate)}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ backgroundColor: sourceBadge.bg, color: sourceBadge.text }}
                          >
                            {sourceBadge.label}
                          </span>
                        </div>

                        {(hearing.courtBench || hearing.judge) && (
                          <p className="text-xs" style={{ color: GREY }}>
                            {[hearing.courtBench, hearing.judge].filter(Boolean).join(' \u00B7 ')}
                          </p>
                        )}

                        {hearing.orderSummary && (
                          <p className="text-sm" style={{ color: '#555' }}>{hearing.orderSummary}</p>
                        )}

                        {hearing.staffNotes && (
                          <p className="text-xs italic" style={{ color: GREY }}>Note: {hearing.staffNotes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Compliance Items */}
      <CollapsibleSection
        title="Compliance Items"
        count={compliance.length}
        defaultOpen={true}
        actions={
          !showAddCompliance ? (
            <button
              onClick={() => setShowAddCompliance(true)}
              className="h-7 px-3 rounded-md text-[11px] font-medium text-white transition-colors"
              style={{ backgroundColor: ACCENT }}
            >
              + Add Compliance
            </button>
          ) : null
        }
      >
        {showAddCompliance && (
          <AddComplianceForm
            onSave={handleAddCompliance}
            onCancel={() => setShowAddCompliance(false)}
            saving={savingCompliance}
          />
        )}

        {compliance.length === 0 && !showAddCompliance ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm" style={{ color: GREY }}>No compliance items for this case.</p>
          </div>
        ) : compliance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: `${NAVY}05` }}>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Direction</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Due Date</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Status</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: GREY }}>Assigned To</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: GREY }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {compliance.map((item, idx) => {
                  const cBadge = complianceStatusStyle(item.status);
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-gray-100"
                      style={{ backgroundColor: idx % 2 === 1 ? '#FAFBFC' : 'white' }}
                    >
                      <td className="px-6 py-3 max-w-xs" style={{ color: NAVY }}>
                        <span className="line-clamp-2">{item.direction}</span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap" style={{ color: '#555' }}>
                        {formatDate(item.dueDate)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: cBadge.bg, color: cBadge.text }}
                        >
                          {COMPLIANCE_STATUS_LABELS[item.status]}
                        </span>
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell" style={{ color: GREY }}>
                        {item.assignedTo?.name || item.assignedToId || '\u2014'}
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell max-w-xs" style={{ color: GREY }}>
                        <span className="line-clamp-1">{item.notes || '\u2014'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </CollapsibleSection>

      {/* Filing Items */}
      <CollapsibleSection
        title="Filing Items"
        count={filings.length}
        defaultOpen={true}
        actions={
          !showAddFiling ? (
            <button
              onClick={() => setShowAddFiling(true)}
              className="h-7 px-3 rounded-md text-[11px] font-medium text-white transition-colors"
              style={{ backgroundColor: ACCENT }}
            >
              + Add Filing
            </button>
          ) : null
        }
      >
        {showAddFiling && (
          <AddFilingForm
            onSave={handleAddFiling}
            onCancel={() => setShowAddFiling(false)}
            saving={savingFiling}
          />
        )}

        {filings.length === 0 && !showAddFiling ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm" style={{ color: GREY }}>No filing items for this case.</p>
          </div>
        ) : filings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: `${NAVY}05` }}>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Type</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Status</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Due Date</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: GREY }}>Filed Date</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: GREY }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filings.map((item, idx) => {
                  const fBadge = filingStatusStyle(item.status);
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-gray-100"
                      style={{ backgroundColor: idx % 2 === 1 ? '#FAFBFC' : 'white' }}
                    >
                      <td className="px-6 py-3 font-medium" style={{ color: NAVY }}>
                        {FILING_TYPE_LABELS[item.filingType] || item.filingType}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: fBadge.bg, color: fBadge.text }}
                        >
                          {FILING_STATUS_LABELS[item.status]}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap" style={{ color: '#555' }}>
                        {formatDate(item.dueDate)}
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell whitespace-nowrap" style={{ color: '#555' }}>
                        {formatDate(item.filedDate)}
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell max-w-xs" style={{ color: GREY }}>
                        <span className="line-clamp-1">{item.notes || '\u2014'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </CollapsibleSection>
    </div>
  );
}
