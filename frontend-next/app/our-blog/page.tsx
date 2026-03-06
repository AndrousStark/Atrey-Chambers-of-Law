import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NewsGrid } from '@/components/NewsGrid';
import { Section } from '@/components/Section';
import { TechBackground } from '@/components/TechBackground';

export const metadata: Metadata = {
  title: 'Blog by Dr. Abhishek Atrey — Legal News, Updates & Articles',
  description: 'Stay updated with the latest legal news, case analyses, legislative updates, and articles from Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey) and the team at Atrey Chambers of Law LLP. Abhishek Atrey covers Supreme Court developments, environmental law news, constitutional law updates, and criminal justice reforms. Dr. Atrey, father of Mr. Aniruddh Atrey, shares expert takes on landmark Indian judgments.',
  keywords: ['Dr. Abhishek Atrey blog', 'Abhishek Atrey articles', 'Mr. Atrey blog', 'Mr. Abhishek articles', 'Atrey blog', 'Abhishek blog', 'Dr. Atrey legal news', 'A. Atrey articles', 'Atrey Chambers blog', 'Abhishek Atrey Supreme Court updates', 'Dr. Abhishek Atrey legal writing', 'Mr. A. Atrey news', 'Indian law blog', 'Supreme Court news'],
  openGraph: {
    title: 'Blog by Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
    description: 'Legal news, case analyses, and updates from Advocate Abhishek Atrey and Atrey Chambers.',
    url: 'https://www.atreychambers.com/our-blog',
  },
  alternates: { canonical: 'https://www.atreychambers.com/our-blog' },
};

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

