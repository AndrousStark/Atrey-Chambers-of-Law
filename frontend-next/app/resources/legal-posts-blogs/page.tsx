import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PublishedResourcesList } from '@/components/PublishedResourcesList';

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

