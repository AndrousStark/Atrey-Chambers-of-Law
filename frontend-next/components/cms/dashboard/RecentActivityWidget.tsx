'use client';

import React from 'react';
import type { AuditEntry } from '@/lib/cms-types';

interface RecentActivityWidgetProps {
  entries: AuditEntry[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getActionVerb(action: string): string {
  const mapping: Record<string, string> = {
    create: 'created',
    edit: 'edited',
    delete: 'deleted',
    login: 'logged in',
    update: 'updated',
    view: 'viewed',
  };
  return mapping[action.toLowerCase()] || action;
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  return then.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

function getAvatarColor(userId: string): string {
  const colors = ['#4472C4', '#FF8C00', '#28A745', '#FF4444', '#6C757D', '#FFC107'];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function RecentActivityWidget({ entries }: RecentActivityWidgetProps) {
  const visibleEntries = entries.slice(0, 10);

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
          Recent Activity
        </h3>
      </div>

      {/* Content */}
      <div className="p-5">
        {visibleEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: '#6C757D' }}>
              No recent activity
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {visibleEntries.map((entry) => {
              const userName = entry.user?.name || 'Unknown';
              const initials = getInitials(userName);
              const avatarColor = getAvatarColor(entry.userId);
              const verb = getActionVerb(entry.action);
              const entityLabel = entry.entityType === 'system' ? '' : ` ${entry.entityType}`;

              return (
                <li key={entry.id} className="flex items-start gap-3">
                  {/* Avatar circle */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: avatarColor }}
                  >
                    <span className="text-xs font-bold text-white">{initials}</span>
                  </div>

                  {/* Activity text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#333' }}>
                      <span className="font-semibold" style={{ color: '#1B2A4A' }}>
                        {userName}
                      </span>{' '}
                      {verb}{entityLabel}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6C757D' }}>
                      {getRelativeTime(entry.timestamp)}
                    </p>
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
