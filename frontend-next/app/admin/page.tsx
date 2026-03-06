'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TechBackground } from '@/components/TechBackground';
import { assetPath } from '@/lib/utils';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.role === 'admin') {
            setIsAuthenticated(true);
          } else {
            router.push(assetPath('/signin'));
          }
        } else {
          router.push(assetPath('/signin'));
        }
      } catch {
        router.push(assetPath('/signin'));
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Logout even if the API call fails
    }
    window.dispatchEvent(new Event('authChange'));
    router.push(assetPath('/'));
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-charcoal/60">Checking authentication...</p>
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
      <TechBackground />
      <Header />

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-deepGreen font-display">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-charcoal text-cream rounded hover:bg-charcoal/80 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <a
              href={assetPath("/admin/resources")}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-deepGreen/30"
            >
              <h2 className="text-2xl font-semibold text-deepGreen mb-2">Manage Resources</h2>
              <p className="text-charcoal/70">
                Add, edit, and publish resources (Books, Research Articles, Legal Posts, News Telecasts)
              </p>
            </a>
            <a
              href={assetPath("/admin/testimonials")}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-deepGreen/30"
            >
              <h2 className="text-2xl font-semibold text-deepGreen mb-2">Manage Testimonials</h2>
              <p className="text-charcoal/70">
                Add, edit, and publish client testimonials that appear on the home page
              </p>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
