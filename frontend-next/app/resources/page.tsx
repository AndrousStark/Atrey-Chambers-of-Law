import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ResourcesLayout } from '@/components/ResourcesLayout';

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
