// ============================================================
// Atrey CMS — Design Tokens (Single Source of Truth)
// ============================================================

export const colors = {
  // Brand
  navy: '#1B2A4A',
  navyDark: '#2E5090',
  accent: '#4472C4',
  accentHover: '#3A62A8',

  // Semantic
  success: '#28A745',
  warning: '#FF8C00',
  warningLight: '#D97706',
  danger: '#FF4444',
  dangerDark: '#DC2626',
  info: '#0D9488',

  // Neutral
  text: '#333333',
  textSecondary: '#6C757D',
  placeholder: '#999999',
  border: '#D1D5DB',
  borderLight: '#E5E7EB',
  bgPage: '#F0F2F5',
  bgCard: '#FFFFFF',
  bgHover: '#F8F9FA',
  bgInput: '#FFFFFF',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 2px 8px rgba(0,0,0,0.08)',
  lg: '0 4px 16px rgba(0,0,0,0.12)',
  xl: '0 8px 30px rgba(0,0,0,0.15)',
} as const;

export const fontFamily = "'Segoe UI', system-ui, -apple-system, sans-serif";

// Shared Tailwind class strings
export const tw = {
  input: 'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors',
  select: 'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors appearance-none cursor-pointer pr-8',
  label: 'text-xs font-semibold uppercase tracking-wider text-[#6C757D]',
  badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap',
  textarea: 'w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-[#333333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors resize-y',
} as const;

export const selectArrowStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 8px center' as const,
} as const;

// Badge variant maps (unified across entire CMS)
export const badgeVariants = {
  // Priority
  Critical: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  High: 'bg-orange-50 text-[#FF8C00] border-[#FF8C00]',
  Medium: 'bg-yellow-50 text-[#D97706] border-[#D97706]',
  Low: 'bg-green-50 text-[#28A745] border-[#28A745]',

  // Status (general)
  Active: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  Pending: 'bg-yellow-50 text-[#D97706] border-[#D97706]',
  Completed: 'bg-green-50 text-[#28A745] border-[#28A745]',
  Overdue: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  Draft: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  Approved: 'bg-green-50 text-[#28A745] border-[#28A745]',
  Rejected: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  Submitted: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',

  // Notification severity
  info: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  warning: 'bg-orange-50 text-[#FF8C00] border-[#FF8C00]',
  urgent: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  critical: 'bg-red-100 text-red-700 border-[#DC2626]',

  // Misc
  success: 'bg-green-50 text-[#28A745] border-[#28A745]',
  danger: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  default: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
} as const;

// Stat card colors
export const statColors = {
  blue: { bg: '#EBF2FF', border: '#4472C4', text: '#4472C4' },
  green: { bg: '#EAFBEF', border: '#28A745', text: '#28A745' },
  orange: { bg: '#FFF8EB', border: '#FF8C00', text: '#FF8C00' },
  red: { bg: '#FFF5F5', border: '#FF4444', text: '#FF4444' },
  gray: { bg: '#F8F9FA', border: '#6C757D', text: '#6C757D' },
  teal: { bg: '#F0FDFA', border: '#0D9488', text: '#0D9488' },
} as const;
