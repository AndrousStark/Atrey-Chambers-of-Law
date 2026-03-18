import CaseDetailClient from './CaseDetailClient';

// Required for static export (output: 'export') — returns empty array
// because case IDs come from API at runtime. The JS chunk is still
// compiled so client-side navigation from the cases list works.
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return [];
}

export default function CaseDetailPage() {
  return <CaseDetailClient />;
}
