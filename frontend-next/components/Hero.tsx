'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CTAButton } from '@/components/CTAButton';
import { heroLineVariant } from '@/lib/animations';

const credentials = [
  'Advocate-on-Record, Supreme Court',
  '29+ Years of Practice',
  '500+ Cases Argued',
  "3 Books Authored",
  "'A' Panel Counsel, Govt. of India",
];

const taglines = [
  'Where Legal Excellence Meets Justice',
  'Defending Rights, Delivering Results',
  'Your Trusted Legal Partners Since 1997',
  'Supreme Court Advocates of Distinction',
];

export const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <main id="main-content" className="hero">
      <Header />

      <div className="hero__bg">
        <picture>
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Supreme Court of India — professional legal services"
          />
        </picture>
      </div>

      {/* Floating particles overlay */}
      <div className="absolute inset-0 z-[6] overflow-hidden pointer-events-none" aria-hidden="true">
        {!prefersReducedMotion && Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gold/20"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              animationName: 'float-up',
              animationDuration: `${8 + Math.random() * 12}s`,
              animationDelay: `${Math.random() * 10}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          />
        ))}
      </div>

      <div className="hero__cnt">
        <div className="hero__logo-wrapper">
          <img
            src="/ChatGPT Image Dec 24, 2025, 09_56_01 PM.png"
            alt="Atrey Chambers Logo"
            className="hero__logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        <motion.h1
          custom={1.5}
          variants={prefersReducedMotion ? {} : heroLineVariant}
          initial="hidden"
          animate="visible"
          className="font-display"
        >
          Atrey Chambers
        </motion.h1>

        {/* Animated rotating tagline */}
        <div className="mt-2 h-8 md:h-10 overflow-hidden relative" style={{ textTransform: 'none' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={taglineIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.2, 0.9, 0.3, 1] }}
              className="text-cream/80 text-base md:text-lg font-accent italic tracking-wide absolute inset-x-0"
              style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.25rem)' }}
            >
              of Law LLP — {taglines[taglineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div
          custom={2.2}
          variants={prefersReducedMotion ? {} : heroLineVariant}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-wrap gap-3 justify-center"
        >
          <CTAButton
            type="button"
            aria-label="Schedule a Consultation"
            className="!border-gold !text-white hover:!bg-gold hover:!text-white !bg-gold/20 !backdrop-blur-sm"
            onClick={() => { window.location.href = '/schedule'; }}
          >
            Schedule a Consultation
          </CTAButton>
          <a
            href="/our-firm"
            className="inline-flex items-center rounded border border-white/40 bg-white/10 px-6 py-2.5 text-xs uppercase tracking-widest text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            About Our Firm
          </a>
        </motion.div>

        {/* Credential ticker with gold separators */}
        <motion.div
          custom={2.8}
          variants={prefersReducedMotion ? {} : heroLineVariant}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4"
          style={{ textTransform: 'none' }}
        >
          {credentials.map((cred, i) => (
            <span key={cred} className="flex items-center gap-5 text-cream text-sm md:text-base tracking-wide font-medium" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
              <span>{cred}</span>
              {i < credentials.length - 1 && (
                <span className="hidden md:inline h-1.5 w-1.5 rounded-full bg-gold" />
              )}
            </span>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-indicator"
          style={{ textTransform: 'none' }}
        >
          <span className="text-cream/40 text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-cream/30 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-2 rounded-full bg-gold/60"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </main>
  );
};
