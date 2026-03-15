// ============================================================
// Case Management System — TypeScript Types
// ============================================================

// --- Enums ---

export type CaseStatus =
  | 'Active'
  | 'Disposed'
  | 'StayGranted'
  | 'NoticeIssued'
  | 'PartHeard'
  | 'ReservedForJudgment'
  | 'Adjourned'
  | 'ListedForHearing'
  | 'Dismissed'
  | 'Allowed'
  | 'Withdrawn'
  | 'Transferred'
  | 'Admitted'
  | 'LeaveGranted'
  | 'CounterFiled'
  | 'CounterNotFiled'
  | 'Pending';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type UserRole = 'superadmin' | 'editor' | 'viewer';

export type ComplianceStatus = 'Pending' | 'InProgress' | 'Completed' | 'Overdue' | 'Waived';

export type FilingType =
  | 'CounterAffidavit'
  | 'Rejoinder'
  | 'WrittenSubmission'
  | 'Application'
  | 'Vakalatnama'
  | 'Compilation'
  | 'SynopsisListOfDates'
  | 'Caveat'
  | 'AdditionalDocuments'
  | 'MemoOfAppearance'
  | 'Affidavit';

export type FilingStatus =
  | 'NotStarted'
  | 'Drafting'
  | 'UnderReview'
  | 'ReadyForFiling'
  | 'Filed'
  | 'RejectedRefiled';

// --- Models ---

export interface CmsUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  departmentFilter: string | null;
  clientFilter: string | null;
  lastLogin: string | null;
  createdAt: string;
}

export interface Case {
  id: string;
  serialNo: number;
  caseNo: string;
  cnrNumber: string | null;
  court: string;
  bench: string | null;
  client: string;
  caseTitle: string;
  petitioner: string;
  respondent: string;
  ourRole: string;
  respondentNumber: string | null;
  category: string | null;
  subjectMatter: string | null;
  department: string | null;
  filingDate: string | null;
  registrationDate: string | null;
  status: CaseStatus;
  ndoh: string | null;
  previousHearing: string | null;
  benchNumber: string | null;
  presidingJudge: string | null;
  linkedCases: string[];
  priority: Priority;
  assignedToId: string | null;
  assignedTo?: CmsUser | null;
  remarks: string | null;
  isBatch: boolean;
  batchGroup: string | null;
  lastAutoFetch: string | null;
  createdById: string | null;
  createdBy?: CmsUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceItem {
  id: string;
  caseId: string;
  case?: Case;
  direction: string;
  directionDate: string | null;
  dueDate: string;
  status: ComplianceStatus;
  assignedToId: string | null;
  assignedTo?: CmsUser | null;
  completionDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FilingItem {
  id: string;
  caseId: string;
  case?: Case;
  filingType: FilingType;
  status: FilingStatus;
  dueDate: string | null;
  filedDate: string | null;
  filedBy: string | null;
  filingNumber: string | null;
  defects: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HearingRecord {
  id: string;
  caseId: string;
  case?: Case;
  hearingDate: string;
  courtBench: string | null;
  judge: string | null;
  orderSummary: string | null;
  orderPdfUrl: string | null;
  source: 'auto' | 'manual';
  staffNotes: string | null;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  user?: CmsUser;
  action: string;
  entityType: string;
  entityId: string | null;
  fieldChanged: string | null;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
}

// --- API Types ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: CmsUser;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalActive: number;
  hearingsThisWeek: number;
  pendingCompliance: number;
  counterNotFiled: number;
  disposedCases: number;
  courtDistribution: { court: string; count: number }[];
  departmentDistribution: { department: string; count: number }[];
}

export interface CaseFilters {
  search?: string;
  court?: string;
  client?: string;
  status?: CaseStatus;
  category?: string;
  department?: string;
  priority?: Priority;
  assignedTo?: string;
  ndohFrom?: string;
  ndohTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// --- Display Helpers ---

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  Active: 'Active',
  Disposed: 'Disposed',
  StayGranted: 'Stay Granted',
  NoticeIssued: 'Notice Issued',
  PartHeard: 'Part Heard',
  ReservedForJudgment: 'Reserved for Judgment',
  Adjourned: 'Adjourned',
  ListedForHearing: 'Listed for Hearing',
  Dismissed: 'Dismissed',
  Allowed: 'Allowed',
  Withdrawn: 'Withdrawn',
  Transferred: 'Transferred',
  Admitted: 'Admitted',
  LeaveGranted: 'Leave Granted',
  CounterFiled: 'Counter Filed',
  CounterNotFiled: 'Counter Not Filed',
  Pending: 'Pending',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  Critical: 'Critical',
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
};

export const FILING_TYPE_LABELS: Record<FilingType, string> = {
  CounterAffidavit: 'Counter Affidavit',
  Rejoinder: 'Rejoinder',
  WrittenSubmission: 'Written Submission',
  Application: 'Application',
  Vakalatnama: 'Vakalatnama',
  Compilation: 'Compilation',
  SynopsisListOfDates: 'Synopsis & List of Dates',
  Caveat: 'Caveat',
  AdditionalDocuments: 'Additional Documents',
  MemoOfAppearance: 'Memo of Appearance',
  Affidavit: 'Affidavit',
};

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  NotStarted: 'Not Started',
  Drafting: 'Drafting',
  UnderReview: 'Under Review',
  ReadyForFiling: 'Ready for Filing',
  Filed: 'Filed',
  RejectedRefiled: 'Rejected & Refiled',
};

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Overdue: 'Overdue',
  Waived: 'Waived',
};

export const COURTS = [
  'Supreme Court of India',
  'High Court of Delhi',
  'High Court of Uttarakhand',
  'High Court of Allahabad',
  'NCLT',
  'NCLAT',
  'ITAT',
  'NGT',
  'CAT',
  'Consumer Forum',
] as const;

export const DEPARTMENTS = [
  'Home',
  'Forest',
  'Urban Development',
  'Education',
  'Medical',
  'Finance',
  'PWD',
  'Social Welfare',
  'Labour',
  'Higher Education',
  'Industrial Development',
  'Cooperative Societies',
  'Sainik Welfare',
  'Animal Husbandry',
  'Disaster Management',
  'Revenue',
  'Home Guards',
  'Medical Education',
  'PIL',
  'Election',
  'Service Matter',
  'Department of Personnel',
] as const;

export const ROLES = [
  'Petitioner',
  'Respondent',
  'Intervenor',
  'Amicus',
  'Caveator',
  'Impleader',
] as const;

export const CATEGORIES = [
  'SLP (Civil)',
  'SLP (Criminal)',
  'Civil Appeal',
  'Criminal Appeal',
  'Writ Petition (Civil)',
  'Writ Petition (Criminal)',
  'Contempt Petition (Civil)',
  'Contempt Petition (Criminal)',
  'Transfer Petition',
  'Review Petition',
  'Original Suit',
  'Miscellaneous Application',
  'Company Petition',
  'Tax Appeal',
] as const;
