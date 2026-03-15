'use client';

import React from 'react';
import Link from 'next/link';
import type { Case } from '@/lib/cms-types';

interface UpcomingHearingsWidgetProps {
  cases: Case[];
}

function parseDDMMYYYY(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('.');
  if (!day || !month || !year) return null;
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
}

function getDaysLeft(ndoh: string | null): number | null {
  const target = parseDDMMYYYY(ndoh);
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysLeftColor(days: number): { bg: string; text: string } {
  if (days <= 3) return { bg: '#FF4444', text: '#FFFFFF' };
  if (days <= 7) return { bg: '#FF8C00', text: '#FFFFFF' };
  if (days <= 14) return { bg: '#FFC107', text: '#333333' };
  return { bg: '#28A745', text: '#FFFFFF' };
}

function formatNdohDisplay(ndoh: string | null): string {
  if (!ndoh) return '--';
  const parsed = parseDDMMYYYY(ndoh);
  if (!parsed) return ndoh;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

export default function UpcomingHearingsWidget({ cases }: UpcomingHearingsWidgetProps) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#1B2A4A' }}>
          Upcoming Hearings (Next 7 Days)
        </h3>
      </div>

      {/* Content */}
      <div className="p-5">
        {cases.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2 select-none" aria-hidden="true">
              &#128197;
            </div>
            <p className="text-sm" style={{ color: '#6C757D' }}>
              No upcoming hearings in the next 7 days
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-3 font-semibold text-xs uppercase tracking-wider" style={{ color: '#6C757D' }}>
                    Date
                  </th>
                  <th className="text-left pb-3 font-semibold text-xs uppercase tracking-wider" style={{ color: '#6C757D' }}>
                    Case No.
                  </th>
                  <th className="text-left pb-3 font-semibold text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: '#6C757D' }}>
                    Court
                  </th>
                  <th className="text-left pb-3 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell" style={{ color: '#6C757D' }}>
                    Title
                  </th>
                  <th className="text-right pb-3 font-semibold text-xs uppercase tracking-wider" style={{ color: '#6C757D' }}>
                    Days Left
                  </th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c, idx) => {
                  const daysLeft = getDaysLeft(c.ndoh);
                  const colors = daysLeft !== null ? getDaysLeftColor(daysLeft) : null;

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-gray-50 transition-colors duration-150 hover:bg-gray-50"
                      style={{
                        backgroundColor: idx % 2 === 1 ? '#FAFBFC' : undefined,
                      }}
                    >
                      <td className="py-3 pr-3 whitespace-nowrap" style={{ color: '#333' }}>
                        {formatNdohDisplay(c.ndoh)}
                      </td>
                      <td className="py-3 pr-3">
                        <Link
                          href={`/case-management/cases/${c.id}`}
                          className="font-medium hover:underline transition-colors"
                          style={{ color: '#4472C4' }}
                        >
                          {truncate(c.caseNo, 30)}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 hidden md:table-cell whitespace-nowrap" style={{ color: '#333' }}>
                        {truncate(c.court, 25)}
                      </td>
                      <td className="py-3 pr-3 hidden lg:table-cell" style={{ color: '#333' }}>
                        {truncate(c.caseTitle, 40)}
                      </td>
                      <td className="py-3 text-right">
                        {daysLeft !== null && colors ? (
                          <span
                            className="inline-block px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.text,
                            }}
                          >
                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day' : `${daysLeft} days`}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: '#6C757D' }}>--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
