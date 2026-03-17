'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  cmsAuth,
  cmsCases,
  cmsCompliance,
  cmsFilings,
  cmsExport,
  cmsImport,
  cmsUsers,
  clearAllMockCases,
} from '@/lib/cms-api';
import type { ImportResult } from '@/lib/cms-api';

// ============================================================
// Design tokens
// ============================================================
const NAVY = '#1B2A4A';
const ACCENT = '#4472C4';
const RED = '#FF4444';
const GREEN = '#28A745';
const GREY = '#6C757D';
const BG = '#F0F2F5';

const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:4000';
const USE_MOCK = process.env.NEXT_PUBLIC_CMS_MOCK === 'true' || !process.env.NEXT_PUBLIC_CMS_API_URL;

// ============================================================
// Helpers
// ============================================================

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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
        You do not have permission to view this page. Only superadmins can access settings.
      </p>
    </div>
  );
}

// ============================================================
// Progress Bar
// ============================================================

function ProgressBar({
  current,
  total,
  label,
}: {
  readonly current: number;
  readonly total: number;
  readonly label?: string;
}) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      {label && (
        <p className="text-xs font-medium mb-1" style={{ color: GREY }}>
          {label}
        </p>
      )}
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: ACCENT }}
        />
      </div>
      <p className="text-xs mt-1" style={{ color: GREY }}>
        {current} of {total} ({percent}%)
      </p>
    </div>
  );
}

// ============================================================
// CSV Preview Table
// ============================================================

function CsvPreviewTable({
  headers,
  rows,
}: {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
}) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-xs">
        <thead>
          <tr style={{ backgroundColor: `${NAVY}08` }}>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: GREY }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="border-t border-gray-100" style={{ backgroundColor: rIdx % 2 === 1 ? '#FAFBFC' : 'white' }}>
              {headers.map((_, cIdx) => (
                <td key={cIdx} className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate" style={{ color: '#555' }}>
                  {row[cIdx] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Import Error Summary
// ============================================================

function ImportErrorSummary({ result }: { readonly result: ImportResult }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md" style={{ backgroundColor: `${GREEN}15`, color: GREEN }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-xs font-semibold">{result.successCount} imported</span>
        </div>
        {result.failedCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md" style={{ backgroundColor: `${RED}15`, color: RED }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span className="text-xs font-semibold">{result.failedCount} failed</span>
          </div>
        )}
      </div>
      {result.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
          <p className="text-xs font-semibold mb-1" style={{ color: RED }}>Failed Rows:</p>
          <ul className="space-y-0.5">
            {result.errors.map((e, i) => (
              <li key={i} className="text-xs" style={{ color: '#555' }}>
                <span className="font-mono" style={{ color: RED }}>Row {e.row}:</span> {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Section Card
// ============================================================

function SectionCard({
  title,
  description,
  icon,
  children,
  borderColor,
}: {
  readonly title: string;
  readonly description?: string;
  readonly icon: React.ReactNode;
  readonly children: React.ReactNode;
  readonly borderColor?: string;
}) {
  return (
    <div
      className="bg-white rounded-xl p-6"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: borderColor ? `4px solid ${borderColor}` : undefined,
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${borderColor || ACCENT}12` }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: NAVY }}>{title}</h2>
          {description && (
            <p className="text-xs mt-0.5" style={{ color: GREY }}>{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function SettingsPage() {
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Export state
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreviewRows, setCsvPreviewRows] = useState<string[][]>([]);
  const [csvTotalRows, setCsvTotalRows] = useState(0);
  const [csvRawText, setCsvRawText] = useState('');
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvProgress, setCsvProgress] = useState({ current: 0, total: 0 });
  const [csvResult, setCsvResult] = useState<ImportResult | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // JSON import state
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonSummary, setJsonSummary] = useState<{ cases: number; compliance: number; filings: number } | null>(null);
  const [jsonRawData, setJsonRawData] = useState<Record<string, unknown> | null>(null);
  const [jsonImporting, setJsonImporting] = useState(false);
  const [jsonProgress, setJsonProgress] = useState({ current: 0, total: 0, type: '' });
  const [jsonResult, setJsonResult] = useState<ImportResult | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // System info state
  const [systemInfo, setSystemInfo] = useState({
    totalCases: 0,
    totalUsers: 0,
    totalCompliance: 0,
    totalFilings: 0,
  });
  const [loadingInfo, setLoadingInfo] = useState(true);

  // Danger zone state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Check auth
  useEffect(() => {
    const user = cmsAuth.getUser();
    if (user && user.role === 'superadmin') {
      setIsSuperadmin(true);
    }
    setAuthChecked(true);
  }, []);

  // Load system info
  const loadSystemInfo = useCallback(async () => {
    setLoadingInfo(true);
    try {
      const [casesResult, users, compliance, filings] = await Promise.all([
        cmsCases.list({ limit: 1 }),
        cmsUsers.list(),
        cmsCompliance.list(),
        cmsFilings.list(),
      ]);
      setSystemInfo({
        totalCases: casesResult.total,
        totalUsers: users.length,
        totalCompliance: compliance.length,
        totalFilings: filings.length,
      });
    } catch {
      // Silently fail — just show 0s
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperadmin) {
      loadSystemInfo();
    }
  }, [isSuperadmin, loadSystemInfo]);

  // ---- Export handlers ----

  const handleExportCsv = useCallback(async () => {
    setExportingCsv(true);
    try {
      const csvText = await cmsExport.casesToCsv();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `cases-export-${todayIso()}.csv`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export CSV');
    } finally {
      setExportingCsv(false);
    }
  }, []);

  const handleExportJson = useCallback(async () => {
    setExportingJson(true);
    try {
      const data = await cmsExport.allDataToJson();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      downloadBlob(blob, `cms-backup-${todayIso()}.json`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export JSON');
    } finally {
      setExportingJson(false);
    }
  }, []);

  // ---- CSV import handlers ----

  const handleCsvFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvRawText(text);

      // Simple CSV parse for preview
      const lines = text.split('\n').filter((line) => line.trim().length > 0);
      if (lines.length < 1) {
        setCsvHeaders([]);
        setCsvPreviewRows([]);
        setCsvTotalRows(0);
        return;
      }

      // Parse just headers and first 5 rows for preview
      const parseRow = (line: string): string[] => {
        const fields: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') {
              current += '"';
              i++;
            } else if (ch === '"') {
              inQuotes = false;
            } else {
              current += ch;
            }
          } else if (ch === '"') {
            inQuotes = true;
          } else if (ch === ',') {
            fields.push(current.trim());
            current = '';
          } else if (ch !== '\r') {
            current += ch;
          }
        }
        fields.push(current.trim());
        return fields;
      };

      const headers = parseRow(lines[0]);
      const dataLines = lines.slice(1);
      const previewRows = dataLines.slice(0, 5).map(parseRow);

      setCsvHeaders(headers);
      setCsvPreviewRows(previewRows);
      setCsvTotalRows(dataLines.length);
    };
    reader.readAsText(file);
  }, []);

  const handleCsvImport = useCallback(async () => {
    if (!csvRawText) return;
    setCsvImporting(true);
    setCsvResult(null);
    setCsvProgress({ current: 0, total: 0 });

    try {
      const result = await cmsImport.casesFromCsv(csvRawText, (current, total) => {
        setCsvProgress({ current, total });
      });
      setCsvResult(result);
      loadSystemInfo(); // Refresh counts
    } catch (err) {
      setCsvResult({
        successCount: 0,
        failedCount: 1,
        errors: [{ row: 0, message: err instanceof Error ? err.message : 'Import failed' }],
      });
    } finally {
      setCsvImporting(false);
    }
  }, [csvRawText, loadSystemInfo]);

  const handleCsvReset = useCallback(() => {
    setCsvFile(null);
    setCsvHeaders([]);
    setCsvPreviewRows([]);
    setCsvTotalRows(0);
    setCsvRawText('');
    setCsvResult(null);
    setCsvProgress({ current: 0, total: 0 });
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  }, []);

  // ---- JSON import handlers ----

  const handleJsonFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFile(file);
    setJsonResult(null);
    setJsonError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        // Validate structure
        if (typeof data !== 'object' || data === null) {
          setJsonError('Invalid JSON structure: expected an object');
          setJsonSummary(null);
          setJsonRawData(null);
          return;
        }

        const casesArr = Array.isArray(data.cases) ? data.cases : [];
        const complianceArr = Array.isArray(data.compliance) ? data.compliance : [];
        const filingsArr = Array.isArray(data.filings) ? data.filings : [];

        if (casesArr.length === 0 && complianceArr.length === 0 && filingsArr.length === 0) {
          setJsonError('No importable data found in JSON. Expected "cases", "compliance", or "filings" arrays.');
          setJsonSummary(null);
          setJsonRawData(null);
          return;
        }

        setJsonSummary({
          cases: casesArr.length,
          compliance: complianceArr.length,
          filings: filingsArr.length,
        });
        setJsonRawData(data);
      } catch {
        setJsonError('Failed to parse JSON file. Please ensure it is valid JSON.');
        setJsonSummary(null);
        setJsonRawData(null);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleJsonImport = useCallback(async () => {
    if (!jsonRawData) return;
    setJsonImporting(true);
    setJsonResult(null);
    setJsonProgress({ current: 0, total: 0, type: '' });

    try {
      const result = await cmsImport.fromJsonBackup(
        jsonRawData as Parameters<typeof cmsImport.fromJsonBackup>[0],
        (current, total, type) => {
          setJsonProgress({ current, total, type });
        }
      );
      setJsonResult(result);
      loadSystemInfo(); // Refresh counts
    } catch (err) {
      setJsonResult({
        successCount: 0,
        failedCount: 1,
        errors: [{ row: 0, message: err instanceof Error ? err.message : 'Import failed' }],
      });
    } finally {
      setJsonImporting(false);
    }
  }, [jsonRawData, loadSystemInfo]);

  const handleJsonReset = useCallback(() => {
    setJsonFile(null);
    setJsonSummary(null);
    setJsonRawData(null);
    setJsonResult(null);
    setJsonError(null);
    setJsonProgress({ current: 0, total: 0, type: '' });
    if (jsonInputRef.current) {
      jsonInputRef.current.value = '';
    }
  }, []);

  // ---- Danger zone handlers ----

  const handleClearAll = useCallback(async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setClearing(true);
    try {
      clearAllMockCases();
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      loadSystemInfo();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to clear data');
    } finally {
      setClearing(false);
    }
  }, [deleteConfirmText, loadSystemInfo]);

  // ---- Access check ----

  if (authChecked && !isSuperadmin) {
    return <AccessDenied />;
  }

  if (!authChecked) {
    return (
      <div className="animate-pulse space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-72 bg-gray-200 rounded mb-4" />
            <div className="flex gap-3">
              <div className="h-9 w-36 bg-gray-200 rounded-md" />
              <div className="h-9 w-36 bg-gray-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: GREY }}>
          Import, export, and manage your case management data
        </p>
      </div>

      {/* ============================================================ */}
      {/* Export Section */}
      {/* ============================================================ */}
      <SectionCard
        title="Export Data"
        description="Download your case data as CSV or create a full JSON backup"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        }
        borderColor={ACCENT}
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="h-10 px-5 rounded-md text-sm font-medium text-white transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: ACCENT }}
          >
            {exportingCsv ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Export Cases as CSV
              </>
            )}
          </button>

          <button
            onClick={handleExportJson}
            disabled={exportingJson}
            className="h-10 px-5 rounded-md text-sm font-medium border transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ color: ACCENT, borderColor: ACCENT, backgroundColor: 'white' }}
          >
            {exportingJson ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M2 15h8" />
                  <path d="m5 12-3 3 3 3" />
                </svg>
                Export All Data (JSON)
              </>
            )}
          </button>
        </div>
      </SectionCard>

      {/* ============================================================ */}
      {/* Import Section */}
      {/* ============================================================ */}
      <SectionCard
        title="Import Data"
        description="Import cases from CSV or restore from a JSON backup"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        }
        borderColor={GREEN}
      >
        <div className="space-y-6">
          {/* CSV Import */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Import Cases from CSV</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}>
                .csv
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvFileSelect}
                className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:cursor-pointer hover:file:opacity-80 file:transition-opacity"
                style={{
                  color: GREY,
                }}
                disabled={csvImporting}
              />
              {csvFile && (
                <button
                  onClick={handleCsvReset}
                  className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                  style={{ color: GREY }}
                  disabled={csvImporting}
                >
                  Clear
                </button>
              )}
            </div>

            {/* CSV Preview */}
            {csvHeaders.length > 0 && !csvResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: GREY }}>
                    Preview ({Math.min(5, csvTotalRows)} of {csvTotalRows} rows)
                  </p>
                </div>
                <CsvPreviewTable headers={csvHeaders} rows={csvPreviewRows} />
                <button
                  onClick={handleCsvImport}
                  disabled={csvImporting}
                  className="h-9 px-5 rounded-md text-sm font-medium text-white transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: GREEN }}
                >
                  {csvImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Confirm Import ({csvTotalRows} rows)
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CSV Import Progress */}
            {csvImporting && csvProgress.total > 0 && (
              <ProgressBar
                current={csvProgress.current}
                total={csvProgress.total}
                label="Importing cases..."
              />
            )}

            {/* CSV Import Result */}
            {csvResult && <ImportErrorSummary result={csvResult} />}
          </div>

          <hr className="border-gray-200" />

          {/* JSON Import */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Import from JSON Backup</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}>
                .json
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonFileSelect}
                className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:cursor-pointer hover:file:opacity-80 file:transition-opacity"
                style={{
                  color: GREY,
                }}
                disabled={jsonImporting}
              />
              {jsonFile && (
                <button
                  onClick={handleJsonReset}
                  className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                  style={{ color: GREY }}
                  disabled={jsonImporting}
                >
                  Clear
                </button>
              )}
            </div>

            {/* JSON Validation Error */}
            {jsonError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm flex items-center gap-2" style={{ color: RED }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {jsonError}
              </div>
            )}

            {/* JSON Summary */}
            {jsonSummary && !jsonResult && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: NAVY }}>{jsonSummary.cases}</p>
                    <p className="text-xs" style={{ color: GREY }}>Cases</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: NAVY }}>{jsonSummary.compliance}</p>
                    <p className="text-xs" style={{ color: GREY }}>Compliance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: NAVY }}>{jsonSummary.filings}</p>
                    <p className="text-xs" style={{ color: GREY }}>Filings</p>
                  </div>
                </div>
                <button
                  onClick={handleJsonImport}
                  disabled={jsonImporting}
                  className="h-9 px-5 rounded-md text-sm font-medium text-white transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: GREEN }}
                >
                  {jsonImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Confirm Import ({jsonSummary.cases + jsonSummary.compliance + jsonSummary.filings} items)
                    </>
                  )}
                </button>
              </div>
            )}

            {/* JSON Import Progress */}
            {jsonImporting && jsonProgress.total > 0 && (
              <ProgressBar
                current={jsonProgress.current}
                total={jsonProgress.total}
                label={`Importing ${jsonProgress.type}...`}
              />
            )}

            {/* JSON Import Result */}
            {jsonResult && <ImportErrorSummary result={jsonResult} />}
          </div>
        </div>
      </SectionCard>

      {/* ============================================================ */}
      {/* System Info Section */}
      {/* ============================================================ */}
      <SectionCard
        title="System Information"
        description="Current state of your case management system"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        }
        borderColor={NAVY}
      >
        <div className="space-y-4">
          {/* Stats Grid */}
          {loadingInfo ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-4">
                  <div className="h-6 w-12 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xl font-bold" style={{ color: NAVY }}>{systemInfo.totalCases}</p>
                <p className="text-xs" style={{ color: GREY }}>Total Cases</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xl font-bold" style={{ color: NAVY }}>{systemInfo.totalUsers}</p>
                <p className="text-xs" style={{ color: GREY }}>Total Users</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xl font-bold" style={{ color: NAVY }}>{systemInfo.totalCompliance}</p>
                <p className="text-xs" style={{ color: GREY }}>Compliance Items</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xl font-bold" style={{ color: NAVY }}>{systemInfo.totalFilings}</p>
                <p className="text-xs" style={{ color: GREY }}>Total Filings</p>
              </div>
            </div>
          )}

          {/* System Details */}
          <div className="flex flex-wrap gap-3">
            {/* Mock Mode Indicator */}
            {USE_MOCK && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#FFF3CD', color: '#856404' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Mock Mode Active
              </div>
            )}

            {!USE_MOCK && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${GREEN}15`, color: GREEN }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Live Backend Connected
              </div>
            )}
          </div>

          <div className="text-xs space-y-1" style={{ color: GREY }}>
            <p>
              <span className="font-semibold">Backend URL:</span>{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-mono">{CMS_API_URL}</code>
            </p>
            <p>
              <span className="font-semibold">Mode:</span>{' '}
              {USE_MOCK ? 'Mock (in-memory data)' : 'Live (connected to backend API)'}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ============================================================ */}
      {/* Danger Zone Section — SUPERADMIN ONLY */}
      {/* ============================================================ */}
      {!isSuperadmin ? (
        <div className="bg-white rounded-xl p-6 opacity-50" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #ccc' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h2 className="text-base font-bold" style={{ color: GREY }}>Danger Zone</h2>
              <p className="text-xs mt-0.5" style={{ color: GREY }}>Only super admins can access destructive actions.</p>
            </div>
          </div>
        </div>
      ) : (
      <div
        className="bg-white rounded-xl p-6"
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: `2px solid ${RED}40`,
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${RED}12` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: RED }}>Danger Zone</h2>
            <p className="text-xs mt-0.5" style={{ color: GREY }}>
              Irreversible actions. Proceed with extreme caution.
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-9 px-5 rounded-md text-sm font-medium border-2 transition-colors flex items-center gap-2 hover:text-white"
            style={{
              color: RED,
              borderColor: RED,
              backgroundColor: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = RED;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = RED;
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Clear All Cases
          </button>
        ) : (
          <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: `${RED}08`, border: `1px solid ${RED}30` }}>
            <p className="text-sm font-semibold" style={{ color: RED }}>
              Are you sure? This will permanently delete ALL cases, compliance items, filings, and audit entries.
            </p>
            <p className="text-xs" style={{ color: GREY }}>
              Type <strong>DELETE</strong> below to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="h-9 px-3 rounded-md border text-sm w-full max-w-xs focus:outline-none focus:ring-2"
              style={{
                borderColor: deleteConfirmText === 'DELETE' ? RED : '#D1D5DB',
                color: NAVY,
                ...(deleteConfirmText === 'DELETE' ? { boxShadow: `0 0 0 2px ${RED}30` } : {}),
              }}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                disabled={deleteConfirmText !== 'DELETE' || clearing}
                className="h-9 px-5 rounded-md text-sm font-medium text-white transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: RED }}
              >
                {clearing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Yes, Clear All Data
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="h-9 px-4 rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                style={{ color: GREY }}
                disabled={clearing}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
