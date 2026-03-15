'use client';

import React from 'react';
import type { ComplianceItem } from '@/lib/cms-types';

interface OverdueComplianceWidgetProps {
  items: ComplianceItem[];
}

function parseDDMMYYYY(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('.');
  if (!day || !month || !year) return null;
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
}

function getDaysOverdue(dueDate: string): number {
  const due = parseDDMMYYYY(dueDate);
  if (!due) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function formatDueDate(dueDate: string): string {
  const parsed = parseDDMMYYYY(dueDate);
  if (!parsed) return dueDate;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getCaseNo(item: ComplianceItem): string {
  return item.case?.caseNo || `Case #${item.caseId}`;
}

export default function OverdueComplianceWidget({ items }: OverdueComplianceWidgetProps) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header with red tint */}
      <div
        className="px-5 py-4 border-b"
        style={{
          backgroundColor: '#FFF5F5',
          borderBottomColor: '#FFE0E0',
        }}
      >
        <h3
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: '#FF4444' }}
        >
          Overdue Compliance
        </h3>
      </div>

      {/* Content */}
      <div className="p-5">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
              style={{ backgroundColor: '#E8F5E9' }}
            >
              <span className="text-xl select-none" aria-hidden="true" style={{ color: '#28A745' }}>
                &#10003;
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#28A745' }}>
              All clear!
            </p>
            <p className="text-xs mt-1" style={{ color: '#6C757D' }}>
              No overdue compliance items
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const daysOverdue = getDaysOverdue(item.dueDate);

              return (
                <li
                  key={item.id}
                  className="p-3 rounded-lg border transition-colors duration-150 hover:bg-gray-50"
                  style={{ borderColor: '#FFE0E0' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold mb-1 truncate"
                        style={{ color: '#4472C4' }}
                      >
                        {getCaseNo(item)}
                      </p>
                      <p className="text-sm mb-1" style={{ color: '#333' }}>
                        {item.direction}
                      </p>
                      <p className="text-xs" style={{ color: '#6C757D' }}>
                        Due: {formatDueDate(item.dueDate)}
                      </p>
                    </div>
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: '#FF4444',
                        color: '#FFFFFF',
                      }}
                    >
                      {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
