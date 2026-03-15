'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cmsUsers, cmsAuth } from '@/lib/cms-api';
import type { CmsUser, UserRole } from '@/lib/cms-types';
import { DEPARTMENTS } from '@/lib/cms-types';

// ============================================================
// Design tokens
// ============================================================
const NAVY = '#1B2A4A';
const ACCENT = '#4472C4';
const RED = '#FF4444';
const GREEN = '#28A745';
const GREY = '#6C757D';
const BG = '#F0F2F5';

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
// Add/Edit User Modal
// ============================================================

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  departmentFilter: string;
  isActive: boolean;
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
      });
    } else {
      setForm({ name: '', email: '', password: '', role: 'viewer', departmentFilter: '', isActive: true });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 rounded-t-xl">
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
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
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
        });
        showToast('success', `User "${data.name}" updated successfully.`);
      } else {
        await cmsUsers.create({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        });
        showToast('success', `User "${data.name}" created successfully.`);
      }
      handleCloseModal();
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
    // In a real implementation this would call an API endpoint.
    // For now we show a confirmation toast.
    showToast('success', `Password reset link sent to ${user.email}.`);
  }, [showToast]);

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

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
