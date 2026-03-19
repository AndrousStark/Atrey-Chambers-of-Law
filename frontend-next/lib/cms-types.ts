// ============================================================
// Case Management System — TypeScript Types
// ============================================================

// --- Enums ---

export type CaseStatus =
  | 'Active'
  | 'Pending'
  | 'ListedForHearing'
  | 'PartHeard'
  | 'ReservedForJudgment'
  | 'Disposed'
  | 'Dismissed'
  | 'Allowed'
  | 'Withdrawn'
  | 'Transferred'
  | 'StayGranted'
  | 'NoticeIssued'
  | 'Admitted'
  | 'LeaveGranted'
  | 'CounterFiled'
  | 'CounterNotFiled'
  | 'Adjourned'
  | 'Tagged'
  | 'Clubbed'
  | 'PartlyAllowed'
  | 'RemandedBack'
  | 'ConvertedToAppeal'
  | 'FreshNotice'
  | 'DefectsRemoved'
  | 'DefectsPending'
  | 'Closed';

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
  permissions: string[];
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

// --- Document ---

export type DocumentCategory = 'Pleading' | 'Application' | 'Affidavit' | 'CourtOrder' | 'Judgment' | 'Notice' | 'Correspondence' | 'Evidence' | 'Agreement' | 'Template' | 'Other';

export interface Document {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  category: DocumentCategory;
  description: string | null;
  tags: string[];
  version: number;
  parentId: string | null;
  isArchived: boolean;
  caseId: string | null;
  case?: { id: string; caseNo: string; caseTitle: string } | null;
  clientId: string | null;
  client?: { id: string; name: string } | null;
  uploadedById: string;
  uploadedBy?: { id: string; name: string } | null;
  _count?: { versions: number };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: DocumentCategory;
  templateKey: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  Pleading: 'Pleading',
  Application: 'Application',
  Affidavit: 'Affidavit',
  CourtOrder: 'Court Order',
  Judgment: 'Judgment',
  Notice: 'Notice',
  Correspondence: 'Correspondence',
  Evidence: 'Evidence',
  Agreement: 'Agreement',
  Template: 'Template',
  Other: 'Other',
};

// --- Time Tracking ---

export type ActivityType = 'Research' | 'Drafting' | 'CourtAppearance' | 'Travel' | 'ClientMeeting' | 'PhoneCall' | 'ReviewWork' | 'FilingWork' | 'Administrative' | 'Consultation' | 'Conference' | 'Other';
export type TimeEntryStatus = 'Running' | 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface TimeEntry {
  id: string;
  userId: string;
  user?: { id: string; name: string; email: string } | null;
  caseId: string | null;
  case?: { id: string; caseNo: string; caseTitle: string } | null;
  clientId: string | null;
  client?: { id: string; name: string } | null;
  taskId: string | null;
  task?: { id: string; title: string } | null;
  hearingId: string | null;
  activityType: ActivityType;
  description: string;
  tags: string[];
  date: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  isTimerEntry: boolean;
  billable: boolean;
  ratePerHour: number | null;
  amount: number | null;
  status: TimeEntryStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  approvedBy?: { id: string; name: string } | null;
  rejectionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RunningTimer {
  id: string;
  userId: string;
  caseId: string | null;
  case?: { id: string; caseNo: string; caseTitle: string } | null;
  activityType: ActivityType;
  description: string | null;
  startedAt: string;
  isPaused: boolean;
  accumulatedMs: number;
  elapsedMs?: number;
  elapsedMinutes?: number;
}

export interface TimeSummaryReport {
  totalMinutes: number;
  totalEntries: number;
  byActivity: { activityType: string; totalMinutes: number; count: number }[];
  billableMinutes: number;
  nonBillableMinutes: number;
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  Research: 'Research',
  Drafting: 'Drafting',
  CourtAppearance: 'Court Appearance',
  Travel: 'Travel',
  ClientMeeting: 'Client Meeting',
  PhoneCall: 'Phone Call',
  ReviewWork: 'Review',
  FilingWork: 'Filing',
  Administrative: 'Administrative',
  Consultation: 'Consultation',
  Conference: 'Conference',
  Other: 'Other',
};

export const TIME_ENTRY_STATUS_LABELS: Record<TimeEntryStatus, string> = {
  Running: 'Running',
  Draft: 'Draft',
  Submitted: 'Submitted',
  Approved: 'Approved',
  Rejected: 'Rejected',
};

// --- Client ---

export type ClientCategory = 'Individual' | 'Corporate' | 'Government' | 'NGO' | 'Trust' | 'Other';

export interface Client {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  category: ClientCategory;
  organization: string | null;
  notes: string | null;
  isActive: boolean;
  createdById: string | null;
  createdBy?: { id: string; name: string } | null;
  _count?: { cases: number; tasks: number };
  cases?: Case[];
  createdAt: string;
  updatedAt: string;
}

// --- Task ---

export type TaskStatus = 'Todo' | 'InProgress' | 'Done' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskCategory = 'Research' | 'Drafting' | 'Filing' | 'CourtAppearance' | 'ClientCommunication' | 'Internal' | 'Review' | 'Other';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string | null;
  completedAt: string | null;
  tags: string[];
  caseId: string | null;
  case?: { id: string; caseNo: string; caseTitle: string } | null;
  clientId: string | null;
  client?: { id: string; name: string } | null;
  assignedToId: string | null;
  assignedTo?: { id: string; name: string; email: string } | null;
  createdById: string | null;
  createdBy?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  todo: number;
  inProgress: number;
  done: number;
  blocked: number;
  overdue: number;
  total: number;
}

// --- Notification ---

export type NotificationSeverity = 'info' | 'warning' | 'urgent' | 'critical';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  severity: NotificationSeverity;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  acknowledgedAt: string | null;
  snoozedUntil: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  notificationType: string;
  channel: string;
  enabled: boolean;
  advanceDays: number[];
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  Todo: 'To Do',
  InProgress: 'In Progress',
  Done: 'Done',
  Blocked: 'Blocked',
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  Research: 'Research',
  Drafting: 'Drafting',
  Filing: 'Filing',
  CourtAppearance: 'Court Appearance',
  ClientCommunication: 'Client Communication',
  Internal: 'Internal',
  Review: 'Review',
  Other: 'Other',
};

export const CLIENT_CATEGORY_LABELS: Record<ClientCategory, string> = {
  Individual: 'Individual',
  Corporate: 'Corporate',
  Government: 'Government',
  NGO: 'NGO',
  Trust: 'Trust',
  Other: 'Other',
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  hearing_reminder: 'Hearing Reminder',
  compliance_deadline: 'Compliance Deadline',
  task_assigned: 'Task Assigned',
  task_overdue: 'Task Overdue',
  case_assigned: 'Case Assigned',
  case_status_change: 'Case Status Change',
};

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
  Pending: 'Pending',
  ListedForHearing: 'Listed for Hearing',
  PartHeard: 'Part Heard',
  ReservedForJudgment: 'Reserved for Judgment',
  Disposed: 'Disposed',
  Dismissed: 'Dismissed',
  Allowed: 'Allowed',
  Withdrawn: 'Withdrawn',
  Transferred: 'Transferred',
  StayGranted: 'Stay Granted',
  NoticeIssued: 'Notice Issued',
  Admitted: 'Admitted',
  LeaveGranted: 'Leave Granted',
  CounterFiled: 'Counter Filed',
  CounterNotFiled: 'Counter Not Filed',
  Adjourned: 'Adjourned',
  Tagged: 'Tagged',
  Clubbed: 'Clubbed',
  PartlyAllowed: 'Partly Allowed',
  RemandedBack: 'Remanded Back',
  ConvertedToAppeal: 'Converted to Appeal',
  FreshNotice: 'Fresh Notice',
  DefectsRemoved: 'Defects Removed',
  DefectsPending: 'Defects Pending',
  Closed: 'Closed',
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

// ============================================================
// Courts — Complete list of Indian courts relevant to an AOR practice
// Grouped by: Supreme Court, High Courts (all 25), Tribunals, Lower Courts
// ============================================================

export const COURTS = [
  // --- Supreme Court ---
  'Supreme Court of India',

  // --- High Courts (all 25) ---
  'High Court of Allahabad',
  'High Court of Andhra Pradesh (Amaravati)',
  'High Court of Bombay',
  'High Court of Calcutta',
  'High Court of Chhattisgarh (Bilaspur)',
  'High Court of Delhi',
  'High Court of Gauhati',
  'High Court of Gujarat',
  'High Court of Himachal Pradesh (Shimla)',
  'High Court of Jammu & Kashmir and Ladakh',
  'High Court of Jharkhand (Ranchi)',
  'High Court of Karnataka',
  'High Court of Kerala',
  'High Court of Madhya Pradesh (Jabalpur)',
  'High Court of Madras',
  'High Court of Manipur (Imphal)',
  'High Court of Meghalaya (Shillong)',
  'High Court of Orissa (Cuttack)',
  'High Court of Patna',
  'High Court of Punjab and Haryana (Chandigarh)',
  'High Court of Rajasthan',
  'High Court of Sikkim (Gangtok)',
  'High Court of Telangana (Hyderabad)',
  'High Court of Tripura (Agartala)',
  'High Court of Uttarakhand (Nainital)',

  // --- Tribunals ---
  'National Company Law Tribunal (NCLT)',
  'National Company Law Appellate Tribunal (NCLAT)',
  'Income Tax Appellate Tribunal (ITAT)',
  'National Green Tribunal (NGT)',
  'Central Administrative Tribunal (CAT)',
  'Telecom Disputes Settlement & Appellate Tribunal (TDSAT)',
  'National Consumer Disputes Redressal Commission (NCDRC)',
  'Securities Appellate Tribunal (SAT)',
  'Armed Forces Tribunal (AFT)',
  'Debt Recovery Tribunal (DRT)',
  'Debt Recovery Appellate Tribunal (DRAT)',
  'Real Estate Appellate Tribunal (RERA AT)',
  'Customs, Excise & Service Tax Appellate Tribunal (CESTAT)',
  'Appellate Tribunal for Electricity (APTEL)',
  'National Company Law Tribunal - Principal Bench (NCLT Delhi)',
  'Competition Commission of India (CCI)',
  'Competition Appellate Tribunal',
  'Intellectual Property Appellate Board (IPAB)',
  'Railway Claims Tribunal',
  'Cyber Appellate Tribunal',

  // --- Consumer Forums ---
  'District Consumer Disputes Redressal Forum',
  'State Consumer Disputes Redressal Commission',
  'National Consumer Disputes Redressal Commission (NCDRC)',

  // --- Lower / Subordinate Courts ---
  'District Court',
  'Sessions Court',
  'Civil Judge (Senior Division)',
  'Civil Judge (Junior Division)',
  'Metropolitan Magistrate Court',
  'Judicial Magistrate First Class (JMFC)',
  'Chief Judicial Magistrate Court',
  'Family Court',
  'Labour Court',
  'Industrial Tribunal',
  'Motor Accident Claims Tribunal (MACT)',
  'Special Court (NIA / PMLA / NDPS)',
  'Commercial Court',
  'Revenue Court / Board of Revenue',
  'Lok Adalat',
  'Gram Nyayalaya',

  // --- Other ---
  'Other',
] as const;

// Short labels for display in compact views (charts, tags, etc.)
export const COURT_SHORT_LABELS: Record<string, string> = {
  'Supreme Court of India': 'SCI',
  'High Court of Allahabad': 'HC Allahabad',
  'High Court of Andhra Pradesh (Amaravati)': 'HC AP',
  'High Court of Bombay': 'HC Bombay',
  'High Court of Calcutta': 'HC Calcutta',
  'High Court of Chhattisgarh (Bilaspur)': 'HC Chhattisgarh',
  'High Court of Delhi': 'HC Delhi',
  'High Court of Gauhati': 'HC Gauhati',
  'High Court of Gujarat': 'HC Gujarat',
  'High Court of Himachal Pradesh (Shimla)': 'HC HP',
  'High Court of Jammu & Kashmir and Ladakh': 'HC J&K',
  'High Court of Jharkhand (Ranchi)': 'HC Jharkhand',
  'High Court of Karnataka': 'HC Karnataka',
  'High Court of Kerala': 'HC Kerala',
  'High Court of Madhya Pradesh (Jabalpur)': 'HC MP',
  'High Court of Madras': 'HC Madras',
  'High Court of Manipur (Imphal)': 'HC Manipur',
  'High Court of Meghalaya (Shillong)': 'HC Meghalaya',
  'High Court of Orissa (Cuttack)': 'HC Orissa',
  'High Court of Patna': 'HC Patna',
  'High Court of Punjab and Haryana (Chandigarh)': 'HC P&H',
  'High Court of Rajasthan': 'HC Rajasthan',
  'High Court of Sikkim (Gangtok)': 'HC Sikkim',
  'High Court of Telangana (Hyderabad)': 'HC Telangana',
  'High Court of Tripura (Agartala)': 'HC Tripura',
  'High Court of Uttarakhand (Nainital)': 'HC Uttarakhand',
  'National Company Law Tribunal (NCLT)': 'NCLT',
  'National Company Law Appellate Tribunal (NCLAT)': 'NCLAT',
  'Income Tax Appellate Tribunal (ITAT)': 'ITAT',
  'National Green Tribunal (NGT)': 'NGT',
  'Central Administrative Tribunal (CAT)': 'CAT',
  'Telecom Disputes Settlement & Appellate Tribunal (TDSAT)': 'TDSAT',
  'National Consumer Disputes Redressal Commission (NCDRC)': 'NCDRC',
  'Securities Appellate Tribunal (SAT)': 'SAT',
  'Armed Forces Tribunal (AFT)': 'AFT',
  'Debt Recovery Tribunal (DRT)': 'DRT',
  'Debt Recovery Appellate Tribunal (DRAT)': 'DRAT',
  'Real Estate Appellate Tribunal (RERA AT)': 'RERA AT',
  'Customs, Excise & Service Tax Appellate Tribunal (CESTAT)': 'CESTAT',
  'Appellate Tribunal for Electricity (APTEL)': 'APTEL',
};

// ============================================================
// Departments — Government departments commonly seen in litigation
// Covers Central, State (Uttarakhand/Delhi focus), and generic departments
// ============================================================

export const DEPARTMENTS = [
  // --- Core State Government Departments ---
  'Home',
  'Finance',
  'Revenue',
  'Forest',
  'Urban Development',
  'Education',
  'Higher Education',
  'Medical',
  'Medical Education',
  'PWD',
  'Social Welfare',
  'Labour',
  'Agriculture',
  'Animal Husbandry',
  'Cooperative Societies',
  'Disaster Management',
  'Energy',
  'Environment',
  'Excise',
  'Food & Civil Supplies',
  'Health and Family Welfare',
  'Home Guards',
  'Housing',
  'Industrial Development',
  'Information Technology',
  'Irrigation',
  'Judiciary / Law Department',
  'Mines & Geology',
  'Panchayati Raj',
  'Planning',
  'Police',
  'Rural Development',
  'Sainik Welfare',
  'Science & Technology',
  'Sports & Youth Affairs',
  'Tourism',
  'Transport',
  'Tribal Welfare',
  'Water Supply & Sanitation',
  'Women & Child Development',
  'Department of Personnel',

  // --- Central Government Departments ---
  'Defence (MoD)',
  'Railways',
  'Telecom (DoT)',
  'Petroleum & Natural Gas',
  'Civil Aviation',
  'Shipping & Ports',
  'Commerce & Industry',
  'Consumer Affairs',
  'Corporate Affairs (MCA)',
  'External Affairs',
  'Heavy Industries',
  'Steel',
  'Textiles',
  'MSME',
  'Atomic Energy',
  'Space (ISRO / DoS)',
  'CBDT / Income Tax',
  'CBIC / Customs & Excise',
  'GST Council',
  'CBI',
  'NIA',
  'Enforcement Directorate (ED)',
  'SEBI',
  'RBI',
  'Insurance (IRDAI)',

  // --- Litigation-specific categories ---
  'PIL',
  'Election',
  'Service Matter',
  'Land Acquisition',
  'Municipal / Local Bodies',
  'Cantonment Board',
  'University / Educational Institution',
  'Public Sector Undertaking (PSU)',
  'Autonomous Body',
  'Private Party (Non-Govt)',
  'Other',
] as const;

// ============================================================
// Roles — Our role in the case (party capacity / legal standing)
// ============================================================

export const ROLES = [
  // --- Primary Party Roles ---
  'Petitioner',
  'Respondent',
  'Appellant',
  'Respondent (Appeal)',
  'Plaintiff',
  'Defendant',
  'Complainant',
  'Accused',
  'Applicant',

  // --- Secondary / Intervention Roles ---
  'Intervenor',
  'Impleader',
  'Amicus Curiae',
  'Caveator',
  'Party-in-Person',
  'Third Party',
  'Proforma Respondent',
  'Garnishee',
  'Decree Holder',
  'Judgment Debtor',

  // --- Special Roles ---
  'Advocate Commissioner',
  'Guardian Ad Litem',
  'Next Friend',
  'Receiver',
  'Liquidator',
  'Administrator',

  // --- Other ---
  'Other',
] as const;

// ============================================================
// Case Categories — Types of cases filed in Indian courts
// Covers Supreme Court, High Court, Tribunal, and lower court filings
// ============================================================

export const CATEGORIES = [
  // --- Supreme Court specific ---
  'SLP (Civil)',
  'SLP (Criminal)',
  'Civil Appeal',
  'Criminal Appeal',
  'Writ Petition (Civil)',
  'Writ Petition (Criminal)',
  'Contempt Petition (Civil)',
  'Contempt Petition (Criminal)',
  'Transfer Petition (Civil)',
  'Transfer Petition (Criminal)',
  'Review Petition',
  'Curative Petition',
  'Original Suit',
  'Arbitration Petition',
  'Miscellaneous Application',
  'Interlocutory Application',

  // --- High Court common ---
  'Civil Writ Petition',
  'Criminal Writ Petition',
  'First Appeal',
  'Second Appeal',
  'Civil Revision',
  'Criminal Revision',
  'Criminal Misc. Petition',
  'Letters Patent Appeal (LPA)',
  'Reference under Article 228',

  // --- Bail-related ---
  'Bail Application',
  'Anticipatory Bail Application',
  'Default Bail Application',
  'Interim Bail Application',

  // --- Company / Commercial ---
  'Company Petition',
  'Company Appeal',
  'Company Application',
  'Insolvency Petition (Corporate)',
  'Insolvency Petition (Personal)',
  'Commercial Suit',
  'Commercial Appeal',

  // --- Tax / Revenue ---
  'Tax Appeal',
  'Customs Appeal',
  'Central Excise Appeal',
  'GST Appeal',
  'Income Tax Appeal',
  'Income Tax Reference',

  // --- Tribunal-specific ---
  'OA (Original Application) - CAT',
  'MA (Misc. Application) - CAT',
  'OA (Original Application) - NGT',
  'Appeal - NGT',
  'OA (Original Application) - AFT',
  'Petition - TDSAT',
  'Appeal - SAT',
  'OA - DRT',
  'Appeal - DRAT',
  'Complaint - RERA',
  'Appeal - RERA AT',

  // --- Consumer ---
  'Consumer Complaint',
  'Consumer Appeal',
  'Consumer Revision',

  // --- Family / Matrimonial ---
  'Matrimonial Petition',
  'Divorce Petition',
  'Maintenance Application',
  'Domestic Violence Application',
  'Child Custody Petition',
  'Guardianship Petition',
  'Hindu Marriage Petition',
  'Muslim Personal Law Petition',

  // --- Labour ---
  'Labour Dispute',
  'Industrial Dispute',
  'Workmen Compensation Claim',

  // --- Criminal (lower court) ---
  'FIR / Complaint Case',
  'Charge Sheet / Challan',
  'Private Complaint (Sec 200 CrPC)',
  'Quashing Petition (Sec 482 CrPC)',
  'Habeas Corpus Petition',

  // --- Civil (lower court) ---
  'Civil Suit',
  'Declaratory Suit',
  'Injunction Suit',
  'Partition Suit',
  'Title Suit',
  'Money Recovery Suit',
  'Specific Performance Suit',
  'Execution Petition',
  'Land Acquisition Reference',

  // --- Special ---
  'Public Interest Litigation (PIL)',
  'Election Petition',
  'Contempt Application',
  'Caveat Application',
  'Succession / Probate Petition',
  'Motor Accident Claim',
  'Arbitration Application (Sec 9 / 11 / 34 / 36)',
  'Mediation Reference',
  'Lok Adalat Reference',

  // --- Other ---
  'Other',
] as const;

// ============================================================
// Grouped versions for <optgroup> rendering in dropdowns
// ============================================================

export const COURTS_GROUPED = [
  {
    label: 'Supreme Court',
    options: ['Supreme Court of India'],
  },
  {
    label: 'High Courts',
    options: COURTS.filter((c) => c.startsWith('High Court')),
  },
  {
    label: 'Tribunals',
    options: COURTS.filter((c) =>
      c.includes('Tribunal') || c.includes('NCLT') || c.includes('NCLAT') ||
      c.includes('CCI') || c.includes('IPAB')
    ),
  },
  {
    label: 'Consumer Forums',
    options: COURTS.filter((c) => c.includes('Consumer')),
  },
  {
    label: 'Lower / Subordinate Courts',
    options: [
      'District Court', 'Sessions Court', 'Civil Judge (Senior Division)',
      'Civil Judge (Junior Division)', 'Metropolitan Magistrate Court',
      'Judicial Magistrate First Class (JMFC)', 'Chief Judicial Magistrate Court',
      'Family Court', 'Labour Court', 'Industrial Tribunal',
      'Motor Accident Claims Tribunal (MACT)', 'Special Court (NIA / PMLA / NDPS)',
      'Commercial Court', 'Revenue Court / Board of Revenue',
      'Lok Adalat', 'Gram Nyayalaya',
    ],
  },
  {
    label: 'Other',
    options: ['Other'],
  },
] as const;

export const CATEGORIES_GROUPED = [
  {
    label: 'Supreme Court',
    options: [
      'SLP (Civil)', 'SLP (Criminal)', 'Civil Appeal', 'Criminal Appeal',
      'Writ Petition (Civil)', 'Writ Petition (Criminal)',
      'Contempt Petition (Civil)', 'Contempt Petition (Criminal)',
      'Transfer Petition (Civil)', 'Transfer Petition (Criminal)',
      'Review Petition', 'Curative Petition', 'Original Suit',
      'Arbitration Petition', 'Miscellaneous Application', 'Interlocutory Application',
    ],
  },
  {
    label: 'High Court',
    options: [
      'Civil Writ Petition', 'Criminal Writ Petition',
      'First Appeal', 'Second Appeal', 'Civil Revision', 'Criminal Revision',
      'Criminal Misc. Petition', 'Letters Patent Appeal (LPA)',
      'Reference under Article 228',
    ],
  },
  {
    label: 'Bail',
    options: [
      'Bail Application', 'Anticipatory Bail Application',
      'Default Bail Application', 'Interim Bail Application',
    ],
  },
  {
    label: 'Company / Commercial',
    options: [
      'Company Petition', 'Company Appeal', 'Company Application',
      'Insolvency Petition (Corporate)', 'Insolvency Petition (Personal)',
      'Commercial Suit', 'Commercial Appeal',
    ],
  },
  {
    label: 'Tax / Revenue',
    options: [
      'Tax Appeal', 'Customs Appeal', 'Central Excise Appeal',
      'GST Appeal', 'Income Tax Appeal', 'Income Tax Reference',
    ],
  },
  {
    label: 'Tribunal',
    options: [
      'OA (Original Application) - CAT', 'MA (Misc. Application) - CAT',
      'OA (Original Application) - NGT', 'Appeal - NGT',
      'OA (Original Application) - AFT', 'Petition - TDSAT',
      'Appeal - SAT', 'OA - DRT', 'Appeal - DRAT',
      'Complaint - RERA', 'Appeal - RERA AT',
    ],
  },
  {
    label: 'Consumer',
    options: ['Consumer Complaint', 'Consumer Appeal', 'Consumer Revision'],
  },
  {
    label: 'Family / Matrimonial',
    options: [
      'Matrimonial Petition', 'Divorce Petition', 'Maintenance Application',
      'Domestic Violence Application', 'Child Custody Petition',
      'Guardianship Petition', 'Hindu Marriage Petition', 'Muslim Personal Law Petition',
    ],
  },
  {
    label: 'Labour',
    options: ['Labour Dispute', 'Industrial Dispute', 'Workmen Compensation Claim'],
  },
  {
    label: 'Criminal (Lower Court)',
    options: [
      'FIR / Complaint Case', 'Charge Sheet / Challan',
      'Private Complaint (Sec 200 CrPC)', 'Quashing Petition (Sec 482 CrPC)',
      'Habeas Corpus Petition',
    ],
  },
  {
    label: 'Civil (Lower Court)',
    options: [
      'Civil Suit', 'Declaratory Suit', 'Injunction Suit', 'Partition Suit',
      'Title Suit', 'Money Recovery Suit', 'Specific Performance Suit',
      'Execution Petition', 'Land Acquisition Reference',
    ],
  },
  {
    label: 'Special',
    options: [
      'Public Interest Litigation (PIL)', 'Election Petition',
      'Contempt Application', 'Caveat Application',
      'Succession / Probate Petition', 'Motor Accident Claim',
      'Arbitration Application (Sec 9 / 11 / 34 / 36)',
      'Mediation Reference', 'Lok Adalat Reference',
    ],
  },
  {
    label: 'Other',
    options: ['Other'],
  },
] as const;

export const DEPARTMENTS_GROUPED = [
  {
    label: 'State Government',
    options: [
      'Home', 'Finance', 'Revenue', 'Forest', 'Urban Development',
      'Education', 'Higher Education', 'Medical', 'Medical Education',
      'PWD', 'Social Welfare', 'Labour', 'Agriculture',
      'Animal Husbandry', 'Cooperative Societies', 'Disaster Management',
      'Energy', 'Environment', 'Excise', 'Food & Civil Supplies',
      'Health and Family Welfare', 'Home Guards', 'Housing', 'Industrial Development',
      'Information Technology', 'Irrigation', 'Judiciary / Law Department',
      'Mines & Geology', 'Panchayati Raj', 'Planning', 'Police',
      'Rural Development', 'Sainik Welfare', 'Science & Technology',
      'Sports & Youth Affairs', 'Tourism', 'Transport', 'Tribal Welfare',
      'Water Supply & Sanitation', 'Women & Child Development', 'Department of Personnel',
    ],
  },
  {
    label: 'Central Government',
    options: [
      'Defence (MoD)', 'Railways', 'Telecom (DoT)', 'Petroleum & Natural Gas',
      'Civil Aviation', 'Shipping & Ports', 'Commerce & Industry', 'Consumer Affairs',
      'Corporate Affairs (MCA)', 'External Affairs', 'Heavy Industries', 'Steel',
      'Textiles', 'MSME', 'Atomic Energy', 'Space (ISRO / DoS)',
      'CBDT / Income Tax', 'CBIC / Customs & Excise', 'GST Council',
      'CBI', 'NIA', 'Enforcement Directorate (ED)', 'SEBI', 'RBI', 'Insurance (IRDAI)',
    ],
  },
  {
    label: 'Litigation Categories',
    options: [
      'PIL', 'Election', 'Service Matter', 'Land Acquisition',
      'Municipal / Local Bodies', 'Cantonment Board',
      'University / Educational Institution', 'Public Sector Undertaking (PSU)',
      'Autonomous Body', 'Private Party (Non-Govt)', 'Other',
    ],
  },
] as const;

export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
