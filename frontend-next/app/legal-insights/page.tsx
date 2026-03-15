import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LegalInsights } from '@/components/LegalInsights';
import { Section } from '@/components/Section';
import { TechBackground } from '@/components/TechBackground';

export const metadata: Metadata = {
  title: 'Legal Insights by Dr. Abhishek Atrey — Expert Analysis & Commentary',
  description: 'Expert legal analysis, insights, and commentary by Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey), Advocate-on-Record, Supreme Court of India. Abhishek Atrey provides authoritative perspectives on Constitutional Law, Supreme Court rulings, Environmental Law developments, and landmark judicial decisions. Dr. Atrey\'s insights draw from distinguished frontline practice since 1997 at Atrey Chambers of Law LLP, alongside Mrs. Ambika Atrey and Mr. Aniruddh Atrey.',
  keywords: ['Dr. Abhishek Atrey legal insights', 'Abhishek Atrey analysis', 'Mr. Atrey commentary', 'Mr. Abhishek insights', 'Atrey insights', 'Abhishek insights', 'Dr. Atrey commentary', 'A. Atrey legal opinion', 'Atrey legal opinion', 'Abhishek Atrey Supreme Court analysis', 'Dr. Abhishek Atrey constitutional law insight', 'Mr. A. Atrey analysis', 'Atrey Chambers insights', 'Indian law expert analysis'],
  openGraph: {
    title: 'Legal Insights by Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
    description: 'Authoritative legal analysis by Advocate Abhishek Atrey on constitutional, environmental, and criminal law.',
    url: 'https://www.atreychambers.com/legal-insights',
  },
  alternates: { canonical: 'https://www.atreychambers.com/legal-insights' },
};

export default function LegalInsightsPage() {
  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
      <TechBackground />
      <Header />
      
      <div className="relative z-10 pt-32 pb-20">
        <Section id="legal-insights" className="bg-cream">
          <LegalInsights />
        </Section>
      </div>
      
      <Footer />
    </main>
  );
}

