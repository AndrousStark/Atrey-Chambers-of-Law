import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | ATREY CMS',
  robots: { index: false, follow: false },
};

export default function CmsLoginLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#F0F2F5',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
