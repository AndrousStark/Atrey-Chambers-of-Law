'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { scrollHint } from '@/lib/animations';

export const ScrollHint = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : scrollHint}
      animate="animate"
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      aria-hidden="true"
    >
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-charcoal/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          delay: 4.0,
          duration: 2,
          repeat: Infinity,
          repeatDelay: 2
        }}
      >
        <path
          d="M7 10L12 15L17 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
};

