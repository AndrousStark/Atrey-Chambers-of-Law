'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { dotVariant, smallPulse } from '@/lib/animations';

export const DecorativeDots = () => {
  const prefersReducedMotion = useReducedMotion();
  const [entranceComplete, setEntranceComplete] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    // All dots should be visible by 1.16s + 0.16s = 1.32s, then start idle pulse
    const timer = setTimeout(() => setEntranceComplete(true), 1400);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <div className="pointer-events-none absolute left-[8%] top-1/2 -translate-y-1/2 space-y-3 md:left-[12%]" role="presentation" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={prefersReducedMotion ? {} : dotVariant}
          custom={i}
          initial="hidden"
          animate={
            prefersReducedMotion
              ? 'visible'
              : entranceComplete
                ? {
                    scale: [1, 1.03, 1],
                    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                  }
                : 'visible'
          }
          className="h-1 w-1 rounded-full bg-charcoal"
          style={{ willChange: 'transform' }}
          aria-hidden="true"
          role="presentation"
        />
      ))}
    </div>
  );
};


