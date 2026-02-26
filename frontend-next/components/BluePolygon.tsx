'use client';

import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export const BluePolygon = () => {
  const prefersReducedMotion = useReducedMotion();
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 15 });
  const parallaxX = useTransform(springX, [-1, 1], [-20, 20]);
  const parallaxY = useTransform(springY, [-1, 1], [-20, 20]);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDesktop, prefersReducedMotion, mouseX, mouseY]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    // Entrance completes at ~2.7s, settle bounce at 2.9-3.4s, then idle
    const timer = setTimeout(() => setEntranceComplete(true), 3400);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        className="pointer-events-none absolute inset-y-[-20%] right-[-30%] w-[70%] origin-top-right bg-deepGreen md:right-[-20%] md:w-[55%]"
        style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0 80%)', backgroundColor: '#0E3B2F' }}
        aria-hidden="true"
      />
    );
  }

  const baseStyle = {
    clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0 80%)',
    willChange: 'transform'
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { x: '0%', rotate: -18, opacity: 1, scale: 1 } : { x: '60%', rotate: 0, opacity: 0, scale: 0.98 }}
      animate={
        prefersReducedMotion
          ? {}
          : entranceComplete
            ? {
                rotate: [-18, -18.5, -18, -17.5, -18],
                scale: [1, 1.001, 1, 0.999, 1]
              }
            : {
                x: ['60%', '0%', '-2%', '0%'],
                rotate: [0, -18, -18.5, -18],
                scale: [0.98, 1.02, 0.995, 1],
                opacity: [0, 1, 1, 1]
              }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : entranceComplete
            ? {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            : {
                delay: 1.8,
                duration: 1.1,
                ease: [0.19, 1, 0.22, 1],
                times: [0, 0.7, 0.85, 1],
                onComplete: () => setEntranceComplete(true)
              }
      }
      className="pointer-events-none absolute inset-y-[-20%] right-[-30%] w-[70%] origin-top-right bg-deepGreen shadow-[0_20px_60px_rgba(14,59,47,0.4)] md:right-[-20%] md:w-[55%]"
      style={{
        ...baseStyle,
        backgroundColor: '#0E3B2F',
        ...(!prefersReducedMotion && isDesktop && entranceComplete
          ? { x: parallaxX, y: parallaxY }
          : {})
      }}
      aria-hidden="true"
      role="presentation"
    />
  );
};


