'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cmsNotifications, cmsAuth } from '@/lib/cms-api';
import type {
  Notification,
  NotificationSeverity,
  NotificationPreference,
  UserRole,
} from '@/lib/cms-types';
import { NOTIFICATION_TYPE_LABELS } from '@/lib/cms-types';

// ============================================================
// Constants
// ============================================================

const PAGE_LIMIT = 20;

const SEVERITY_COLORS: Record<
  NotificationSeverity,
  { readonly border: string; readonly bg: string; readonly text: string; readonly label: string }
> = {
  info: { border: '#4472C4', bg: 'bg-blue-50', text: 'text-[#4472C4]', label: 'Info' },
  warning: { border: '#FF8C00', bg: 'bg-orange-50', text: 'text-[#FF8C00]', label: 'Warning' },
  urgent: { border: '#FF4444', bg: 'bg-red-50', text: 'text-[#FF4444]', label: 'Urgent' },
  critical: { border: '#DC2626', bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
};

const SEVERITY_OPTIONS: readonly NotificationSeverity[] = ['info', 'warning', 'urgent', 'critical'];

const TYPE_OPTIONS = Object.keys(NOTIFICATION_TYPE_LABELS) as readonly string[];

const CHANNELS: readonly { readonly key: string; readonly label: string }[] = [
  { key: 'in_app', label: 'In-App' },
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
];

const SNOOZE_OPTIONS: readonly { readonly label: string; readonly getDate: () => string }[] = [
  {
    label: '1 hour',
    getDate: () => new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  },
  {
    label: '3 hours',
    getDate: () => new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    label: 'Tomorrow 9 AM',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d.toISOString();
    },
  },
];

// ============================================================
// Helpers
// ============================================================

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSnoozeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (60 * 60 * 1000));

  if (diffHours < 1) return 'Soon';
  if (diffHours < 24) return `in ${diffHours}h`;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================
// Toast
// ============================================================

interface Toast {
  readonly id: string;
  readonly type: 'success' | 'error';
  readonly message: string;
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  readonly toasts: readonly Toast[];
  readonly onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
            text-sm font-medium
            ${
              toast.type === 'success'
                ? 'bg-green-50 border-[#28A745]/30 text-[#28A745]'
                : 'bg-red-50 border-[#FF4444]/30 text-[#FF4444]'
            }
          `.trim()}
        >
          {toast.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-0.5 rounded hover:bg-black/5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Loading Skeleton
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
            <div className="h-7 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      {/* Cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4">
            <div className="w-2 h-16 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
              <div className="h-3 w-1/4 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================

function EmptyState({ hasFilters }: { readonly hasFilters: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D1D5DB"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <p className="text-sm font-medium text-[#1B2A4A]">
        {hasFilters ? 'No notifications match your filters' : 'No notifications yet'}
      </p>
      <p className="text-xs text-[#6C757D]">
        {hasFilters
          ? 'Try adjusting your filters or clear them.'
          : 'Notifications about hearings, deadlines, and tasks will appear here.'}
      </p>
    </div>
  );
}

// ============================================================
// Stat Card
// ============================================================

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  readonly label: string;
  readonly value: number;
  readonly color: string;
  readonly icon: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-default"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
          </div>
          <div className="ml-3 flex-shrink-0 opacity-60">{icon}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Notification Card
// ============================================================

function NotificationCard({
  notification,
  onMarkRead,
  onAcknowledge,
  onSnooze,
  onDismiss,
}: {
  readonly notification: Notification;
  readonly onMarkRead: (id: string) => void;
  readonly onAcknowledge: (id: string) => void;
  readonly onSnooze: (id: string, until: string) => void;
  readonly onDismiss: (id: string) => void;
}) {
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [customSnoozeDate, setCustomSnoozeDate] = useState('');
  const snoozeRef = useRef<HTMLDivElement>(null);

  const severity = SEVERITY_COLORS[notification.severity] ?? SEVERITY_COLORS.info;
  const isUnread = !notification.readAt;
  const isAcknowledged = !!notification.acknowledgedAt;
  const isSnoozed = !!notification.snoozedUntil && new Date(notification.snoozedUntil) > new Date();
  const isDismissed = !!notification.dismissedAt;
  const isCritical = notification.severity === 'critical' || notification.severity === 'urgent';

  // Close snooze dropdown on click outside
  useEffect(() => {
    if (!snoozeOpen) return;
    function handleClick(e: MouseEvent) {
      if (snoozeRef.current && !snoozeRef.current.contains(e.target as Node)) {
        setSnoozeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [snoozeOpen]);

  const handleCustomSnooze = () => {
    if (!customSnoozeDate) return;
    const date = new Date(customSnoozeDate);
    if (isNaN(date.getTime())) return;
    onSnooze(notification.id, date.toISOString());
    setSnoozeOpen(false);
    setCustomSnoozeDate('');
  };

  return (
    <div
      className={`
        bg-white rounded-lg border transition-all duration-200 hover:shadow-sm
        ${isUnread ? 'border-gray-200 ring-1 ring-blue-100' : 'border-gray-200'}
        ${isDismissed ? 'opacity-50' : ''}
      `.trim()}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: severity.border,
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Unread dot */}
          <div className="flex-shrink-0 mt-1.5">
            {isUnread ? (
              <span
                className={`block w-2.5 h-2.5 rounded-full ${
                  notification.severity === 'critical' ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: severity.border }}
              />
            ) : (
              <span className="block w-2.5 h-2.5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Type badge + severity */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${severity.bg} ${severity.text}`}
              >
                {severity.label}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-[#6C757D]">
                {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
              </span>

              {/* Status indicators */}
              {isSnoozed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  Snoozed until {formatSnoozeTime(notification.snoozedUntil!)}
                </span>
              )}
              {isAcknowledged && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-[#28A745]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Acknowledged
                </span>
              )}
            </div>

            {/* Title */}
            <h4
              className={`text-sm leading-snug ${
                isUnread ? 'font-semibold text-[#1B2A4A]' : 'font-medium text-[#333]'
              }`}
            >
              {notification.title}
            </h4>

            {/* Body */}
            {notification.body && (
              <p className="text-sm text-[#6C757D] mt-1 leading-relaxed">
                {notification.body}
              </p>
            )}

            {/* Timestamp */}
            <p className="text-xs text-[#6C757D]/70 mt-2">
              {formatTimeAgo(notification.createdAt)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 flex flex-wrap items-start gap-1.5 ml-2">
            {/* Mark Read */}
            {isUnread && !isDismissed && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="h-8 px-3 rounded-md text-xs font-medium text-[#4472C4] border border-[#4472C4]/30 bg-white hover:bg-blue-50 transition-colors whitespace-nowrap"
                title="Mark as read"
              >
                Mark Read
              </button>
            )}

            {/* Acknowledge (critical/urgent only) */}
            {isCritical && !isAcknowledged && !isDismissed && (
              <button
                onClick={() => onAcknowledge(notification.id)}
                className="h-8 px-3 rounded-md text-xs font-medium text-[#28A745] border border-[#28A745]/30 bg-white hover:bg-green-50 transition-colors whitespace-nowrap"
                title="Acknowledge"
              >
                Acknowledge
              </button>
            )}

            {/* Snooze */}
            {!isDismissed && !isAcknowledged && (
              <div className="relative" ref={snoozeRef}>
                <button
                  onClick={() => setSnoozeOpen((prev) => !prev)}
                  className="h-8 px-3 rounded-md text-xs font-medium text-[#FF8C00] border border-[#FF8C00]/30 bg-white hover:bg-orange-50 transition-colors whitespace-nowrap flex items-center gap-1"
                  title="Snooze"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  Snooze
                </button>

                {snoozeOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                    {SNOOZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          onSnooze(notification.id, opt.getDate());
                          setSnoozeOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[#333] hover:bg-gray-50 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 p-2">
                      <label className="block text-xs text-[#6C757D] mb-1">Custom</label>
                      <div className="flex gap-1">
                        <input
                          type="datetime-local"
                          value={customSnoozeDate}
                          onChange={(e) => setCustomSnoozeDate(e.target.value)}
                          className="flex-1 h-8 px-2 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#4472C4]"
                        />
                        <button
                          onClick={handleCustomSnooze}
                          disabled={!customSnoozeDate}
                          className="h-8 px-2 rounded text-xs font-medium text-white bg-[#FF8C00] hover:bg-[#E67E00] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dismiss */}
            {!isDismissed && (
              <button
                onClick={() => onDismiss(notification.id)}
                className="h-8 w-8 flex items-center justify-center rounded-md text-[#6C757D] border border-gray-200 bg-white hover:bg-gray-50 hover:text-[#FF4444] transition-colors"
                title="Dismiss"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Preferences Tab
// ============================================================

function PreferencesTab({
  preferences,
  saving,
  onSave,
}: {
  readonly preferences: NotificationPreference[];
  readonly saving: boolean;
  readonly onSave: (prefs: Partial<NotificationPreference>[]) => void;
}) {
  // Build editable local state from preferences
  const [localPrefs, setLocalPrefs] = useState<
    Record<string, Record<string, { enabled: boolean; advanceDays: number[] }>>
  >({});

  useEffect(() => {
    const map: Record<string, Record<string, { enabled: boolean; advanceDays: number[] }>> = {};
    for (const type of TYPE_OPTIONS) {
      map[type] = {};
      for (const ch of CHANNELS) {
        const found = preferences.find(
          (p) => p.notificationType === type && p.channel === ch.key
        );
        map[type][ch.key] = {
          enabled: found ? found.enabled : true,
          advanceDays: found ? found.advanceDays : [1, 3, 7],
        };
      }
    }
    setLocalPrefs(map);
  }, [preferences]);

  const togglePref = (type: string, channel: string) => {
    setLocalPrefs((prev) => {
      const updated = { ...prev };
      const typePrefs = { ...updated[type] };
      const current = typePrefs[channel];
      typePrefs[channel] = { ...current, enabled: !current.enabled };
      updated[type] = typePrefs;
      return updated;
    });
  };

  const updateAdvanceDays = (type: string, channel: string, days: number[]) => {
    setLocalPrefs((prev) => {
      const updated = { ...prev };
      const typePrefs = { ...updated[type] };
      const current = typePrefs[channel];
      typePrefs[channel] = { ...current, advanceDays: days };
      updated[type] = typePrefs;
      return updated;
    });
  };

  const handleSave = () => {
    const prefsToSave: Partial<NotificationPreference>[] = [];
    for (const type of TYPE_OPTIONS) {
      for (const ch of CHANNELS) {
        const pref = localPrefs[type]?.[ch.key];
        if (pref) {
          const existing = preferences.find(
            (p) => p.notificationType === type && p.channel === ch.key
          );
          prefsToSave.push({
            ...(existing?.id ? { id: existing.id } : {}),
            notificationType: type,
            channel: ch.key,
            enabled: pref.enabled,
            advanceDays: pref.advanceDays,
          });
        }
      }
    }
    onSave(prefsToSave);
  };

  const isReminderType = (type: string) =>
    type === 'hearing_reminder' || type === 'compliance_deadline';

  const ADVANCE_DAY_OPTIONS = [1, 2, 3, 5, 7, 14, 30];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Matrix Header */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200" style={{ backgroundColor: '#F8F9FA' }}>
              <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] min-w-[200px]">
                Notification Type
              </th>
              {CHANNELS.map((ch) => (
                <th
                  key={ch.key}
                  className="text-center px-4 py-3 font-semibold text-[#1B2A4A] min-w-[100px]"
                >
                  {ch.label}
                </th>
              ))}
              <th className="text-center px-4 py-3 font-semibold text-[#1B2A4A] min-w-[200px]">
                Advance Days
              </th>
            </tr>
          </thead>
          <tbody>
            {TYPE_OPTIONS.map((type) => (
              <tr key={type} className="border-b border-gray-100 last:border-b-0">
                <td className="px-4 py-3">
                  <span className="font-medium text-[#1B2A4A]">
                    {NOTIFICATION_TYPE_LABELS[type] ?? type}
                  </span>
                </td>
                {CHANNELS.map((ch) => {
                  const pref = localPrefs[type]?.[ch.key];
                  const isEnabled = pref?.enabled ?? true;
                  return (
                    <td key={ch.key} className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref(type, ch.key)}
                        className={`
                          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
                          border-2 border-transparent transition-colors duration-200 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-[#4472C4] focus:ring-offset-2
                          ${isEnabled ? 'bg-[#4472C4]' : 'bg-gray-200'}
                        `.trim()}
                        role="switch"
                        aria-checked={isEnabled}
                      >
                        <span
                          className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full
                            bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                          `.trim()}
                        />
                      </button>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  {isReminderType(type) ? (
                    <div className="flex flex-wrap justify-center gap-1">
                      {ADVANCE_DAY_OPTIONS.map((day) => {
                        const inAppPref = localPrefs[type]?.['in_app'];
                        const isSelected = inAppPref?.advanceDays?.includes(day) ?? false;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const currentDays = inAppPref?.advanceDays ?? [];
                              const newDays = isSelected
                                ? currentDays.filter((d) => d !== day)
                                : [...currentDays, day].sort((a, b) => a - b);
                              // Update all channels for this type
                              for (const ch of CHANNELS) {
                                updateAdvanceDays(type, ch.key, newDays);
                              }
                            }}
                            className={`
                              h-7 min-w-[36px] px-2 rounded-md text-xs font-medium border transition-colors
                              ${
                                isSelected
                                  ? 'bg-[#4472C4] text-white border-[#4472C4]'
                                  : 'bg-white text-[#6C757D] border-gray-300 hover:border-[#4472C4]'
                              }
                            `.trim()}
                          >
                            {day}d
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-[#6C757D]">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="border-t border-gray-200 px-4 py-3 flex justify-end bg-gray-50/50">
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Pagination
// ============================================================

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: {
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly limit: number;
  readonly onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  function buildPageNumbers(current: number, tp: number): (number | '...')[] {
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(tp - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < tp - 2) pages.push('...');
    pages.push(tp);
    return pages;
  }

  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
      <p className="text-sm text-[#6C757D]">
        Showing{' '}
        <span className="font-semibold text-[#333]">{rangeStart}</span>
        {' - '}
        <span className="font-semibold text-[#333]">{rangeEnd}</span>
        {' of '}
        <span className="font-semibold text-[#333]">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 text-[#6C757D] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        {pageNumbers.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-sm text-[#6C757D]">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={p === page}
              className={`
                min-w-[34px] px-2.5 py-1.5 text-sm rounded-lg border transition-colors
                ${
                  p === page
                    ? 'bg-[#4472C4] text-white border-[#4472C4] font-semibold'
                    : 'border-gray-300 text-[#333] hover:bg-[#F0F2F5]'
                }
              `.trim()}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 text-[#6C757D] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function NotificationsPage() {
  // Auth
  const [userRole, setUserRole] = useState<UserRole>('viewer');

  // Tab
  const [activeTab, setActiveTab] = useState<'list' | 'preferences'>('list');

  // Data
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    unreadCount: 0,
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 0,
  });

  // Preferences
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `toast-${++toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Auth ---
  useEffect(() => {
    const user = cmsAuth.getUser();
    if (user) setUserRole(user.role);
  }, []);

  // --- Fetch notifications ---
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: PAGE_LIMIT,
      };
      if (filterType) params.type = filterType;
      if (filterSeverity) params.severity = filterSeverity;
      if (filterUnreadOnly) params.unreadOnly = 1;

      const result = await cmsNotifications.list(params);
      setNotifications(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType, filterSeverity, filterUnreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --- Fetch preferences ---
  const fetchPreferences = useCallback(async () => {
    setPrefsLoading(true);
    try {
      const prefs = await cmsNotifications.getPreferences();
      setPreferences(prefs);
    } catch {
      // Silently fail
    } finally {
      setPrefsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'preferences') {
      fetchPreferences();
    }
  }, [activeTab, fetchPreferences]);

  // --- Stats ---
  const stats = useMemo(() => {
    const unreadCount = meta.unreadCount;
    // Compute type-based counts from current data for visual display
    const urgentCritical = notifications.filter(
      (n) =>
        (n.severity === 'urgent' || n.severity === 'critical') && !n.readAt
    ).length;
    const hearingReminders = notifications.filter(
      (n) => n.type === 'hearing_reminder' && !n.readAt
    ).length;
    const taskOverdue = notifications.filter(
      (n) => n.type === 'task_overdue' && !n.readAt
    ).length;

    return { unreadCount, urgentCritical, hearingReminders, taskOverdue };
  }, [meta.unreadCount, notifications]);

  // --- Has filters ---
  const hasFilters = !!filterType || !!filterSeverity || filterUnreadOnly;

  // --- Clear filters ---
  const clearFilters = () => {
    setFilterType('');
    setFilterSeverity('');
    setFilterUnreadOnly(false);
    setCurrentPage(1);
  };

  // --- Action handlers ---
  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        await cmsNotifications.markRead(id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, readAt: new Date().toISOString() } : n
          )
        );
        setMeta((prev) => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
        showToast('success', 'Marked as read.');
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to mark as read.');
      }
    },
    [showToast]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      const result = await cmsNotifications.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        }))
      );
      setMeta((prev) => ({ ...prev, unreadCount: 0 }));
      showToast('success', `${result.updated} notification${result.updated !== 1 ? 's' : ''} marked as read.`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to mark all as read.');
    }
  }, [showToast]);

  const handleAcknowledge = useCallback(
    async (id: string) => {
      try {
        await cmsNotifications.acknowledge(id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  acknowledgedAt: new Date().toISOString(),
                  readAt: n.readAt ?? new Date().toISOString(),
                }
              : n
          )
        );
        showToast('success', 'Notification acknowledged.');
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to acknowledge.');
      }
    },
    [showToast]
  );

  const handleSnooze = useCallback(
    async (id: string, snoozedUntil: string) => {
      try {
        await cmsNotifications.snooze(id, snoozedUntil);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, snoozedUntil } : n
          )
        );
        showToast('success', 'Notification snoozed.');
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to snooze.');
      }
    },
    [showToast]
  );

  const handleDismiss = useCallback(
    async (id: string) => {
      try {
        await cmsNotifications.dismiss(id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, dismissedAt: new Date().toISOString() } : n
          )
        );
        showToast('success', 'Notification dismissed.');
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to dismiss.');
      }
    },
    [showToast]
  );

  const handleSweep = useCallback(async () => {
    try {
      await cmsNotifications.sweep();
      showToast('success', 'Notification sweep triggered. New notifications will appear shortly.');
      // Refetch after a brief delay
      setTimeout(() => {
        fetchNotifications();
      }, 2000);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to run sweep.');
    }
  }, [fetchNotifications, showToast]);

  const handleSavePreferences = useCallback(
    async (prefs: Partial<NotificationPreference>[]) => {
      setPrefsSaving(true);
      try {
        const saved = await cmsNotifications.updatePreferences(prefs);
        setPreferences(saved);
        showToast('success', 'Preferences saved.');
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to save preferences.');
      } finally {
        setPrefsSaving(false);
      }
    },
    [showToast]
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            Notifications &amp; Alerts
          </h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Stay on top of hearings, deadlines, and task updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="h-9 px-4 rounded-md text-sm font-medium text-[#6C757D] border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          {meta.unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#4472C4] border border-[#4472C4]/30 bg-white hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Mark All Read
            </button>
          )}
          {userRole === 'superadmin' && (
            <button
              onClick={handleSweep}
              className="h-9 px-4 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
              Run Sweep
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Unread"
          value={stats.unreadCount}
          color="#4472C4"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4472C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          }
        />
        <StatCard
          label="Urgent / Critical"
          value={stats.urgentCritical}
          color="#FF4444"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          }
        />
        <StatCard
          label="Hearing Reminders"
          value={stats.hearingReminders}
          color="#FF8C00"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          }
        />
        <StatCard
          label="Task Overdue"
          value={stats.taskOverdue}
          color="#D97706"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          }
        />
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('list')}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              activeTab === 'list'
                ? 'bg-white text-[#1B2A4A] shadow-sm'
                : 'text-[#6C757D] hover:text-[#1B2A4A]'
            }
          `.trim()}
        >
          Notification List
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              activeTab === 'preferences'
                ? 'bg-white text-[#1B2A4A] shadow-sm'
                : 'text-[#6C757D] hover:text-[#1B2A4A]'
            }
          `.trim()}
        >
          Preferences
        </button>
      </div>

      {/* List Tab */}
      {activeTab === 'list' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 text-[#333]"
            >
              <option value="">All Types</option>
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {NOTIFICATION_TYPE_LABELS[type] ?? type}
                </option>
              ))}
            </select>

            {/* Severity filter */}
            <select
              value={filterSeverity}
              onChange={(e) => {
                setFilterSeverity(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 text-[#333]"
            >
              <option value="">All Severities</option>
              {SEVERITY_OPTIONS.map((sev) => (
                <option key={sev} value={sev}>
                  {SEVERITY_COLORS[sev].label}
                </option>
              ))}
            </select>

            {/* Unread only toggle */}
            <button
              type="button"
              onClick={() => {
                setFilterUnreadOnly((prev) => !prev);
                setCurrentPage(1);
              }}
              className={`
                h-9 px-4 rounded-md text-sm font-medium border transition-colors flex items-center gap-2
                ${
                  filterUnreadOnly
                    ? 'bg-[#4472C4] text-white border-[#4472C4]'
                    : 'bg-white text-[#6C757D] border-gray-300 hover:bg-gray-50'
                }
              `.trim()}
            >
              <span
                className={`
                  inline-block w-3 h-3 rounded-full border-2
                  ${filterUnreadOnly ? 'bg-white border-white' : 'border-gray-400'}
                `.trim()}
              >
                {filterUnreadOnly && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4472C4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="ml-[-1px] mt-[-1px]"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </span>
              Unread Only
            </button>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="h-9 px-3 rounded-md text-sm font-medium text-[#FF4444] border border-[#FF4444]/30 bg-white hover:bg-red-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm text-[#FF4444] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
              <button onClick={fetchNotifications} className="ml-auto text-xs font-medium underline hover:no-underline">
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && <LoadingSkeleton />}

          {/* Empty State */}
          {!loading && !error && notifications.length === 0 && (
            <EmptyState hasFilters={hasFilters} />
          )}

          {/* Notification Cards */}
          {!loading && !error && notifications.length > 0 && (
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onAcknowledge={handleAcknowledge}
                  onSnooze={handleSnooze}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && meta.totalPages > 1 && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={(p) => setCurrentPage(p)}
            />
          )}
        </>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <>
          {prefsLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
              <div
                className="w-8 h-8 rounded-full animate-spin"
                style={{ borderWidth: '3px', borderColor: '#4472C4', borderTopColor: 'transparent' }}
              />
              <p className="text-sm text-[#6C757D]">Loading preferences...</p>
            </div>
          ) : (
            <PreferencesTab
              preferences={preferences}
              saving={prefsSaving}
              onSave={handleSavePreferences}
            />
          )}
        </>
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
