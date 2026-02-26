import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NewsGrid } from '@/components/NewsGrid';
import { Section } from '@/components/Section';
import { TechBackground } from '@/components/TechBackground';

export default function OurBlogPage() {
  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
      <TechBackground />
      <Header />
      
      <div className="relative z-10 pt-32 pb-20">
        <Section id="our-blog" className="bg-white">
          <NewsGrid showAll={true} />
        </Section>
      </div>
      
      <Footer />
    </main>
  );
}

