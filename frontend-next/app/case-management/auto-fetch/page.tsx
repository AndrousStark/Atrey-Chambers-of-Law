'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cmsScraper, cmsAuth } from '@/lib/cms-api';
import type { ScraperStatus, ScraperConflict } from '@/lib/cms-api';
import { CmsToastProvider, useToast } from '@/components/cms/ui';

// ============================================================
// Design tokens
// ============================================================
const NAVY = '#1B2A4A';
const ACCENT = '#4472C4';
const GREEN = '#28A745';
const RED = '#FF4444';
const GREY = '#6C757D';
const BG = '#F0F2F5';

// ============================================================
// Helpers
// ============================================================

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never run';
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()} ${hours}:${mins}`;
}

// ============================================================
// Spinner
// ============================================================

function Spinner({ size = 16 }: { readonly size?: number }) {
  return (
    <div
      className="border-2 border-current border-t-transparent rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}

// ============================================================
// Main Page
// ============================================================

export default function AutoFetchPage() {
  return (
    <CmsToastProvider>
      <AutoFetchContent />
    </CmsToastProvider>
  );
}

function AutoFetchContent() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<ScraperStatus>({
    lastRun: null,
    casesUpdated: 0,
    errors: 0,
    isRunning: false,
  });
  const [conflicts, setConflicts] = useState<ScraperConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [fetchingCase, setFetchingCase] = useState(false);
  const [singleCaseId, setSingleCaseId] = useState('');
  const [singleCaseResult, setSingleCaseResult] = useState<{ success: boolean; message: string } | null>(null);
  const [resolvingKey, setResolvingKey] = useState<string | null>(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Auth check ---
  useEffect(() => {
    const user = cmsAuth.getUser();
    if (user && user.role === 'superadmin') {
      setIsSuperadmin(true);
    }
  }, []);

  // --- Load data ---
  const loadData = useCallback(async () => {
    try {
      const [statusResult, conflictsResult] = await Promise.all([
        cmsScraper.getStatus(),
        cmsScraper.getConflicts(),
      ]);
      setStatus(statusResult);
      setConflicts(conflictsResult);
    } catch {
      // Silently handle — status card shows defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Polling while running ---
  useEffect(() => {
    if (status.isRunning || fetchingAll) {
      pollingRef.current = setInterval(async () => {
        try {
          const s = await cmsScraper.getStatus();
          setStatus(s);
          if (!s.isRunning) {
            setFetchingAll(false);
            if (pollingRef.current) clearInterval(pollingRef.current);
            loadData();
          }
        } catch {
          // ignore polling errors
        }
      }, 10000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [status.isRunning, fetchingAll, loadData]);

  // --- Fetch All ---
  const handleFetchAll = useCallback(async () => {
    setFetchingAll(true);
    try {
      const result = await cmsScraper.fetchAll();
      showToast('success', result.message);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fetch failed';
      showToast('error', msg);
    } finally {
      setFetchingAll(false);
    }
  }, [loadData, showToast]);

  // --- Fetch Single Case ---
  const handleFetchCase = useCallback(async () => {
    if (!singleCaseId.trim()) return;
    setFetchingCase(true);
    setSingleCaseResult(null);
    try {
      const result = await cmsScraper.fetchCase(singleCaseId.trim());
      setSingleCaseResult(result);
      if (result.success) {
        showToast('success', result.message);
      } else {
        showToast('error', result.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fetch failed';
      setSingleCaseResult({ success: false, message: msg });
      showToast('error', msg);
    } finally {
      setFetchingCase(false);
    }
  }, [singleCaseId, showToast]);

  // --- Resolve Conflict ---
  const handleResolveConflict = useCallback(async (caseId: string, field: string, acceptAuto: boolean) => {
    const key = `${caseId}-${field}`;
    setResolvingKey(key);
    try {
      await cmsScraper.resolveConflict(caseId, field, acceptAuto);
      setConflicts((prev) => prev.filter((c) => !(c.caseId === caseId && c.field === field)));
      showToast('success', acceptAuto ? 'Accepted auto-fetched value' : 'Kept manual value');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resolve conflict';
      showToast('error', msg);
    } finally {
      setResolvingKey(null);
    }
  }, [showToast]);

  // --- Not superadmin ---
  if (!isSuperadmin && !loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div
          className="bg-white rounded-xl p-12 text-center"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h2 className="text-lg font-bold mb-2" style={{ color: NAVY }}>Access Restricted</h2>
          <p className="text-sm" style={{ color: GREY }}>Only superadmins can access the Auto-Fetch Engine.</p>
        </div>
      </div>
    );
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 animate-pulse space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-200 rounded" />
        <div className="bg-white rounded-xl h-28" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        <div className="bg-white rounded-xl h-64" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
      </div>
    );
  }

  const isRunning = status.isRunning || fetchingAll;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>
            Auto-Fetch Engine
          </h1>
          <p className="text-sm mt-1" style={{ color: GREY }}>
            Supreme Court of India &mdash; sci.gov.in
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Last run badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: status.lastRun ? `${ACCENT}12` : `${GREY}12`,
              color: status.lastRun ? ACCENT : GREY,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Last run: {status.lastRun ? timeAgo(status.lastRun) : 'Never'}
          </span>

          {/* Fetch All button */}
          <button
            onClick={handleFetchAll}
            disabled={isRunning}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            {isRunning ? (
              <>
                <Spinner size={16} />
                Running...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Fetch All Cases
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div
        className="bg-white rounded-xl p-6 mb-6"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <h2 className="text-sm font-bold mb-4" style={{ color: NAVY }}>
          Fetch Status
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Last Run */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>
              Last Run
            </p>
            <p className="text-sm font-medium" style={{ color: NAVY }}>
              {formatDateTime(status.lastRun)}
            </p>
          </div>
          {/* Cases Updated */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>
              Cases Updated
            </p>
            <p className="text-sm font-medium" style={{ color: NAVY }}>
              {status.casesUpdated}
            </p>
          </div>
          {/* Errors */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>
              Errors
            </p>
            <p className="text-sm font-medium" style={{ color: status.errors > 0 ? RED : NAVY }}>
              {status.errors}
            </p>
          </div>
          {/* Running */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>
              Status
            </p>
            <div className="flex items-center gap-2">
              {isRunning ? (
                <>
                  <Spinner size={14} />
                  <span className="text-sm font-medium" style={{ color: ACCENT }}>Running</span>
                </>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${GREEN}15`, color: GREEN }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GREEN }} />
                  Idle
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conflicts Section */}
      <div
        className="bg-white rounded-xl overflow-hidden mb-6"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <div className="px-6 py-4 flex items-center gap-2 border-b border-gray-100">
          <h2 className="text-sm font-bold" style={{ color: NAVY }}>
            Data Conflicts
          </h2>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: conflicts.length > 0 ? `${RED}15` : `${GREEN}15`,
              color: conflicts.length > 0 ? RED : GREEN,
            }}
          >
            {conflicts.length}
          </span>
        </div>

        {conflicts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-sm font-medium" style={{ color: GREEN }}>
              No conflicts &mdash; all data is in sync
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: `${NAVY}05` }}>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Case No.</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Field</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Manual Value</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Auto-Fetched Value</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: GREY }}>Fetched At</th>
                  <th className="text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conflicts.map((conflict, idx) => {
                  const key = `${conflict.caseId}-${conflict.field}`;
                  const isResolving = resolvingKey === key;

                  return (
                    <tr
                      key={key}
                      className="border-t border-gray-100"
                      style={{ backgroundColor: idx % 2 === 1 ? '#FAFBFC' : 'white' }}
                    >
                      <td className="px-6 py-3 font-medium whitespace-nowrap" style={{ color: NAVY }}>
                        {conflict.caseNo}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap" style={{ color: '#555' }}>
                        {conflict.field}
                      </td>
                      <td className="px-6 py-3 max-w-xs" style={{ color: NAVY }}>
                        <span className="line-clamp-2">{conflict.manualValue}</span>
                      </td>
                      <td className="px-6 py-3 max-w-xs" style={{ color: ACCENT }}>
                        <span className="line-clamp-2">{conflict.autoValue}</span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap hidden sm:table-cell" style={{ color: GREY }}>
                        {formatDateTime(conflict.fetchedAt)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveConflict(conflict.caseId, conflict.field, true)}
                            disabled={isResolving}
                            className="h-7 px-3 rounded text-[11px] font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                            style={{ backgroundColor: GREEN }}
                          >
                            {isResolving && <Spinner size={10} />}
                            Accept Auto
                          </button>
                          <button
                            onClick={() => handleResolveConflict(conflict.caseId, conflict.field, false)}
                            disabled={isResolving}
                            className="h-7 px-3 rounded text-[11px] font-medium border transition-colors disabled:opacity-50"
                            style={{ color: GREY, borderColor: '#D1D5DB' }}
                          >
                            Keep Manual
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Per-Case Fetch */}
      <div
        className="bg-white rounded-xl p-6 mb-6"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <h2 className="text-sm font-bold mb-4" style={{ color: NAVY }}>
          Fetch Individual Case
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={singleCaseId}
            onChange={(e) => {
              setSingleCaseId(e.target.value);
              setSingleCaseResult(null);
            }}
            placeholder="Enter Case ID to fetch individual case"
            className="flex-1 h-10 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFetchCase();
            }}
          />
          <button
            onClick={handleFetchCase}
            disabled={fetchingCase || !singleCaseId.trim()}
            className="h-10 px-6 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: ACCENT }}
          >
            {fetchingCase ? (
              <>
                <Spinner size={14} />
                Fetching...
              </>
            ) : (
              'Fetch'
            )}
          </button>
        </div>
        {singleCaseResult && (
          <div
            className="mt-3 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2"
            style={{
              backgroundColor: singleCaseResult.success ? `${GREEN}10` : `${RED}10`,
              color: singleCaseResult.success ? GREEN : RED,
              border: `1px solid ${singleCaseResult.success ? `${GREEN}30` : `${RED}30`}`,
            }}
          >
            {singleCaseResult.success ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            {singleCaseResult.message}
          </div>
        )}
      </div>

      {/* Schedule Info */}
      <div
        className="bg-white rounded-xl p-6"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        <h2 className="text-sm font-bold mb-4" style={{ color: NAVY }}>
          Scheduled Runs
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${ACCENT}12` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: NAVY }}>
                Daily at 6:00 AM IST
              </p>
              <p className="text-xs mt-0.5" style={{ color: GREY }}>
                Cases with hearings in the next 14 days
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${ACCENT}12` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: NAVY }}>
                Weekly Sunday at midnight IST
              </p>
              <p className="text-xs mt-0.5" style={{ color: GREY }}>
                Full refresh of all active cases
              </p>
            </div>
          </div>
        </div>
        <div
          className="mt-4 px-4 py-2.5 rounded-lg text-xs"
          style={{ backgroundColor: BG, color: GREY }}
        >
          Scheduled jobs run on the backend. This panel is for monitoring and manual triggers only.
        </div>
      </div>

    </div>
  );
}
