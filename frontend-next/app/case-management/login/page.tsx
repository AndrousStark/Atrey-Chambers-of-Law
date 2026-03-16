'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cmsAuth } from '@/lib/cms-api';

interface FormState {
  readonly email: string;
  readonly password: string;
  readonly error: string;
  readonly loading: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  email: '',
  password: '',
  error: '',
  loading: false,
};

export default function CmsLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);

  const updateField = useCallback(
    (field: 'email' | 'password', value: string) => {
      setForm((prev) => ({ ...prev, [field]: value, error: '' }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!form.email.trim()) {
        setForm((prev) => ({ ...prev, error: 'Email is required' }));
        return;
      }
      if (!form.password) {
        setForm((prev) => ({ ...prev, error: 'Password is required' }));
        return;
      }

      setForm((prev) => ({ ...prev, loading: true, error: '' }));

      try {
        await cmsAuth.login(form.email.trim(), form.password);
        router.replace('/case-management/dashboard');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Login failed. Please try again.';
        setForm((prev) => ({ ...prev, loading: false, error: message }));
      }
    },
    [form.email, form.password, router]
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: '#F0F2F5',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl"
        style={{ padding: '40px' }}
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3" role="img" aria-label="Scales of justice">
            {'\u2696\uFE0F'}
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: '#1B2A4A' }}
          >
            ATREY CMS
          </h1>
          <p
            className="text-sm mb-1"
            style={{ color: '#1B2A4A', opacity: 0.7 }}
          >
            (Case Management System)
          </p>
          <p className="text-sm" style={{ color: '#666666' }}>
            Atrey Chambers of Law LLP
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cms-email"
              className="text-sm font-medium"
              style={{ color: '#1B2A4A' }}
            >
              Email
            </label>
            <input
              id="cms-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              disabled={form.loading}
              className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] disabled:opacity-60"
              style={{
                borderColor: '#D1D5DB',
                color: '#1B2A4A',
                backgroundColor: '#FAFAFA',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cms-password"
              className="text-sm font-medium"
              style={{ color: '#1B2A4A' }}
            >
              Password
            </label>
            <input
              id="cms-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              disabled={form.loading}
              className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#4472C4]/30 focus:border-[#4472C4] disabled:opacity-60"
              style={{
                borderColor: '#D1D5DB',
                color: '#1B2A4A',
                backgroundColor: '#FAFAFA',
              }}
            />
          </div>

          {/* Error message */}
          {form.error && (
            <p className="text-sm text-red-600 mt-1" role="alert">
              {form.error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={form.loading}
            className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 cursor-pointer mt-2 hover:brightness-110 active:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#4472C4]/50 focus:ring-offset-2"
            style={{ backgroundColor: '#4472C4' }}
          >
            {form.loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: '#FFFFFF', borderTopColor: 'transparent' }}
                />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer hint for mock mode */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: '#999999' }}
        >
          Use a registered email with any password in demo mode
        </p>
      </div>
    </div>
  );
}
