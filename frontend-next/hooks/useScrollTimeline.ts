'use client';

import { useEffect, useState } from 'react';

export const useScrollTimeline = (enabled: boolean = false) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const startTime = Date.now();
    const duration = 15000; // 15 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const time = (elapsed % duration) / 1000; // Convert to seconds
      setCurrentTime(time);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [enabled]);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const timers = [
      setTimeout(() => scrollToId('news'), 4600),
      setTimeout(() => scrollToId('services'), 7600),
      setTimeout(() => scrollToId('testimonials'), 10800),
      setTimeout(() => scrollToId('contact'), 13600),
    ];

    return () => timers.forEach(clearTimeout);
  }, [enabled]);

  return { currentTime, scrollToId };
};

