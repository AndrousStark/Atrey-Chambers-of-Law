'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';
import { NumberTicker } from '@/components/ui/NumberTicker';

const stats = [
  { value: 29, suffix: '+', label: 'Years of Practice', icon: '⚖' },
  { value: 500, suffix: '+', label: 'Cases Argued', icon: '📋' },
  { value: 3, suffix: '', label: 'Books Authored', icon: '📚' },
  { value: 20, suffix: '+', label: 'Articles Published', icon: '✍' },
  { value: 30, suffix: '+', label: 'TV Appearances', icon: '📺' },
  { value: 40, suffix: '+', label: 'Clients Served', icon: '🤝' },
];

export const StatsSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative bg-deepGreen py-14 md:py-20 overflow-hidden section-grain">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-deepGreenLight/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-10">
        <motion.p
          className="text-center text-cream/40 text-xs uppercase tracking-[0.3em] mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          By the Numbers
        </motion.p>

        <motion.div
          variants={prefersReducedMotion ? {} : fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="mb-3 text-4xl md:text-5xl font-display font-bold text-gold group-hover:scale-110 transition-transform duration-300">
                <NumberTicker value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="h-px w-8 mx-auto bg-gold/30 mb-3" />
              <p className="text-sm text-cream/60 uppercase tracking-wider leading-tight">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
