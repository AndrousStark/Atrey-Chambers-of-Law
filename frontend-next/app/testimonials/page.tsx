import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';
import { Section } from '@/components/Section';
import { TechBackground } from '@/components/TechBackground';

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

