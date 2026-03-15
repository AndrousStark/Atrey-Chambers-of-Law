import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FeaturesSection } from '@/components/FeaturesSection';
import { Section } from '@/components/Section';
import { TechBackground } from '@/components/TechBackground';

export const metadata: Metadata = {
  title: 'Why Choose Dr. Abhishek Atrey & Atrey Chambers — Key Differentiators',
  description: 'Discover why clients choose Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey) and Atrey Chambers of Law LLP. Abhishek Atrey brings distinguished Supreme Court experience since 1997, AOR designation since 2006, and mastery across 32 practice areas with 5000+ cases handled successfully. More than 50 articles published and more than 200 reported judgments. Dr. Atrey, father of Mr. Aniruddh Atrey and husband of Mrs. Ambika Atrey, offers a unique combination of government counsel experience, constitutional law expertise, and environmental law advocacy that sets Atrey Chambers apart.',
  keywords: ['why choose Dr. Abhishek Atrey', 'Abhishek Atrey experience', 'Mr. Atrey qualifications', 'Mr. Abhishek credentials', 'Atrey qualifications', 'Abhishek qualifications', 'Dr. Atrey qualifications', 'A. Atrey advantages', 'Atrey Chambers advantages', 'Abhishek Atrey AOR advantage', 'Dr. Abhishek Atrey 29 years', 'best Supreme Court lawyer', 'Mr. A. Atrey advocate', 'Atrey advocate credentials'],
  openGraph: {
    title: 'Why Choose Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
    description: 'Abhishek Atrey: Since 1997, AOR Supreme Court, 5000+ cases handled, 200+ reported judgments, 32 practice areas. Unmatched legal excellence.',
    url: 'https://www.atreychambers.com/features',
  },
  alternates: { canonical: 'https://www.atreychambers.com/features' },
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
      <TechBackground />
      <Header />
      
      <div className="relative z-10 pt-32 pb-20">
        <Section id="features" className="bg-cream">
          <FeaturesSection />
        </Section>
      </div>
      
      <Footer />
    </main>
  );
}

