import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ResourcesLayout } from '@/components/ResourcesLayout';

export const metadata: Metadata = {
  title: 'Resources by Dr. Abhishek Atrey — Legal Books, Articles & Media',
  description: 'Access legal resources authored and curated by Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey) at Atrey Chambers of Law LLP. Browse Abhishek Atrey\'s books on constitutional law, research articles on environmental jurisprudence, legal blog posts, and news telecasts featuring Dr. Atrey on national television. Resources from Advocate Abhishek Atrey, father of Mr. Aniruddh Atrey and husband of Mrs. Ambika Atrey.',
  keywords: ['Dr. Abhishek Atrey resources', 'Abhishek Atrey legal books', 'Mr. Atrey resources', 'Mr. Abhishek resources', 'Atrey resources', 'Abhishek resources', 'Dr. Atrey research', 'A. Atrey publications', 'Atrey Chambers resources', 'Abhishek Atrey media', 'Dr. Abhishek Atrey publications', 'Mr. A. Atrey books', 'Atrey legal knowledge base'],
  openGraph: {
    title: 'Resources by Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
    description: 'Books, research articles, and media by Advocate Abhishek Atrey on Indian constitutional and environmental law.',
    url: 'https://www.atreychambers.com/resources',
  },
  alternates: { canonical: 'https://www.atreychambers.com/resources' },
};

// Use static rendering for GitHub Pages export, dynamic for server deployments
export const dynamic = process.env.GITHUB_PAGES === 'true' ? 'force-static' : 'force-dynamic';
export const revalidate = process.env.GITHUB_PAGES === 'true' ? false : 0;

export default function ResourcesPage() {
    return (
        <main className="min-h-screen relative">
            <Header />
            <ResourcesLayout />
            {/* Footer might need to be hidden or placed at the very end */}
            {/* <Footer /> */}
        </main>
    );
}
