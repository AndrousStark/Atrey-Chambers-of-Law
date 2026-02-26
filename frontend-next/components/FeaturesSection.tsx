'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations';

const features = [
  {
    id: 1,
    title: 'Supreme Court Expertise',
    description: 'As an Advocate-on-Record since 2006, we file cases directly in the Supreme Court of India — cutting through layers of intermediaries for faster resolution.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" />
      </svg>
    ),
    stat: '500+',
    statLabel: 'Cases',
  },
  {
    id: 2,
    title: 'Government Panel Counsel',
    description: "Entrusted by the Government of India as 'A' Panel Counsel at the Supreme Court — the highest category of government legal representation.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
      </svg>
    ),
    stat: 'A',
    statLabel: 'Panel',
  },
  {
    id: 3,
    title: 'Published Legal Scholar',
    description: '3 books, 20+ articles in India Legal and national publications, and 30+ television appearances on Sansad TV, Rajya Sabha TV, and APN News.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8M8 11h6" />
      </svg>
    ),
    stat: '3',
    statLabel: 'Books',
  },
  {
    id: 4,
    title: 'Multi-Forum Litigation',
    description: 'We handle cases across the Supreme Court, High Courts, National Green Tribunal, District Courts, and specialized tribunals — a truly full-spectrum practice.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    stat: '29+',
    statLabel: 'Years',
  },
];

export const FeaturesSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-10">
      <motion.h2
        className="mb-3 text-3xl md:text-4xl font-semibold text-deepGreen font-display text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Why Choose <span className="text-gold">Atrey Chambers</span>
      </motion.h2>
      <motion.p
        className="text-center text-charcoal/60 mb-12 max-w-2xl mx-auto font-accent italic text-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Decades of legal excellence backed by real results
      </motion.p>

      <motion.div
        variants={prefersReducedMotion ? {} : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            variants={prefersReducedMotion ? {} : fadeUp}
            className="group relative rounded-xl border border-deepGreen/10 bg-white p-6 transition-all duration-300 hover:border-gold/30 hover:shadow-xl overflow-hidden"
          >
            {/* Background stat watermark */}
            <span className="absolute -right-2 -top-2 text-7xl font-display font-bold text-deepGreen/[0.04] select-none pointer-events-none">
              {feature.stat}
            </span>

            <div className="mb-5 text-deepGreen/60 group-hover:text-gold transition-colors duration-300">
              {feature.icon}
            </div>

            <h3 className="mb-3 text-lg font-display font-semibold text-deepGreen group-hover:text-deepGreen/80 transition-colors">
              {feature.title}
            </h3>
            <p className="mb-4 text-sm text-charcoal/70 leading-relaxed">{feature.description}</p>

            {/* Stat badge */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold text-gold">{feature.stat}</span>
              <span className="text-xs text-charcoal/50 uppercase tracking-wider">{feature.statLabel}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
