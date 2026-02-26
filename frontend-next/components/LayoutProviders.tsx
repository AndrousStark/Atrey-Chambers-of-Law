'use client';

import dynamic from 'next/dynamic';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll'), { ssr: false });
const PageTransitionComponent = dynamic(
  () => import('@/components/PageTransition').then((mod) => ({ default: mod.PageTransition })),
  { ssr: false }
);

export default function LayoutProviders({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <PageTransitionComponent>{children}</PageTransitionComponent>
    </SmoothScroll>
  );
}
