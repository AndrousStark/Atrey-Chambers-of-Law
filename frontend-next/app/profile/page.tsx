'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TechBackground } from '@/components/TechBackground';
import { assetPath } from '@/lib/utils';

export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.role === 'admin') {
            setIsAuthenticated(true);
            setAdminEmail(data.email || '');
            return;
          }
        }
        router.push(assetPath('/signin'));
      } catch {
        router.push(assetPath('/signin'));
      }
    };
    checkSession();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Sign out even if the API call fails
    }
    window.dispatchEvent(new Event('authChange'));
    router.push(assetPath('/'));
  };

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
      <TechBackground />
      <Header />
      
      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-deepGreen mb-8 text-center font-poppins">
            Admin Profile
          </h1>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-deepGreen mb-4">
                Account Information
              </h2>
              <div className="space-y-4">
                {adminEmail && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Email
                    </label>
                    <div className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal">
                      {adminEmail}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Role
                  </label>
                  <div className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal">
                    Administrator
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Access Level
                  </label>
                  <div className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal">
                    Full Access
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-charcoal/20">
              <h2 className="text-2xl font-semibold text-deepGreen mb-4">
                Quick Actions
              </h2>
              <div className="space-y-4">
                <a
                  href={assetPath("/admin/resources")}
                  className="block bg-deepGreen/10 hover:bg-deepGreen/20 border border-deepGreen/30 rounded-lg p-4 text-deepGreen transition-colors"
                >
                  <h3 className="font-semibold mb-2">Manage Resources</h3>
                  <p className="text-sm text-charcoal/70">
                    Add, edit, and publish resources
                  </p>
                </a>
                <a
                  href={assetPath("/admin/testimonials")}
                  className="block bg-deepGreen/10 hover:bg-deepGreen/20 border border-deepGreen/30 rounded-lg p-4 text-deepGreen transition-colors"
                >
                  <h3 className="font-semibold mb-2">Manage Testimonials</h3>
                  <p className="text-sm text-charcoal/70">
                    Add, edit, and publish client testimonials
                  </p>
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-charcoal/20">
              <button
                onClick={handleSignOut}
                className="w-full rounded bg-charcoal text-cream px-6 py-3 font-semibold hover:bg-charcoal/80 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}

