// ============================================================
// Case Management System — API Client
// ============================================================
// Talks to the separate backend (atrey-cms-api).
// Falls back to mock data when backend is unavailable.
// ============================================================

import type {
  Case,
  CaseFilters,
  CmsUser,
  ComplianceItem,
  FilingItem,
  HearingRecord,
  AuditEntry,
  DashboardStats,
  LoginResponse,
  PaginatedResponse,
} from './cms-types';
import { SEED_CASES } from './data/seed-cases';

const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:4000';
const USE_MOCK = process.env.NEXT_PUBLIC_CMS_MOCK === 'true' || !process.env.NEXT_PUBLIC_CMS_API_URL;

// --- Token Management ---

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cms_token');
}

function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cms_token', token);
  }
}

function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
  }
}

function getStoredUser(): CmsUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('cms_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredUser(user: CmsUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cms_user', JSON.stringify(user));
  }
}

// --- Core Fetch Wrapper ---

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${CMS_API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/case-management/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}

// --- Auth ---

export const cmsAuth = {
  async login(email: string, password: string): Promise<LoginResponse> {
    if (USE_MOCK) {
      return mockLogin(email, password);
    }
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  async logout(): Promise<void> {
    if (!USE_MOCK) {
      await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    }
    clearToken();
  },

  async getSession(): Promise<CmsUser | null> {
    if (USE_MOCK) {
      return getStoredUser();
    }
    try {
      const data = await apiFetch<{ user: CmsUser }>('/auth/me');
      return data.user;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },

  getUser(): CmsUser | null {
    return getStoredUser();
  },
};

// --- Cases ---

export const cmsCases = {
  async list(filters: CaseFilters = {}): Promise<PaginatedResponse<Case>> {
    if (USE_MOCK) return mockCases.list(filters);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        params.set(key, String(val));
      }
    });
    return apiFetch(`/cases?${params.toString()}`);
  },

  async get(id: string): Promise<Case> {
    if (USE_MOCK) return mockCases.get(id);
    return apiFetch(`/cases/${id}`);
  },

  async create(data: Partial<Case>): Promise<Case> {
    if (USE_MOCK) return mockCases.create(data);
    return apiFetch('/cases', { method: 'POST', body: JSON.stringify(data) });
  },

  async update(id: string, data: Partial<Case>): Promise<Case> {
    if (USE_MOCK) return mockCases.update(id, data);
    return apiFetch(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) return mockCases.remove(id);
    await apiFetch(`/cases/${id}`, { method: 'DELETE' });
  },

  async bulkUpdate(ids: string[], updates: Partial<Case>): Promise<void> {
    if (USE_MOCK) return mockCases.bulkUpdate(ids, updates);
    await apiFetch('/cases/bulk', { method: 'POST', body: JSON.stringify({ ids, updates }) });
  },
};

// --- Dashboard ---

export const cmsDashboard = {
  async stats(): Promise<DashboardStats> {
    if (USE_MOCK) return mockDashboard.stats();
    return apiFetch('/dashboard/stats');
  },

  async upcoming(): Promise<Case[]> {
    if (USE_MOCK) return mockDashboard.upcoming();
    return apiFetch('/dashboard/upcoming');
  },

  async overdue(): Promise<ComplianceItem[]> {
    if (USE_MOCK) return mockDashboard.overdue();
    return apiFetch('/dashboard/overdue');
  },

  async activity(): Promise<AuditEntry[]> {
    if (USE_MOCK) return mockDashboard.activity();
    return apiFetch('/dashboard/activity');
  },
};

// --- Compliance ---

export const cmsCompliance = {
  async list(): Promise<ComplianceItem[]> {
    if (USE_MOCK) return mockCompliance.list();
    return apiFetch('/compliance');
  },

  async forCase(caseId: string): Promise<ComplianceItem[]> {
    if (USE_MOCK) return mockCompliance.forCase(caseId);
    return apiFetch(`/compliance/case/${caseId}`);
  },

  async create(data: Partial<ComplianceItem>): Promise<ComplianceItem> {
    if (USE_MOCK) return mockCompliance.create(data);
    return apiFetch('/compliance', { method: 'POST', body: JSON.stringify(data) });
  },

  async update(id: string, data: Partial<ComplianceItem>): Promise<ComplianceItem> {
    if (USE_MOCK) return mockCompliance.update(id, data);
    return apiFetch(`/compliance/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) return mockCompliance.remove(id);
    await apiFetch(`/compliance/${id}`, { method: 'DELETE' });
  },
};

// --- Filings ---

export const cmsFilings = {
  async list(): Promise<FilingItem[]> {
    if (USE_MOCK) return mockFilings.list();
    return apiFetch('/filings');
  },

  async forCase(caseId: string): Promise<FilingItem[]> {
    if (USE_MOCK) return mockFilings.forCase(caseId);
    return apiFetch(`/filings/case/${caseId}`);
  },

  async create(data: Partial<FilingItem>): Promise<FilingItem> {
    if (USE_MOCK) return mockFilings.create(data);
    return apiFetch('/filings', { method: 'POST', body: JSON.stringify(data) });
  },

  async update(id: string, data: Partial<FilingItem>): Promise<FilingItem> {
    if (USE_MOCK) return mockFilings.update(id, data);
    return apiFetch(`/filings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) return mockFilings.remove(id);
    await apiFetch(`/filings/${id}`, { method: 'DELETE' });
  },
};

// --- Hearings ---

export const cmsHearings = {
  async forCase(caseId: string): Promise<HearingRecord[]> {
    if (USE_MOCK) return mockHearings.forCase(caseId);
    return apiFetch(`/hearings/case/${caseId}`);
  },

  async create(data: Partial<HearingRecord>): Promise<HearingRecord> {
    if (USE_MOCK) return mockHearings.create(data);
    return apiFetch('/hearings', { method: 'POST', body: JSON.stringify(data) });
  },

  async update(id: string, data: Partial<HearingRecord>): Promise<HearingRecord> {
    if (USE_MOCK) return mockHearings.update(id, data);
    return apiFetch(`/hearings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) return;
    await apiFetch(`/hearings/${id}`, { method: 'DELETE' });
  },
};

// --- Users ---

export const cmsUsers = {
  async list(): Promise<CmsUser[]> {
    if (USE_MOCK) return mockUsers.list();
    return apiFetch('/users');
  },

  async create(data: { name: string; email: string; password: string; role: string }): Promise<CmsUser> {
    if (USE_MOCK) return mockUsers.create(data);
    return apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
  },

  async update(id: string, data: Partial<CmsUser>): Promise<CmsUser> {
    if (USE_MOCK) return mockUsers.update(id, data);
    return apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) return;
    await apiFetch(`/users/${id}`, { method: 'DELETE' });
  },
};

// --- Audit ---

export const cmsAudit = {
  async list(page = 1, limit = 50): Promise<PaginatedResponse<AuditEntry>> {
    if (USE_MOCK) return mockAudit.list(page, limit);
    return apiFetch(`/audit?page=${page}&limit=${limit}`);
  },
};

// --- Export ---

export const cmsExport = {
  async casesToCsv(): Promise<string> {
    const result = await cmsCases.list({ limit: 9999 });
    const cases = result.data;

    const CSV_COLUMNS = [
      'S.No', 'Case No', 'Court', 'Client', 'Title', 'Petitioner',
      'Respondent', 'Role', 'Category', 'Department', 'Filing Date',
      'Status', 'NDOH', 'Priority', 'Remarks',
    ] as const;

    function escapeCsvField(value: string): string {
      const str = String(value ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const headerRow = CSV_COLUMNS.map(escapeCsvField).join(',');
    const dataRows = cases.map((c) =>
      [
        String(c.serialNo),
        c.caseNo,
        c.court,
        c.client,
        c.caseTitle,
        c.petitioner,
        c.respondent,
        c.ourRole,
        c.category ?? '',
        c.department ?? '',
        c.filingDate ?? '',
        c.status,
        c.ndoh ?? '',
        c.priority,
        c.remarks ?? '',
      ]
        .map(escapeCsvField)
        .join(',')
    );

    return [headerRow, ...dataRows].join('\n');
  },

  async allDataToJson(): Promise<{
    cases: Case[];
    compliance: ComplianceItem[];
    filings: FilingItem[];
    exportDate: string;
  }> {
    const [casesResult, compliance, filings] = await Promise.all([
      cmsCases.list({ limit: 9999 }),
      cmsCompliance.list(),
      cmsFilings.list(),
    ]);

    return {
      cases: casesResult.data,
      compliance,
      filings,
      exportDate: new Date().toISOString(),
    };
  },
};

// --- Import ---

function parseCsvText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const nextCh = csvText[i + 1];

    if (insideQuotes) {
      if (ch === '"' && nextCh === '"') {
        currentField += '"';
        i++; // skip the second quote
      } else if (ch === '"') {
        insideQuotes = false;
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        insideQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (ch === '\r' && nextCh === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++; // skip \n
      } else if (ch === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
      } else {
        currentField += ch;
      }
    }
  }

  // Last field and row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

export interface ImportResult {
  readonly successCount: number;
  readonly failedCount: number;
  readonly errors: readonly { row: number; message: string }[];
}

export const cmsImport = {
  async casesFromCsv(
    csvText: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<ImportResult> {
    const rows = parseCsvText(csvText);
    if (rows.length < 2) {
      return { successCount: 0, failedCount: 0, errors: [{ row: 0, message: 'CSV file is empty or has no data rows' }] };
    }

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0));
    const total = dataRows.length;

    const colIndex = (name: string): number =>
      headers.findIndex((h) => h === name || h.replace(/[.\s]/g, '').toLowerCase() === name.replace(/[.\s]/g, '').toLowerCase());

    const snoIdx = colIndex('s.no');
    const caseNoIdx = colIndex('caseno');
    const courtIdx = colIndex('court');
    const clientIdx = colIndex('client');
    const titleIdx = colIndex('title');
    const petitionerIdx = colIndex('petitioner');
    const respondentIdx = colIndex('respondent');
    const roleIdx = colIndex('role');
    const categoryIdx = colIndex('category');
    const departmentIdx = colIndex('department');
    const filingDateIdx = colIndex('filingdate');
    const statusIdx = colIndex('status');
    const ndohIdx = colIndex('ndoh');
    const priorityIdx = colIndex('priority');
    const remarksIdx = colIndex('remarks');

    const getField = (row: string[], idx: number): string => (idx >= 0 && idx < row.length ? row[idx].trim() : '');

    let successCount = 0;
    let failedCount = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      try {
        const caseNo = getField(row, caseNoIdx);
        if (!caseNo) {
          throw new Error('Case No is required');
        }

        await cmsCases.create({
          caseNo,
          court: getField(row, courtIdx) || 'Supreme Court of India',
          client: getField(row, clientIdx) || '',
          caseTitle: getField(row, titleIdx) || '',
          petitioner: getField(row, petitionerIdx) || '',
          respondent: getField(row, respondentIdx) || '',
          ourRole: getField(row, roleIdx) || 'Respondent',
          category: getField(row, categoryIdx) || null,
          department: getField(row, departmentIdx) || null,
          filingDate: getField(row, filingDateIdx) || null,
          status: (getField(row, statusIdx) as Case['status']) || 'Pending',
          ndoh: getField(row, ndohIdx) || null,
          priority: (getField(row, priorityIdx) as Case['priority']) || 'Medium',
          remarks: getField(row, remarksIdx) || null,
        });
        successCount++;
      } catch (err) {
        failedCount++;
        errors.push({
          row: i + 2, // +2 because 1-indexed and header row
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }

      if (onProgress) {
        onProgress(i + 1, total);
      }
    }

    return { successCount, failedCount, errors };
  },

  async fromJsonBackup(
    data: { cases?: Partial<Case>[]; compliance?: Partial<ComplianceItem>[]; filings?: Partial<FilingItem>[] },
    onProgress?: (current: number, total: number, type: string) => void
  ): Promise<ImportResult> {
    const cases = data.cases ?? [];
    const compliance = data.compliance ?? [];
    const filings = data.filings ?? [];
    const totalItems = cases.length + compliance.length + filings.length;

    let successCount = 0;
    let failedCount = 0;
    const errors: { row: number; message: string }[] = [];
    let processedCount = 0;

    // Import cases
    for (let i = 0; i < cases.length; i++) {
      try {
        await cmsCases.create(cases[i]);
        successCount++;
      } catch (err) {
        failedCount++;
        errors.push({
          row: i + 1,
          message: `Case: ${err instanceof Error ? err.message : 'Unknown error'}`,
        });
      }
      processedCount++;
      if (onProgress) onProgress(processedCount, totalItems, 'cases');
    }

    // Import compliance
    for (let i = 0; i < compliance.length; i++) {
      try {
        await cmsCompliance.create(compliance[i]);
        successCount++;
      } catch (err) {
        failedCount++;
        errors.push({
          row: i + 1,
          message: `Compliance: ${err instanceof Error ? err.message : 'Unknown error'}`,
        });
      }
      processedCount++;
      if (onProgress) onProgress(processedCount, totalItems, 'compliance');
    }

    // Import filings
    for (let i = 0; i < filings.length; i++) {
      try {
        await cmsFilings.create(filings[i]);
        successCount++;
      } catch (err) {
        failedCount++;
        errors.push({
          row: i + 1,
          message: `Filing: ${err instanceof Error ? err.message : 'Unknown error'}`,
        });
      }
      processedCount++;
      if (onProgress) onProgress(processedCount, totalItems, 'filings');
    }

    return { successCount, failedCount, errors };
  },
};

// --- Mock Store Access (for clear-all in settings) ---

export function clearAllMockCases(): void {
  if (USE_MOCK) {
    initMockData();
    mockCaseStore = [];
    mockComplianceStore = [];
    mockFilingStore = [];
    mockHearingStore = [];
    mockAuditStore = [];
  }
}

// ============================================================
// MOCK DATA — used when backend is unavailable
// ============================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// In-memory mock store
let mockCaseStore: Case[] = [];
let mockComplianceStore: ComplianceItem[] = [];
let mockFilingStore: FilingItem[] = [];
let mockHearingStore: HearingRecord[] = [];
let mockUserStore: CmsUser[] = [];
let mockAuditStore: AuditEntry[] = [];
let mockInitialized = false;

function initMockData() {
  if (mockInitialized) return;
  mockInitialized = true;

  const now = new Date().toISOString();

  // Helper: generate date string N days from now
  const daysFromNow = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  // Seed users
  mockUserStore = [
    { id: 'user_admin', name: 'Dr. Abhishek Atrey', email: 'abhishekatrey@gmail.com', role: 'superadmin', isActive: true, departmentFilter: null, clientFilter: null, lastLogin: now, createdAt: now },
    { id: 'user_aniruddh', name: 'Aniruddh Atrey', email: 'aniruddh.atrey111101@gmail.com', role: 'editor', isActive: true, departmentFilter: null, clientFilter: null, lastLogin: null, createdAt: now },
    { id: 'user_atul', name: 'Atul Sharma', email: 'atul.sharma@example.com', role: 'editor', isActive: true, departmentFilter: null, clientFilter: null, lastLogin: null, createdAt: now },
    { id: 'user_aastha', name: 'Aastha Atrey', email: 'aasthaatrey14@gmail.com', role: 'editor', isActive: true, departmentFilter: null, clientFilter: null, lastLogin: null, createdAt: now },
  ];

  // Seed cases — imported from standalone seed data file (85 real cases)
  mockCaseStore = [...SEED_CASES];

  // Seed some compliance items (case IDs reference seed-cases.ts positions)
  // case_27 = Nagar Nigam Haldwani, case_35 = Asha Yadav, case_67 = Shubham Chaudhary
  // case_1 = Arun Kumar Bhadoria, case_11 = Parvez Alam
  mockComplianceStore = [
    { id: 'comp_1', caseId: 'case_27', direction: 'File counter affidavit within 4 weeks', directionDate: '01.02.2026', dueDate: daysFromNow(-5), status: 'Overdue', assignedToId: 'user_atul', completionDate: null, notes: 'Counter not filed for Nagar Nigam Haldwani case', createdAt: now, updatedAt: now },
    { id: 'comp_2', caseId: 'case_35', direction: 'File counter affidavit', directionDate: '15.01.2026', dueDate: daysFromNow(3), status: 'Pending', assignedToId: 'user_atul', completionDate: null, notes: 'Asha Yadav case — urgent', createdAt: now, updatedAt: now },
    { id: 'comp_3', caseId: 'case_67', direction: 'File counter affidavit on behalf of respondent No.11', directionDate: '10.02.2026', dueDate: daysFromNow(7), status: 'InProgress', assignedToId: 'user_aniruddh', completionDate: null, notes: 'Shubham Chaudhary case', createdAt: now, updatedAt: now },
    { id: 'comp_4', caseId: 'case_1', direction: 'File written submissions', directionDate: '01.03.2026', dueDate: daysFromNow(-2), status: 'Overdue', assignedToId: 'user_atul', completionDate: null, notes: null, createdAt: now, updatedAt: now },
    { id: 'comp_5', caseId: 'case_11', direction: 'File additional affidavit with updated status report', directionDate: '05.03.2026', dueDate: daysFromNow(1), status: 'Pending', assignedToId: 'user_aniruddh', completionDate: null, notes: 'Parvez Alam case — hearing tomorrow', createdAt: now, updatedAt: now },
  ];

  // Seed some filings (case IDs updated to match new seed positions)
  mockFilingStore = [
    { id: 'filing_1', caseId: 'case_27', filingType: 'CounterAffidavit', status: 'Drafting', dueDate: daysFromNow(5), filedDate: null, filedBy: null, filingNumber: null, defects: null, notes: 'Counter affidavit for Nagar Nigam case', createdAt: now, updatedAt: now },
    { id: 'filing_2', caseId: 'case_35', filingType: 'CounterAffidavit', status: 'NotStarted', dueDate: daysFromNow(10), filedDate: null, filedBy: null, filingNumber: null, defects: null, notes: null, createdAt: now, updatedAt: now },
    { id: 'filing_3', caseId: 'case_1', filingType: 'WrittenSubmission', status: 'UnderReview', dueDate: daysFromNow(2), filedDate: null, filedBy: null, filingNumber: null, defects: null, notes: null, createdAt: now, updatedAt: now },
    { id: 'filing_4', caseId: 'case_67', filingType: 'CounterAffidavit', status: 'Drafting', dueDate: daysFromNow(8), filedDate: null, filedBy: null, filingNumber: null, defects: null, notes: null, createdAt: now, updatedAt: now },
  ];

  // Seed hearings (case_1 = Arun Kumar Bhadoria, case_11 = Parvez Alam)
  mockHearingStore = [
    { id: 'hearing_1', caseId: 'case_1', hearingDate: '06.08.2018', courtBench: 'Court No. 5', judge: 'Justice A.K. Sikri', orderSummary: 'Leave and stay granted.', orderPdfUrl: null, source: 'manual', staffNotes: null, createdAt: now },
    { id: 'hearing_2', caseId: 'case_11', hearingDate: '01.04.2019', courtBench: 'Court No. 3', judge: null, orderSummary: 'Notice issued. Tagged with batch matters.', orderPdfUrl: null, source: 'manual', staffNotes: null, createdAt: now },
  ];

  // Seed audit log (case_27 = Nagar Nigam Haldwani)
  mockAuditStore = [
    { id: 'audit_1', userId: 'user_admin', action: 'login', entityType: 'system', entityId: null, fieldChanged: null, oldValue: null, newValue: null, timestamp: now },
    { id: 'audit_2', userId: 'user_atul', action: 'edit', entityType: 'case', entityId: 'case_27', fieldChanged: 'remarks', oldValue: 'Counter pending', newValue: 'Counter not filed', timestamp: now },
    { id: 'audit_3', userId: 'user_admin', action: 'create', entityType: 'compliance', entityId: 'comp_1', fieldChanged: null, oldValue: null, newValue: 'File counter affidavit within 4 weeks', timestamp: now },
  ];
}

// --- Mock Implementations ---

function mockLogin(email: string, password: string): Promise<LoginResponse> {
  initMockData();
  const user = mockUserStore.find(u => u.email === email && u.isActive);
  if (!user) {
    return Promise.reject(new Error('Invalid email or password'));
  }
  // In mock mode, any password works for demo
  if (password.length < 1) {
    return Promise.reject(new Error('Password is required'));
  }
  const token = btoa(JSON.stringify({ userId: user.id, email: user.email, role: user.role, exp: Date.now() + 8 * 60 * 60 * 1000 }));
  setToken(token);
  setStoredUser(user);
  return Promise.resolve({ token, user });
}

const mockCases = {
  list(filters: CaseFilters): Promise<PaginatedResponse<Case>> {
    initMockData();
    let filtered = [...mockCaseStore];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.caseNo.toLowerCase().includes(q) ||
        c.caseTitle.toLowerCase().includes(q) ||
        c.petitioner.toLowerCase().includes(q) ||
        c.respondent.toLowerCase().includes(q) ||
        (c.remarks || '').toLowerCase().includes(q) ||
        (c.department || '').toLowerCase().includes(q)
      );
    }
    if (filters.court) filtered = filtered.filter(c => c.court === filters.court);
    if (filters.client) filtered = filtered.filter(c => c.client === filters.client);
    if (filters.status) filtered = filtered.filter(c => c.status === filters.status);
    if (filters.department) filtered = filtered.filter(c => c.department === filters.department);
    if (filters.priority) filtered = filtered.filter(c => c.priority === filters.priority);
    if (filters.category) filtered = filtered.filter(c => c.category === filters.category);
    if (filters.assignedTo) filtered = filtered.filter(c => c.assignedToId === filters.assignedTo);

    // Sort
    const sortBy = filters.sortBy || 'serialNo';
    const order = filters.sortOrder || 'asc';
    filtered.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy] ?? '';
      const bVal = (b as unknown as Record<string, unknown>)[sortBy] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return order === 'asc' ? cmp : -cmp;
    });

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return Promise.resolve({
      data: paged,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    });
  },

  get(id: string): Promise<Case> {
    initMockData();
    const c = mockCaseStore.find(x => x.id === id);
    if (!c) return Promise.reject(new Error('Case not found'));
    return Promise.resolve({ ...c, assignedTo: mockUserStore.find(u => u.id === c.assignedToId) || null, createdBy: mockUserStore.find(u => u.id === c.createdById) || null });
  },

  create(data: Partial<Case>): Promise<Case> {
    initMockData();
    const newCase: Case = {
      id: generateId(),
      serialNo: mockCaseStore.length + 1,
      caseNo: data.caseNo || '',
      cnrNumber: data.cnrNumber || null,
      court: data.court || 'Supreme Court of India',
      bench: data.bench || null,
      client: data.client || '',
      caseTitle: data.caseTitle || '',
      petitioner: data.petitioner || '',
      respondent: data.respondent || '',
      ourRole: data.ourRole || 'Respondent',
      respondentNumber: data.respondentNumber || null,
      category: data.category || null,
      subjectMatter: data.subjectMatter || null,
      department: data.department || null,
      filingDate: data.filingDate || null,
      registrationDate: data.registrationDate || null,
      status: data.status || 'Pending',
      ndoh: data.ndoh || null,
      previousHearing: data.previousHearing || null,
      benchNumber: data.benchNumber || null,
      presidingJudge: data.presidingJudge || null,
      linkedCases: data.linkedCases || [],
      priority: data.priority || 'Medium',
      assignedToId: data.assignedToId || null,
      remarks: data.remarks || null,
      isBatch: data.isBatch || false,
      batchGroup: data.batchGroup || null,
      lastAutoFetch: null,
      createdById: cmsAuth.getUser()?.id || 'user_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCaseStore = [...mockCaseStore, newCase];
    return Promise.resolve(newCase);
  },

  update(id: string, data: Partial<Case>): Promise<Case> {
    initMockData();
    const idx = mockCaseStore.findIndex(c => c.id === id);
    if (idx === -1) return Promise.reject(new Error('Case not found'));
    const updated = { ...mockCaseStore[idx], ...data, updatedAt: new Date().toISOString() };
    mockCaseStore = mockCaseStore.map(c => c.id === id ? updated : c);
    return Promise.resolve(updated);
  },

  remove(id: string): Promise<void> {
    initMockData();
    mockCaseStore = mockCaseStore.filter(c => c.id !== id);
    return Promise.resolve();
  },

  bulkUpdate(ids: string[], updates: Partial<Case>): Promise<void> {
    initMockData();
    mockCaseStore = mockCaseStore.map(c =>
      ids.includes(c.id) ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    return Promise.resolve();
  },
};

const mockDashboard = {
  stats(): Promise<DashboardStats> {
    initMockData();
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const parseDate = (d: string | null) => {
      if (!d) return null;
      const [day, month, year] = d.split('.');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    const activeCases = mockCaseStore.filter(c => c.status !== 'Disposed' && c.status !== 'Dismissed' && c.status !== 'Withdrawn');

    const hearingsThisWeek = activeCases.filter(c => {
      const ndoh = parseDate(c.ndoh);
      return ndoh && ndoh >= now && ndoh <= weekEnd;
    }).length;

    const counterNotFiled = mockCaseStore.filter(c =>
      c.status === 'CounterNotFiled' || (c.remarks || '').toLowerCase().includes('counter not filed') || (c.remarks || '').toLowerCase().includes('counter yet to file')
    ).length;

    const disposed = mockCaseStore.filter(c => c.status === 'Disposed' || c.status === 'Dismissed').length;
    const pendingCompliance = mockComplianceStore.filter(c => c.status === 'Overdue' || c.status === 'Pending').length;

    const courtDist = Object.entries(
      activeCases.reduce<Record<string, number>>((acc, c) => {
        acc[c.court] = (acc[c.court] || 0) + 1;
        return acc;
      }, {})
    ).map(([court, count]) => ({ court, count }));

    const deptDist = Object.entries(
      activeCases.reduce<Record<string, number>>((acc, c) => {
        const dept = c.department || 'Unspecified';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {})
    ).map(([department, count]) => ({ department, count })).sort((a, b) => b.count - a.count);

    return Promise.resolve({
      totalActive: activeCases.length,
      hearingsThisWeek,
      pendingCompliance,
      counterNotFiled,
      disposedCases: disposed,
      courtDistribution: courtDist,
      departmentDistribution: deptDist,
    });
  },

  upcoming(): Promise<Case[]> {
    initMockData();
    const now = new Date();
    const parseDate = (d: string | null) => {
      if (!d) return null;
      const [day, month, year] = d.split('.');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    return Promise.resolve(
      mockCaseStore
        .filter(c => {
          const ndoh = parseDate(c.ndoh);
          return ndoh && ndoh >= now;
        })
        .sort((a, b) => {
          const da = parseDate(a.ndoh)!;
          const db = parseDate(b.ndoh)!;
          return da.getTime() - db.getTime();
        })
        .slice(0, 10)
    );
  },

  overdue(): Promise<ComplianceItem[]> {
    initMockData();
    return Promise.resolve(mockComplianceStore.filter(c => c.status === 'Overdue'));
  },

  activity(): Promise<AuditEntry[]> {
    initMockData();
    return Promise.resolve([...mockAuditStore].reverse().slice(0, 20));
  },
};

const mockCompliance = {
  list: () => { initMockData(); return Promise.resolve([...mockComplianceStore]); },
  forCase: (caseId: string) => { initMockData(); return Promise.resolve(mockComplianceStore.filter(c => c.caseId === caseId)); },
  create: (data: Partial<ComplianceItem>) => {
    initMockData();
    const item: ComplianceItem = { id: generateId(), caseId: data.caseId || '', direction: data.direction || '', directionDate: data.directionDate || null, dueDate: data.dueDate || '', status: data.status || 'Pending', assignedToId: data.assignedToId || null, completionDate: null, notes: data.notes || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockComplianceStore = [...mockComplianceStore, item];
    return Promise.resolve(item);
  },
  update: (id: string, data: Partial<ComplianceItem>) => {
    initMockData();
    mockComplianceStore = mockComplianceStore.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c);
    return Promise.resolve(mockComplianceStore.find(c => c.id === id)!);
  },
  remove: (id: string) => { initMockData(); mockComplianceStore = mockComplianceStore.filter(c => c.id !== id); return Promise.resolve(); },
};

const mockFilings = {
  list: () => { initMockData(); return Promise.resolve([...mockFilingStore]); },
  forCase: (caseId: string) => { initMockData(); return Promise.resolve(mockFilingStore.filter(f => f.caseId === caseId)); },
  create: (data: Partial<FilingItem>) => {
    initMockData();
    const item: FilingItem = { id: generateId(), caseId: data.caseId || '', filingType: data.filingType || 'CounterAffidavit', status: data.status || 'NotStarted', dueDate: data.dueDate || null, filedDate: null, filedBy: null, filingNumber: null, defects: null, notes: data.notes || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockFilingStore = [...mockFilingStore, item];
    return Promise.resolve(item);
  },
  update: (id: string, data: Partial<FilingItem>) => {
    initMockData();
    mockFilingStore = mockFilingStore.map(f => f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f);
    return Promise.resolve(mockFilingStore.find(f => f.id === id)!);
  },
  remove: (id: string) => { initMockData(); mockFilingStore = mockFilingStore.filter(f => f.id !== id); return Promise.resolve(); },
};

const mockHearings = {
  forCase: (caseId: string) => { initMockData(); return Promise.resolve(mockHearingStore.filter(h => h.caseId === caseId)); },
  create: (data: Partial<HearingRecord>) => {
    initMockData();
    const item: HearingRecord = { id: generateId(), caseId: data.caseId || '', hearingDate: data.hearingDate || '', courtBench: data.courtBench || null, judge: data.judge || null, orderSummary: data.orderSummary || null, orderPdfUrl: null, source: 'manual', staffNotes: data.staffNotes || null, createdAt: new Date().toISOString() };
    mockHearingStore = [...mockHearingStore, item];
    return Promise.resolve(item);
  },
  update: (id: string, data: Partial<HearingRecord>) => {
    initMockData();
    mockHearingStore = mockHearingStore.map(h => h.id === id ? { ...h, ...data } : h);
    return Promise.resolve(mockHearingStore.find(h => h.id === id)!);
  },
};

const mockUsers = {
  list: () => { initMockData(); return Promise.resolve([...mockUserStore]); },
  create: (data: { name: string; email: string; password: string; role: string }) => {
    initMockData();
    const user: CmsUser = { id: generateId(), name: data.name, email: data.email, role: data.role as CmsUser['role'], isActive: true, departmentFilter: null, clientFilter: null, lastLogin: null, createdAt: new Date().toISOString() };
    mockUserStore = [...mockUserStore, user];
    return Promise.resolve(user);
  },
  update: (id: string, data: Partial<CmsUser>) => {
    initMockData();
    mockUserStore = mockUserStore.map(u => u.id === id ? { ...u, ...data } : u);
    return Promise.resolve(mockUserStore.find(u => u.id === id)!);
  },
};

const mockAudit = {
  list: (page: number, limit: number) => {
    initMockData();
    const sorted = [...mockAuditStore].reverse();
    const start = (page - 1) * limit;
    return Promise.resolve({
      data: sorted.slice(start, start + limit).map(a => ({ ...a, user: mockUserStore.find(u => u.id === a.userId) })),
      total: sorted.length,
      page,
      limit,
      totalPages: Math.ceil(sorted.length / limit),
    });
  },
};
