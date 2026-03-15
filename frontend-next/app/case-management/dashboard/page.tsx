'use client';

import React, { useEffect, useState } from 'react';
import { cmsDashboard } from '@/lib/cms-api';
import type { DashboardStats, Case, ComplianceItem, AuditEntry } from '@/lib/cms-types';
import StatCardsRow from '@/components/cms/dashboard/StatCardsRow';
import UpcomingHearingsWidget from '@/components/cms/dashboard/UpcomingHearingsWidget';
import DistributionCharts from '@/components/cms/dashboard/DistributionCharts';
import OverdueComplianceWidget from '@/components/cms/dashboard/OverdueComplianceWidget';
import RecentActivityWidget from '@/components/cms/dashboard/RecentActivityWidget';

interface DashboardData {
  stats: DashboardStats;
  upcoming: Case[];
  overdue: ComplianceItem[];
  activity: AuditEntry[];
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Stat cards skeleton */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl h-24"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderLeft: '4px solid #E8ECF1',
            }}
          >
            <div className="p-5 space-y-3">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-6 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Widget grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl h-64"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <div className="p-5 space-y-4">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="space-y-3">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="rounded-xl p-5 flex items-center justify-between"
      style={{
        backgroundColor: '#FFF5F5',
        border: '1px solid #FFE0E0',
      }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: '#FF4444' }}>
          Failed to load dashboard
        </p>
        <p className="text-xs mt-1" style={{ color: '#6C757D' }}>
          {message}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: '#4472C4' }}
      >
        Retry
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const [stats, upcoming, overdue, activity] = await Promise.all([
        cmsDashboard.stats(),
        cmsDashboard.upcoming(),
        cmsDashboard.overdue(),
        cmsDashboard.activity(),
      ]);

      setData({ stats, upcoming, overdue, activity });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6C757D' }}>
          Case management overview
        </p>
      </div>

      {/* Loading state */}
      {loading && <LoadingSkeleton />}

      {/* Error state */}
      {!loading && error && (
        <ErrorBanner message={error} onRetry={fetchDashboard} />
      )}

      {/* Dashboard content */}
      {!loading && !error && data && (
        <div className="space-y-6">
          {/* Stat cards — full width */}
          <StatCardsRow stats={data.stats} />

          {/* Row 1: Upcoming Hearings (left) + Distribution Charts (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingHearingsWidget cases={data.upcoming} />
            <DistributionCharts
              courtDistribution={data.stats.courtDistribution}
              departmentDistribution={data.stats.departmentDistribution}
            />
          </div>

          {/* Row 2: Overdue Compliance (left) + Recent Activity (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OverdueComplianceWidget items={data.overdue} />
            <RecentActivityWidget entries={data.activity} />
          </div>
        </div>
      )}
    </div>
  );
}
