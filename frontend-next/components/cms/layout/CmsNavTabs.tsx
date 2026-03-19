'use client';

import Link from 'next/link';
import type { UserRole } from '@/lib/cms-types';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Scale,
  Users,
  CheckSquare,
  FileText,
  Activity,
  Shield,
} from 'lucide-react';

interface TabDefinition {
  readonly key: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly href: string;
  readonly permission: string;
}

const TABS: readonly TabDefinition[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/case-management/dashboard', permission: 'page.dashboard' },
  { key: 'cases', label: 'Cases', icon: Scale, href: '/case-management/cases', permission: 'page.cases' },
  { key: 'people', label: 'People', icon: Users, href: '/case-management/people', permission: 'page.clients' },
  { key: 'work', label: 'Work', icon: CheckSquare, href: '/case-management/work', permission: 'page.tasks' },
  { key: 'documents', label: 'Documents', icon: FileText, href: '/case-management/documents', permission: 'page.documents' },
  { key: 'activity', label: 'Activity', icon: Activity, href: '/case-management/activity', permission: 'page.timetracking' },
  { key: 'admin', label: 'Admin', icon: Shield, href: '/case-management/admin', permission: 'page.settings' },
] as const;

interface CmsNavTabsProps {
  readonly activeTab: string;
  readonly userRole: UserRole;
  readonly userPermissions?: readonly string[];
}

export default function CmsNavTabs({ activeTab, userRole, userPermissions = [] }: CmsNavTabsProps) {
  const visibleTabs = TABS.filter((tab) => {
    if (userRole === 'superadmin') return true;
    return userPermissions.includes(tab.permission);
  });

  return (
    <nav
      className="cms-nav-tabs sticky top-0 z-30 w-full bg-white shadow-sm overflow-x-auto"
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style>{`.cms-nav-tabs::-webkit-scrollbar { display: none; }`}</style>
      <div className="flex min-w-max">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 border-b-[3px] hover:bg-gray-50 min-h-[44px]"
              style={{
                color: isActive ? '#1B2A4A' : '#6C757D',
                borderBottomColor: isActive ? '#4472C4' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
