import type { Metadata } from 'next';
import CmsLayoutShell from '@/components/cms/layout/CmsLayoutShell';

export const metadata: Metadata = {
  title: 'Case Management | Atrey Chambers',
  robots: { index: false, follow: false },
};

export default function CaseManagementLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <CmsLayoutShell>{children}</CmsLayoutShell>;
}
