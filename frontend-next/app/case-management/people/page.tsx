'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Users, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CmsLoadingState from '@/components/cms/ui/CmsLoadingState';

// ============================================================
// Design tokens
// ============================================================
const ACCENT = '#4472C4';
const GREY = '#6C757D';
const NAVY = '#1B2A4A';

// ============================================================
// Tab definitions
// ============================================================
type TabKey = 'clients' | 'team';

interface TabDef {
  readonly key: TabKey;
  readonly label: string;
  readonly icon: LucideIcon;
}

const TABS: readonly TabDef[] = [
  { key: 'clients', label: 'Clients', icon: Users },
  { key: 'team', label: 'Team', icon: UserCog },
] as const;

// ============================================================
// Lazy-loaded sub-pages
// ============================================================
const LoadingSkeleton = () => <CmsLoadingState text="Loading..." />;

const ClientsPage = dynamic(() => import('../clients/page'), {
  loading: LoadingSkeleton,
});

const UsersPage = dynamic(() => import('../users/page'), {
  loading: LoadingSkeleton,
});

const TAB_CONTENT: Record<TabKey, React.ComponentType> = {
  clients: ClientsPage,
  team: UsersPage,
};

// ============================================================
// Sub-tab bar
// ============================================================
interface SubTabBarProps {
  readonly activeTab: TabKey;
  readonly onTabChange: (tab: TabKey) => void;
}

function SubTabBar({ activeTab, onTabChange }: SubTabBarProps) {
  return (
    <div
      className="flex gap-1 bg-white border-b border-gray-200 px-6"
      role="tablist"
      aria-label="People sub-tabs"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors relative"
            style={{
              color: isActive ? ACCENT : GREY,
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            <Icon size={16} />
            {tab.label}
            {/* Active indicator bar */}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t"
                style={{ backgroundColor: ACCENT }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Main page
// ============================================================
export default function PeoplePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('clients');

  const ActiveContent = TAB_CONTENT[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 pt-6 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${NAVY}10` }}
          >
            <Users size={20} style={{ color: NAVY }} />
          </div>
          <div>
            <h1
              className="text-xl font-bold"
              style={{
                color: NAVY,
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}
            >
              People
            </h1>
            <p className="text-xs" style={{ color: GREY }}>
              Manage clients and team members
            </p>
          </div>
        </div>

        {/* Sub-tab bar (sits flush at bottom of header) */}
        <SubTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab content */}
      <div className="p-0">
        <ActiveContent />
      </div>
    </div>
  );
}
