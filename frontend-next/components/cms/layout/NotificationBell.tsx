'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cmsNotifications } from '@/lib/cms-api';
import type { Notification, NotificationSeverity } from '@/lib/cms-types';
import { NOTIFICATION_TYPE_LABELS } from '@/lib/cms-types';

// ============================================================
// Constants
// ============================================================

const POLL_INTERVAL_MS = 30_000;
const RECENT_LIMIT = 10;

const SEVERITY_COLORS: Record<
  NotificationSeverity,
  { readonly border: string; readonly bg: string; readonly text: string }
> = {
  info: { border: '#4472C4', bg: 'bg-blue-50', text: 'text-[#4472C4]' },
  warning: { border: '#FF8C00', bg: 'bg-orange-50', text: 'text-[#FF8C00]' },
  urgent: { border: '#FF4444', bg: 'bg-red-50', text: 'text-[#FF4444]' },
  critical: { border: '#DC2626', bg: 'bg-red-100', text: 'text-red-700' },
};

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
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '...';
}

// ============================================================
// Critical Alert Toast
// ============================================================

function CriticalAlertToast({
  notification,
  onDismiss,
}: {
  readonly notification: Notification;
  readonly onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-[60] max-w-sm animate-slide-up">
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border bg-red-50 border-red-300"
        style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      >
        <div className="flex-shrink-0 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">
            {notification.title}
          </p>
          {notification.body && (
            <p className="text-xs text-red-600 mt-0.5">
              {truncateText(notification.body, 100)}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 rounded hover:bg-red-100 transition-colors"
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </div>
  );
}

// ============================================================
// Notification Item in Dropdown
// ============================================================

function NotificationItem({
  notification,
  onClick,
}: {
  readonly notification: Notification;
  readonly onClick: (n: Notification) => void;
}) {
  const isUnread = !notification.readAt;
  const severity = SEVERITY_COLORS[notification.severity] ?? SEVERITY_COLORS.info;
  const isCritical = notification.severity === 'critical';

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`
        w-full text-left px-3 py-2.5 transition-colors hover:bg-gray-50
        ${isUnread ? 'bg-blue-50/30' : 'bg-white'}
      `.trim()}
      style={{
        borderLeft: `3px solid ${severity.border}`,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div className="flex items-start gap-2">
        {/* Unread dot */}
        <div className="flex-shrink-0 mt-1.5">
          {isUnread ? (
            <span
              className={`block w-2 h-2 rounded-full ${isCritical ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: severity.border }}
            />
          ) : (
            <span className="block w-2 h-2" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm leading-snug ${
              isUnread ? 'font-semibold text-[#1B2A4A]' : 'font-normal text-[#333]'
            }`}
          >
            {truncateText(notification.title, 60)}
          </p>
          {notification.body && (
            <p className="text-xs text-[#6C757D] mt-0.5 leading-relaxed">
              {truncateText(notification.body, 80)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-medium ${severity.text}`}>
              {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
            </span>
            <span className="text-[10px] text-[#6C757D]">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================================
// NotificationBell Component
// ============================================================

export default function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState<Notification | null>(null);
  const [dismissedCriticalIds, setDismissedCriticalIds] = useState<Set<string>>(
    () => new Set()
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Fetch unread count ---
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await cmsNotifications.unreadCount();
      setUnreadCount(result.count);
    } catch {
      // Silently fail on count polling
    }
  }, []);

  // --- Fetch recent notifications ---
  const fetchRecent = useCallback(async () => {
    setLoadingList(true);
    try {
      const result = await cmsNotifications.list({
        limit: RECENT_LIMIT,
        page: 1,
      });
      setNotifications(result.data);
      setUnreadCount(result.meta.unreadCount);

      // Check for unread critical notifications
      const unreadCritical = result.data.find(
        (n) =>
          n.severity === 'critical' &&
          !n.readAt &&
          !n.dismissedAt &&
          !dismissedCriticalIds.has(n.id)
      );
      if (unreadCritical) {
        setCriticalAlert(unreadCritical);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingList(false);
    }
  }, [dismissedCriticalIds]);

  // --- Polling ---
  useEffect(() => {
    fetchUnreadCount();
    pollTimerRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [fetchUnreadCount]);

  // --- Load list when dropdown opens ---
  useEffect(() => {
    if (isOpen) {
      fetchRecent();
    }
  }, [isOpen, fetchRecent]);

  // --- Click outside to close ---
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        bellRef.current &&
        !bellRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // --- Handlers ---
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Mark as read
      if (!notification.readAt) {
        try {
          await cmsNotifications.markRead(notification.id);
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id
                ? { ...n, readAt: new Date().toISOString() }
                : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
          // Silently fail
        }
      }

      // Navigate if caseId exists
      const data = notification.data as Record<string, unknown> | null;
      if (data?.caseId) {
        setIsOpen(false);
        router.push(`/case-management/cases/${data.caseId}`);
      }
    },
    [router]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await cmsNotifications.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }, []);

  const handleDismissCritical = useCallback(() => {
    if (criticalAlert) {
      setDismissedCriticalIds((prev) => {
        const next = new Set(prev);
        next.add(criticalAlert.id);
        return next;
      });
    }
    setCriticalAlert(null);
  }, [criticalAlert]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="relative" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Bell Button */}
      <button
        ref={bellRef}
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-lg transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-[#FF4444] opacity-40" />
            <span className="relative inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-[#FF4444] text-white text-[10px] font-bold leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          role="menu"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-[#1B2A4A]">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-[#4472C4] hover:text-[#3A62A8] hover:underline transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {loadingList && notifications.length === 0 ? (
              <div className="px-4 py-8 flex flex-col items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full animate-spin"
                  style={{
                    borderWidth: '2px',
                    borderColor: '#4472C4',
                    borderTopColor: 'transparent',
                  }}
                />
                <p className="text-xs text-[#6C757D]">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 flex flex-col items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
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
                <p className="text-sm text-[#6C757D] font-medium">
                  No notifications
                </p>
                <p className="text-xs text-[#6C757D]/60">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onClick={handleNotificationClick}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50">
            <Link
              href="/case-management/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-medium text-[#4472C4] hover:text-[#3A62A8] hover:underline transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}

      {/* Critical Alert Toast */}
      {criticalAlert && (
        <CriticalAlertToast
          notification={criticalAlert}
          onDismiss={handleDismissCritical}
        />
      )}
    </div>
  );
}
