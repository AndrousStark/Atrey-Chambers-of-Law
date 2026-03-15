'use client';

import React from 'react';
import CmsStatCard from '@/components/cms/ui/CmsStatCard';
import type { DashboardStats } from '@/lib/cms-types';

interface StatCardsRowProps {
  stats: DashboardStats;
}

export default function StatCardsRow({ stats }: StatCardsRowProps) {
  const totalCourts = stats.courtDistribution.reduce((sum, c) => sum + c.count, 0);
  const topCourt = stats.courtDistribution.length > 0
    ? stats.courtDistribution.reduce((a, b) => (a.count > b.count ? a : b))
    : null;

  const cards = [
    {
      label: 'Total Active',
      value: stats.totalActive,
      detail: 'Active cases in the system',
      color: '#4472C4',
    },
    {
      label: 'Hearings This Week',
      value: stats.hearingsThisWeek,
      detail: 'Upcoming in next 7 days',
      color: '#FF4444',
    },
    {
      label: 'Pending Compliance',
      value: stats.pendingCompliance,
      detail: 'Overdue or pending items',
      color: '#FF8C00',
    },
    {
      label: 'Counter Not Filed',
      value: stats.counterNotFiled,
      detail: 'Awaiting counter filing',
      color: '#FFC107',
    },
    {
      label: 'Disposed',
      value: stats.disposedCases,
      detail: 'Disposed or dismissed',
      color: '#28A745',
    },
    {
      label: 'By Court',
      value: totalCourts,
      detail: topCourt ? `Most: ${topCourt.court} (${topCourt.count})` : 'No data',
      color: '#6C757D',
    },
  ];

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
    >
      {cards.map((card) => (
        <CmsStatCard
          key={card.label}
          label={card.label}
          value={card.value}
          detail={card.detail}
          color={card.color}
        />
      ))}
    </div>
  );
}
