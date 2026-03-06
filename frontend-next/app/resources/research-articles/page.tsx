import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublishedResourcesList } from '@/components/PublishedResourcesList';

export const metadata: Metadata = {
  title: 'Research Articles by Dr. Abhishek Atrey — Scholarly Legal Analysis',
  description: 'Read scholarly research articles authored by Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey), LL.D. Abhishek Atrey\'s academic contributions cover constitutional jurisprudence, environmental law doctrine, Supreme Court case analysis, and Indian legal theory. Dr. Atrey\'s research papers are published in leading Indian legal journals. Scholarly work from Advocate Abhishek Atrey, father of Mr. Aniruddh Atrey, at Atrey Chambers of Law LLP.',
  keywords: ['Dr. Abhishek Atrey research', 'Abhishek Atrey scholarly articles', 'Mr. Atrey research', 'Mr. Abhishek articles', 'Atrey research', 'Abhishek research', 'Dr. Atrey academic papers', 'A. Atrey research', 'Atrey legal research', 'Abhishek Atrey constitutional jurisprudence', 'Dr. Abhishek Atrey environmental law research', 'Mr. A. Atrey papers', 'Atrey Chambers research', 'Indian legal academia'],
  openGraph: {
    title: 'Research Articles by Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
    description: 'Scholarly legal research by Advocate Abhishek Atrey on constitutional and environmental jurisprudence.',
    url: 'https://www.atreychambers.com/resources/research-articles',
  },
  alternates: { canonical: 'https://www.atreychambers.com/resources/research-articles' },
};

export default function ResearchArticlesPage() {
    return (
        <main className="min-h-screen bg-cream">
            <Header />
            <div className="container mx-auto px-4 md:px-10 py-20">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-deepGreen mb-4">
                        Research Articles
                    </h1>
                    <p className="text-xl text-charcoal/70 mb-8">
                        Scholarly Analysis
                    </p>
                    <PublishedResourcesList resourceType="Research Article" />
                </div>
            </div>
            <Footer />
        </main>
    );
}

