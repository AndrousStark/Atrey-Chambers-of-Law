'use client';

import { motion, useReducedMotion, useAnimationControls } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
}

const TestimonialCard = ({ testimonial, prefix }: { testimonial: Testimonial; prefix: string }) => (
  <div
    className="flex-shrink-0 w-44 h-44 md:w-52 md:h-52 rounded-md border border-cream/10 bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden flex flex-col"
  >
    <div className="h-20 w-full overflow-hidden">
      {testimonial.image ? (
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-deepGreen/30 to-deepGreen/10 flex items-center justify-center">
          <span className="text-cream/50 text-2xl font-bold">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
      )}
    </div>
    <div className="flex-1 flex flex-col justify-between px-3 py-2 text-cream">
      <blockquote className="text-[0.68rem] md:text-xs text-cream/90 leading-relaxed line-clamp-3">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>
      <div className="mt-2 pt-2 border-t border-cream/15">
        <p className="font-semibold text-[0.7rem] md:text-xs text-cream">
          {testimonial.name}
        </p>
        <p className="text-[0.6rem] md:text-[0.7rem] text-cream/70">
          {testimonial.role}
        </p>
      </div>
    </div>
  </div>
);

export const TestimonialsCarousel = () => {
  const prefersReducedMotion = useReducedMotion();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const topControls = useAnimationControls();
  const bottomControls = useAnimationControls();

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`/api/testimonials/published?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        setTestimonials(data || []);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

    // Fallback testimonials when API returns empty
  const FALLBACK_TESTIMONIALS: Testimonial[] = [
    {
      id: 'fallback-1',
      name: 'Corporate Client',
      role: 'Managing Director, Delhi NCR',
      content: 'Atrey Chambers provided exceptional representation in our Supreme Court matter. Their deep knowledge of constitutional law and strategic approach led to a favorable outcome.',
      image: '',
    },
    {
      id: 'fallback-2',
      name: 'Government Authority',
      role: 'Senior Official',
      content: 'Dr. Atrey\'s expertise in government litigation and environmental law is unparalleled. His team handled our complex NGT matter with remarkable professionalism.',
      image: '',
    },
    {
      id: 'fallback-3',
      name: 'Real Estate Developer',
      role: 'CEO, Property Firm',
      content: 'Outstanding legal counsel on our RERA compliance and property dispute matters. The firm\'s attention to detail and courtroom skills are truly impressive.',
      image: '',
    },
    {
      id: 'fallback-4',
      name: 'International Client',
      role: 'Business Executive',
      content: 'Atrey Chambers navigated our cross-border commercial arbitration with expertise and efficiency. Highly recommend their services for complex disputes.',
      image: '',
    },
    {
      id: 'fallback-5',
      name: 'Homebuyer Association',
      role: 'President, Residents Welfare',
      content: 'Dr. Atrey fought for our homebuyer rights with dedication and legal acumen. His arguments before the Supreme Court were compelling and well-researched.',
      image: '',
    },
  ];

  const activeTestimonials = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;
  const duplicatedTestimonials = [...activeTestimonials, ...activeTestimonials];

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipe = 50;
    const total = testimonials.length > 0 ? testimonials.length : 5;
    if (Math.abs(swipeDistance) > minSwipe && total > 0) {
      if (swipeDistance > 0) {
        setActiveIndex(prev => (prev + 1) % total);
      } else {
        setActiveIndex(prev => (prev - 1 + total) % total);
      }
    }
    setTimeout(() => setIsPaused(false), 2000);
  }, [testimonials.length]);

  const topAnimation = prefersReducedMotion || isPaused ? {} : { x: ['-50%', '0%'] };
  const bottomAnimation = prefersReducedMotion || isPaused ? {} : { x: ['0%', '-50%'] };

  return (
    <div
      className="mx-auto max-w-7xl px-4 md:px-10 py-2 md:py-3 relative z-0"
      role="region"
      aria-label="Client testimonials"
      aria-roledescription="carousel"
    >
      <motion.h2
        className="mb-4 text-3xl md:text-4xl font-semibold text-charcoal font-display text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        What Our <span className="text-deepGreen">Clients</span> Say
      </motion.h2>

      {/* Screen reader announcement for active testimonial */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {activeTestimonials[activeIndex] && (
          <p>
            Testimonial {activeIndex + 1} of {activeTestimonials.length}: {activeTestimonials[activeIndex].name} says &ldquo;{activeTestimonials[activeIndex].content}&rdquo;
          </p>
        )}
      </div>

      <div
        ref={containerRef}
        className="rounded-lg bg-gradient-to-br from-[#061814] via-[#0E3B2F] to-[#061814] px-2 py-3 md:px-4 md:py-4 shadow-xl grain-overlay relative overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Banner - Moving Right */}
        <div className="mb-6 overflow-hidden relative z-0">
          <motion.div
            className="flex gap-3 md:gap-4 relative z-0"
            animate={topAnimation}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 40,
                ease: 'linear'
              }
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={`top-${testimonial.id}-${index}`} testimonial={testimonial} prefix="top" />
            ))}
          </motion.div>
        </div>

        {/* Bottom Banner - Moving Left */}
        <div className="overflow-hidden relative z-0">
          <motion.div
            className="flex gap-3 md:gap-4 relative z-0"
            animate={bottomAnimation}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 40,
                ease: 'linear'
              }
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={`bottom-${testimonial.id}-${index}`} testimonial={testimonial} prefix="bottom" />
            ))}
          </motion.div>
        </div>

        {/* Swipe hint on mobile */}
        <p className="text-center text-cream/30 text-[0.6rem] mt-2 md:hidden" aria-hidden="true">
          Swipe to browse testimonials
        </p>
      </div>
    </div>
  );
};

