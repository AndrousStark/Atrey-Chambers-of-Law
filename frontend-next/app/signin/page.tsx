'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TechBackground } from '@/components/TechBackground';
import { assetPath } from '@/lib/utils';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Dispatch event so Header can update (e.g., show admin link)
        window.dispatchEvent(new Event('authChange'));
        router.push(assetPath('/admin'));
      } else if (response.status === 429) {
        setError(data.error || 'Too many attempts. Please wait and try again.');
      } else if (response.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
      <TechBackground />
      <Header />

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-deepGreen mb-8 text-center font-display">
            Admin Sign In
          </h1>

          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg space-y-6" noValidate>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                placeholder="admin@example.com"
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                placeholder="Enter password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded bg-deepGreen text-cream px-6 py-3 font-semibold hover:bg-deepGreen/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-charcoal/60">
            Authorized personnel only. Contact admin for access.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
