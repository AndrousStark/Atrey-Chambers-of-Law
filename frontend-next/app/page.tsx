'use client';

import { Hero } from '@/components/Hero';
import { Section } from '@/components/Section';
import { AboutUs } from '@/components/AboutUs';
import { FeaturesSection } from '@/components/FeaturesSection';
import { LandmarkCases } from '@/components/LandmarkCases';
import { NewsGrid } from '@/components/NewsGrid';
import { ServicesGrid } from '@/components/ServicesGrid';
import { LegalInsights } from '@/components/LegalInsights';
import { Newsletter } from '@/components/Newsletter';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';
import { Footer } from '@/components/Footer';
import { BCIDisclaimer } from '@/components/BCIDisclaimer';
import { StatsSection } from '@/components/StatsSection';
import { AwardsMarquee } from '@/components/AwardsMarquee';
import { useScrollTimeline } from '@/hooks/useScrollTimeline';
import { useState } from 'react';

export default function Page() {
  const [demoMode] = useState(false);
  useScrollTimeline(demoMode);

  return (
    <>
      <BCIDisclaimer />
      <Hero />
      <Section id="our-firm" className="bg-white">
        <AboutUs />
      </Section>
      <StatsSection />
      <Section id="features" className="bg-cream">
        <FeaturesSection />
      </Section>
      <Section id="practice-area" className="services-section">
        <ServicesGrid />
      </Section>
      <AwardsMarquee />
      <Section id="landmark-cases" className="bg-white">
        <LandmarkCases />
      </Section>
      <Section id="legal-insights" className="bg-cream">
        <LegalInsights />
      </Section>
      <Section id="our-blog" className="bg-white">
        <NewsGrid />
      </Section>
      <Section id="newsletter" className="bg-cream">
        <Newsletter />
      </Section>
      <Section id="testimonials" className="bg-cream relative z-0 !py-4 md:!py-6">
        <TestimonialsCarousel />
      </Section>
      <footer id="contact">
        <Footer />
      </footer>
    </>
  );
}
