'use client';

import type { UserRole } from '@/lib/cms-types';
import NotificationBell from './NotificationBell';
import TimerWidget from './TimerWidget';
import LanguageToggle from './LanguageToggle';

interface CmsHeaderProps {
  readonly userName: string;
  readonly userRole: UserRole;
  readonly onLogout: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export default function CmsHeader({ userName, userRole, onLogout }: CmsHeaderProps) {
  return (
    <header
      className="w-full px-5 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
      style={{
        background: 'linear-gradient(135deg, #1B2A4A, #2E5090)',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div className="flex flex-col gap-1">
        <h1
          className="text-white font-bold leading-tight text-xl sm:text-2xl"
          style={{ fontWeight: 700 }}
        >
          ATREY CMS
        </h1>
        <p
          className="leading-snug"
          style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.6em', position: 'relative', top: '-2px' }}
        >
          (Case Management System)
        </p>
        <p
          className="leading-snug text-xs sm:text-sm"
          style={{ color: 'rgba(255, 255, 255, 0.8)' }}
        >
          Dr. Abhishek Atrey &mdash; Advocate on Record, Supreme Court of India
        </p>
        <p
          className="leading-snug"
          style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75em' }}
        >
          Made by{' '}
          <a
            href="https://aniruddhatrey.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-200"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
          >
            Aniruddh Atrey
          </a>
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <LanguageToggle />
        <TimerWidget />
        <NotificationBell />
        <div className="text-right hidden sm:block">
          <p className="text-white text-sm font-medium leading-tight">
            {userName}
          </p>
          <p
            className="text-xs leading-tight"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {ROLE_LABELS[userRole]}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100 cursor-pointer min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#1B2A4A',
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
