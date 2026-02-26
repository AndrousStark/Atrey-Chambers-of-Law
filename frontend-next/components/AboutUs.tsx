'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, slideInFromLeft, slideInFromRight } from '@/lib/animations';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { assetPath } from '@/lib/utils';

const highlights = [
  {
    title: 'Supreme Court Practice',
    description: 'Advocate-on-Record since 2006 — direct filing and comprehensive representation before the Supreme Court of India.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3" />
      </svg>
    ),
  },
  {
    title: 'Government Counsel',
    description: "'A' Panel Counsel for Government of India, Standing Counsel for Uttarakhand and MoEFCC.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
      </svg>
    ),
  },
  {
    title: 'Published Authority',
    description: '3 books, 20+ articles, and 30+ TV appearances on Sansad TV, Rajya Sabha TV, and APN News.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

export const AboutUs = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-10">
      <SectionHeading
        title="Welcome to"
        highlight="Atrey Chambers of Law LLP"
        subtitle="Where legal excellence meets unwavering commitment to justice"
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_1px_380px] items-start">
        {/* Main content */}
        <motion.div
          variants={prefersReducedMotion ? {} : slideInFromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="mb-6 text-lg leading-relaxed text-charcoal/80">
            <strong className="font-display text-deepGreen">Atrey Chambers of Law LLP</strong> stands as a beacon of legal excellence in India. Registered under the Limited Liability Partnership Act, 2008, we are a premier full-service law firm led by <strong className="font-display text-deepGreen">Dr. Abhishek Atrey, LL.D., Advocate-on-Record</strong>, whose distinguished career spans over 29 years of exceptional legal practice since 1997.
          </p>
          <p className="mb-6 text-base leading-relaxed text-charcoal/70">
            Dr. Atrey&apos;s exceptional expertise earned him the prestigious designation of Advocate-on-Record by the Supreme Court of India in 2006. His distinguished service includes appointments as Standing Counsel for the Government of Uttarakhand (2007), &apos;A&apos; Panel Counsel for the Government of India at the Supreme Court (2014), and Standing Counsel for the Ministry of Environment, Forest &amp; Climate Change at the National Green Tribunal (2015).
          </p>
          <p className="mb-8 text-base leading-relaxed text-charcoal/70">
            With a legacy built on integrity, precision, and client-centric values, our firm combines time-honored legal traditions with innovative strategies, ensuring that our clients receive not just representation, but a partnership dedicated to achieving their goals.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="/our-firm"
              className="inline-flex items-center gap-2 rounded-lg bg-deepGreen px-6 py-3 text-sm text-cream font-semibold hover:bg-deepGreenLight transition-colors"
            >
              Learn More About Us
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/our-team"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-deepGreen px-6 py-3 text-sm text-deepGreen font-semibold hover:bg-deepGreen hover:text-cream transition-colors"
            >
              Meet Our Team
            </a>
          </div>
        </motion.div>

        {/* Gold vertical divider */}
        <div className="hidden lg:block gold-line h-full min-h-[300px]" style={{ width: '1px', background: 'linear-gradient(180deg, transparent, #B8860B, transparent)' }} />

        {/* Highlights sidebar */}
        <motion.div
          variants={prefersReducedMotion ? {} : slideInFromRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-5"
        >
          {/* Dr. Atrey photo card */}
          <div className="rounded-xl overflow-hidden border border-gold/20 shadow-md">
            <div className="w-full aspect-[3/4] overflow-hidden bg-deepGreen/5">
              <img
                src={assetPath("/dr-abhishek-atrey.jpg")}
                alt="Dr. Abhishek Atrey — Founder & Managing Partner"
                className="w-full h-full object-cover object-[center_15%]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="p-4 bg-gradient-to-b from-white to-creamWarm/30">
              <p className="font-display font-semibold text-deepGreen">Dr. Abhishek Atrey</p>
              <p className="text-xs text-gold font-medium">Founder & Managing Partner</p>
              <p className="text-xs text-charcoal/50 mt-1">LL.D., LL.M., LL.B., B.Sc.</p>
            </div>
          </div>

          {highlights.map((item) => (
            <div key={item.title} className="rounded-lg border border-gold/15 bg-gradient-to-br from-white to-creamWarm/20 p-5 transition-all duration-300 hover:shadow-md hover:border-gold/30 group">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 text-gold/60 group-hover:text-gold transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-display font-semibold text-deepGreen mb-1">{item.title}</h3>
                  <p className="text-sm text-charcoal/65 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
