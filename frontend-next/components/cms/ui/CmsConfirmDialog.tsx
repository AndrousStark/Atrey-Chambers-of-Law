'use client';

import React, { useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CmsConfirmDialogProps {
  readonly isOpen: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly variant?: 'danger' | 'warning' | 'info';
  readonly loading?: boolean;
}

const VARIANT_STYLES = {
  danger: {
    icon: 'text-[#FF4444]',
    button: 'bg-[#FF4444] text-white border-[#FF4444] hover:bg-[#E63939]',
  },
  warning: {
    icon: 'text-[#FF8C00]',
    button: 'bg-[#FF8C00] text-white border-[#FF8C00] hover:bg-[#E67E00]',
  },
  info: {
    icon: 'text-[#4472C4]',
    button: 'bg-[#4472C4] text-white border-[#4472C4] hover:bg-[#3A62A8]',
  },
};

export default function CmsConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: CmsConfirmDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    },
    [onCancel],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const styles = VARIANT_STYLES[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-start gap-3 mb-4">
          <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1B2A4A]">{title}</h3>
            <p className="text-sm text-[#6C757D] mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-4 rounded-md text-sm font-medium text-[#6C757D] border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`h-9 px-5 rounded-md text-sm font-medium border transition-colors cursor-pointer disabled:opacity-50 ${styles.button}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
