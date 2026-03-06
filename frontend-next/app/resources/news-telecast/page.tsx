import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublishedResourcesList } from '@/components/PublishedResourcesList';

export const metadata: Metadata = {
  title: 'Dr. Abhishek Atrey on TV — News Telecasts & Media Appearances',
  description: 'Watch Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey) on national television providing expert legal commentary. Abhishek Atrey appears on leading news channels discussing constitutional law, environmental issues, PIL cases, and public interest matters. Dr. Atrey\'s media presence, alongside Mrs. Ambika Atrey and Mr. Aniruddh Atrey, showcases Atrey Chambers of Law LLP\'s thought leadership.',
  keywords: ['Dr. Abhishek Atrey TV', 'Abhishek Atrey news', 'Mr. Atrey TV', 'Mr. Abhishek news', 'Atrey TV', 'Abhishek TV', 'Dr. Atrey media', 'A. Atrey media', 'Atrey TV appearance', 'Abhishek Atrey news channel', 'Dr. Abhishek Atrey interview', 'Mr. A. Atrey television', 'Atrey Chambers media', 'Abhishek Atrey legal commentary TV', 'Dr. Atrey national television'],
  openGraph: {
    title: 'Dr. Abhishek Atrey on TV — Atrey Chambers of Law LLP',
    description: 'Advocate Abhishek Atrey on national TV. Legal commentary on constitutional, environmental, and public interest matters.',
    url: 'https://www.atreychambers.com/resources/news-telecast',
  },
  alternates: { canonical: 'https://www.atreychambers.com/resources/news-telecast' },
};

export default function NewsTelecastPage() {
    return (
        <main className="min-h-screen bg-cream">
            <Header />
            <div className="container mx-auto px-4 md:px-10 py-20">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-deepGreen mb-4">
                        News Telecast
                    </h1>
                    <p className="text-xl text-charcoal/70 mb-8">
                        Visual Intelligence
                    </p>
                    <PublishedResourcesList resourceType="News Telecast" />
                </div>
            </div>
            <Footer />
        </main>
    );
}

