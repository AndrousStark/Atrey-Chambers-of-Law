import dynamic from 'next/dynamic';

const CaseDetailClient = dynamic(
  () => import('./CaseDetailClient'),
  { ssr: false }
);

export async function generateStaticParams() {
  return [];
}

export default function CaseDetailPage() {
  return <CaseDetailClient />;
}
