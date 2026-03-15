'use client';

import type { UserRole } from '@/lib/cms-types';

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
      className="w-full px-6 py-8 sm:px-10 sm:py-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{
        background: 'linear-gradient(135deg, #1B2A4A, #2E5090)',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div className="flex flex-col gap-1">
        <h1
          className="text-white font-semibold leading-tight"
          style={{ fontSize: '2em', fontWeight: 600 }}
        >
          Case Management System
        </h1>
        <p
          className="leading-snug"
          style={{ fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.9)' }}
        >
          Dr. Abhishek Atrey &mdash; Advocate on Record, Supreme Court of India
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
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
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100 cursor-pointer"
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
