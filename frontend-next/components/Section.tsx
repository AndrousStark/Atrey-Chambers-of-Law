'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { sectionReveal } from '@/lib/animations';

type SectionProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

export const Section = ({ id, children, className = '' }: SectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      ref={ref}
      id={id}
      variants={prefersReducedMotion ? {} : sectionReveal}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={`py-10 md:py-14 ${className}`}
    >
      {children}
    </motion.section>
  );
};
