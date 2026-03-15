'use client';

import React, { useEffect, useCallback } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface CmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function CmsModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'xl',
}: CmsModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        className={`
          relative bg-white rounded-2xl shadow-xl w-full ${SIZE_CLASSES[size]}
          animate-in fade-in zoom-in-95 duration-200
        `.trim()}
        style={{ padding: '30px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2
            id="cms-modal-title"
            className="text-lg font-bold text-[#1B2A4A]"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6C757D] hover:text-[#333333] hover:bg-[#F0F2F5] transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
