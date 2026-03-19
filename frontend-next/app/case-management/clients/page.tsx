'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cmsClients, cmsAuth } from '@/lib/cms-api';
import type { Client, ClientCategory, UserRole } from '@/lib/cms-types';
import { CLIENT_CATEGORY_LABELS } from '@/lib/cms-types';

// ============================================================
// Design tokens
// ============================================================
const NAVY = '#1B2A4A';
const ACCENT = '#4472C4';
const RED = '#FF4444';
const GREEN = '#28A745';
const GREY = '#6C757D';

// ============================================================
// Category badge colors
// ============================================================
const CATEGORY_COLORS: Record<ClientCategory, string> = {
  Individual: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  Corporate: 'bg-purple-50 text-purple-600 border-purple-600',
  Government: 'bg-amber-50 text-amber-600 border-amber-600',
  NGO: 'bg-green-50 text-[#28A745] border-[#28A745]',
  Trust: 'bg-teal-50 text-teal-600 border-teal-600',
  Other: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
};

const CLIENT_CATEGORIES: ClientCategory[] = [
  'Individual',
  'Corporate',
  'Government',
  'NGO',
  'Trust',
  'Other',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

// ============================================================
// Input class constants
// ============================================================
const INPUT_CLASS =
  'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors';

const SELECT_CLASS =
  'w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors appearance-none cursor-pointer pr-8';

const SELECT_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 8px center' as const,
};

const LABEL_CLASS = 'block text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-1.5';

// ============================================================
// Helpers
// ============================================================

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
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

function ToastContainer({
  toasts,
  onDismiss,
}: {
  readonly toasts: Toast[];
  readonly onDismiss: (id: string) => void;
}) {
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
          {toast.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-0.5 rounded hover:bg-black/5 transition-colors"
          >
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
// Loading Skeleton
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 bg-gray-200 rounded" />
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
            <div className="h-4 w-10 bg-gray-200 rounded" />
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
            <div className="flex-1" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================

function EmptyState({ hasFilters, onClearFilters }: { readonly hasFilters: boolean; readonly onClearFilters: () => void }) {
  return (
    <div className="bg-white rounded-xl p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${GREY}15` }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: NAVY }}>
        {hasFilters ? 'No clients match your filters' : 'No clients yet'}
      </p>
      <p className="text-xs mb-4" style={{ color: GREY }}>
        {hasFilters
          ? 'Try adjusting your search or filter criteria.'
          : 'Add your first client to get started.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="h-9 px-4 rounded-md text-sm font-medium text-[#4472C4] border border-[#4472C4] bg-white hover:bg-blue-50 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ============================================================
// Client Detail Panel (Expandable Row)
// ============================================================

function ClientDetailPanel({ client }: { readonly client: Client }) {
  return (
    <tr>
      <td colSpan={8} className="px-0 py-0">
        <div className="bg-gray-50 border-t border-b border-gray-200 px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-3">
                Contact Information
              </h4>
              <div className="space-y-2">
                <DetailRow label="Contact Person" value={client.contactPerson} />
                <DetailRow label="Email" value={client.email} />
                <DetailRow label="Phone" value={client.phone} />
                <DetailRow label="WhatsApp" value={client.whatsapp} />
              </div>
            </div>

            {/* Organization & Category */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-3">
                Organization Details
              </h4>
              <div className="space-y-2">
                <DetailRow label="Organization" value={client.organization} />
                <DetailRow label="Category" value={CLIENT_CATEGORY_LABELS[client.category]} />
                <DetailRow
                  label="Status"
                  value={
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: client.isActive ? `${GREEN}15` : `${RED}15`,
                        color: client.isActive ? GREEN : RED,
                      }}
                    >
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  }
                />
                <DetailRow label="Cases" value={String(client._count?.cases ?? 0)} />
                <DetailRow label="Tasks" value={String(client._count?.tasks ?? 0)} />
              </div>
            </div>

            {/* Address & Metadata */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-3">
                Address & Metadata
              </h4>
              <div className="space-y-2">
                <DetailRow label="Address" value={client.address} />
                <DetailRow
                  label="City / State"
                  value={[client.city, client.state].filter(Boolean).join(', ') || null}
                />
                <DetailRow label="PIN Code" value={client.pincode} />
                <DetailRow label="Created" value={formatDate(client.createdAt)} />
                {client.createdBy && (
                  <DetailRow label="Created By" value={client.createdBy.name} />
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6C757D] mb-2">
                Notes
              </h4>
              <p className="text-sm text-[#555] whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function DetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[11px] font-medium text-[#999] w-24 flex-shrink-0">{label}</span>
      <span className="text-sm text-[#333]">
        {value || <span className="text-[#CCC] italic">--</span>}
      </span>
    </div>
  );
}

// ============================================================
// Pagination
// ============================================================

function ClientPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: {
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly limit: number;
  readonly onPageChange: (page: number) => void;
  readonly onLimitChange: (limit: number) => void;
}) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Build page numbers array
  const pageNumbers: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (page > 3) pageNumbers.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pageNumbers.push(i);
    }
    if (page < totalPages - 2) pageNumbers.push('ellipsis');
    pageNumbers.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
      {/* Left: showing info */}
      <div className="flex items-center gap-3" style={{ color: GREY }}>
        <span>
          Showing {startItem}&ndash;{endItem} of {total}
        </span>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <span>Show</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-7 px-2 rounded border border-gray-300 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#4472C4]/30 cursor-pointer"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {pageNumbers.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-8 min-w-[32px] px-2 flex items-center justify-center rounded border text-xs font-medium transition-colors ${
                p === page
                  ? 'bg-[#4472C4] border-[#4472C4] text-white'
                  : 'border-gray-300 bg-white text-[#333] hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Add/Edit Client Modal
// ============================================================

interface ClientFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp: string;
  organization: string;
  category: ClientCategory;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  isActive: boolean;
}

const EMPTY_FORM: ClientFormData = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  whatsapp: '',
  organization: '',
  category: 'Individual',
  address: '',
  city: '',
  state: '',
  pincode: '',
  notes: '',
  isActive: true,
};

function ClientModal({
  isOpen,
  editClient,
  onClose,
  onSave,
  saving,
}: {
  readonly isOpen: boolean;
  readonly editClient: Client | null;
  readonly onClose: () => void;
  readonly onSave: (data: ClientFormData) => void;
  readonly saving: boolean;
}) {
  const [form, setForm] = useState<ClientFormData>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editClient) {
      setForm({
        name: editClient.name,
        contactPerson: editClient.contactPerson || '',
        email: editClient.email || '',
        phone: editClient.phone || '',
        whatsapp: editClient.whatsapp || '',
        organization: editClient.organization || '',
        category: editClient.category,
        address: editClient.address || '',
        city: editClient.city || '',
        state: editClient.state || '',
        pincode: editClient.pincode || '',
        notes: editClient.notes || '',
        isActive: editClient.isActive,
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setErrors({});
  }, [editClient, isOpen]);

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
    if (!form.name.trim()) errs.name = 'Client name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (form.phone && !/^[+]?[\d\s()-]{7,15}$/.test(form.phone)) errs.phone = 'Invalid phone number';
    if (form.whatsapp && !/^[+]?[\d\s()-]{7,15}$/.test(form.whatsapp)) errs.whatsapp = 'Invalid WhatsApp number';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) errs.pincode = 'PIN code must be 6 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  const updateField = <K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  const isEdit = !!editClient;
  const title = isEdit ? 'Edit Client' : 'Add Client';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            {/* Name (full width) */}
            <div className="md:col-span-2">
              <label className={LABEL_CLASS}>Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`${INPUT_CLASS} ${errors.name ? '!border-[#FF4444] focus:!ring-[#FF4444]/30' : ''}`}
                placeholder="Client or organization name"
              />
              {errors.name && <p className="text-xs mt-1 text-[#FF4444]">{errors.name}</p>}
            </div>

            {/* Contact Person */}
            <div>
              <label className={LABEL_CLASS}>Contact Person</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => updateField('contactPerson', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Primary contact name"
              />
            </div>

            {/* Organization */}
            <div>
              <label className={LABEL_CLASS}>Organization</label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => updateField('organization', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Company or org name"
              />
            </div>

            {/* Email */}
            <div>
              <label className={LABEL_CLASS}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`${INPUT_CLASS} ${errors.email ? '!border-[#FF4444] focus:!ring-[#FF4444]/30' : ''}`}
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-xs mt-1 text-[#FF4444]">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={LABEL_CLASS}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={`${INPUT_CLASS} ${errors.phone ? '!border-[#FF4444] focus:!ring-[#FF4444]/30' : ''}`}
                placeholder="+91 98765 43210"
              />
              {errors.phone && <p className="text-xs mt-1 text-[#FF4444]">{errors.phone}</p>}
            </div>

            {/* WhatsApp */}
            <div>
              <label className={LABEL_CLASS}>WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                className={`${INPUT_CLASS} ${errors.whatsapp ? '!border-[#FF4444] focus:!ring-[#FF4444]/30' : ''}`}
                placeholder="+91 98765 43210"
              />
              {errors.whatsapp && <p className="text-xs mt-1 text-[#FF4444]">{errors.whatsapp}</p>}
            </div>

            {/* Category */}
            <div>
              <label className={LABEL_CLASS}>Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value as ClientCategory)}
                className={SELECT_CLASS}
                style={SELECT_STYLE}
              >
                {CLIENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CLIENT_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Address (full width) */}
            <div className="md:col-span-2">
              <label className={LABEL_CLASS}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Street address"
              />
            </div>

            {/* City */}
            <div>
              <label className={LABEL_CLASS}>City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className={INPUT_CLASS}
                placeholder="City"
              />
            </div>

            {/* State */}
            <div>
              <label className={LABEL_CLASS}>State</label>
              <select
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                className={SELECT_CLASS}
                style={SELECT_STYLE}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* PIN Code */}
            <div>
              <label className={LABEL_CLASS}>PIN Code</label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => updateField('pincode', e.target.value)}
                className={`${INPUT_CLASS} ${errors.pincode ? '!border-[#FF4444] focus:!ring-[#FF4444]/30' : ''}`}
                placeholder="110001"
                maxLength={6}
              />
              {errors.pincode && <p className="text-xs mt-1 text-[#FF4444]">{errors.pincode}</p>}
            </div>

            {/* Active toggle (edit only) */}
            {isEdit && (
              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6C757D]">Status</label>
                <button
                  type="button"
                  onClick={() => updateField('isActive', !form.isActive)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-[#28A745]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`}
                  />
                </button>
                <span className="text-xs" style={{ color: GREY }}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}

            {/* Notes (full width) */}
            <div className="md:col-span-2">
              <label className={LABEL_CLASS}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-[#333333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors resize-none"
                rows={3}
                placeholder="Additional notes about this client..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#6C757D] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
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
              {isEdit ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Filter Bar
// ============================================================

type StatusFilter = 'all' | 'active' | 'inactive';

interface ClientFilters {
  search: string;
  category: ClientCategory | '';
  status: StatusFilter;
  page: number;
  limit: number;
}

const DEFAULT_FILTERS: ClientFilters = {
  search: '',
  category: '',
  status: 'all',
  page: 1,
  limit: 25,
};

function FilterBar({
  filters,
  onFiltersChange,
}: {
  readonly filters: ClientFilters;
  readonly onFiltersChange: (filters: ClientFilters) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const hasActiveFilters =
    filters.search !== '' || filters.category !== '' || filters.status !== 'all';

  const handleSearchChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, search: value, page: 1 });
    }, 300);
  };

  const handleClearFilters = () => {
    onFiltersChange({ ...DEFAULT_FILTERS });
    if (searchRef.current) searchRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl px-5 py-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            defaultValue={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
            placeholder="Search name, email, phone, organization..."
          />
        </div>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) =>
            onFiltersChange({ ...filters, category: e.target.value as ClientCategory | '', page: 1 })
          }
          className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors appearance-none cursor-pointer pr-8"
          style={SELECT_STYLE}
        >
          <option value="">All Categories</option>
          {CLIENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CLIENT_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>

        {/* Status Toggle */}
        <div className="flex items-center h-9 rounded-md border border-gray-300 overflow-hidden">
          {(['all', 'active', 'inactive'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => onFiltersChange({ ...filters, status: s, page: 1 })}
              className={`h-full px-3 text-xs font-medium transition-colors capitalize ${
                filters.status === s
                  ? 'bg-[#4472C4] text-white'
                  : 'bg-white text-[#6C757D] hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="h-9 px-3 rounded-md text-xs font-medium text-[#FF4444] border border-[#FF4444]/30 bg-red-50 hover:bg-red-100 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function ClientsPage() {
  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<ClientFilters>({ ...DEFAULT_FILTERS });

  // User permissions
  const [userRole, setUserRole] = useState<UserRole>('viewer');

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

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
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const canEdit = userRole === 'superadmin' || userRole === 'editor';

  // --- Data fetching ---

  const fetchClients = useCallback(async (currentFilters: ClientFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page: currentFilters.page,
        limit: currentFilters.limit,
      };
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.category) params.category = currentFilters.category;
      if (currentFilters.status === 'active') params.isActive = 'true';
      if (currentFilters.status === 'inactive') params.isActive = 'false';

      const result = await cmsClients.list(params);
      setClients(result.data);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients.');
      setClients([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(filters);
  }, [filters, fetchClients]);

  // --- Handlers ---

  const handleFiltersChange = useCallback((newFilters: ClientFilters) => {
    setFilters(newFilters);
    setExpandedId(null);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setExpandedId(null);
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
    setExpandedId(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
    setExpandedId(null);
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Add
  const handleOpenAdd = useCallback(() => {
    setEditTarget(null);
    setModalOpen(true);
  }, []);

  // Edit
  const handleOpenEdit = useCallback((client: Client) => {
    setEditTarget(client);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditTarget(null);
  }, []);

  // Save (create or update)
  const handleSave = useCallback(
    async (data: ClientFormData) => {
      setSaving(true);
      try {
        const payload: Partial<Client> = {
          name: data.name.trim(),
          contactPerson: data.contactPerson.trim() || null,
          email: data.email.trim() || null,
          phone: data.phone.trim() || null,
          whatsapp: data.whatsapp.trim() || null,
          organization: data.organization.trim() || null,
          category: data.category,
          address: data.address.trim() || null,
          city: data.city.trim() || null,
          state: data.state || null,
          pincode: data.pincode.trim() || null,
          notes: data.notes.trim() || null,
          isActive: data.isActive,
        };

        if (editTarget) {
          await cmsClients.update(editTarget.id, payload);
          showToast('success', `Client "${data.name}" updated successfully.`);
        } else {
          await cmsClients.create(payload);
          showToast('success', `Client "${data.name}" created successfully.`);
        }
        handleCloseModal();
        await fetchClients(filters);
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Operation failed.');
      } finally {
        setSaving(false);
      }
    },
    [editTarget, filters, fetchClients, handleCloseModal, showToast]
  );

  // Delete
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await cmsClients.remove(deleteTarget.id);
      showToast('success', `Client "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      if (expandedId === deleteTarget.id) setExpandedId(null);
      await fetchClients(filters);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete client.');
    }
  }, [deleteTarget, expandedId, filters, fetchClients, showToast]);

  // --- Derived ---

  const hasActiveFilters =
    filters.search !== '' || filters.category !== '' || filters.status !== 'all';

  // --- Render ---

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>
            Client Management
          </h1>
          <p className="text-sm mt-0.5" style={{ color: GREY }}>
            Manage clients and their contact information &mdash;{' '}
            {loading ? 'loading...' : `${total} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => fetchClients(filters)}
            disabled={loading}
            className="h-9 px-4 rounded-md text-sm font-medium text-[#6C757D] border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Refresh data"
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

          {/* Add Client */}
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Client
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm text-[#FF4444] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button
            onClick={() => fetchClients(filters)}
            className="ml-auto text-xs font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Empty State */}
      {!loading && !error && clients.length === 0 && (
        <EmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
      )}

      {/* Client Table */}
      {!loading && !error && clients.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {/* Desktop Table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: `${NAVY}08` }}>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                    Contact Person
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: GREY }}>
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: GREY }}>
                    Phone
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                    Category
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                    Cases
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, idx) => (
                  <React.Fragment key={client.id}>
                    <tr
                      className={`border-t border-gray-100 hover:bg-gray-50/50 transition-colors ${
                        expandedId === client.id ? 'bg-blue-50/30' : ''
                      }`}
                      style={{ backgroundColor: expandedId === client.id ? undefined : idx % 2 === 1 ? '#FAFBFC' : 'white' }}
                    >
                      {/* Name */}
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => handleToggleExpand(client.id)}
                          className="flex items-center gap-2 text-left group"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={GREY}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform flex-shrink-0 ${
                              expandedId === client.id ? 'rotate-90' : ''
                            }`}
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                          <span
                            className="font-medium group-hover:text-[#4472C4] transition-colors"
                            style={{ color: NAVY }}
                          >
                            {client.name}
                          </span>
                        </button>
                        {client.organization && (
                          <span className="block text-[11px] ml-[22px]" style={{ color: GREY }}>
                            {client.organization}
                          </span>
                        )}
                      </td>

                      {/* Contact Person */}
                      <td className="px-4 py-3.5" style={{ color: '#555' }}>
                        {client.contactPerson || (
                          <span className="text-gray-300">--</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 hidden lg:table-cell" style={{ color: '#555' }}>
                        {client.email ? (
                          <a
                            href={`mailto:${client.email}`}
                            className="hover:text-[#4472C4] transition-colors"
                          >
                            {client.email}
                          </a>
                        ) : (
                          <span className="text-gray-300">--</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 hidden md:table-cell" style={{ color: '#555' }}>
                        {client.phone ? (
                          <a
                            href={`tel:${client.phone}`}
                            className="hover:text-[#4472C4] transition-colors"
                          >
                            {client.phone}
                          </a>
                        ) : (
                          <span className="text-gray-300">--</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${
                            CATEGORY_COLORS[client.category]
                          }`}
                        >
                          {CLIENT_CATEGORY_LABELS[client.category]}
                        </span>
                      </td>

                      {/* Cases count */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: (client._count?.cases ?? 0) > 0 ? `${ACCENT}15` : '#f3f4f6',
                            color: (client._count?.cases ?? 0) > 0 ? ACCENT : GREY,
                          }}
                        >
                          {client._count?.cases ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap"
                          style={{
                            backgroundColor: client.isActive ? `${GREEN}12` : `${RED}12`,
                            color: client.isActive ? GREEN : RED,
                            borderColor: client.isActive ? `${GREEN}40` : `${RED}40`,
                          }}
                        >
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(client);
                                }}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="Edit client"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(client);
                                }}
                                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                title="Delete client"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
                            </>
                          )}
                          {!canEdit && (
                            <button
                              onClick={() => handleToggleExpand(client.id)}
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                              title="View details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GREY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail */}
                    {expandedId === client.id && <ClientDetailPanel client={client} />}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (below sm) */}
          <div className="sm:hidden divide-y divide-gray-100">
            {clients.map((client) => (
              <div key={client.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => handleToggleExpand(client.id)}
                    className="text-left"
                  >
                    <span className="font-medium text-sm" style={{ color: NAVY }}>
                      {client.name}
                    </span>
                    {client.organization && (
                      <span className="block text-[11px]" style={{ color: GREY }}>
                        {client.organization}
                      </span>
                    )}
                  </button>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap flex-shrink-0"
                    style={{
                      backgroundColor: client.isActive ? `${GREEN}12` : `${RED}12`,
                      color: client.isActive ? GREEN : RED,
                      borderColor: client.isActive ? `${GREEN}40` : `${RED}40`,
                    }}
                  >
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {client.contactPerson && (
                  <p className="text-xs" style={{ color: '#555' }}>
                    {client.contactPerson}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${
                      CATEGORY_COLORS[client.category]
                    }`}
                  >
                    {CLIENT_CATEGORY_LABELS[client.category]}
                  </span>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}
                  >
                    {client._count?.cases ?? 0} cases
                  </span>
                </div>

                {(client.email || client.phone) && (
                  <div className="text-xs space-y-0.5" style={{ color: '#555' }}>
                    {client.email && <p>{client.email}</p>}
                    {client.phone && <p>{client.phone}</p>}
                  </div>
                )}

                {canEdit && (
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="text-xs font-medium px-2 py-1 rounded hover:bg-gray-100"
                      style={{ color: ACCENT }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleExpand(client.id)}
                      className="text-xs font-medium px-2 py-1 rounded hover:bg-gray-100"
                      style={{ color: GREY }}
                    >
                      {expandedId === client.id ? 'Collapse' : 'Details'}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(client)}
                      className="text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                      style={{ color: RED }}
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* Mobile expanded detail */}
                {expandedId === client.id && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-3">
                    <div className="space-y-1.5">
                      <h5 className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                        Contact
                      </h5>
                      <MobileDetailRow label="Person" value={client.contactPerson} />
                      <MobileDetailRow label="Email" value={client.email} />
                      <MobileDetailRow label="Phone" value={client.phone} />
                      <MobileDetailRow label="WhatsApp" value={client.whatsapp} />
                    </div>
                    <div className="space-y-1.5">
                      <h5 className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                        Address
                      </h5>
                      <MobileDetailRow label="Address" value={client.address} />
                      <MobileDetailRow
                        label="City/State"
                        value={[client.city, client.state].filter(Boolean).join(', ') || null}
                      />
                      <MobileDetailRow label="PIN" value={client.pincode} />
                    </div>
                    <div className="space-y-1.5">
                      <h5 className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                        Metadata
                      </h5>
                      <MobileDetailRow label="Created" value={formatDate(client.createdAt)} />
                      <MobileDetailRow label="Cases" value={String(client._count?.cases ?? 0)} />
                      <MobileDetailRow label="Tasks" value={String(client._count?.tasks ?? 0)} />
                    </div>
                    {client.notes && (
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GREY }}>
                          Notes
                        </h5>
                        <p className="text-xs text-[#555] whitespace-pre-wrap">{client.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <ClientPagination
          page={filters.page}
          totalPages={totalPages}
          total={total}
          limit={filters.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Add/Edit Client Modal */}
      <ClientModal
        isOpen={modalOpen}
        editClient={editTarget}
        onClose={handleCloseModal}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Client"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone. Any linked cases will be unlinked.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

// ============================================================
// Mobile detail helper
// ============================================================

function MobileDetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="font-medium text-[#999] w-16 flex-shrink-0">{label}</span>
      <span className="text-[#333]">{value || <span className="text-gray-300 italic">--</span>}</span>
    </div>
  );
}
