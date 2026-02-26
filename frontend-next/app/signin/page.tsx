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
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy authentication - accept any credentials
    if (email && password) {
      localStorage.setItem('isAdmin', 'true');
      // Dispatch custom event to update Header
      window.dispatchEvent(new Event('authChange'));
      router.push(assetPath('/admin'));
    }
  };

  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
      <TechBackground />
      <Header />
      
      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-deepGreen mb-8 text-center font-poppins">
            Admin Sign In
          </h1>
          
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg space-y-6">
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
              />
            </div>
            
            <button
              type="submit"
              className="w-full rounded bg-deepGreen text-cream px-6 py-3 font-semibold hover:bg-deepGreen/90 transition-colors"
            >
              Sign In
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

