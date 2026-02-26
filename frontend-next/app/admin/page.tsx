'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TechBackground } from '@/components/TechBackground';
import { assetPath } from '@/lib/utils';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem('isAdmin');
    if (!admin) {
      router.push(assetPath('/signin'));
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    // Dispatch custom event to update Header
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-deepGreen font-display">
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

