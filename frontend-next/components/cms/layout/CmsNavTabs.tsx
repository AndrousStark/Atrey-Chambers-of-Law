'use client';

import Link from 'next/link';
import type { UserRole } from '@/lib/cms-types';

interface TabDefinition {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly href: string;
  readonly adminOnly: boolean;
}

const TABS: readonly TabDefinition[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '\u229E', href: '/case-management/dashboard', adminOnly: false },
  { key: 'cases', label: 'Cases', icon: '\u2696', href: '/case-management/cases', adminOnly: false },
  { key: 'hearings', label: 'Hearings', icon: '\uD83D\uDCC5', href: '/case-management/hearings', adminOnly: false },
  { key: 'calendar', label: 'Calendar', icon: '\uD83D\uDDD3', href: '/case-management/calendar', adminOnly: false },
  { key: 'compliance', label: 'Compliance', icon: '\u2713', href: '/case-management/compliance', adminOnly: false },
  { key: 'filings', label: 'Filings', icon: '\uD83D\uDCC4', href: '/case-management/filings', adminOnly: false },
  { key: 'users', label: 'Users', icon: '\uD83D\uDC65', href: '/case-management/users', adminOnly: true },
  { key: 'audit', label: 'Audit', icon: '\uD83D\uDCCB', href: '/case-management/audit', adminOnly: true },
  { key: 'settings', label: 'Settings', icon: '\u2699', href: '/case-management/settings', adminOnly: true },
] as const;

interface CmsNavTabsProps {
  readonly activeTab: string;
  readonly userRole: UserRole;
}

export default function CmsNavTabs({ activeTab, userRole }: CmsNavTabsProps) {
  const visibleTabs = TABS.filter(
    (tab) => !tab.adminOnly || userRole === 'superadmin'
  );

  return (
    <nav
      className="cms-nav-tabs sticky top-0 z-30 w-full bg-white shadow-sm overflow-x-auto"
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {/* Hide scrollbar for WebKit browsers */}
      <style>{`.cms-nav-tabs::-webkit-scrollbar { display: none; }`}</style>
      <div className="flex min-w-max">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 border-b-[3px] hover:bg-gray-50 min-h-[44px]"
              style={{
                color: isActive ? '#1B2A4A' : '#6C757D',
                borderBottomColor: isActive ? '#4472C4' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <span className="text-base" role="img" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
