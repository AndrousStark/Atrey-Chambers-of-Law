'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { assetPath } from '@/lib/utils';

const NUM_BLOCKS = 20;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoOverlayRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const isTransitioning = useRef(false);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const revealPage = useCallback(() => {
    if (prefersReducedMotion) return;
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);

    gsap.set(blocksRef.current, { scaleX: 1, transformOrigin: 'right' });
    gsap.to(blocksRef.current, {
      scaleX: 0,
      duration: 0.4,
      stagger: 0.02,
      ease: 'power2.out',
      transformOrigin: 'right',
      onComplete: () => {
        isTransitioning.current = false;
        if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none';
        if (logoOverlayRef.current) logoOverlayRef.current.style.pointerEvents = 'none';
      },
    });

    // Safety fallback — force clear after 1s
    revealTimeoutRef.current = setTimeout(() => {
      if (blocksRef.current.length > 0) {
        const first = blocksRef.current[0];
        if (first && Number(gsap.getProperty(first, 'scaleX')) > 0) {
          gsap.to(blocksRef.current, {
            scaleX: 0,
            duration: 0.2,
            ease: 'power2.out',
            transformOrigin: 'right',
            onComplete: () => {
              isTransitioning.current = false;
              if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none';
              if (logoOverlayRef.current) logoOverlayRef.current.style.pointerEvents = 'none';
            },
          });
        }
      }
    }, 1000);
  }, [prefersReducedMotion]);

  const coverPage = useCallback(
    (url: string) => {
      if (overlayRef.current) overlayRef.current.style.pointerEvents = 'auto';
      if (logoOverlayRef.current) logoOverlayRef.current.style.pointerEvents = 'auto';

      const tl = gsap.timeline({
        onComplete: () => router.push(url),
      });

      tl.to(blocksRef.current, {
        scaleX: 1,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power2.out',
        transformOrigin: 'left',
      })
        .set(logoOverlayRef.current, { opacity: 1 }, '-=0.2')
        .to(logoOverlayRef.current, {
          opacity: 0,
          duration: 0.3,
          delay: 0.6,
          ease: 'power2.out',
        });
    },
    [router]
  );

  const handleRouteChange = useCallback(
    (url: string) => {
      if (isTransitioning.current) return;
      isTransitioning.current = true;
      coverPage(url);
    },
    [coverPage]
  );

  const onAnchorClick = useCallback(
    (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      if (isTransitioning.current) {
        e.preventDefault();
        return;
      }
      const target = e.currentTarget as HTMLAnchorElement;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || target.target === '_blank') return;

      const href = target.getAttribute('href') || '';
      if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href === '#' || href.includes('#')) return;

      e.preventDefault();
      // target.href is the fully resolved URL which includes basePath on GitHub Pages.
      // router.push() auto-adds basePath, so we must strip it to avoid double-prefixing.
      let url = new URL(target.href).pathname;
      if (BASE_PATH && url.startsWith(BASE_PATH)) {
        url = url.slice(BASE_PATH.length) || '/';
      }
      if (url !== pathname) handleRouteChange(url);
    },
    [pathname, handleRouteChange, prefersReducedMotion]
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!overlayRef.current) return;

    overlayRef.current.innerHTML = '';
    blocksRef.current = [];

    for (let i = 0; i < NUM_BLOCKS; i++) {
      const block = document.createElement('div');
      block.className = 'transition-block';
      overlayRef.current.appendChild(block);
      blocksRef.current.push(block);
    }

    gsap.set(blocksRef.current, { scaleX: 0, transformOrigin: 'left' });
    revealPage();

    const links = document.querySelectorAll('a[href^="/"], a[href^="./"]');
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('http') || href === '#' || href.startsWith('mailto') || href.startsWith('tel')) return;
      link.addEventListener('click', onAnchorClick as EventListener);
    });

    return () => {
      links.forEach((link) => link.removeEventListener('click', onAnchorClick as EventListener));
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, [pathname, onAnchorClick, revealPage, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <>
      <div ref={overlayRef} className="transition-overlay" />
      <div ref={logoOverlayRef} className="logo-overlay">
        <div className="logo-overlay-container">
          <div className="relative w-[180px] h-[180px] rounded-full overflow-hidden mb-6 border-2 border-gold/30">
            <img
              src={assetPath('/logo ac.png')}
              alt="Atrey Chambers"
              className="w-full h-full object-contain p-4"
            />
          </div>
          <span className="text-3xl font-bold text-cream tracking-wider font-display">
            ATREY CHAMBERS
          </span>
          <span className="text-sm text-gold uppercase tracking-[0.3em] mt-2">
            of Law LLP
          </span>
        </div>
      </div>
      {children}
    </>
  );
};
