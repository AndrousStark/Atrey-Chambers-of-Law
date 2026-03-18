'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Case, CaseStatus, Priority, UserRole } from '@/lib/cms-types';
import { CASE_STATUS_LABELS, PRIORITY_LABELS } from '@/lib/cms-types';

// --- Helpers ---

function parseNdohDate(ndoh: string | null): Date | null {
  if (!ndoh) return null;
  const parts = ndoh.split('.');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  return isNaN(d.getTime()) ? null : d;
}

function daysUntil(ndoh: string | null): number | null {
  const date = parseNdohDate(ndoh);
  if (!date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getRowUrgencyClass(ndoh: string | null): string {
  const days = daysUntil(ndoh);
  if (days === null) return '';
  if (days <= 3) return 'bg-red-50';
  if (days <= 7) return 'bg-yellow-50';
  return '';
}

function truncate(text: string | null, maxLen: number): string {
  if (!text) return '-';
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}

// --- Status Badge ---

const STATUS_BADGE_STYLES: Record<CaseStatus, string> = {
  Active: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  Disposed: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  StayGranted: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  NoticeIssued: 'bg-sky-50 text-[#0EA5E9] border-[#0EA5E9]',
  PartHeard: 'bg-orange-50 text-[#FF8C00] border-[#FF8C00]',
  ReservedForJudgment: 'bg-purple-50 text-[#7C3AED] border-[#7C3AED]',
  Adjourned: 'bg-yellow-50 text-[#D97706] border-[#D97706]',
  ListedForHearing: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  Dismissed: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  Allowed: 'bg-green-50 text-[#28A745] border-[#28A745]',
  Withdrawn: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  Transferred: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  Admitted: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  LeaveGranted: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  CounterFiled: 'bg-green-50 text-[#28A745] border-[#28A745]',
  CounterNotFiled: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  Pending: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
};

function StatusBadge({ status }: { readonly status: CaseStatus }) {
  const style = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.Pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${style}`}>
      {CASE_STATUS_LABELS[status] || status}
    </span>
  );
}

// --- Priority Badge ---

const PRIORITY_BADGE_STYLES: Record<Priority, string> = {
  Critical: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  High: 'bg-orange-50 text-[#FF8C00] border-[#FF8C00]',
  Medium: 'bg-yellow-50 text-[#D97706] border-[#FFC107]',
  Low: 'bg-green-50 text-[#28A745] border-[#28A745]',
};

function PriorityBadge({ priority }: { readonly priority: Priority }) {
  const style = PRIORITY_BADGE_STYLES[priority] || PRIORITY_BADGE_STYLES.Medium;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${style}`}>
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

// --- Sort Icon ---

function SortIcon({ active, direction }: { readonly active: boolean; readonly direction: 'asc' | 'desc' }) {
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

// --- Action Icons ---

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

// --- Inline Save Feedback Icon ---

function InlineSaveIcon({ state }: { readonly state: 'idle' | 'success' | 'error' }) {
  if (state === 'success') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#28A745" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 animate-in fade-in">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (state === 'error') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 animate-in fade-in">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  return null;
}

// --- Inline Editable Cell Hook ---

type CellSaveState = 'idle' | 'success' | 'error';

function useInlineSave(
  caseId: string,
  field: string,
  onInlineUpdate?: (id: string, data: Partial<Case>) => Promise<boolean>,
) {
  const [saveState, setSaveState] = useState<CellSaveState>('idle');

  const handleChange = useCallback(async (value: string | null) => {
    if (!onInlineUpdate) return;
    setSaveState('idle');
    const success = await onInlineUpdate(caseId, { [field]: value } as Partial<Case>);
    setSaveState(success ? 'success' : 'error');
    setTimeout(() => setSaveState('idle'), 1500);
  }, [caseId, field, onInlineUpdate]);

  return { saveState, handleChange };
}

// --- Props ---

interface CaseTableProps {
  readonly cases: Case[];
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
  readonly onSort: (key: string) => void;
  readonly selectedIds: Set<string>;
  readonly onToggleSelect: (id: string) => void;
  readonly onToggleAll: () => void;
  readonly onEdit: (caseItem: Case) => void;
  readonly onDelete: (caseItem: Case) => void;
  readonly userRole: UserRole;
  readonly editMode?: boolean;
  readonly onInlineUpdate?: (id: string, data: Partial<Case>) => Promise<boolean>;
  readonly visibleColumns?: string[];
}

// --- Column Definitions ---

interface ColumnDef {
  readonly key: string;
  readonly label: string;
  readonly sortable: boolean;
  readonly width?: string;
}

const ALL_COLUMNS: readonly ColumnDef[] = [
  { key: 'checkbox', label: '', sortable: false, width: '40px' },
  { key: 'serialNo', label: 'S.No.', sortable: true, width: '60px' },
  { key: 'caseNo', label: 'Case No.', sortable: true, width: '200px' },
  { key: 'cnrNumber', label: 'CNR Number', sortable: true, width: '160px' },
  { key: 'court', label: 'Court', sortable: true, width: '140px' },
  { key: 'bench', label: 'Bench', sortable: true, width: '120px' },
  { key: 'client', label: 'Client', sortable: true, width: '130px' },
  { key: 'caseTitle', label: 'Title', sortable: true, width: '200px' },
  { key: 'petitioner', label: 'Petitioner', sortable: true, width: '160px' },
  { key: 'respondent', label: 'Respondent', sortable: true, width: '160px' },
  { key: 'ourRole', label: 'Role', sortable: true, width: '100px' },
  { key: 'category', label: 'Category', sortable: true, width: '140px' },
  { key: 'subjectMatter', label: 'Subject Matter', sortable: true, width: '160px' },
  { key: 'department', label: 'Department', sortable: true, width: '120px' },
  { key: 'filingDate', label: 'Filing Date', sortable: true, width: '110px' },
  { key: 'registrationDate', label: 'Registration Date', sortable: true, width: '130px' },
  { key: 'status', label: 'Status', sortable: true, width: '130px' },
  { key: 'ndoh', label: 'NDOH', sortable: true, width: '100px' },
  { key: 'previousHearing', label: 'Previous Hearing', sortable: true, width: '130px' },
  { key: 'benchNumber', label: 'Bench Number', sortable: true, width: '120px' },
  { key: 'presidingJudge', label: 'Judge', sortable: true, width: '140px' },
  { key: 'priority', label: 'Priority', sortable: true, width: '90px' },
  { key: 'linkedCases', label: 'Linked Cases', sortable: false, width: '140px' },
  { key: 'isBatch', label: 'Batch', sortable: true, width: '80px' },
  { key: 'remarks', label: 'Remarks', sortable: false, width: '160px' },
  { key: 'actions', label: 'Actions', sortable: false, width: '110px' },
];

/** Default visible column keys */
export const DEFAULT_VISIBLE_COLUMNS: readonly string[] = [
  'checkbox',
  'serialNo',
  'caseNo',
  'court',
  'client',
  'caseTitle',
  'ourRole',
  'department',
  'status',
  'ndoh',
  'priority',
  'remarks',
  'actions',
];

/** All column keys (excluding checkbox and actions which are always available) */
export const TOGGLEABLE_COLUMNS: readonly { key: string; label: string }[] =
  ALL_COLUMNS
    .filter((c) => c.key !== 'checkbox' && c.key !== 'actions')
    .map((c) => ({ key: c.key, label: c.label }));

// --- Inline Editable Cells ---

function InlineStatusSelect({
  caseItem,
  onInlineUpdate,
}: {
  readonly caseItem: Case;
  readonly onInlineUpdate?: (id: string, data: Partial<Case>) => Promise<boolean>;
}) {
  const { saveState, handleChange } = useInlineSave(caseItem.id, 'status', onInlineUpdate);

  return (
    <div className="flex items-center gap-0.5">
      <select
        defaultValue={caseItem.status}
        onChange={(e) => handleChange(e.target.value)}
        className="
          h-7 px-1.5 pr-5 rounded border border-[#4472C4]/30 bg-blue-50/50
          text-xs font-medium text-[#333] appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[#4472C4]/40 focus:border-[#4472C4]
          transition-colors
        "
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%234472C4' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 4px center',
        }}
      >
        {(Object.entries(CASE_STATUS_LABELS) as [CaseStatus, string][]).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <InlineSaveIcon state={saveState} />
    </div>
  );
}

function InlinePrioritySelect({
  caseItem,
  onInlineUpdate,
}: {
  readonly caseItem: Case;
  readonly onInlineUpdate?: (id: string, data: Partial<Case>) => Promise<boolean>;
}) {
  const { saveState, handleChange } = useInlineSave(caseItem.id, 'priority', onInlineUpdate);

  return (
    <div className="flex items-center gap-0.5">
      <select
        defaultValue={caseItem.priority}
        onChange={(e) => handleChange(e.target.value)}
        className="
          h-7 px-1.5 pr-5 rounded border border-[#4472C4]/30 bg-blue-50/50
          text-xs font-medium text-[#333] appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[#4472C4]/40 focus:border-[#4472C4]
          transition-colors
        "
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%234472C4' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 4px center',
        }}
      >
        {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <InlineSaveIcon state={saveState} />
    </div>
  );
}

function InlineNdohInput({
  caseItem,
  onInlineUpdate,
}: {
  readonly caseItem: Case;
  readonly onInlineUpdate?: (id: string, data: Partial<Case>) => Promise<boolean>;
}) {
  const { saveState, handleChange } = useInlineSave(caseItem.id, 'ndoh', onInlineUpdate);
  const [value, setValue] = useState(caseItem.ndoh || '');

  const handleBlur = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed !== (caseItem.ndoh || '')) {
      handleChange(trimmed || null);
    }
  }, [value, caseItem.ndoh, handleChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  return (
    <div className="flex items-center gap-0.5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="DD.MM.YYYY"
        className="
          h-7 w-[90px] px-1.5 rounded border border-[#4472C4]/30 bg-blue-50/50
          text-xs text-[#333] placeholder:text-[#999]
          focus:outline-none focus:ring-2 focus:ring-[#4472C4]/40 focus:border-[#4472C4]
          transition-colors
        "
      />
      <InlineSaveIcon state={saveState} />
    </div>
  );
}

function InlineRemarksInput({
  caseItem,
  onInlineUpdate,
}: {
  readonly caseItem: Case;
  readonly onInlineUpdate?: (id: string, data: Partial<Case>) => Promise<boolean>;
}) {
  const { saveState, handleChange } = useInlineSave(caseItem.id, 'remarks', onInlineUpdate);
  const [value, setValue] = useState(caseItem.remarks || '');

  const handleBlur = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed !== (caseItem.remarks || '')) {
      handleChange(trimmed || null);
    }
  }, [value, caseItem.remarks, handleChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  return (
    <div className="flex items-center gap-0.5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Add remarks..."
        className="
          h-7 w-full min-w-[100px] px-1.5 rounded border border-[#4472C4]/30 bg-blue-50/50
          text-xs text-[#333] placeholder:text-[#999]
          focus:outline-none focus:ring-2 focus:ring-[#4472C4]/40 focus:border-[#4472C4]
          focus:w-[200px] transition-all
        "
        title={caseItem.remarks || ''}
      />
      <InlineSaveIcon state={saveState} />
    </div>
  );
}

// --- Component ---

export default function CaseTable({
  cases,
  sortBy,
  sortOrder,
  onSort,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onEdit,
  onDelete,
  userRole,
  editMode = false,
  onInlineUpdate,
  visibleColumns,
}: CaseTableProps) {
  const allSelected = cases.length > 0 && cases.every((c) => selectedIds.has(c.id));
  const someSelected = cases.some((c) => selectedIds.has(c.id)) && !allSelected;

  // Determine which columns to render
  const visibleSet = visibleColumns ? new Set(visibleColumns) : new Set(DEFAULT_VISIBLE_COLUMNS);
  // Always include checkbox and actions
  visibleSet.add('checkbox');
  visibleSet.add('actions');
  const columns = ALL_COLUMNS.filter((col) => visibleSet.has(col.key));

  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6C757D"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-3 opacity-40"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <p className="text-[#6C757D] text-sm">No cases found matching your filters.</p>
        <p className="text-[#999] text-xs mt-1">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  // Calculate min-width based on visible columns
  const totalWidth = columns.reduce((sum, col) => {
    const w = col.width ? parseInt(col.width, 10) : 120;
    return sum + w;
  }, 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full border-collapse" style={{ minWidth: `${totalWidth}px` }}>
        <thead>
          <tr className="bg-[#F0F2F5]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  px-3 py-3 text-left font-semibold uppercase tracking-wider text-[#6C757D]
                  border-b border-gray-200 sticky top-0 bg-[#F0F2F5] z-10
                  ${col.sortable ? 'cursor-pointer select-none hover:text-[#1B2A4A]' : ''}
                `.trim()}
                style={{ fontSize: '0.7em', width: col.width || 'auto' }}
                onClick={() => {
                  if (col.sortable) onSort(col.key);
                }}
              >
                {col.key === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={onToggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#4472C4] focus:ring-[#4472C4] cursor-pointer"
                  />
                ) : (
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && (
                      <SortIcon
                        active={sortBy === col.key}
                        direction={sortBy === col.key ? sortOrder : 'asc'}
                      />
                    )}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem, rowIndex) => {
            const urgencyClass = getRowUrgencyClass(caseItem.ndoh);
            const isSelected = selectedIds.has(caseItem.id);
            const days = daysUntil(caseItem.ndoh);

            // Row bg: urgency > selection highlight > alternating
            let rowBg = rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]';
            if (urgencyClass) rowBg = urgencyClass;
            if (isSelected) rowBg = `${urgencyClass || ''} ring-1 ring-inset ring-[#4472C4]/20`;

            return (
              <tr
                key={caseItem.id}
                className={`border-b border-gray-100 transition-colors hover:bg-[#F0F2F5] ${rowBg}`}
              >
                {columns.map((col) => {
                  switch (col.key) {
                    case 'checkbox':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(caseItem.id)}
                            className="w-4 h-4 rounded border-gray-300 text-[#4472C4] focus:ring-[#4472C4] cursor-pointer"
                          />
                        </td>
                      );

                    case 'serialNo':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333] font-medium">
                          {caseItem.serialNo}
                        </td>
                      );

                    case 'caseNo':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm">
                          <Link
                            href={`/case-management/cases?view=${caseItem.id}`}
                            className="text-[#4472C4] hover:underline font-medium"
                          >
                            {truncate(caseItem.caseNo, 30)}
                          </Link>
                        </td>
                      );

                    case 'cnrNumber':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.cnrNumber || '-'}
                        </td>
                      );

                    case 'court':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {truncate(caseItem.court, 20)}
                        </td>
                      );

                    case 'bench':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.bench || '-'}
                        </td>
                      );

                    case 'client':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {truncate(caseItem.client, 20)}
                        </td>
                      );

                    case 'caseTitle':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]" title={caseItem.caseTitle}>
                          {truncate(caseItem.caseTitle, 40)}
                        </td>
                      );

                    case 'petitioner':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]" title={caseItem.petitioner}>
                          {truncate(caseItem.petitioner, 25)}
                        </td>
                      );

                    case 'respondent':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]" title={caseItem.respondent}>
                          {truncate(caseItem.respondent, 25)}
                        </td>
                      );

                    case 'ourRole':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.ourRole || '-'}
                        </td>
                      );

                    case 'category':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.category || '-'}
                        </td>
                      );

                    case 'subjectMatter':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]" title={caseItem.subjectMatter || ''}>
                          {truncate(caseItem.subjectMatter, 25)}
                        </td>
                      );

                    case 'department':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.department || '-'}
                        </td>
                      );

                    case 'filingDate':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.filingDate || '-'}
                        </td>
                      );

                    case 'registrationDate':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.registrationDate || '-'}
                        </td>
                      );

                    case 'status':
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          {editMode ? (
                            <InlineStatusSelect caseItem={caseItem} onInlineUpdate={onInlineUpdate} />
                          ) : (
                            <StatusBadge status={caseItem.status} />
                          )}
                        </td>
                      );

                    case 'ndoh':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm">
                          {editMode ? (
                            <InlineNdohInput caseItem={caseItem} onInlineUpdate={onInlineUpdate} />
                          ) : caseItem.ndoh ? (
                            <span className={days !== null && days <= 3 ? 'font-bold text-[#FF4444]' : days !== null && days <= 7 ? 'font-semibold text-[#D97706]' : 'text-[#333333]'}>
                              {caseItem.ndoh}
                              {days !== null && days >= 0 && (
                                <span className="block text-[10px] text-[#6C757D]">
                                  {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d away`}
                                </span>
                              )}
                              {days !== null && days < 0 && (
                                <span className="block text-[10px] text-[#FF4444]">
                                  {Math.abs(days)}d overdue
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[#999]">-</span>
                          )}
                        </td>
                      );

                    case 'previousHearing':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.previousHearing || '-'}
                        </td>
                      );

                    case 'benchNumber':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.benchNumber || '-'}
                        </td>
                      );

                    case 'presidingJudge':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]" title={caseItem.presidingJudge || ''}>
                          {truncate(caseItem.presidingJudge, 20)}
                        </td>
                      );

                    case 'priority':
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          {editMode ? (
                            <InlinePrioritySelect caseItem={caseItem} onInlineUpdate={onInlineUpdate} />
                          ) : (
                            <PriorityBadge priority={caseItem.priority} />
                          )}
                        </td>
                      );

                    case 'linkedCases':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.linkedCases.length > 0 ? caseItem.linkedCases.join(', ') : '-'}
                        </td>
                      );

                    case 'isBatch':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#333333]">
                          {caseItem.isBatch ? (caseItem.batchGroup || 'Yes') : '-'}
                        </td>
                      );

                    case 'remarks':
                      return (
                        <td key={col.key} className="px-3 py-2.5 text-sm text-[#666]" title={caseItem.remarks || ''}>
                          {editMode ? (
                            <InlineRemarksInput caseItem={caseItem} onInlineUpdate={onInlineUpdate} />
                          ) : (
                            truncate(caseItem.remarks, 30)
                          )}
                        </td>
                      );

                    case 'actions':
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/case-management/cases?view=${caseItem.id}`}
                              className="p-1.5 rounded-md text-[#4472C4] hover:bg-blue-50 transition-colors"
                              title="View case"
                            >
                              <EyeIcon />
                            </Link>
                            <button
                              onClick={() => onEdit(caseItem)}
                              className="p-1.5 rounded-md text-[#6C757D] hover:bg-gray-100 hover:text-[#333333] transition-colors"
                              title="Edit case"
                            >
                              <PencilIcon />
                            </button>
                            {userRole === 'superadmin' && (
                              <button
                                onClick={() => onDelete(caseItem)}
                                className="p-1.5 rounded-md text-[#FF4444] hover:bg-red-50 transition-colors"
                                title="Delete case"
                              >
                                <TrashIcon />
                              </button>
                            )}
                          </div>
                        </td>
                      );

                    default:
                      return null;
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
