'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Scale, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Design tokens ───────────────────────────────────────────
const ACCENT = '#4472C4';
const GREY = '#6C757D';
const NAVY = '#1B2A4A';

// ─── Lazy-loaded sub-pages ───────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse p-4 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="h-3 w-16 bg-gray-200 rounded mb-3" />
            <div className="h-7 w-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 h-96" />
    </div>
  );
}

const CasesListPage = dynamic(() => import('./CasesListPage'), {
  loading: () => <LoadingSkeleton />,
});

const HearingsPage = dynamic(() => import('../hearings/page'), {
  loading: () => <LoadingSkeleton />,
});

const CalendarPage = dynamic(() => import('../calendar/page'), {
  loading: () => <LoadingSkeleton />,
});

const CompliancePage = dynamic(() => import('../compliance/page'), {
  loading: () => <LoadingSkeleton />,
});

// ─── Sub-tab definitions ─────────────────────────────────────

type TabKey = 'list' | 'hearings' | 'calendar' | 'compliance';

interface SubTab {
  readonly key: TabKey;
  readonly label: string;
  readonly icon: LucideIcon;
}

const SUB_TABS: readonly SubTab[] = [
  { key: 'list', label: 'All Cases', icon: Scale },
  { key: 'hearings', label: 'Hearings', icon: Clock },
  { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { key: 'compliance', label: 'Compliance', icon: CheckCircle },
] as const;

// ─── Main Page ───────────────────────────────────────────────

export default function CasesHubPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('list');

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Page header */}
      <div className="px-4 md:px-6 lg:px-8 pt-5 pb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: NAVY }}>
          <Scale size={24} />
          Cases
        </h1>
        <p className="text-sm mt-1" style={{ color: GREY }}>
          Manage cases, hearings, calendar, and compliance
        </p>
      </div>

      {/* Sub-tab bar */}
      <div className="px-4 md:px-6 lg:px-8 border-b border-gray-200 bg-white overflow-x-auto">
        <div className="flex min-w-max" role="tablist">
          {SUB_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 border-b-[3px] hover:bg-gray-50 min-h-[44px] cursor-pointer"
                style={{
                  color: isActive ? NAVY : GREY,
                  borderBottomColor: isActive ? ACCENT : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'list' && <CasesListPage />}
        {activeTab === 'hearings' && <HearingsPage />}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'compliance' && <CompliancePage />}
      </div>
    </div>
  );
}
