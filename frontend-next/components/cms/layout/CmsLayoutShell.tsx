'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cmsAuth } from '@/lib/cms-api';
import type { CmsUser } from '@/lib/cms-types';
import CmsHeader from './CmsHeader';
import CmsNavTabs from './CmsNavTabs';

function deriveActiveTab(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  // /case-management/cases -> "cases", /case-management -> "dashboard"
  return segments[1] || 'dashboard';
}

export default function CmsLayoutShell({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CmsUser | null>(null);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === '/case-management/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    async function checkAuth() {
      const session = await cmsAuth.getSession();
      if (!session) {
        router.replace('/case-management/login');
        return;
      }
      setUser(session);
      setChecking(false);
    }

    checkAuth();
  }, [isLoginPage, router]);

  const handleLogout = useCallback(async () => {
    await cmsAuth.logout();
    setUser(null);
    router.replace('/case-management/login');
  }, [router]);

  // Login page renders without CMS chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Auth check in progress
  if (checking || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: '#F0F2F5',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#2E5090', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#1B2A4A' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const activeTab = deriveActiveTab(pathname);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#F0F2F5',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <CmsHeader
        userName={user.name}
        userRole={user.role}
        onLogout={handleLogout}
      />
      <CmsNavTabs
        activeTab={activeTab}
        userRole={user.role}
        userPermissions={user.permissions ?? []}
      />
      <main className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
