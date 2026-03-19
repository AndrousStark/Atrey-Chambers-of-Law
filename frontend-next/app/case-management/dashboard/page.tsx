'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import { cmsDashboard, cmsScraper, cmsAuth } from '@/lib/cms-api';
import type { ScraperStatus } from '@/lib/cms-api';
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

function timeAgoShort(dateStr: string | null): string {
  if (!dateStr) return 'Never run';
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  useEffect(() => {
    const user = cmsAuth.getUser();
    if (user && user.role === 'superadmin') {
      setIsSuperadmin(true);
    }
  }, []);

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

  // Fetch scraper status for superadmin
  useEffect(() => {
    if (!isSuperadmin) return;
    cmsScraper.getStatus().then(setScraperStatus).catch(() => {});
  }, [isSuperadmin]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1B2A4A' }}>
          <LayoutDashboard size={24} />
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
          {/* Stat cards -- full width */}
          <StatCardsRow stats={data.stats} />

          {/* Auto-Fetch status banner -- superadmin only */}
          {isSuperadmin && scraperStatus && (
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: scraperStatus.lastRun ? '#EDF2FA' : '#F0F2F5',
                color: scraperStatus.lastRun ? '#4472C4' : '#6C757D',
              }}
            >
              <RefreshCw size={16} />
              <span>
                <span className="font-semibold">Auto-Fetch:</span>
                {scraperStatus.lastRun ? (
                  <>{' '}Last run {timeAgoShort(scraperStatus.lastRun)} &mdash; {scraperStatus.casesUpdated} cases updated</>
                ) : (
                  <>{' '}Never run</>
                )}
              </span>
            </div>
          )}

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
