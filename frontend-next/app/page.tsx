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
import { HowWeWork } from '@/components/HowWeWork';
import { useScrollTimeline } from '@/hooks/useScrollTimeline';
import { useState } from 'react';
import { generateWebSiteSchema, generateSiteNavigationSchema } from '@/lib/schema';

export default function Page() {
  const [demoMode] = useState(false);
  useScrollTimeline(demoMode);

  const websiteSchema = generateWebSiteSchema();
  const navSchema = generateSiteNavigationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navSchema) }}
      />
      <BCIDisclaimer />
      <Hero />
      <Section id="our-firm" className="bg-white">
        <AboutUs />
      </Section>
      <StatsSection />
      <Section id="features" className="bg-cream">
        <FeaturesSection />
      </Section>
      <Section id="how-we-work" className="bg-white">
        <HowWeWork />
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
