import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';
import { Section } from '@/components/Section';
import { TechBackground } from '@/components/TechBackground';

export const metadata: Metadata = {
  title: 'Client Testimonials — Reviews of Dr. Abhishek Atrey & Atrey Chambers',
  description: 'Read client testimonials and reviews about Dr. Abhishek Atrey and Atrey Chambers of Law LLP. Real feedback on Abhishek Atrey\'s Supreme Court litigation, constitutional law matters, environmental cases, and corporate advisory. Clients praise Dr. Atrey\'s expertise, dedication, and track record of winning landmark cases across Indian courts.',
  keywords: ['Dr. Abhishek Atrey reviews', 'Abhishek Atrey testimonials', 'Mr. Atrey reviews', 'Mr. Abhishek Atrey feedback', 'Abhishek reviews', 'Atrey reviews', 'Dr. Atrey client feedback', 'Atrey Chambers reviews', 'A. Atrey rating', 'Dr. Abhishek Atrey reputation', 'Mr. Aniruddh Atrey', 'Mrs. Ambika Atrey', 'Atrey family law firm reviews'],
  openGraph: {
    title: 'Client Testimonials — Dr. Abhishek Atrey, Atrey Chambers of Law LLP',
    description: 'What clients say about Advocate Abhishek Atrey. Real reviews of Supreme Court and legal representation.',
    url: 'https://www.atreychambers.com/testimonials',
  },
  alternates: { canonical: 'https://www.atreychambers.com/testimonials' },
};

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
      <TechBackground />
      <Header />
      
      <div className="relative z-10 pt-32 pb-20">
        <Section id="testimonials" className="bg-white">
          <TestimonialsCarousel />
        </Section>
      </div>
      
      <Footer />
    </main>
  );
}

