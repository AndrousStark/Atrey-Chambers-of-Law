'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';

interface SectionHeadingProps {
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export const SectionHeading = ({
  title,
  highlight,
  subtitle,
  align = 'center',
  light = false,
}: SectionHeadingProps) => {
  const prefersReducedMotion = useReducedMotion();
  const textAlign = align === 'center' ? 'text-center' : 'text-left';
  const titleColor = light ? 'text-cream' : 'text-charcoal';
  const highlightColor = light ? 'text-goldLight' : 'text-deepGreen';
  const subtitleColor = light ? 'text-cream/60' : 'text-charcoal/60';
  const lineMargin = align === 'center' ? 'mx-auto' : '';

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`mb-14 ${textAlign}`}
    >
      <p className={`text-xs uppercase tracking-[0.3em] ${light ? 'text-gold/60' : 'text-gold/70'} mb-3 font-semibold`}>
        {title}
      </p>
      <h2 className={`mb-4 font-display font-bold text-3xl md:text-4xl ${titleColor}`}>
        {highlight && <span className={highlightColor}>{highlight}</span>}
      </h2>
      <div className={`flex items-center gap-2 ${lineMargin} w-fit mb-5`}>
        <div className="h-px w-8 bg-gold/40" />
        <div className="h-1.5 w-1.5 rotate-45 bg-gold/60" />
        <div className="h-px w-8 bg-gold/40" />
      </div>
      {subtitle && (
        <p className={`mx-auto max-w-2xl text-base ${subtitleColor} font-accent italic leading-relaxed`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
