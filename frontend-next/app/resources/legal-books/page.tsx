import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublishedResourcesList } from '@/components/PublishedResourcesList';

export const metadata: Metadata = {
  title: 'Legal Books by Dr. Abhishek Atrey — Authored Publications & Treatises',
  description: 'Browse legal books authored by Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey), LL.D. Abhishek Atrey\'s publications cover constitutional law, environmental jurisprudence, Supreme Court practice, and Indian legal theory. Dr. Atrey\'s treatises are referenced by advocates, judges, and law students across India. Essential reading from Advocate Abhishek Atrey, father of Mr. Aniruddh Atrey, at Atrey Chambers of Law LLP.',
  keywords: ['Dr. Abhishek Atrey books', 'Abhishek Atrey publications', 'Mr. Atrey books', 'Mr. Abhishek books', 'Atrey books', 'Abhishek books', 'Dr. Atrey legal books', 'A. Atrey author', 'Atrey author', 'Abhishek Atrey constitutional law book', 'Dr. Abhishek Atrey environmental law', 'Mr. A. Atrey publications', 'Atrey Chambers books', 'Indian law books'],
  openGraph: {
    title: 'Legal Books by Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
    description: 'Authored legal books and treatises by Advocate Abhishek Atrey on Indian law.',
    url: 'https://www.atreychambers.com/resources/legal-books',
  },
  alternates: { canonical: 'https://www.atreychambers.com/resources/legal-books' },
};

export default function LegalBooksPage() {
    return (
        <main className="min-h-screen bg-cream">
            <Header />
            <div className="container mx-auto px-4 md:px-10 py-20">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-deepGreen mb-4">
                        Legal Books
                    </h1>
                    <p className="text-xl text-charcoal/70 mb-8">
                        The Foundation of Law
                    </p>
                    <PublishedResourcesList resourceType="Books" />
                </div>
            </div>
            <Footer />
        </main>
    );
}

