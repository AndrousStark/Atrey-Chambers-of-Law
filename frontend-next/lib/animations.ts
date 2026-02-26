import { Variants } from 'framer-motion';

// Fade up reveal (used for sections)
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.9, 0.3, 1] } }
};

// Stagger container for children
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 }
  }
};

// Header + nav entrance (0.5s – 0.8s)
export const headerContainerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.2, 0.9, 0.3, 1]
    }
  }
};

export const headerItemVariant: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: (index: number = 0) => ({
    opacity: index === 0 ? 1 : 0.85,
    y: 0,
    transition: {
      delay: 0.5 + index * 0.06,
      duration: 0.4,
      ease: [0.2, 0.9, 0.3, 1]
    }
  })
};

// Logo entrance (0.05s delay, 0.3s duration)
export const logoVariant: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05,
      duration: 0.3,
      ease: [0.2, 0.9, 0.3, 1]
    }
  }
};

// Decorative dots entrance (0.8s, 0.98s, 1.16s)
export const dotVariant: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (index: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.8 + index * 0.18,
      duration: 0.16,
      ease: [0.2, 0.9, 0.3, 1]
    }
  })
};

// Dot idle pulse
export const smallPulse: Variants = {
  animate: {
    scale: [1, 1.03, 1],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
  }
};

// Blue polygon entrance (1.8s – 3.4s)
export const polygonEntrance: Variants = {
  offscreen: { x: '60%', rotate: 0, opacity: 0 },
  onscreen: {
    x: '0%',
    rotate: -18,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 75,
      damping: 12,
      duration: 0.9,
      delay: 1.8
    }
  }
};

// Polygon micro-bounce on settle
export const polygonSettle: Variants = {
  animate: {
    scale: [1, 1.02, 0.995, 1],
    transition: {
      duration: 0.5,
      ease: [0.2, 0.9, 0.3, 1],
      times: [0, 0.5, 0.75, 1]
    }
  }
};

// Hero text lines entrance
export const heroLineVariant: Variants = {
  hidden: (offset: number = 30) => ({ opacity: 0, y: offset }),
  visible: (delay: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: [0.19, 1, 0.22, 1]
    }
  })
};

// Scroll hint nudge (4.0s)
export const scrollHint: Variants = {
  animate: {
    y: [0, 6, 0],
    transition: {
      delay: 4.0,
      duration: 0.6,
      ease: [0.2, 0.9, 0.3, 1]
    }
  }
};

// Section reveal (News, Services, Testimonials)
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.2, 0.9, 0.3, 1]
    }
  }
};

// Card hover
export const cardHover: Variants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -6,
    scale: 1.01,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

// Service card pulse (9.4s)
export const servicePulse: Variants = {
  animate: {
    scale: [1, 1.04, 1],
    transition: {
      delay: 9.4,
      duration: 0.4,
      ease: [0.2, 0.9, 0.3, 1]
    }
  }
};

// Testimonial carousel fade
export const testimonialFade: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.2, 0.9, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.3 }
  }
};

// --- New Animations (Phase 7) ---

// Text reveal (character by character)
export const textReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const charReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.2, 0.9, 0.3, 1] },
  },
};

// Slide in from sides
export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.2, 0.9, 0.3, 1] },
  },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.2, 0.9, 0.3, 1] },
  },
};

// Scale in
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.2, 0.9, 0.3, 1] },
  },
};

// Stagger grid for card grids
export const staggerGrid: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

// Parallax float (subtle idle animation)
export const parallaxFloat: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.2, 0.9, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25 },
  },
};

// Tab switch animation
export const tabSwitch: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15 },
  },
};
