'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cmsAudit, cmsAuth } from '@/lib/cms-api';
import type { AuditEntry, PaginatedResponse } from '@/lib/cms-types';

// ============================================================
// Design tokens
// ============================================================
const NAVY = '#1B2A4A';
const ACCENT = '#4472C4';
const RED = '#FF4444';
const GREEN = '#28A745';
const GREY = '#6C757D';

// ============================================================
// Helpers
// ============================================================

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${mon} ${year} ${hours}:${mins}`;
}

function actionBadgeStyle(action: string): { bg: string; text: string } {
  switch (action.toLowerCase()) {
    case 'create':
      return { bg: `${GREEN}15`, text: GREEN };
    case 'edit':
      return { bg: `${ACCENT}15`, text: ACCENT };
    case 'delete':
      return { bg: `${RED}15`, text: RED };
    case 'login':
    default:
      return { bg: `${GREY}15`, text: GREY };
  }
}

// ============================================================
// Filter types
// ============================================================

interface AuditFilters {
  actionType: string;
  entityType: string;
  dateFrom: string;
  dateTo: string;
}

const ACTION_TYPES = ['create', 'edit', 'delete', 'login'] as const;
const ENTITY_TYPES = ['case', 'compliance', 'filing', 'user', 'system'] as const;

// ============================================================
// Access Denied
// ============================================================

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${RED}15` }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: NAVY }}>Access Denied</h2>
      <p className="text-sm" style={{ color: GREY }}>
        You do not have permission to view this page. Only superadmins can access audit logs.
      </p>
    </div>
  );
}

// ============================================================
// Loading Skeleton
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-40 bg-gray-200 rounded-md" />
        ))}
      </div>
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-14 bg-gray-200 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="flex-1" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Pagination
// ============================================================

function AuditPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <p className="text-xs" style={{ color: GREY }}>
        {total} total entries
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 rounded-md border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ color: GREY }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e${idx}`} className="w-8 text-center text-xs" style={{ color: GREY }}>...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
                p === page
                  ? 'text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              style={p === page ? { backgroundColor: ACCENT, color: 'white' } : { color: GREY }}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 rounded-md border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ color: GREY }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Export CSV
// ============================================================

function exportCsv(entries: AuditEntry[]) {
  const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Field Changed', 'Old Value', 'New Value'];
  const rows = entries.map((e) => [
    formatTimestamp(e.timestamp),
    e.user?.name || e.userId,
    e.action,
    e.entityType,
    e.entityId || '',
    e.fieldChanged || '',
    e.oldValue || '',
    e.newValue || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// Main Page
// ============================================================

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [filters, setFilters] = useState<AuditFilters>({
    actionType: '',
    entityType: '',
    dateFrom: '',
    dateTo: '',
  });

  // Check auth
  useEffect(() => {
    const user = cmsAuth.getUser();
    if (user && user.role === 'superadmin') {
      setIsSuperadmin(true);
    }
    setAuthChecked(true);
  }, []);

  // Fetch data
  const fetchAudit = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result: PaginatedResponse<AuditEntry> = await cmsAudit.list(pageNum, 20);
      setEntries(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit log.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperadmin) {
      fetchAudit(page);
    } else if (authChecked) {
      setLoading(false);
    }
  }, [isSuperadmin, authChecked, page, fetchAudit]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
  }, []);

  const handleFilterChange = useCallback((key: keyof AuditFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Apply client-side filters (API might not support all filters, so we filter displayed data)
  const filteredEntries = entries.filter((entry) => {
    if (filters.actionType && entry.action.toLowerCase() !== filters.actionType.toLowerCase()) return false;
    if (filters.entityType && entry.entityType.toLowerCase() !== filters.entityType.toLowerCase()) return false;
    if (filters.dateFrom) {
      const entryDate = new Date(entry.timestamp).toISOString().slice(0, 10);
      if (entryDate < filters.dateFrom) return false;
    }
    if (filters.dateTo) {
      const entryDate = new Date(entry.timestamp).toISOString().slice(0, 10);
      if (entryDate > filters.dateTo) return false;
    }
    return true;
  });

  // Access check
  if (authChecked && !isSuperadmin) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Audit Log</h1>
          <p className="text-sm mt-0.5" style={{ color: GREY }}>
            Track all system activity and changes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAudit(page)}
            disabled={loading}
            className="h-9 px-4 rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ color: GREY }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={loading ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => exportCsv(filteredEntries)}
            disabled={filteredEntries.length === 0}
            className="h-9 px-4 rounded-md text-sm font-medium text-white border transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl px-4 py-3 flex flex-wrap items-end gap-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {/* Action Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Action</label>
          <select
            value={filters.actionType}
            onChange={(e) => handleFilterChange('actionType', e.target.value)}
            className="h-9 px-3 pr-8 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 appearance-none"
            style={{
              color: NAVY,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            <option value="">All Actions</option>
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a} className="capitalize">{a.charAt(0).toUpperCase() + a.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Entity Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Entity</label>
          <select
            value={filters.entityType}
            onChange={(e) => handleFilterChange('entityType', e.target.value)}
            className="h-9 px-3 pr-8 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 appearance-none"
            style={{
              color: NAVY,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            <option value="">All Entities</option>
            {ENTITY_TYPES.map((e) => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="h-9 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            style={{ color: NAVY }}
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="h-9 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            style={{ color: NAVY }}
          />
        </div>

        {/* Clear filters */}
        {(filters.actionType || filters.entityType || filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => setFilters({ actionType: '', entityType: '', dateFrom: '', dateTo: '' })}
            className="h-9 px-3 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            style={{ color: GREY }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm flex items-center gap-2" style={{ color: RED }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button onClick={() => fetchAudit(page)} className="ml-auto text-xs font-medium underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Table */}
      {!loading && !error && (
        <>
          {filteredEntries.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${GREY}15` }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: NAVY }}>No audit entries found</p>
              <p className="text-xs" style={{ color: GREY }}>
                {filters.actionType || filters.entityType || filters.dateFrom || filters.dateTo
                  ? 'Try adjusting your filters.'
                  : 'Activity will appear here once users start interacting with the system.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {/* Desktop Table */}
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: `${NAVY}08` }}>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>Timestamp</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>User</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>Action</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>Entity</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>Entity ID</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: GREY }}>Field</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider hidden xl:table-cell" style={{ color: GREY }}>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry, idx) => {
                      const badge = actionBadgeStyle(entry.action);
                      return (
                        <tr
                          key={entry.id}
                          className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                          style={{ backgroundColor: idx % 2 === 1 ? '#FAFBFC' : 'white' }}
                        >
                          <td className="px-6 py-3 whitespace-nowrap" style={{ color: '#555' }}>
                            {formatTimestamp(entry.timestamp)}
                          </td>
                          <td className="px-6 py-3 font-medium" style={{ color: NAVY }}>
                            {entry.user?.name || entry.userId}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                              style={{ backgroundColor: badge.bg, color: badge.text }}
                            >
                              {entry.action}
                            </span>
                          </td>
                          <td className="px-6 py-3 capitalize" style={{ color: '#555' }}>
                            {entry.entityType}
                          </td>
                          <td className="px-6 py-3 font-mono text-xs" style={{ color: GREY }}>
                            {entry.entityId || '\u2014'}
                          </td>
                          <td className="px-6 py-3 hidden lg:table-cell" style={{ color: '#555' }}>
                            {entry.fieldChanged || '\u2014'}
                          </td>
                          <td className="px-6 py-3 hidden xl:table-cell max-w-xs">
                            {entry.oldValue || entry.newValue ? (
                              <span className="text-xs" style={{ color: '#555' }}>
                                {entry.oldValue && (
                                  <span className="line-through mr-1" style={{ color: RED }}>
                                    {entry.oldValue}
                                  </span>
                                )}
                                {entry.oldValue && entry.newValue && (
                                  <span style={{ color: GREY }}>{'\u2192'} </span>
                                )}
                                {entry.newValue && (
                                  <span style={{ color: GREEN }}>{entry.newValue}</span>
                                )}
                              </span>
                            ) : (
                              <span style={{ color: GREY }}>{'\u2014'}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {filteredEntries.map((entry) => {
                  const badge = actionBadgeStyle(entry.action);
                  return (
                    <div key={entry.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: GREY }}>{formatTimestamp(entry.timestamp)}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                        >
                          {entry.action}
                        </span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: NAVY }}>{entry.user?.name || entry.userId}</p>
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#555' }}>
                        <span className="capitalize">{entry.entityType}</span>
                        {entry.entityId && (
                          <>
                            <span style={{ color: GREY }}>{'\u00B7'}</span>
                            <span className="font-mono" style={{ color: GREY }}>{entry.entityId}</span>
                          </>
                        )}
                      </div>
                      {entry.fieldChanged && (
                        <p className="text-xs" style={{ color: GREY }}>
                          Field: <span style={{ color: '#555' }}>{entry.fieldChanged}</span>
                        </p>
                      )}
                      {(entry.oldValue || entry.newValue) && (
                        <div className="text-xs">
                          {entry.oldValue && <span className="line-through mr-1" style={{ color: RED }}>{entry.oldValue}</span>}
                          {entry.oldValue && entry.newValue && <span style={{ color: GREY }}>{'\u2192'} </span>}
                          {entry.newValue && <span style={{ color: GREEN }}>{entry.newValue}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          <AuditPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
