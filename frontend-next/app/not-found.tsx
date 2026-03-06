import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { assetPath } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center bg-cream px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-8xl font-display font-bold text-deepGreen/20 mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-deepGreen mb-4">
            Page Not Found
          </h2>
          <p className="text-charcoal/70 mb-8 leading-relaxed">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable.
            Please check the URL or navigate back to our homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={assetPath('/')}
              className="inline-block rounded bg-deepGreen px-8 py-3 text-sm font-semibold text-cream hover:bg-deepGreen/90 transition-colors"
            >
              Back to Homepage
            </a>
            <a
              href={assetPath('/contact')}
              className="inline-block rounded border border-deepGreen px-8 py-3 text-sm font-semibold text-deepGreen hover:bg-deepGreen/10 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
