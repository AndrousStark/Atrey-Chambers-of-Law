import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublishedResourcesList } from '@/components/PublishedResourcesList';

export const metadata: Metadata = {
  title: 'Legal Posts & Blogs by Dr. Abhishek Atrey — Current Insights',
  description: 'Read legal blog posts and articles by Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey) and the Atrey Chambers team. Abhishek Atrey provides insights on recent Supreme Court judgments, legislative changes, PIL developments, and constitutional law debates. Dr. Atrey\'s practical legal commentary at Atrey Chambers of Law LLP, alongside Mrs. Ambika Atrey and Mr. Aniruddh Atrey.',
  keywords: ['Dr. Abhishek Atrey blog posts', 'Abhishek Atrey legal blog', 'Mr. Atrey blog', 'Mr. Abhishek posts', 'Atrey posts', 'Abhishek posts', 'Dr. Atrey insights', 'A. Atrey blog', 'Atrey Chambers blog', 'Abhishek Atrey PIL commentary', 'Dr. Abhishek Atrey legal updates', 'Mr. A. Atrey insights', 'Atrey legal posts'],
  openGraph: {
    title: 'Legal Posts & Blogs by Dr. Abhishek Atrey — Atrey Chambers',
    description: 'Current legal insights by Advocate Abhishek Atrey on judgments, PIL, and legislative changes.',
    url: 'https://www.atreychambers.com/resources/legal-posts-blogs',
  },
  alternates: { canonical: 'https://www.atreychambers.com/resources/legal-posts-blogs' },
};

export default function LegalPostsBlogsPage() {
    return (
        <main className="min-h-screen bg-cream">
            <Header />
            <div className="container mx-auto px-4 md:px-10 py-20">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-deepGreen mb-4">
                        Legal Posts & Blogs
                    </h1>
                    <p className="text-xl text-charcoal/70 mb-8">
                        Current Insights
                    </p>
                    <PublishedResourcesList resourceType="Legal Post" />
                </div>
            </div>
            <Footer />
        </main>
    );
}

