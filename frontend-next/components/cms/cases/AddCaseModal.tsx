'use client';

import React, { useState, useCallback } from 'react';
import type { Case, CaseStatus, Priority } from '@/lib/cms-types';
import {
  COURTS,
  DEPARTMENTS,
  CATEGORIES,
  ROLES,
  CASE_STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/lib/cms-types';

interface AddCaseModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (data: Partial<Case>) => Promise<void>;
  readonly initialData?: Case | null;
}

function FormField({
  label,
  required,
  children,
}: {
  readonly label: string;
  readonly required?: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-[#6C757D]">
        {label}
        {required && <span className="text-[#FF4444] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = `
  w-full h-9 px-3 rounded-md border border-gray-300 bg-white
  text-sm text-[#333333] placeholder-[#999]
  focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4]
  transition-colors
`.trim();

const selectClass = `
  w-full h-9 px-3 pr-8 rounded-md border border-gray-300 bg-white
  text-sm text-[#333333] appearance-none cursor-pointer
  focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4]
  transition-colors
`.trim();

const selectBgStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236C757D' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 8px center',
};

function buildInitialFormState(initialData: Case | null | undefined): Partial<Case> {
  if (initialData) {
    return {
      caseNo: initialData.caseNo,
      court: initialData.court,
      client: initialData.client,
      caseTitle: initialData.caseTitle,
      petitioner: initialData.petitioner,
      respondent: initialData.respondent,
      ourRole: initialData.ourRole,
      respondentNumber: initialData.respondentNumber,
      category: initialData.category,
      department: initialData.department,
      filingDate: initialData.filingDate,
      status: initialData.status,
      ndoh: initialData.ndoh,
      priority: initialData.priority,
      remarks: initialData.remarks,
    };
  }
  return {
    caseNo: '',
    court: 'Supreme Court of India',
    client: '',
    caseTitle: '',
    petitioner: '',
    respondent: '',
    ourRole: 'Respondent',
    respondentNumber: '',
    category: '',
    department: '',
    filingDate: '',
    status: 'Pending' as CaseStatus,
    ndoh: '',
    priority: 'Medium' as Priority,
    remarks: '',
  };
}

export default function AddCaseModal({ isOpen, onClose, onSave, initialData }: AddCaseModalProps) {
  const [form, setForm] = useState<Partial<Case>>(() => buildInitialFormState(initialData));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens with new data
  React.useEffect(() => {
    if (isOpen) {
      setForm(buildInitialFormState(initialData));
      setError(null);
      setSaving(false);
    }
  }, [isOpen, initialData]);

  const handleField = useCallback((key: keyof Case, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value || null }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!form.caseNo || form.caseNo.trim() === '') {
      setError('Case Number is required.');
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save case. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [form, onSave, onClose]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#F0F2F5]">
          <h2 className="text-lg font-bold text-[#1B2A4A]">
            {isEdit ? 'Edit Case' : 'Add New Case'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#6C757D] hover:bg-gray-200 hover:text-[#333333] transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-[#FF4444]/20 text-[#FF4444] text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Case No. */}
            <FormField label="Case Number" required>
              <input
                type="text"
                value={form.caseNo || ''}
                onChange={(e) => handleField('caseNo', e.target.value)}
                placeholder="e.g., SLP (C) No.12345 of 2024"
                className={inputClass}
              />
            </FormField>

            {/* Court */}
            <FormField label="Court">
              <select
                value={form.court || ''}
                onChange={(e) => handleField('court', e.target.value)}
                className={selectClass}
                style={selectBgStyle}
              >
                <option value="">Select Court</option>
                {COURTS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>

            {/* Client */}
            <FormField label="Client">
              <input
                type="text"
                value={form.client || ''}
                onChange={(e) => handleField('client', e.target.value)}
                placeholder="e.g., State of Uttarakhand"
                className={inputClass}
              />
            </FormField>

            {/* Case Title */}
            <FormField label="Case Title">
              <input
                type="text"
                value={form.caseTitle || ''}
                onChange={(e) => handleField('caseTitle', e.target.value)}
                placeholder="Full case title"
                className={inputClass}
              />
            </FormField>

            {/* Petitioner */}
            <FormField label="Petitioner">
              <input
                type="text"
                value={form.petitioner || ''}
                onChange={(e) => handleField('petitioner', e.target.value)}
                placeholder="Petitioner name(s)"
                className={inputClass}
              />
            </FormField>

            {/* Respondent */}
            <FormField label="Respondent">
              <input
                type="text"
                value={form.respondent || ''}
                onChange={(e) => handleField('respondent', e.target.value)}
                placeholder="Respondent name(s)"
                className={inputClass}
              />
            </FormField>

            {/* Our Role */}
            <FormField label="Our Role">
              <select
                value={form.ourRole || ''}
                onChange={(e) => handleField('ourRole', e.target.value)}
                className={selectClass}
                style={selectBgStyle}
              >
                <option value="">Select Role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FormField>

            {/* Respondent Number */}
            <FormField label="Respondent Number">
              <input
                type="text"
                value={form.respondentNumber || ''}
                onChange={(e) => handleField('respondentNumber', e.target.value)}
                placeholder="e.g., No.1 to 3"
                className={inputClass}
              />
            </FormField>

            {/* Category */}
            <FormField label="Category">
              <select
                value={form.category || ''}
                onChange={(e) => handleField('category', e.target.value)}
                className={selectClass}
                style={selectBgStyle}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>

            {/* Department */}
            <FormField label="Department">
              <select
                value={form.department || ''}
                onChange={(e) => handleField('department', e.target.value)}
                className={selectClass}
                style={selectBgStyle}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FormField>

            {/* Filing Date */}
            <FormField label="Filing Date">
              <input
                type="text"
                value={form.filingDate || ''}
                onChange={(e) => handleField('filingDate', e.target.value)}
                placeholder="DD.MM.YYYY"
                className={inputClass}
              />
            </FormField>

            {/* Status */}
            <FormField label="Status">
              <select
                value={form.status || ''}
                onChange={(e) => handleField('status', e.target.value)}
                className={selectClass}
                style={selectBgStyle}
              >
                {(Object.entries(CASE_STATUS_LABELS) as [CaseStatus, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  )
                )}
              </select>
            </FormField>

            {/* NDOH */}
            <FormField label="Next Date of Hearing">
              <input
                type="text"
                value={form.ndoh || ''}
                onChange={(e) => handleField('ndoh', e.target.value)}
                placeholder="DD.MM.YYYY"
                className={inputClass}
              />
            </FormField>

            {/* Priority */}
            <FormField label="Priority">
              <select
                value={form.priority || 'Medium'}
                onChange={(e) => handleField('priority', e.target.value)}
                className={selectClass}
                style={selectBgStyle}
              >
                {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  )
                )}
              </select>
            </FormField>
          </div>

          {/* Remarks — full width */}
          <div className="mt-4">
            <FormField label="Remarks">
              <textarea
                value={form.remarks || ''}
                onChange={(e) => handleField('remarks', e.target.value)}
                placeholder="Any notes or remarks about the case..."
                rows={3}
                className="
                  w-full px-3 py-2 rounded-md border border-gray-300 bg-white
                  text-sm text-[#333333] placeholder-[#999] resize-y
                  focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4]
                  transition-colors
                "
              />
            </FormField>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-[#F0F2F5]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              h-9 px-5 rounded-md text-sm font-medium
              text-[#333333] border border-gray-300 bg-white
              hover:bg-gray-50 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="
              h-9 px-5 rounded-md text-sm font-medium
              text-white bg-[#4472C4] border border-[#4472C4]
              hover:bg-[#3A62A8] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
          >
            {saving && (
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'white', borderTopColor: 'transparent' }}
              />
            )}
            {saving ? 'Saving...' : isEdit ? 'Update Case' : 'Save Case'}
          </button>
        </div>
      </div>
    </div>
  );
}
