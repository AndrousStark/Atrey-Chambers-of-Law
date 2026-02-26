'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { SectionHeading } from '@/components/ui/SectionHeading';

const cases = [
  {
    title: 'Constitutional Law & PIL',
    court: 'Supreme Court of India',
    description: 'Successfully argued multiple Public Interest Litigations before the Supreme Court, shaping jurisprudence on fundamental rights and directive principles.',
    category: 'Constitutional',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Environmental Protection',
    court: 'National Green Tribunal',
    description: 'Represented the Ministry of Environment, Forest & Climate Change in landmark environmental cases, establishing key precedents for ecological protection.',
    category: 'Environment',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 22c-4.97 0-9-2.24-9-5v-3c0 2.76 4.03 5 9 5s9-2.24 9-5v3c0 2.76-4.03 5-9 5z" />
        <path d="M12 17c-4.97 0-9-2.24-9-5V9c0 2.76 4.03 5 9 5s9-2.24 9-5v3c0 2.76-4.03 5-9 5z" />
        <ellipse cx="12" cy="7" rx="9" ry="5" />
      </svg>
    ),
  },
  {
    title: 'Government Litigation',
    court: 'Supreme Court & High Courts',
    description: 'As \'A\' Panel Counsel for the Government of India, handled critical cases involving Union of India, defending government policies and constitutional provisions.',
    category: 'Government',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" />
      </svg>
    ),
  },
  {
    title: 'Temple Rights & Religious Law',
    court: 'Supreme Court of India',
    description: 'Represented parties in significant temple administration and religious endowment cases, contributing to the evolving jurisprudence on Article 25 & 26.',
    category: 'Religious',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
      </svg>
    ),
  },
  {
    title: 'Air Quality Regulation',
    court: 'Delhi HC & NGT',
    description: 'As Sr. Panel Counsel for the Commission for Air Quality Management (CAQM), argued critical cases for air pollution control in the NCR region.',
    category: 'Regulatory',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
      </svg>
    ),
  },
  {
    title: 'University & Education Law',
    court: 'Supreme Court & Delhi HC',
    description: 'Panel Counsel for the Association of Indian Universities (AIU), handling matters of university governance, accreditation, and academic freedom.',
    category: 'Education',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
];

export const LandmarkCases = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-10">
      <SectionHeading
        title="Landmark"
        highlight="Matters"
        subtitle="Areas where Atrey Chambers has made significant legal contributions"
      />

      <motion.div
        variants={prefersReducedMotion ? {} : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {cases.map((item, index) => (
          <motion.div
            key={item.title}
            variants={prefersReducedMotion ? {} : fadeUp}
            className="group relative rounded-xl border border-charcoal/10 bg-white p-6 transition-all duration-300 hover:border-gold/30 hover:shadow-lg shimmer-border"
          >
            {/* Category badge */}
            <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider text-charcoal/40 font-semibold">
              {item.category}
            </span>

            {/* Icon */}
            <div className="mb-4 text-deepGreen/70 group-hover:text-gold transition-colors duration-300">
              {item.icon}
            </div>

            <h3 className="mb-1 text-lg font-display font-semibold text-deepGreen group-hover:text-deepGreen/80 transition-colors">
              {item.title}
            </h3>
            <p className="mb-3 text-xs text-gold font-medium">{item.court}</p>
            <p className="text-sm text-charcoal/70 leading-relaxed">{item.description}</p>

            {/* Bottom gold accent line */}
            <div className="mt-4 h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent w-0 group-hover:w-full transition-all duration-500" />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={prefersReducedMotion ? {} : fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-10 text-center"
      >
        <a
          href="/practice-area"
          className="inline-flex items-center gap-2 text-sm font-semibold text-deepGreen hover:text-gold transition-colors animated-underline"
        >
          Explore All Practice Areas
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </motion.div>
    </div>
  );
};
