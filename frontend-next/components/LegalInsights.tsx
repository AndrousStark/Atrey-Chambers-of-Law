'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations';

const insights = [
  {
    id: 1,
    title: 'More Than a Lawyer',
    excerpt: 'Your strategic partner in navigating complex legal landscapes',
    description: 'Modern legal counsel extends far beyond courtroom representation. We serve as your strategic advisors, risk managers, and trusted partners, helping you navigate complex business and personal legal matters with confidence and clarity.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Taking Control When It Matters Most',
    excerpt: 'Empowering you to make informed decisions in challenging times',
    description: 'When facing unavoidable legal challenges, knowledge is power. We empower you with clear insights, strategic options, and the confidence to make informed decisions that protect your interests and secure your future.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Understanding Your Legal Alternatives',
    excerpt: 'Exploring all pathways to achieve your desired outcomes',
    description: 'Every legal challenge has multiple solutions. We explore alternative dispute resolution methods, negotiation strategies, and innovative legal pathways to find the most effective route to your success.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  }
];

export const LegalInsights = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-10">
      <motion.h2
        className="mb-3 text-4xl font-semibold text-charcoal md:text-5xl font-display text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        You Should Know About <span className="text-deepGreen">Law</span>
      </motion.h2>
      <motion.p
        className="text-center text-charcoal/60 mb-12 max-w-xl mx-auto font-accent italic"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Empowering you with knowledge to navigate the legal landscape
      </motion.p>

      <motion.div
        variants={prefersReducedMotion ? {} : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-8 md:grid-cols-3"
      >
        {insights.map((insight) => (
          <motion.article
            key={insight.id}
            variants={prefersReducedMotion ? {} : fadeUp}
            className="group cursor-pointer rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm transition-all duration-300 hover:border-deepGreen/30 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-deepGreen/5 text-deepGreen group-hover:bg-gold/10 group-hover:text-gold transition-all duration-300">
              {insight.icon}
            </div>
            <h3 className="mb-3 text-xl font-display font-semibold text-charcoal group-hover:text-deepGreen transition-colors">
              {insight.title}
            </h3>
            <p className="mb-4 text-sm text-goldDark font-accent italic">{insight.excerpt}</p>
            <p className="mb-4 text-sm text-charcoal/70 leading-relaxed">{insight.description}</p>
            <span className="text-sm font-semibold text-deepGreen group-hover:text-gold transition-colors inline-flex items-center gap-1">
              Learn More
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
};
