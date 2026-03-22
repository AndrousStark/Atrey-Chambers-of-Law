'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cmsScraper, cmsScraperJobs, cmsAuth } from '@/lib/cms-api';
import type { ScraperStatus, ScraperConflict } from '@/lib/cms-api';
import { CmsToastProvider, useToast } from '@/components/cms/ui';
import { RefreshCw, FileText, Scale, Building2, Gavel, Clock, Play, Database, Zap } from 'lucide-react';

// ============================================================
// Design tokens
// ============================================================
const NAVY = '#1B2A4A';
const ACCENT = '#4472C4';
const GREEN = '#28A745';
const RED = '#FF4444';
const GREY = '#6C757D';
const TH = 'text-left px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider';

// ============================================================
// Helpers
// ============================================================

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never run';
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${day} ${mo[d.getMonth()]} ${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function Spinner({ size = 16 }: { readonly size?: number }) {
  return <div className="border-2 border-current border-t-transparent rounded-full animate-spin" style={{ width: size, height: size }} />;
}

// ============================================================
// Job card config
// ============================================================

interface JobConfig {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly color: string;
  readonly icon: React.ElementType;
  readonly buttonLabel: string;
}

const JOBS: readonly JobConfig[] = [
  { id: 'causeList', title: 'Cause List Fetch', description: 'Download SCI cause list PDFs and update hearing dates. No CAPTCHA needed \u2014 100% reliable.', color: GREEN, icon: FileText, buttonLabel: 'Run Cause List' },
  { id: 'sciRefresh', title: 'SCI Full Refresh', description: 'Scrape sci.gov.in for all active Supreme Court cases. Uses CAPTCHA solver (~70% accuracy).', color: '#4472C4', icon: Scale, buttonLabel: 'Run SCI Scraper' },
  { id: 'dailyNdoh', title: 'Daily NDOH Update', description: 'Fetch status updates for cases with hearings in the next 14 days.', color: '#E67E22', icon: Clock, buttonLabel: 'Run NDOH Fetch' },
  { id: 'ecourts', title: 'eCourts HC/DC Refresh', description: 'Refresh High Court and District Court cases via eCourts API.', color: '#8E44AD', icon: Building2, buttonLabel: 'Run eCourts' },
  { id: 'tribunals', title: 'Tribunal Refresh', description: 'Refresh NCLT, NCLAT, ITAT, NGT, CAT tribunal cases.', color: '#17A2B8', icon: Gavel, buttonLabel: 'Run Tribunals' },
];

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
  const [status, setStatus] = useState<ScraperStatus>({ lastRun: null, casesUpdated: 0, errors: 0, isRunning: false });
  const [conflicts, setConflicts] = useState<ScraperConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJobs, setRunningJobs] = useState<Record<string, boolean>>({});
  const [causeListDays, setCauseListDays] = useState(7);
  const [fetchingCase, setFetchingCase] = useState(false);
  const [singleCaseId, setSingleCaseId] = useState('');
  const [singleCaseResult, setSingleCaseResult] = useState<{ success: boolean; message: string } | null>(null);
  const [resolvingKey, setResolvingKey] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Auth check (superadmin + editor) ---
  useEffect(() => {
    const user = cmsAuth.getUser();
    if (user && (user.role === 'superadmin' || user.role === 'editor')) setHasAccess(true);
  }, []);

  // --- Load data ---
  const loadData = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([cmsScraper.getStatus(), cmsScraper.getConflicts()]);
      setStatus(s);
      setConflicts(c);
    } catch { /* status card shows defaults */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- Polling while any job is running ---
  const anyRunning = status.isRunning || Object.values(runningJobs).some(Boolean);

  useEffect(() => {
    if (!anyRunning) return;
    pollingRef.current = setInterval(async () => {
      try {
        const s = await cmsScraper.getStatus();
        setStatus(s);
        if (!s.isRunning) loadData();
      } catch { /* ignore */ }
    }, 10000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [anyRunning, loadData]);

  // --- Run a job ---
  const runJob = useCallback(async (jobId: string) => {
    setRunningJobs((prev) => ({ ...prev, [jobId]: true }));
    try {
      const apiMap: Record<string, () => Promise<{ message: string }>> = {
        causeList: () => cmsScraperJobs.runCauseListFetch(causeListDays),
        sciRefresh: () => cmsScraperJobs.runSciRefresh(),
        dailyNdoh: () => cmsScraperJobs.runDailyNdoh(),
        ecourts: () => cmsScraperJobs.runEcourtsRefresh(),
        tribunals: () => cmsScraperJobs.runTribunalRefresh(),
      };
      const result = await (apiMap[jobId] ?? (() => Promise.reject(new Error('Unknown job'))))();
      showToast('success', result.message);
      await loadData();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Job failed');
    } finally {
      setRunningJobs((prev) => ({ ...prev, [jobId]: false }));
    }
  }, [causeListDays, loadData, showToast]);

  // --- Fetch Single Case ---
  const handleFetchCase = useCallback(async () => {
    if (!singleCaseId.trim()) return;
    setFetchingCase(true);
    setSingleCaseResult(null);
    try {
      const result = await cmsScraper.fetchCase(singleCaseId.trim());
      setSingleCaseResult(result);
      showToast(result.success ? 'success' : 'error', result.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fetch failed';
      setSingleCaseResult({ success: false, message: msg });
      showToast('error', msg);
    } finally { setFetchingCase(false); }
  }, [singleCaseId, showToast]);

  // --- Resolve Conflict ---
  const handleResolve = useCallback(async (caseId: string, field: string, acceptAuto: boolean) => {
    const key = `${caseId}-${field}`;
    setResolvingKey(key);
    try {
      await cmsScraper.resolveConflict(caseId, field, acceptAuto);
      setConflicts((prev) => prev.filter((c) => !(c.caseId === caseId && c.field === field)));
      showToast('success', acceptAuto ? 'Accepted auto-fetched value' : 'Kept manual value');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to resolve conflict');
    } finally { setResolvingKey(null); }
  }, [showToast]);

  // --- Access denied ---
  if (!hasAccess && !loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-xl p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Database size={48} className="mx-auto mb-4" style={{ color: GREY }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: NAVY }}>Access Restricted</h2>
          <p className="text-sm" style={{ color: GREY }}>Only superadmins and editors can access the Auto-Fetch Engine.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 animate-pulse space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-200 rounded" />
        <div className="bg-white rounded-xl h-20" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        <div className="bg-white rounded-xl h-64" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Zap size={24} style={{ color: ACCENT }} />
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Auto-Fetch Engine</h1>
        </div>
        <p className="text-sm" style={{ color: GREY }}>On-demand scraper jobs for SCI, High Courts, District Courts, and Tribunals</p>
      </div>

      {/* Compact Status Row */}
      <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap items-center gap-x-8 gap-y-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <StatusItem label="Last Run" value={formatDateTime(status.lastRun)} />
        <StatusItem label="Cases Updated" value={String(status.casesUpdated)} />
        <StatusItem label="Errors" value={String(status.errors)} valueColor={status.errors > 0 ? RED : undefined} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>Status</span>
          {anyRunning
            ? <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: ACCENT }}><Spinner size={12} /> Running</span>
            : <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${GREEN}15`, color: GREEN }}><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GREEN }} />Idle</span>}
        </div>
      </div>

      {/* Job Runner Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {JOBS.map((job) => {
          const running = runningJobs[job.id] ?? false;
          const Icon = job.icon;
          return (
            <div key={job.id} className="bg-white rounded-xl overflow-hidden" style={{ borderLeft: `4px solid ${job.color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${job.color}10` }}>
                    <Icon size={20} style={{ color: job.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold" style={{ color: NAVY }}>{job.title}</h3>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: GREY }}>{job.description}</p>
                  </div>
                </div>
                {job.id === 'causeList' && (
                  <div className="mt-3 flex items-center gap-2">
                    <label className="text-xs font-medium" style={{ color: GREY }}>Days:</label>
                    <input type="number" min={1} max={30} value={causeListDays}
                      onChange={(e) => setCauseListDays(Math.max(1, Math.min(30, Number(e.target.value) || 7)))}
                      className="w-16 h-7 px-2 rounded border border-gray-300 text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#28A745]/30" />
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-medium" style={{ color: GREY }}>
                    <Clock size={10} className="inline mr-1" style={{ verticalAlign: '-1px' }} />
                    {status.lastRun ? `Last: ${timeAgo(status.lastRun)}` : 'Never run'}
                  </span>
                  <button onClick={() => runJob(job.id)} disabled={running}
                    className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ backgroundColor: job.color }}>
                    {running ? <><Spinner size={12} /> Running...</> : <><Play size={12} /> {job.buttonLabel}</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Case Fetch */}
      <div className="bg-white rounded-xl p-6 mb-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: NAVY }}>
          <Database size={14} className="inline mr-1.5" style={{ verticalAlign: '-2px' }} />
          Fetch Individual Case
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={singleCaseId}
            onChange={(e) => { setSingleCaseId(e.target.value); setSingleCaseResult(null); }}
            placeholder="Enter Case ID to fetch individual case"
            className="flex-1 h-10 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30"
            onKeyDown={(e) => { if (e.key === 'Enter') handleFetchCase(); }} />
          <button onClick={handleFetchCase} disabled={fetchingCase || !singleCaseId.trim()}
            className="h-10 px-6 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: ACCENT }}>
            {fetchingCase ? <><Spinner size={14} /> Fetching...</> : <><RefreshCw size={14} /> Fetch</>}
          </button>
        </div>
        {singleCaseResult && (
          <div className="mt-3 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2" style={{
            backgroundColor: singleCaseResult.success ? `${GREEN}10` : `${RED}10`,
            color: singleCaseResult.success ? GREEN : RED,
            border: `1px solid ${singleCaseResult.success ? `${GREEN}30` : `${RED}30`}`,
          }}>{singleCaseResult.message}</div>
        )}
      </div>

      {/* Conflict Resolution */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div className="px-6 py-4 flex items-center gap-2 border-b border-gray-100">
          <h2 className="text-sm font-bold" style={{ color: NAVY }}>Data Conflicts</h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: conflicts.length > 0 ? `${RED}15` : `${GREEN}15`, color: conflicts.length > 0 ? RED : GREEN }}>
            {conflicts.length}
          </span>
        </div>
        {conflicts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <RefreshCw size={40} className="mx-auto mb-3" style={{ color: GREEN }} />
            <p className="text-sm font-medium" style={{ color: GREEN }}>No conflicts &mdash; all data is in sync</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: `${NAVY}05` }}>
                  <th className={TH} style={{ color: GREY }}>Case No.</th>
                  <th className={TH} style={{ color: GREY }}>Field</th>
                  <th className={TH} style={{ color: GREY }}>Manual Value</th>
                  <th className={TH} style={{ color: GREY }}>Auto-Fetched Value</th>
                  <th className={`${TH} hidden sm:table-cell`} style={{ color: GREY }}>Fetched At</th>
                  <th className={TH} style={{ color: GREY }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conflicts.map((c, idx) => {
                  const key = `${c.caseId}-${c.field}`;
                  const resolving = resolvingKey === key;
                  return (
                    <tr key={key} className="border-t border-gray-100" style={{ backgroundColor: idx % 2 === 1 ? '#FAFBFC' : 'white' }}>
                      <td className="px-6 py-3 font-medium whitespace-nowrap" style={{ color: NAVY }}>{c.caseNo}</td>
                      <td className="px-6 py-3 whitespace-nowrap" style={{ color: '#555' }}>{c.field}</td>
                      <td className="px-6 py-3 max-w-xs" style={{ color: NAVY }}><span className="line-clamp-2">{c.manualValue}</span></td>
                      <td className="px-6 py-3 max-w-xs" style={{ color: ACCENT }}><span className="line-clamp-2">{c.autoValue}</span></td>
                      <td className="px-6 py-3 whitespace-nowrap hidden sm:table-cell" style={{ color: GREY }}>{formatDateTime(c.fetchedAt)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleResolve(c.caseId, c.field, true)} disabled={resolving}
                            className="h-7 px-3 rounded text-[11px] font-medium text-white disabled:opacity-50 flex items-center gap-1"
                            style={{ backgroundColor: GREEN }}>
                            {resolving && <Spinner size={10} />} Accept Auto
                          </button>
                          <button onClick={() => handleResolve(c.caseId, c.field, false)} disabled={resolving}
                            className="h-7 px-3 rounded text-[11px] font-medium border disabled:opacity-50"
                            style={{ color: GREY, borderColor: '#D1D5DB' }}>
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
    </div>
  );
}

function StatusItem({ label, value, valueColor }: { readonly label: string; readonly value: string; readonly valueColor?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: valueColor ?? NAVY }}>{value}</span>
    </div>
  );
}
