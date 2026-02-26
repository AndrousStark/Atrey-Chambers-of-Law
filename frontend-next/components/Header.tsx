'use client';

import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { headerContainerVariant, headerItemVariant, logoVariant } from '@/lib/animations';
import { assetPath } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

const navItems: NavItem[] = [
  { label: 'Our Firm', href: assetPath('/our-firm') },
  {
    label: 'Practice Areas',
    href: assetPath('/practice-area'),
    children: [
      { label: 'Constitutional Law & PIL', href: assetPath('/practice-area/constitutional-law-pil'), description: 'Fundamental rights & public interest' },
      { label: 'Supreme Court Litigation', href: assetPath('/practice-area/supreme-court-litigation'), description: 'AOR — direct filing & appeals' },
      { label: 'Environmental Law & NGT', href: assetPath('/practice-area/environmental-law-ngt'), description: 'NGT & environmental compliance' },
      { label: 'Government Litigation', href: assetPath('/practice-area/government-litigation'), description: 'Union & State representation' },
      { label: 'Criminal Law & Defense', href: assetPath('/practice-area/criminal-law'), description: 'Defense & criminal appeals' },
      { label: 'Arbitration & ADR', href: assetPath('/practice-area/arbitration-adr'), description: 'Domestic & international arbitration' },
      { label: 'Corporate & Commercial', href: assetPath('/practice-area/corporate-commercial-law'), description: 'Governance, NCLT & transactions' },
      { label: 'Family Law', href: assetPath('/practice-area/family-law'), description: 'Divorce, custody & succession' },
      { label: 'View All 32 Practice Areas →', href: assetPath('/practice-area') },
    ],
  },
  {
    label: 'Our Team',
    href: assetPath('/our-team'),
    children: [
      { label: 'Dr. Abhishek Atrey', href: assetPath('/our-team/abhishek-atrey'), description: 'Founder & Managing Partner' },
      { label: 'Mrs. Ambika Atrey', href: assetPath('/our-team/ambika-atrey'), description: 'Partner' },
      { label: 'Aniruddh Atrey', href: assetPath('/our-team/aniruddh-atrey'), description: 'Director of Technology' },
      { label: 'View Full Team →', href: assetPath('/our-team') },
    ],
  },
  {
    label: 'Publications',
    href: assetPath('/publications'),
    children: [
      { label: 'Books', href: assetPath('/publications') + '#books', description: '3 authored books' },
      { label: 'Articles', href: assetPath('/publications') + '#articles', description: '20+ legal articles' },
      { label: 'TV Appearances', href: assetPath('/publications') + '#media', description: '30+ national TV shows' },
      { label: 'Blog', href: assetPath('/our-blog'), description: 'Legal insights & updates' },
    ],
  },
  { label: 'Media', href: assetPath('/publications') + '#media' },
  { label: 'Careers', href: assetPath('/careers') },
  { label: 'Contact', href: assetPath('/contact') },
];

export const Header = () => {
  const prefersReducedMotion = useReducedMotion();
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 25 });
  const navParallaxX = useTransform(springX, [-1, 1], [-3, 3]);
  const navParallaxY = useTransform(springY, [-1, 1], [-3, 3]);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>();

  const headerOpacity = useTransform(scrollY, [0, 100], [0, 0.98]);
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 12]);
  const background = useTransform(
    headerOpacity,
    (opacity) => {
      const bottomOpacity = Math.min(opacity + 0.02, 1);
      return `linear-gradient(to bottom, rgba(242, 235, 221, ${opacity}), rgba(242, 235, 221, ${bottomOpacity}))`;
    }
  );
  const backdropFilter = useTransform(backdropBlur, (blur) => `blur(${blur}px)`);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop || prefersReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDesktop, prefersReducedMotion, mouseX, mouseY]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setTimeout(() => setEntranceComplete(true), 5000);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <>
      {/* Top bar — visible on desktop only */}
      <div className="hidden md:block fixed inset-x-0 top-0 z-[10000] bg-deepGreen text-cream/80 text-[0.65rem] tracking-wider uppercase">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-10 py-1.5">
          <div className="flex items-center gap-6">
            <a href="tel:+911122053080" className="hover:text-cream transition-colors flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +91-11-22053080
            </a>
            <a href="mailto:support@atreychambers.com" className="hover:text-cream transition-colors flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              support@atreychambers.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-cream/50">Delhi</span>
            <span className="text-cream/30">|</span>
            <span className="text-cream/50">Supreme Court</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <motion.header
        variants={prefersReducedMotion ? {} : headerContainerVariant}
        initial={prefersReducedMotion ? {} : 'hidden'}
        animate={prefersReducedMotion ? {} : 'visible'}
        style={{
          ...(!prefersReducedMotion && isDesktop && entranceComplete
            ? { x: navParallaxX, y: navParallaxY }
            : {}),
          background,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
        }}
        className="fixed inset-x-0 top-0 md:top-[28px] z-[9999] flex items-center justify-between px-4 py-4 text-xs tracking-[0.2em] uppercase md:px-10 isolate"
        role="banner"
      >
        <motion.a
          href={assetPath("/")}
          variants={prefersReducedMotion ? {} : logoVariant}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2.5 md:gap-3 md:mr-8"
        >
          <img
            src={assetPath("/logo ac.png")}
            alt="Atrey Chambers Logo"
            className="h-7 w-7 md:h-9 md:w-9 object-contain flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="font-display font-semibold text-sm md:text-base tracking-wider" aria-label="Atrey Chambers">
            Atrey Chambers
          </span>
        </motion.a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex" role="navigation" aria-label="Main navigation">
          {navItems.map((item, index) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
              onMouseLeave={() => item.children && handleDropdownLeave()}
            >
              <motion.a
                href={item.href}
                custom={index + 1}
                variants={prefersReducedMotion ? {} : headerItemVariant}
                initial={prefersReducedMotion ? {} : 'hidden'}
                animate={prefersReducedMotion ? {} : 'visible'}
                whileHover={{ opacity: 1, y: -2 }}
                className="relative text-[0.65rem] text-charcoal font-sans font-semibold tracking-nav focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen/60 focus-visible:ring-offset-2 after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-deepGreen after:transition-transform after:duration-200 hover:after:scale-x-100 flex items-center gap-1"
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
                {item.children && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50"><path d="M6 9l6 6 6-6"/></svg>
                )}
              </motion.a>

              {/* Mega-menu dropdown */}
              <AnimatePresence>
                {item.children && openDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-3 min-w-[280px] rounded-lg bg-cream/98 backdrop-blur-xl border border-charcoal/10 shadow-xl py-2 z-50"
                    style={{ textTransform: 'none', letterSpacing: 'normal' }}
                    onMouseEnter={() => handleDropdownEnter(item.label)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="flex flex-col px-5 py-2.5 hover:bg-deepGreen/5 transition-colors"
                      >
                        <span className="text-sm font-semibold text-charcoal">{child.label}</span>
                        {child.description && (
                          <span className="text-xs text-charcoal/50 mt-0.5">{child.description}</span>
                        )}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <motion.a
            href={assetPath("/schedule")}
            custom={navItems.length + 1}
            variants={prefersReducedMotion ? {} : headerItemVariant}
            initial={prefersReducedMotion ? {} : 'hidden'}
            animate={prefersReducedMotion ? {} : 'visible'}
            whileHover={{ y: -2 }}
            className="rounded border border-deepGreen bg-deepGreen px-5 py-2 text-[0.65rem] text-cream hover:bg-deepGreenLight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen/60"
          >
            Schedule Call
          </motion.a>
        </nav>

        {/* Mobile Hamburger */}
        <motion.button
          custom={navItems.length + 1}
          variants={headerItemVariant}
          initial="hidden"
          animate="visible"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center justify-center gap-1.5 md:hidden w-11 h-11 rounded-md"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <motion.span className="h-0.5 w-6 bg-charcoal block" animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
          <motion.span className="h-0.5 w-6 bg-charcoal block" animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.2 }} />
          <motion.span className="h-0.5 w-6 bg-charcoal block" animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
        </motion.button>

        {/* Mobile Menu — Full-screen drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-cream/98 backdrop-blur-md md:hidden overflow-y-auto"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-6 pt-24 pb-12 px-8"
                onClick={(e) => e.stopPropagation()}
              >
                {navItems.map((item, index) => (
                  <div key={item.label} className="w-full text-center">
                    <motion.a
                      href={item.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-display text-charcoal hover:text-deepGreen transition-colors block py-2"
                    >
                      {item.label}
                    </motion.a>
                    {item.children && (
                      <div className="mt-1 space-y-1">
                        {item.children.map((child) => (
                          <a
                            key={child.label}
                            href={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-sm text-charcoal/60 hover:text-deepGreen py-1 transition-colors"
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <motion.a
                  href={assetPath("/schedule")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.06 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-4 rounded bg-deepGreen px-8 py-3 text-base text-cream font-semibold hover:bg-deepGreenLight transition-colors"
                >
                  Schedule Call
                </motion.a>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};
