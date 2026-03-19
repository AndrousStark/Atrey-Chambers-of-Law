'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────

interface Toast {
  readonly id: string;
  readonly type: 'success' | 'error';
  readonly message: string;
}

interface ToastContextValue {
  readonly showToast: (type: 'success' | 'error', message: string) => void;
}

// ─── Context ─────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within CmsToastProvider');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────

export function CmsToastProvider({ children }: { readonly children: React.ReactNode }) {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `toast-${++idRef.current}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
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
                <CheckCircle size={18} />
              ) : (
                <XCircle size={18} />
              )}
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => dismiss(toast.id)}
                className="p-0.5 rounded hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
