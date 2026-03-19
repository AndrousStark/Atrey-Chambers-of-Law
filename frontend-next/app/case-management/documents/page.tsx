'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cmsDocuments, cmsAuth, cmsCases, cmsClients } from '@/lib/cms-api';
import type { Document, DocumentCategory, DocumentTemplate, UserRole } from '@/lib/cms-types';
import { DOCUMENT_CATEGORY_LABELS } from '@/lib/cms-types';
import { CmsToastProvider, useToast, CmsConfirmDialog, CmsLoadingState } from '@/components/cms/ui';
import { tw, selectArrowStyle } from '@/lib/design-tokens';

// ============================================================
// Constants & Types
// ============================================================

const ALL_CATEGORIES: readonly DocumentCategory[] = [
  'Pleading', 'Application', 'Affidavit', 'CourtOrder', 'Judgment',
  'Notice', 'Correspondence', 'Evidence', 'Agreement', 'Template', 'Other',
] as const;

const CAT_COLORS: Record<DocumentCategory, string> = {
  Pleading: 'bg-blue-50 text-[#4472C4] border-[#4472C4]',
  Application: 'bg-purple-50 text-purple-600 border-purple-600',
  Affidavit: 'bg-teal-50 text-teal-600 border-teal-600',
  CourtOrder: 'bg-amber-50 text-amber-600 border-amber-600',
  Judgment: 'bg-green-50 text-[#28A745] border-[#28A745]',
  Notice: 'bg-red-50 text-[#FF4444] border-[#FF4444]',
  Correspondence: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
  Evidence: 'bg-orange-50 text-[#FF8C00] border-[#FF8C00]',
  Agreement: 'bg-indigo-50 text-indigo-600 border-indigo-600',
  Template: 'bg-pink-50 text-pink-600 border-pink-600',
  Other: 'bg-gray-100 text-[#6C757D] border-[#6C757D]',
};

type FileTypeFilter = 'All' | 'PDF' | 'DOCX' | 'Image';

type ActiveTab = 'documents' | 'templates';

interface UploadQueueItem {
  readonly file: File;
  readonly id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMessage?: string;
}

interface UploadFormData {
  name: string;
  caseId: string;
  clientId: string;
  category: DocumentCategory | '';
  description: string;
  tags: string;
}

interface EditFormData {
  name: string;
  category: DocumentCategory;
  description: string;
  tags: string;
  caseId: string;
  clientId: string;
}

interface CaseOption {
  readonly id: string;
  readonly caseNo: string;
  readonly caseTitle: string;
}

interface ClientOption {
  readonly id: string;
  readonly name: string;
}

interface DocStats {
  total: number;
  byCategory: { category: string; count: number }[];
}

// ============================================================
// Helpers
// ============================================================

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getFileTypeFromMime(mime: string): 'pdf' | 'docx' | 'image' | 'other' {
  if (mime === 'application/pdf') return 'pdf';
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword'
  ) return 'docx';
  if (mime.startsWith('image/')) return 'image';
  return 'other';
}

function getFileIcon(mime: string): { icon: string; color: string } {
  const type = getFileTypeFromMime(mime);
  switch (type) {
    case 'pdf':
      return { icon: '\uD83D\uDCC4', color: '#FF4444' };
    case 'docx':
      return { icon: '\uD83D\uDCC3', color: '#4472C4' };
    case 'image':
      return { icon: '\uD83D\uDDBC\uFE0F', color: '#28A745' };
    default:
      return { icon: '\uD83D\uDCC1', color: '#6C757D' };
  }
}

function matchesFileTypeFilter(mime: string, filter: FileTypeFilter): boolean {
  if (filter === 'All') return true;
  const type = getFileTypeFromMime(mime);
  if (filter === 'PDF') return type === 'pdf';
  if (filter === 'DOCX') return type === 'docx';
  if (filter === 'Image') return type === 'image';
  return true;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// (Toast, ConfirmDialog, LoadingSkeleton now provided by shared CMS UI library)

// ============================================================
// Empty State
// ============================================================

function EmptyState({ onUpload }: { readonly onUpload: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
      <p className="text-sm font-medium text-[#1B2A4A]">No documents yet</p>
      <p className="text-xs text-[#6C757D]">
        Upload your first document to get started.
      </p>
      <button
        onClick={onUpload}
        className="mt-2 h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors"
      >
        Upload Document
      </button>
    </div>
  );
}

// ============================================================
// Upload Modal (Drag & Drop + Metadata)
// ============================================================

function UploadModal({
  isOpen,
  cases,
  clients,
  queue,
  onFilesSelected,
  onUpload,
  onClose,
  uploading,
}: {
  readonly isOpen: boolean;
  readonly cases: CaseOption[];
  readonly clients: ClientOption[];
  readonly queue: UploadQueueItem[];
  readonly onFilesSelected: (files: File[]) => void;
  readonly onUpload: (meta: UploadFormData) => void;
  readonly onClose: () => void;
  readonly uploading: boolean;
}) {
  const [form, setForm] = useState<UploadFormData>({
    name: '',
    caseId: '',
    clientId: '',
    category: '',
    description: '',
    tags: '',
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', caseId: '', clientId: '', category: '', description: '', tags: '' });
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

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onFilesSelected(droppedFiles);
      if (droppedFiles.length === 1 && !form.name) {
        setForm((prev) => ({ ...prev, name: droppedFiles[0].name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      if (selectedFiles.length === 1 && !form.name) {
        setForm((prev) => ({ ...prev, name: selectedFiles[0].name.replace(/\.[^/.]+$/, '') }));
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload(form);
  };

  const updateField = <K extends keyof UploadFormData>(key: K, value: UploadFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const hasFiles = queue.length > 0;
  const allDone = queue.length > 0 && queue.every((q) => q.status === 'done');
  const anyUploading = queue.some((q) => q.status === 'uploading');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-[#1B2A4A]">Upload Documents</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors
              ${isDragOver ? 'border-[#4472C4] bg-[#4472C4]/5' : 'border-gray-300 bg-gray-50 hover:border-[#4472C4]/50 hover:bg-gray-100/50'}
            `.trim()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.xlsx,.xls,.pptx,.ppt"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={isDragOver ? '#4472C4' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="mt-3 text-sm font-medium text-[#1B2A4A]">
              {isDragOver ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
            </p>
            <p className="mt-1 text-xs text-[#6C757D]">
              PDF, DOCX, images, and more. Max 50 MB per file.
            </p>
          </div>

          {/* File Queue */}
          {hasFiles && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#1B2A4A]">Selected Files ({queue.length})</p>
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border border-gray-200 p-3">
                {queue.map((item) => {
                  const icon = getFileIcon(item.file.type);
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-lg" style={{ filter: 'none' }}>{icon.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#333] truncate">{item.file.name}</p>
                        <p className="text-xs text-[#6C757D]">{formatSize(item.file.size)}</p>
                      </div>
                      {item.status === 'uploading' && (
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4472C4] rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                      {item.status === 'done' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28A745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      )}
                      {item.status === 'error' && (
                        <span className="text-xs text-[#FF4444]" title={item.errorMessage}>Failed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata Fields */}
          {hasFiles && !allDone && (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Document Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
                  placeholder="Leave blank to use filename"
                />
              </div>

              {/* Case + Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Link to Case</label>
                  <select
                    value={form.caseId}
                    onChange={(e) => updateField('caseId', e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
                  >
                    <option value="">No case linked</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>{c.caseNo} - {c.caseTitle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Link to Client</label>
                  <select
                    value={form.clientId}
                    onChange={(e) => updateField('clientId', e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
                  >
                    <option value="">No client linked</option>
                    {clients.map((cl) => (
                      <option key={cl.id} value={cl.id}>{cl.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value as DocumentCategory | '')}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
                >
                  <option value="">Select category...</option>
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{DOCUMENT_CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors resize-y"
                  placeholder="Optional description..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
                  placeholder="Comma-separated tags (e.g. urgent, draft)"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#333333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              {allDone ? 'Close' : 'Cancel'}
            </button>
            {hasFiles && !allDone && (
              <button
                type="submit"
                disabled={uploading || anyUploading}
                className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(uploading || anyUploading) && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {(uploading || anyUploading) ? 'Uploading...' : `Upload ${queue.length} file${queue.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Edit Document Modal
// ============================================================

function EditDocumentModal({
  isOpen,
  doc,
  cases,
  clients,
  onSave,
  onClose,
  saving,
}: {
  readonly isOpen: boolean;
  readonly doc: Document | null;
  readonly cases: CaseOption[];
  readonly clients: ClientOption[];
  readonly onSave: (data: EditFormData) => void;
  readonly onClose: () => void;
  readonly saving: boolean;
}) {
  const [form, setForm] = useState<EditFormData>({
    name: '',
    category: 'Other',
    description: '',
    tags: '',
    caseId: '',
    clientId: '',
  });

  useEffect(() => {
    if (isOpen && doc) {
      setForm({
        name: doc.name,
        category: doc.category,
        description: doc.description ?? '',
        tags: (doc.tags ?? []).join(', '),
        caseId: doc.caseId ?? '',
        clientId: doc.clientId ?? '',
      });
    }
  }, [isOpen, doc]);

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

  if (!isOpen || !doc) return null;

  const updateField = <K extends keyof EditFormData>(key: K, value: EditFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-[#1B2A4A]">Edit Document</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Document Name <span className="text-[#FF4444]">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value as DocumentCategory)}
              className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{DOCUMENT_CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>

          {/* Case + Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Link to Case</label>
              <select
                value={form.caseId}
                onChange={(e) => updateField('caseId', e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
              >
                <option value="">No case linked</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.caseNo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Link to Client</label>
              <select
                value={form.clientId}
                onChange={(e) => updateField('clientId', e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
              >
                <option value="">No client linked</option>
                {clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>{cl.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors resize-y"
              placeholder="Optional description..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
              placeholder="Comma-separated tags"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#333333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Preview Panel (Slide-over)
// ============================================================

function PreviewPanel({
  doc,
  cases,
  clients,
  versions,
  loadingVersions,
  onClose,
  onUploadVersion,
  onDownload,
}: {
  readonly doc: Document | null;
  readonly cases: CaseOption[];
  readonly clients: ClientOption[];
  readonly versions: Document[];
  readonly loadingVersions: boolean;
  readonly onClose: () => void;
  readonly onUploadVersion: (file: File) => void;
  readonly onDownload: (id: string) => void;
}) {
  const versionFileRef = useRef<HTMLInputElement>(null);

  if (!doc) return null;

  const fileType = getFileTypeFromMime(doc.mimeType);
  const previewUrl = cmsDocuments.previewUrl(doc.id);
  const downloadUrl = cmsDocuments.downloadUrl(doc.id);
  const linkedCase = cases.find((c) => c.id === doc.caseId);
  const linkedClient = clients.find((c) => c.id === doc.clientId);

  const handleVersionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadVersion(file);
    }
    if (versionFileRef.current) {
      versionFileRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-[#1B2A4A] truncate pr-4">{doc.name}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview Area */}
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            {fileType === 'pdf' && (
              <iframe
                src={previewUrl}
                className="w-full h-96 border-0"
                title={`Preview: ${doc.name}`}
              />
            )}
            {fileType === 'image' && (
              <div className="p-4 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={doc.name}
                  className="max-w-full max-h-96 object-contain rounded"
                />
              </div>
            )}
            {fileType === 'docx' && (
              <div className="p-8 flex flex-col items-center gap-3 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4472C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <p className="text-sm text-[#6C757D]">Word documents cannot be previewed in browser.</p>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors inline-flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download to View
                </a>
              </div>
            )}
            {fileType === 'other' && (
              <div className="p-8 flex flex-col items-center gap-3 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                <p className="text-sm text-[#6C757D]">Preview not available for this file type.</p>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors inline-flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download
                </a>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1B2A4A]">Document Details</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-[#6C757D]">Original Filename</p>
                <p className="text-[#333] truncate" title={doc.originalName}>{doc.originalName}</p>
              </div>
              <div>
                <p className="text-xs text-[#6C757D]">Size</p>
                <p className="text-[#333]">{formatSize(doc.size)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6C757D]">Category</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CAT_COLORS[doc.category]}`}>
                  {DOCUMENT_CATEGORY_LABELS[doc.category]}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#6C757D]">Version</p>
                <p className="text-[#333]">v{doc.version}</p>
              </div>
              <div>
                <p className="text-xs text-[#6C757D]">Uploaded By</p>
                <p className="text-[#333]">{doc.uploadedBy?.name ?? 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-[#6C757D]">Uploaded</p>
                <p className="text-[#333]">{formatDate(doc.createdAt)}</p>
              </div>
              {linkedCase && (
                <div className="col-span-2">
                  <p className="text-xs text-[#6C757D]">Linked Case</p>
                  <p className="text-[#4472C4] font-medium">{linkedCase.caseNo} - {linkedCase.caseTitle}</p>
                </div>
              )}
              {linkedClient && (
                <div className="col-span-2">
                  <p className="text-xs text-[#6C757D]">Linked Client</p>
                  <p className="text-[#333]">{linkedClient.name}</p>
                </div>
              )}
              {doc.description && (
                <div className="col-span-2">
                  <p className="text-xs text-[#6C757D]">Description</p>
                  <p className="text-[#333] text-sm">{doc.description}</p>
                </div>
              )}
              {doc.tags && doc.tags.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-[#6C757D] mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-[#6C757D] border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 rounded-md text-sm font-medium text-[#4472C4] border border-[#4472C4] bg-white hover:bg-[#4472C4]/5 transition-colors inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Download
            </a>
            <button
              onClick={() => versionFileRef.current?.click()}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#FF8C00] border border-[#FF8C00] bg-white hover:bg-[#FF8C00]/5 transition-colors inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
              Upload New Version
            </button>
            <input
              ref={versionFileRef}
              type="file"
              className="hidden"
              onChange={handleVersionFileChange}
            />
          </div>

          {/* Version History */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1B2A4A]">Version History</h4>
            {loadingVersions ? (
              <div className="animate-pulse space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-md" />
                ))}
              </div>
            ) : versions.length === 0 ? (
              <p className="text-sm text-[#6C757D]">No previous versions.</p>
            ) : (
              <div className="space-y-2">
                {/* Current version */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-[#4472C4]/20 bg-[#4472C4]/5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#4472C4] text-white text-xs font-bold">v{doc.version}</span>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{doc.name}</p>
                      <p className="text-xs text-[#6C757D]">{formatDate(doc.createdAt)} - {formatSize(doc.size)} (Current)</p>
                    </div>
                  </div>
                </div>
                {/* Previous versions */}
                {versions.map((ver) => (
                  <div key={ver.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-[#6C757D] text-xs font-bold">v{ver.version}</span>
                      <div>
                        <p className="text-sm text-[#333]">{ver.name}</p>
                        <p className="text-xs text-[#6C757D]">{formatDate(ver.createdAt)} - {formatSize(ver.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDownload(ver.id)}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                      title="Download this version"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4472C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Template Generate Modal
// ============================================================

function TemplateGenerateModal({
  isOpen,
  template,
  cases,
  onGenerate,
  onClose,
  generating,
}: {
  readonly isOpen: boolean;
  readonly template: DocumentTemplate | null;
  readonly cases: CaseOption[];
  readonly onGenerate: (caseId: string, overrides: Record<string, string>, outputName: string) => void;
  readonly onClose: () => void;
  readonly generating: boolean;
}) {
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [outputName, setOutputName] = useState('');
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && template) {
      setSelectedCaseId('');
      setOutputName('');
      const initial: Record<string, string> = {};
      for (const v of template.variables) {
        initial[v] = '';
      }
      setOverrides(initial);
    }
  }, [isOpen, template]);

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

  if (!isOpen || !template) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) return;
    onGenerate(selectedCaseId, overrides, outputName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-[#1B2A4A]">Generate from Template</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Template info */}
          <div className="p-3 rounded-lg bg-[#4472C4]/5 border border-[#4472C4]/20">
            <p className="text-sm font-semibold text-[#1B2A4A]">{template.name}</p>
            {template.description && <p className="text-xs text-[#6C757D] mt-1">{template.description}</p>}
            <span className={`inline-flex items-center px-2 py-0.5 mt-2 rounded-full text-xs font-medium border ${CAT_COLORS[template.category]}`}>
              {DOCUMENT_CATEGORY_LABELS[template.category]}
            </span>
          </div>

          {/* Case Selection */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
              Select Case <span className="text-[#FF4444]">*</span>
            </label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
              required
            >
              <option value="">Select a case...</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNo} - {c.caseTitle}</option>
              ))}
            </select>
          </div>

          {/* Output Name */}
          <div>
            <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Output Document Name</label>
            <input
              type="text"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
              placeholder="Leave blank for auto-generated name"
            />
          </div>

          {/* Variable Overrides */}
          {template.variables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Variable Overrides</label>
              <p className="text-xs text-[#6C757D] mb-3">
                These will be auto-filled from the case. Override only if needed.
              </p>
              <div className="space-y-3">
                {template.variables.map((v) => (
                  <div key={v}>
                    <label className="block text-xs font-medium text-[#6C757D] mb-1">{v}</label>
                    <input
                      type="text"
                      value={overrides[v] ?? ''}
                      onChange={(e) => setOverrides((prev) => ({ ...prev, [v]: e.target.value }))}
                      className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
                      placeholder={`Auto-fill from case data`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-md text-sm font-medium text-[#333333] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating || !selectedCaseId}
              className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#28A745] border border-[#28A745] hover:bg-[#219838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {generating ? 'Generating...' : 'Generate Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function DocumentManagementPageWrapper() {
  return (
    <CmsToastProvider>
      <DocumentManagementPage />
    </CmsToastProvider>
  );
}

function DocumentManagementPage() {
  // Data state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocStats>({ total: 0, byCategory: [] });
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('viewer');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | ''>('');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>('All');
  const [caseFilter, setCaseFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const PAGE_SIZE = 25;

  // Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('documents');

  // Upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [uploading, setUploading] = useState(false);

  // Edit state
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  // Preview state
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewVersions, setPreviewVersions] = useState<Document[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Template generate state
  const [generateTemplate, setGenerateTemplate] = useState<DocumentTemplate | null>(null);
  const [generating, setGenerating] = useState(false);

  // Toast (from shared CMS UI)
  const { showToast } = useToast();

  // ---- Fetch Data ----

  const fetchDocuments = useCallback(async () => {
    try {
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
      };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (caseFilter) params.caseId = caseFilter;
      if (showArchived) params.includeArchived = 1;

      const result = await cmsDocuments.list(params);
      setDocuments(result.data ?? []);
      setTotalDocs(result.meta?.total ?? 0);
      setTotalPages(result.meta?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents.');
    }
  }, [page, search, categoryFilter, caseFilter, showArchived]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docResult, statsResult, caseResult, clientResult] = await Promise.all([
        cmsDocuments.list({ page: 1, limit: PAGE_SIZE }),
        cmsDocuments.stats().catch(() => ({ total: 0, byCategory: [] })),
        cmsCases.list({ limit: 200 }),
        cmsClients.listAll().catch(() => []),
      ]);

      setDocuments(docResult.data ?? []);
      setTotalDocs(docResult.meta?.total ?? 0);
      setTotalPages(docResult.meta?.totalPages ?? 1);
      setStats(statsResult);
      setCases(caseResult.data.map((c) => ({ id: c.id, caseNo: c.caseNo, caseTitle: c.caseTitle })));
      setClients((clientResult ?? []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const tpls = await cmsDocuments.templates();
      setTemplates(tpls.filter((t) => t.isActive));
    } catch {
      // Non-critical, ignore
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchTemplates();
  }, [fetchAll, fetchTemplates]);

  useEffect(() => {
    const user = cmsAuth.getUser();
    if (user) setUserRole(user.role);
  }, []);

  // Refetch when filters or page changes
  useEffect(() => {
    if (!loading) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter, caseFilter, showArchived]);

  // Debounced search
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (loading) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchDocuments();
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ---- Filtered documents (client-side file type filter) ----

  const filteredDocuments = useMemo(() => {
    if (fileTypeFilter === 'All') return documents;
    return documents.filter((d) => matchesFileTypeFilter(d.mimeType, fileTypeFilter));
  }, [documents, fileTypeFilter]);

  // ---- Upload ----

  const handleFilesSelected = useCallback((files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((f) => ({
      file: f,
      id: generateId(),
      progress: 0,
      status: 'pending' as const,
    }));
    setUploadQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleUpload = useCallback(async (meta: UploadFormData) => {
    setUploading(true);
    const pendingItems = uploadQueue.filter((q) => q.status === 'pending');
    const tagsArray = meta.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    for (const item of pendingItems) {
      setUploadQueue((prev) =>
        prev.map((q) => q.id === item.id ? { ...q, status: 'uploading' as const, progress: 20 } : q)
      );

      try {
        setUploadQueue((prev) =>
          prev.map((q) => q.id === item.id ? { ...q, progress: 50 } : q)
        );

        await cmsDocuments.upload(item.file, {
          name: meta.name || undefined,
          caseId: meta.caseId || undefined,
          clientId: meta.clientId || undefined,
          category: meta.category || undefined,
          description: meta.description || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        });

        setUploadQueue((prev) =>
          prev.map((q) => q.id === item.id ? { ...q, status: 'done' as const, progress: 100 } : q)
        );
      } catch (err) {
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error' as const, errorMessage: err instanceof Error ? err.message : 'Upload failed' }
              : q
          )
        );
      }
    }

    const doneCount = uploadQueue.filter((q) => q.status === 'done').length + pendingItems.filter((q) => q.status !== 'error').length;
    setUploading(false);
    showToast('success', `${doneCount} document${doneCount !== 1 ? 's' : ''} uploaded successfully.`);

    // Refresh
    await fetchDocuments();
    const newStats = await cmsDocuments.stats().catch(() => ({ total: 0, byCategory: [] }));
    setStats(newStats);
  }, [uploadQueue, fetchDocuments, showToast]);

  const handleCloseUploadModal = useCallback(() => {
    setUploadModalOpen(false);
    setUploadQueue([]);
  }, []);

  // ---- Edit ----

  const handleOpenEdit = useCallback((doc: Document) => {
    setEditDoc(doc);
    setEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async (data: EditFormData) => {
    if (!editDoc) return;
    setSaving(true);
    try {
      const tagsArray = data.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await cmsDocuments.update(editDoc.id, {
        name: data.name,
        category: data.category,
        description: data.description || null,
        tags: tagsArray,
        caseId: data.caseId || null,
        clientId: data.clientId || null,
      } as Partial<Document>);

      showToast('success', 'Document updated successfully.');
      setEditModalOpen(false);
      setEditDoc(null);
      await fetchDocuments();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update document.');
    } finally {
      setSaving(false);
    }
  }, [editDoc, fetchDocuments, showToast]);

  // ---- Delete ----

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await cmsDocuments.remove(deleteTarget.id);
      showToast('success', 'Document deleted.');
      setDeleteTarget(null);
      if (previewDoc?.id === deleteTarget.id) {
        setPreviewDoc(null);
      }
      await fetchDocuments();
      const newStats = await cmsDocuments.stats().catch(() => ({ total: 0, byCategory: [] }));
      setStats(newStats);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete document.');
    }
  }, [deleteTarget, previewDoc, fetchDocuments, showToast]);

  // ---- Preview ----

  const handlePreview = useCallback(async (doc: Document) => {
    setPreviewDoc(doc);
    setLoadingVersions(true);
    setPreviewVersions([]);
    try {
      // Fetch version history - get documents with same parentId or where parentId = doc.id
      const parentId = doc.parentId ?? doc.id;
      const params: Record<string, string | number> = { limit: 50 };
      if (parentId) params.parentId = parentId;
      const result = await cmsDocuments.list(params);
      const allVersions = (result.data ?? []).filter((d) => d.id !== doc.id);
      setPreviewVersions(allVersions.sort((a, b) => b.version - a.version));
    } catch {
      // Ignore version fetch errors
    } finally {
      setLoadingVersions(false);
    }
  }, []);

  const handleUploadVersion = useCallback(async (file: File) => {
    if (!previewDoc) return;
    try {
      const newDoc = await cmsDocuments.uploadVersion(previewDoc.id, file);
      showToast('success', `Version ${newDoc.version} uploaded.`);
      setPreviewDoc(newDoc);
      await fetchDocuments();
      // Re-fetch versions
      handlePreview(newDoc);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to upload new version.');
    }
  }, [previewDoc, fetchDocuments, showToast, handlePreview]);

  const handleDownloadVersion = useCallback((id: string) => {
    const url = cmsDocuments.downloadUrl(id);
    window.open(url, '_blank');
  }, []);

  // ---- Template Generate ----

  const handleGenerate = useCallback(async (caseId: string, overrides: Record<string, string>, outputName: string) => {
    if (!generateTemplate) return;
    setGenerating(true);
    try {
      const cleanOverrides: Record<string, string> = {};
      for (const [k, v] of Object.entries(overrides)) {
        if (v.trim()) cleanOverrides[k] = v.trim();
      }

      await cmsDocuments.generateFromTemplate(
        generateTemplate.id,
        caseId,
        Object.keys(cleanOverrides).length > 0 ? cleanOverrides : undefined,
        outputName || undefined,
      );

      showToast('success', `Document generated from template "${generateTemplate.name}".`);
      setGenerateTemplate(null);
      await fetchDocuments();
      const newStats = await cmsDocuments.stats().catch(() => ({ total: 0, byCategory: [] }));
      setStats(newStats);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to generate document.');
    } finally {
      setGenerating(false);
    }
  }, [generateTemplate, fetchDocuments, showToast]);

  // ---- Seed Templates ----

  const handleSeedTemplates = useCallback(async () => {
    try {
      const result = await cmsDocuments.seedTemplates();
      showToast('success', `${result.seeded} templates seeded.`);
      await fetchTemplates();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to seed templates.');
    }
  }, [fetchTemplates, showToast]);

  // ============================================================
  // Render
  // ============================================================

  const canEdit = userRole === 'superadmin' || userRole === 'editor';

  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Document Management</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            Upload, organize, and manage case documents
            {!loading && ` \u2014 ${totalDocs} total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchAll(); fetchTemplates(); }}
            disabled={loading}
            className="h-9 px-4 rounded-md text-sm font-medium text-[#6C757D] border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Refresh data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={loading ? 'animate-spin' : ''}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          {canEdit && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Upload
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col">
            <p className="text-xs text-[#6C757D] font-medium">Total Documents</p>
            <p className="text-xl font-bold text-[#1B2A4A] mt-1">{stats.total}</p>
          </div>
          {/* By Category */}
          {stats.byCategory.slice(0, 5).map((cat) => (
            <div key={cat.category} className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col">
              <p className="text-xs text-[#6C757D] font-medium truncate">{DOCUMENT_CATEGORY_LABELS[cat.category as DocumentCategory] ?? cat.category}</p>
              <p className="text-xl font-bold text-[#1B2A4A] mt-1">{cat.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('documents')}
          className={`
            inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors
            ${activeTab === 'documents' ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-[#6C757D] hover:text-[#1B2A4A]'}
          `.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          Documents
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`
            inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors
            ${activeTab === 'templates' ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-[#6C757D] hover:text-[#1B2A4A]'}
          `.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          Templates
          {templates.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-semibold bg-[#4472C4] text-white">
              {templates.length}
            </span>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-[#FF4444]/20 rounded-lg p-4 text-sm text-[#FF4444] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button onClick={fetchAll} className="ml-auto text-xs font-medium underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && <CmsLoadingState text="Loading documents..." />}

      {/* ============ Documents Tab ============ */}
      {!loading && activeTab === 'documents' && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
                placeholder="Search documents..."
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value as DocumentCategory | ''); setPage(1); }}
              className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
            >
              <option value="">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{DOCUMENT_CATEGORY_LABELS[cat]}</option>
              ))}
            </select>

            {/* File Type Filter */}
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value as FileTypeFilter)}
              className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors"
            >
              <option value="All">All File Types</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="Image">Image</option>
            </select>

            {/* Case Filter */}
            <select
              value={caseFilter}
              onChange={(e) => { setCaseFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] transition-colors max-w-[200px]"
            >
              <option value="">All Cases</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNo}</option>
              ))}
            </select>

            {/* Archive Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => { setShowArchived(e.target.checked); setPage(1); }}
                  className="sr-only"
                />
                <div className={`w-9 h-5 rounded-full transition-colors ${showArchived ? 'bg-[#4472C4]' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${showArchived ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <span className="text-sm text-[#6C757D]">Archived</span>
            </label>
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && !error && (
            <EmptyState onUpload={() => setUploadModalOpen(true)} />
          )}

          {/* Document Table */}
          {filteredDocuments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200" style={{ backgroundColor: '#F8F9FA' }}>
                    <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap w-10"></th>
                    <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Case</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Size</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Uploaded By</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Date</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#1B2A4A] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => {
                    const icon = getFileIcon(doc.mimeType);
                    const linkedCase = cases.find((c) => c.id === doc.caseId);

                    return (
                      <tr
                        key={doc.id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => handlePreview(doc)}
                      >
                        {/* File Icon */}
                        <td className="px-4 py-3">
                          <span className="text-xl" style={{ filter: 'none' }}>{icon.icon}</span>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-[#1B2A4A] truncate max-w-[240px]" title={doc.name}>
                            {doc.name}
                          </p>
                          {doc.version > 1 && (
                            <span className="text-xs text-[#6C757D]">v{doc.version}</span>
                          )}
                        </td>

                        {/* Category Badge */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CAT_COLORS[doc.category]}`}>
                            {DOCUMENT_CATEGORY_LABELS[doc.category]}
                          </span>
                        </td>

                        {/* Case Link */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {linkedCase ? (
                            <span className="text-sm text-[#4472C4] font-medium truncate max-w-[160px] block" title={linkedCase.caseNo}>
                              {linkedCase.caseNo}
                            </span>
                          ) : (
                            <span className="text-sm text-[#6C757D]">-</span>
                          )}
                        </td>

                        {/* Size */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#6C757D]">
                          {formatSize(doc.size)}
                        </td>

                        {/* Uploaded By */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#6C757D]">
                          {doc.uploadedBy?.name ?? 'Unknown'}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#6C757D]">
                          {formatDate(doc.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {/* Download */}
                            <a
                              href={cmsDocuments.downloadUrl(doc.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                              title="Download"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4472C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            </a>

                            {/* Preview */}
                            <button
                              onClick={() => handlePreview(doc)}
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                              title="Preview"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>

                            {/* Edit */}
                            {canEdit && (
                              <button
                                onClick={() => handleOpenEdit(doc)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4472C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                            )}

                            {/* Delete */}
                            {userRole === 'superadmin' && (
                              <button
                                onClick={() => setDeleteTarget(doc)}
                                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            )}

                            {/* New Version */}
                            {canEdit && (
                              <button
                                onClick={() => handlePreview(doc)}
                                className="p-1.5 rounded hover:bg-orange-50 transition-colors"
                                title="Upload New Version"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-[#6C757D]">
                Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, totalDocs)} of {totalDocs}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 px-3 rounded-md border border-gray-300 bg-white text-[#333] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-[#4472C4] text-white border border-[#4472C4]'
                          : 'border border-gray-300 bg-white text-[#333] hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-8 px-3 rounded-md border border-gray-300 bg-white text-[#333] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============ Templates Tab ============ */}
      {!loading && activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Seed button for admins */}
          {userRole === 'superadmin' && templates.length === 0 && (
            <div className="bg-[#4472C4]/5 border border-[#4472C4]/20 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">No templates available</p>
                <p className="text-xs text-[#6C757D] mt-0.5">Seed default legal document templates to get started.</p>
              </div>
              <button
                onClick={handleSeedTemplates}
                className="h-9 px-5 rounded-md text-sm font-medium text-white bg-[#4472C4] border border-[#4472C4] hover:bg-[#3A62A8] transition-colors"
              >
                Seed Templates
              </button>
            </div>
          )}

          {/* Template Gallery */}
          {templates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#1B2A4A] truncate">{tpl.name}</h4>
                      {tpl.description && (
                        <p className="text-xs text-[#6C757D] mt-1 line-clamp-2">{tpl.description}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${CAT_COLORS[tpl.category]}`}>
                      {DOCUMENT_CATEGORY_LABELS[tpl.category]}
                    </span>
                  </div>

                  {/* Variables */}
                  {tpl.variables.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-[#6C757D] mb-1.5">Variables:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tpl.variables.map((v) => (
                          <span key={v} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-[#6C757D] border border-gray-200 font-mono">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setGenerateTemplate(tpl)}
                      disabled={!canEdit}
                      className="w-full h-9 px-4 rounded-md text-sm font-medium text-white bg-[#28A745] border border-[#28A745] hover:bg-[#219838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Generate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {templates.length === 0 && userRole !== 'superadmin' && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <p className="text-sm font-medium text-[#1B2A4A]">No templates available</p>
              <p className="text-xs text-[#6C757D]">Contact an administrator to set up document templates.</p>
            </div>
          )}
        </div>
      )}

      {/* ============ Modals ============ */}

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        cases={cases}
        clients={clients}
        queue={uploadQueue}
        onFilesSelected={handleFilesSelected}
        onUpload={handleUpload}
        onClose={handleCloseUploadModal}
        uploading={uploading}
      />

      {/* Edit Modal */}
      <EditDocumentModal
        isOpen={editModalOpen}
        doc={editDoc}
        cases={cases}
        clients={clients}
        onSave={handleSaveEdit}
        onClose={() => { setEditModalOpen(false); setEditDoc(null); }}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <CmsConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteTarget?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Preview Panel */}
      <PreviewPanel
        doc={previewDoc}
        cases={cases}
        clients={clients}
        versions={previewVersions}
        loadingVersions={loadingVersions}
        onClose={() => setPreviewDoc(null)}
        onUploadVersion={handleUploadVersion}
        onDownload={handleDownloadVersion}
      />

      {/* Template Generate Modal */}
      <TemplateGenerateModal
        isOpen={!!generateTemplate}
        template={generateTemplate}
        cases={cases}
        onGenerate={handleGenerate}
        onClose={() => setGenerateTemplate(null)}
        generating={generating}
      />

    </div>
  );
}
