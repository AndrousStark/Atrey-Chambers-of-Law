'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cmsUsers, cmsAuth, cmsAudit } from '@/lib/cms-api';
import type { CmsUser, UserRole, AuditEntry } from '@/lib/cms-types';
import { DEPARTMENTS } from '@/lib/cms-types';

// ============================================================
// Design tokens
// ============================================================
const NAVY = '#1B2A4A';
const ACCENT = '#4472C4';
const RED = '#FF4444';
const GREEN = '#28A745';
const GREY = '#6C757D';

// ============================================================
// Permission definitions
// ============================================================

interface PermissionDef {
  readonly key: string;
  readonly label: string;
}

interface PermissionGroup {
  readonly name: string;
  readonly icon: string;
  readonly items: readonly PermissionDef[];
}

const PERMISSION_GROUPS: readonly PermissionGroup[] = [
  {
    name: 'Dashboard',
    icon: '\uD83D\uDCCA',
    items: [
      { key: 'page.dashboard', label: 'View Dashboard' },
    ],
  },
  {
    name: 'Cases',
    icon: '\u2696',
    items: [
      { key: 'page.cases', label: 'View Cases' },
      { key: 'page.cases.add', label: 'Add Cases' },
      { key: 'page.cases.edit', label: 'Edit Cases' },
      { key: 'page.cases.delete', label: 'Delete Cases' },
    ],
  },
  {
    name: 'Hearings & Calendar',
    icon: '\uD83D\uDCC5',
    items: [
      { key: 'page.hearings', label: 'View Hearing Diary' },
      { key: 'page.calendar', label: 'View Calendar' },
    ],
  },
  {
    name: 'Compliance',
    icon: '\u2713',
    items: [
      { key: 'page.compliance', label: 'View Compliance' },
      { key: 'page.compliance.edit', label: 'Add/Edit Compliance' },
    ],
  },
  {
    name: 'Filings',
    icon: '\uD83D\uDCC4',
    items: [
      { key: 'page.filings', label: 'View Filings' },
      { key: 'page.filings.edit', label: 'Add/Edit Filings' },
    ],
  },
  {
    name: 'Auto-Fetch',
    icon: '\uD83D\uDD04',
    items: [
      { key: 'page.autofetch', label: 'View Auto-Fetch' },
      { key: 'page.autofetch.trigger', label: 'Trigger Fetches' },
    ],
  },
  {
    name: 'Administration',
    icon: '\uD83D\uDC65',
    items: [
      { key: 'page.users', label: 'View Users' },
      { key: 'page.users.edit', label: 'Manage Users' },
      { key: 'page.audit', label: 'View Audit Log' },
      { key: 'page.settings', label: 'View Settings' },
      { key: 'page.export', label: 'Export Data' },
      { key: 'page.import', label: 'Import Data' },
    ],
  },
] as const;

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(g => g.items.map(i => i.key));

const DEFAULT_EDITOR_PERMISSIONS = [
  'page.dashboard',
  'page.cases', 'page.cases.add', 'page.cases.edit',
  'page.hearings', 'page.calendar',
  'page.compliance', 'page.compliance.edit',
  'page.filings', 'page.filings.edit',
];

const DEFAULT_VIEWER_PERMISSIONS = [
  'page.dashboard',
  'page.cases',
];

function getDefaultPermissions(role: UserRole): string[] {
  switch (role) {
    case 'superadmin':
      return [...ALL_PERMISSION_KEYS];
    case 'editor':
      return [...DEFAULT_EDITOR_PERMISSIONS];
    case 'viewer':
      return [...DEFAULT_VIEWER_PERMISSIONS];
    default:
      return [];
  }
}

// ============================================================
// Helpers
// ============================================================

function relativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return 'Just now';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function roleBadgeColor(role: UserRole): { bg: string; text: string } {
  switch (role) {
    case 'superadmin':
      return { bg: `${NAVY}18`, text: NAVY };
    case 'editor':
      return { bg: `${ACCENT}18`, text: ACCENT };
    case 'viewer':
    default:
      return { bg: `${GREY}18`, text: GREY };
  }
}

// ============================================================
// Toast
// ============================================================

interface Toast {
  readonly id: string;
  readonly type: 'success' | 'error';
  readonly message: string;
}

function ToastContainer({ toasts, onDismiss }: { readonly toasts: Toast[]; readonly onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 border-[#28A745]/30 text-[#28A745]'
              : 'bg-red-50 border-[#FF4444]/30 text-[#FF4444]'
          }`}
        >
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} className="p-0.5 rounded hover:bg-black/5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Confirm Dialog
// ============================================================

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">{title}</h3>
        <p className="text-sm text-[#666] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-9 min-h-[44px] px-4 rounded-md text-sm font-medium text-[#333333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-9 min-h-[44px] px-4 rounded-md text-sm font-medium text-white bg-[#FF4444] border border-[#FF4444] hover:bg-[#E63939] transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Permissions Checkboxes
// ============================================================

function PermissionsSection({
  permissions,
  onChange,
  disabled,
}: {
  readonly permissions: string[];
  readonly onChange: (perms: string[]) => void;
  readonly disabled: boolean;
}) {
  const togglePermission = (key: string) => {
    if (disabled) return;
    if (permissions.includes(key)) {
      onChange(permissions.filter(p => p !== key));
    } else {
      onChange([...permissions, key]);
    }
  };

  const selectAll = () => {
    if (disabled) return;
    onChange([...ALL_PERMISSION_KEYS]);
  };

  const deselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold" style={{ color: NAVY }}>
          Permissions
        </label>
        {!disabled && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-[10px] font-medium px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
              style={{ color: ACCENT }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="text-[10px] font-medium px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
              style={{ color: GREY }}
            >
              Deselect All
            </button>
          </div>
        )}
      </div>

      {disabled && (
        <p className="text-[11px] italic" style={{ color: GREY }}>
          Superadmin always has all permissions.
        </p>
      )}

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.name} className="rounded-lg border border-gray-200 p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm" role="img" aria-hidden="true">{group.icon}</span>
              <span className="text-xs font-semibold" style={{ color: NAVY }}>{group.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {group.items.map((item) => {
                const checked = disabled || permissions.includes(item.key);
                return (
                  <label
                    key={item.key}
                    className={`flex items-center gap-1.5 text-[11px] py-0.5 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:text-[#1B2A4A]'}`}
                    style={{ color: '#555' }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => togglePermission(item.key)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#4472C4] focus:ring-[#4472C4]/30 disabled:opacity-50"
                    />
                    {item.label}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Password Created Dialog
// ============================================================

function PasswordCreatedDialog({
  isOpen,
  userName,
  password,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly userName: string;
  readonly password: string;
  readonly onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }, [password]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${GREEN}15` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: NAVY }}>User Created</h3>
            <p className="text-sm" style={{ color: GREY }}>{userName}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <label className="block text-xs font-semibold mb-2" style={{ color: NAVY }}>Password</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-white border border-gray-200 rounded px-3 py-2 select-all" style={{ color: NAVY }}>
              {password}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="h-9 px-3 rounded-md text-sm font-medium border transition-colors flex items-center gap-1.5"
              style={{
                backgroundColor: copied ? `${GREEN}10` : 'white',
                borderColor: copied ? GREEN : '#d1d5db',
                color: copied ? GREEN : NAVY,
              }}
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-xs font-medium" style={{ color: '#92400E' }}>
            Save this password -- it cannot be retrieved later.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-md text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: ACCENT }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Activity Modal
// ============================================================

function ActivityModal({
  isOpen,
  user,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly user: CmsUser | null;
  readonly onClose: () => void;
}) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    setError(null);
    cmsAudit.list(1, 50, user.id)
      .then((result) => {
        setEntries(result.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load activity.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold" style={{ color: NAVY }}>User Activity</h2>
              <p className="text-sm mt-0.5" style={{ color: GREY }}>
                Recent activity for <strong>{user.name}</strong>
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#4472C4]/30 border-t-[#4472C4] rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm" style={{ color: RED }}>
              {error}
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: GREY }}>No activity found for this user.</p>
            </div>
          )}

          {!loading && !error && entries.length > 0 && (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full" style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}>
                      {entry.action}
                    </span>
                    <span className="text-[10px]" style={{ color: GREY }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs space-y-0.5" style={{ color: '#555' }}>
                    <p><span className="font-medium" style={{ color: NAVY }}>Entity:</span> {entry.entityType}{entry.entityId ? ` (${entry.entityId.slice(0, 12)}...)` : ''}</p>
                    {entry.fieldChanged && (
                      <p><span className="font-medium" style={{ color: NAVY }}>Field:</span> {entry.fieldChanged}</p>
                    )}
                    {(entry.oldValue || entry.newValue) && (
                      <p>
                        <span className="font-medium" style={{ color: NAVY }}>Change:</span>{' '}
                        <span style={{ color: RED }}>{entry.oldValue || '(empty)'}</span>
                        {' -> '}
                        <span style={{ color: GREEN }}>{entry.newValue || '(empty)'}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="h-9 px-5 rounded-md text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: ACCENT }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Add/Edit User Modal
// ============================================================

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  departmentFilter: string;
  isActive: boolean;
  permissions: string[];
}

function UserModal({
  isOpen,
  editUser,
  onClose,
  onSave,
  saving,
}: {
  readonly isOpen: boolean;
  readonly editUser: CmsUser | null;
  readonly onClose: () => void;
  readonly onSave: (data: UserFormData) => void;
  readonly saving: boolean;
}) {
  const [form, setForm] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
    departmentFilter: '',
    isActive: true,
    permissions: [...DEFAULT_VIEWER_PERMISSIONS],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name,
        email: editUser.email,
        password: '',
        role: editUser.role,
        departmentFilter: editUser.departmentFilter || '',
        isActive: editUser.isActive,
        permissions: editUser.permissions ? [...editUser.permissions] : getDefaultPermissions(editUser.role),
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'viewer',
        departmentFilter: '',
        isActive: true,
        permissions: [...DEFAULT_VIEWER_PERMISSIONS],
      });
    }
    setErrors({});
  }, [editUser, isOpen]);

  // ESC to close + lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // When role changes, auto-set default permissions for that role
  const handleRoleChange = (newRole: UserRole) => {
    setForm({
      ...form,
      role: newRole,
      permissions: getDefaultPermissions(newRole),
    });
  };

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!editUser && !form.password.trim()) errs.password = 'Password is required';
    if (!editUser && form.password.length > 0 && form.password.length < 6) errs.password = 'Min 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  if (!isOpen) return null;

  const isEdit = !!editUser;
  const title = isEdit ? 'Edit User' : 'Add User';
  const isSuperadmin = form.role === 'superadmin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: NAVY }}>{title}</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 ${errors.name ? 'border-[#FF4444]' : 'border-gray-300'}`}
              placeholder="Full name"
            />
            {errors.name && <p className="text-xs mt-1" style={{ color: RED }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 ${errors.email ? 'border-[#FF4444]' : 'border-gray-300'}`}
              placeholder="user@example.com"
            />
            {errors.email && <p className="text-xs mt-1" style={{ color: RED }}>{errors.email}</p>}
          </div>

          {/* Password (only for add) */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 ${errors.password ? 'border-[#FF4444]' : 'border-gray-300'}`}
                placeholder="Min 6 characters"
              />
              {errors.password && <p className="text-xs mt-1" style={{ color: RED }}>{errors.password}</p>}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Role</label>
            <select
              value={form.role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 bg-white"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Department Filter</label>
            <select
              value={form.departmentFilter}
              onChange={(e) => setForm({ ...form, departmentFilter: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 bg-white"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Active toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold" style={{ color: NAVY }}>Active</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-[#28A745]' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`}
                />
              </button>
              <span className="text-xs" style={{ color: GREY }}>{form.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          )}

          {/* Permissions */}
          <PermissionsSection
            permissions={form.permissions}
            onChange={(perms) => setForm({ ...form, permissions: perms })}
            disabled={isSuperadmin}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Reset Password Modal
// ============================================================

function ResetPasswordModal({
  isOpen,
  user,
  onClose,
  onSubmit,
  saving,
}: {
  readonly isOpen: boolean;
  readonly user: CmsUser | null;
  readonly onClose: () => void;
  readonly onSubmit: (password: string) => void;
  readonly saving: boolean;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!password.trim()) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Min 6 characters';
    if (!confirmPassword.trim()) errs.confirmPassword = 'Please confirm the password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(password);
  }

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: NAVY }}>Reset Password</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <p className="text-sm mt-1" style={{ color: GREY }}>
            Set a new password for <strong>{user.name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>New Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 ${errors.password ? 'border-[#FF4444]' : 'border-gray-300'}`}
              placeholder="Min 6 characters"
              autoFocus
            />
            {errors.password && <p className="text-xs mt-1" style={{ color: RED }}>{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Confirm Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 ${errors.confirmPassword ? 'border-[#FF4444]' : 'border-gray-300'}`}
              placeholder="Re-enter password"
            />
            {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: RED }}>{errors.confirmPassword}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Loading Skeleton
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 bg-gray-200 rounded" />
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
            <div className="h-5 w-14 bg-gray-200 rounded-full" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="flex-1" />
            <div className="h-8 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Access Denied
// ============================================================

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${RED}15` }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: NAVY }}>Access Denied</h2>
      <p className="text-sm" style={{ color: GREY }}>
        You do not have permission to view this page. Only superadmins can manage users.
      </p>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function UsersPage() {
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CmsUser | null>(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CmsUser | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirm deactivate
  const [deactivateTarget, setDeactivateTarget] = useState<CmsUser | null>(null);

  // Reset password modal
  const [resetPasswordTarget, setResetPasswordTarget] = useState<CmsUser | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Password created dialog
  const [createdUserInfo, setCreatedUserInfo] = useState<{ name: string; password: string } | null>(null);

  // Activity modal
  const [activityTarget, setActivityTarget] = useState<CmsUser | null>(null);

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

  // --- Fetch ---

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cmsUsers.list();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = cmsAuth.getUser();
    setCurrentUser(user);
    if (user && user.role === 'superadmin') {
      setIsSuperadmin(true);
      fetchUsers();
    } else {
      setIsSuperadmin(false);
      setLoading(false);
    }
  }, [fetchUsers]);

  // --- Handlers ---

  const handleOpenAdd = useCallback(() => {
    setEditTarget(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((user: CmsUser) => {
    setEditTarget(user);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditTarget(null);
  }, []);

  const handleSave = useCallback(async (data: UserFormData) => {
    setSaving(true);
    try {
      if (editTarget) {
        await cmsUsers.update(editTarget.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          departmentFilter: data.departmentFilter || null,
          isActive: data.isActive,
          permissions: data.permissions,
        });
        showToast('success', `User "${data.name}" updated successfully.`);
        handleCloseModal();
      } else {
        // Remember the password before sending (it gets hashed on server)
        const plainPassword = data.password;
        await cmsUsers.create({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          permissions: data.permissions,
        });
        handleCloseModal();
        // Show password dialog
        setCreatedUserInfo({ name: data.name, password: plainPassword });
      }
      await fetchUsers();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setSaving(false);
    }
  }, [editTarget, fetchUsers, handleCloseModal, showToast]);

  const handleToggleActive = useCallback(async (user: CmsUser) => {
    if (currentUser && user.id === currentUser.id) {
      showToast('error', 'You cannot deactivate yourself.');
      return;
    }
    if (user.isActive) {
      setDeactivateTarget(user);
    } else {
      try {
        await cmsUsers.update(user.id, { isActive: true });
        showToast('success', `User "${user.name}" activated.`);
        await fetchUsers();
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to activate user.');
      }
    }
  }, [currentUser, fetchUsers, showToast]);

  const handleConfirmDeactivate = useCallback(async () => {
    if (!deactivateTarget) return;
    try {
      await cmsUsers.update(deactivateTarget.id, { isActive: false });
      showToast('success', `User "${deactivateTarget.name}" deactivated.`);
      setDeactivateTarget(null);
      await fetchUsers();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to deactivate user.');
    }
  }, [deactivateTarget, fetchUsers, showToast]);

  const handleResetPassword = useCallback((user: CmsUser) => {
    setResetPasswordTarget(user);
  }, []);

  const handleResetPasswordSubmit = useCallback(async (password: string) => {
    if (!resetPasswordTarget) return;
    setResettingPassword(true);
    try {
      await cmsUsers.resetPassword(resetPasswordTarget.id, password);
      showToast('success', `Password for "${resetPasswordTarget.name}" has been reset successfully.`);
      setResetPasswordTarget(null);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setResettingPassword(false);
    }
  }, [resetPasswordTarget, showToast]);

  const handleViewActivity = useCallback((user: CmsUser) => {
    setActivityTarget(user);
  }, []);

  // --- Access check ---

  if (!isSuperadmin && !loading) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>User Management</h1>
          <p className="text-sm mt-0.5" style={{ color: GREY }}>
            Manage system users and their permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="h-9 px-4 rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ color: GREY }}
            title="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={loading ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="h-9 px-5 rounded-md text-sm font-medium text-white border transition-colors flex items-center gap-2"
            style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm flex items-center gap-2" style={{ color: RED }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button onClick={fetchUsers} className="ml-auto text-xs font-medium underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Table */}
      {!loading && !error && (
        <>
          {users.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${GREY}15` }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: NAVY }}>No users found</p>
              <p className="text-xs" style={{ color: GREY }}>Create a new user to get started.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {/* Desktop table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: `${NAVY}08` }}>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>Name</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>Email</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>Role</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: GREY }}>Department</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: GREY }}>Last Login</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => {
                      const rb = roleBadgeColor(user.role);
                      const isSelf = currentUser ? user.id === currentUser.id : false;
                      return (
                        <tr
                          key={user.id}
                          className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                          style={{ backgroundColor: idx % 2 === 1 ? '#FAFBFC' : 'white' }}
                        >
                          <td className="px-6 py-3.5 font-medium" style={{ color: NAVY }}>
                            {user.name}
                            {isSelf && <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#4472C4]/10 text-[#4472C4]">You</span>}
                          </td>
                          <td className="px-6 py-3.5" style={{ color: '#555' }}>{user.email}</td>
                          <td className="px-6 py-3.5">
                            <span
                              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                              style={{ backgroundColor: rb.bg, color: rb.text }}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: user.isActive ? `${GREEN}15` : `${RED}15`,
                                color: user.isActive ? GREEN : RED,
                              }}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 hidden lg:table-cell" style={{ color: GREY }}>
                            {user.departmentFilter || 'All'}
                          </td>
                          <td className="px-6 py-3.5 hidden md:table-cell" style={{ color: GREY }}>
                            {relativeTime(user.lastLogin)}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEdit(user)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="Edit user"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>

                              {/* View Activity */}
                              <button
                                onClick={() => handleViewActivity(user)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="View activity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                              </button>

                              {/* Toggle Active */}
                              <button
                                onClick={() => handleToggleActive(user)}
                                disabled={isSelf}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={isSelf ? 'Cannot deactivate yourself' : user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                  </svg>
                                )}
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => handleResetPassword(user)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="Reset password"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards (visible below sm) */}
              <div className="sm:hidden divide-y divide-gray-100">
                {users.map((user) => {
                  const rb = roleBadgeColor(user.role);
                  const isSelf = currentUser ? user.id === currentUser.id : false;
                  return (
                    <div key={user.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm" style={{ color: NAVY }}>
                          {user.name}
                          {isSelf && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#4472C4]/10 text-[#4472C4]">You</span>}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: user.isActive ? `${GREEN}15` : `${RED}15`,
                            color: user.isActive ? GREEN : RED,
                          }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: '#555' }}>{user.email}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize" style={{ backgroundColor: rb.bg, color: rb.text }}>
                          {user.role}
                        </span>
                        <span className="text-[10px]" style={{ color: GREY }}>{relativeTime(user.lastLogin)}</span>
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                        <button onClick={() => handleOpenEdit(user)} className="text-xs font-medium px-2 py-1 rounded hover:bg-gray-100" style={{ color: ACCENT }}>
                          Edit
                        </button>
                        <button onClick={() => handleViewActivity(user)} className="text-xs font-medium px-2 py-1 rounded hover:bg-gray-100" style={{ color: GREY }}>
                          Activity
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={isSelf}
                          className="text-xs font-medium px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
                          style={{ color: user.isActive ? RED : GREEN }}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleResetPassword(user)} className="text-xs font-medium px-2 py-1 rounded hover:bg-gray-100" style={{ color: GREY }}>
                          Reset Pwd
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={modalOpen}
        editUser={editTarget}
        onClose={handleCloseModal}
        onSave={handleSave}
        saving={saving}
      />

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        isOpen={!!deactivateTarget}
        title="Deactivate User"
        message={`Are you sure you want to deactivate "${deactivateTarget?.name}"? They will no longer be able to log in.`}
        confirmLabel="Deactivate"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={!!resetPasswordTarget}
        user={resetPasswordTarget}
        onClose={() => setResetPasswordTarget(null)}
        onSubmit={handleResetPasswordSubmit}
        saving={resettingPassword}
      />

      {/* Password Created Dialog */}
      <PasswordCreatedDialog
        isOpen={!!createdUserInfo}
        userName={createdUserInfo?.name || ''}
        password={createdUserInfo?.password || ''}
        onClose={() => setCreatedUserInfo(null)}
      />

      {/* Activity Modal */}
      <ActivityModal
        isOpen={!!activityTarget}
        user={activityTarget}
        onClose={() => setActivityTarget(null)}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
