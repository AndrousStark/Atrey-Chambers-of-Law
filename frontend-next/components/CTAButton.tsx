'use client';

import { motion, MotionProps, useReducedMotion } from 'framer-motion';
import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & MotionProps;

export const CTAButton = ({ children, className = '', ...rest }: Props) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.button
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
      whileFocus={{ y: -1 }}
      className={`rounded border border-charcoal px-6 py-3 text-[0.75rem] uppercase tracking-[0.25em] text-charcoal hover:bg-deepGreen hover:text-cream hover:border-deepGreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors ${className}`}
      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
      {...rest}
    >
      {children}
    </motion.button>
  );
};


