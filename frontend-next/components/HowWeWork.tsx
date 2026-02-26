'use client';

import { motion, useReducedMotion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Consultation',
    description: 'Initial meeting to understand your legal matter, objectives, and timeline. We assess the merits and chart a path forward.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Assessment',
    description: 'Thorough legal research, document review, and analysis of applicable laws, precedents, and available remedies.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Strategy',
    description: 'Developing a tailored legal strategy with clear milestones, risk assessment, and alternative scenarios for your case.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Execution',
    description: 'Aggressive advocacy — filing cases, arguing before courts and tribunals, negotiating settlements, and protecting your interests.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Resolution',
    description: 'Achieving the best possible outcome — favorable judgment, settlement, or regulatory compliance — and advising on next steps.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export const HowWeWork = () => {
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
        How We <span className="text-gold">Work</span>
      </motion.h2>
      <motion.p
        className="text-center text-charcoal/60 mb-12 max-w-2xl mx-auto font-accent italic text-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        A structured, client-centric approach to every legal matter
      </motion.p>

      {/* Desktop: Horizontal cards */}
      <div className="hidden md:grid grid-cols-5 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative group"
          >
            <div className="rounded-xl border border-charcoal/10 bg-white p-5 hover:border-gold/30 hover:shadow-lg transition-all h-full">
              <span className="text-4xl font-display font-bold text-gold/20 block mb-3">{step.number}</span>
              <div className="text-deepGreen/60 mb-3 group-hover:text-gold transition-colors">{step.icon}</div>
              <h3 className="text-sm font-display font-semibold text-deepGreen mb-2">{step.title}</h3>
              <p className="text-xs text-charcoal/60 leading-relaxed">{step.description}</p>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className="absolute top-1/2 -right-2 w-4 h-px bg-gold/30 hidden lg:block" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Mobile: Vertical timeline */}
      <div className="md:hidden space-y-0">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {/* Timeline line */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-deepGreen flex items-center justify-center text-cream text-xs font-bold">
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-gold/20 mt-2" />
              )}
            </div>
            {/* Content */}
            <div className="pb-4">
              <h3 className="text-base font-display font-semibold text-deepGreen mb-1">{step.title}</h3>
              <p className="text-sm text-charcoal/60 leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
