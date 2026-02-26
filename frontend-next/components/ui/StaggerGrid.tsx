'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerGrid = ({ children, className, staggerDelay = 0.06 }: StaggerGridProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('grid', className)}
      variants={
        prefersReducedMotion
          ? {}
          : {
              hidden: {},
              visible: {
                transition: { staggerChildren: staggerDelay },
              },
            }
      }
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        prefersReducedMotion
          ? {}
          : {
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: [0.2, 0.9, 0.3, 1] },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
};
