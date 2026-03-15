'use client';

import React from 'react';
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
}

// --- Column Definitions ---

interface ColumnDef {
  readonly key: string;
  readonly label: string;
  readonly sortable: boolean;
  readonly width?: string;
}

const COLUMNS: readonly ColumnDef[] = [
  { key: 'checkbox', label: '', sortable: false, width: '40px' },
  { key: 'serialNo', label: 'S.No.', sortable: true, width: '60px' },
  { key: 'caseNo', label: 'Case No.', sortable: true, width: '200px' },
  { key: 'court', label: 'Court', sortable: true, width: '140px' },
  { key: 'client', label: 'Client', sortable: true, width: '130px' },
  { key: 'caseTitle', label: 'Title', sortable: true, width: '200px' },
  { key: 'ourRole', label: 'Role', sortable: true, width: '100px' },
  { key: 'department', label: 'Department', sortable: true, width: '120px' },
  { key: 'status', label: 'Status', sortable: true, width: '130px' },
  { key: 'ndoh', label: 'NDOH', sortable: true, width: '100px' },
  { key: 'priority', label: 'Priority', sortable: true, width: '90px' },
  { key: 'remarks', label: 'Remarks', sortable: false, width: '160px' },
  { key: 'actions', label: 'Actions', sortable: false, width: '110px' },
];

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
}: CaseTableProps) {
  const allSelected = cases.length > 0 && cases.every((c) => selectedIds.has(c.id));
  const someSelected = cases.some((c) => selectedIds.has(c.id)) && !allSelected;

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

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full border-collapse" style={{ minWidth: '1400px' }}>
        <thead>
          <tr className="bg-[#F0F2F5]">
            {COLUMNS.map((col) => (
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
                {/* Checkbox */}
                <td className="px-3 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(caseItem.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#4472C4] focus:ring-[#4472C4] cursor-pointer"
                  />
                </td>

                {/* S.No. */}
                <td className="px-3 py-2.5 text-sm text-[#333333] font-medium">
                  {caseItem.serialNo}
                </td>

                {/* Case No. */}
                <td className="px-3 py-2.5 text-sm">
                  <Link
                    href={`/case-management/cases/${caseItem.id}`}
                    className="text-[#4472C4] hover:underline font-medium"
                  >
                    {truncate(caseItem.caseNo, 30)}
                  </Link>
                </td>

                {/* Court */}
                <td className="px-3 py-2.5 text-sm text-[#333333]">
                  {truncate(caseItem.court, 20)}
                </td>

                {/* Client */}
                <td className="px-3 py-2.5 text-sm text-[#333333]">
                  {truncate(caseItem.client, 20)}
                </td>

                {/* Title */}
                <td className="px-3 py-2.5 text-sm text-[#333333]" title={caseItem.caseTitle}>
                  {truncate(caseItem.caseTitle, 40)}
                </td>

                {/* Role */}
                <td className="px-3 py-2.5 text-sm text-[#333333]">
                  {caseItem.ourRole || '-'}
                </td>

                {/* Department */}
                <td className="px-3 py-2.5 text-sm text-[#333333]">
                  {caseItem.department || '-'}
                </td>

                {/* Status */}
                <td className="px-3 py-2.5">
                  <StatusBadge status={caseItem.status} />
                </td>

                {/* NDOH */}
                <td className="px-3 py-2.5 text-sm">
                  {caseItem.ndoh ? (
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

                {/* Priority */}
                <td className="px-3 py-2.5">
                  <PriorityBadge priority={caseItem.priority} />
                </td>

                {/* Remarks */}
                <td className="px-3 py-2.5 text-sm text-[#666]" title={caseItem.remarks || ''}>
                  {truncate(caseItem.remarks, 30)}
                </td>

                {/* Actions */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/case-management/cases/${caseItem.id}`}
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
