'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PRACTICE_AREAS } from '@/lib/data/practice-areas';
import { assetPath } from '@/lib/utils';

export default function PracticeAreaPage() {
  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              Practice Areas
            </h1>
            <div className="h-0.5 w-16 bg-gold mx-auto mb-4" />
            <p className="max-w-2xl mx-auto text-lg text-charcoal/70 font-accent italic">
              Comprehensive legal expertise across critical areas of Indian law
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {PRACTICE_AREAS.map((area) => (
              <a
                key={area.slug}
                href={assetPath(`/practice-area/${area.slug}`)}
                className="group flex gap-4 rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm hover:shadow-md hover:border-gold/30 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-deepGreen/5 flex items-center justify-center text-deepGreen group-hover:bg-deepGreen group-hover:text-cream transition-colors">
                  <span className="text-xl">&#9878;</span>
                </div>
                <div>
                  <h2 className="text-lg font-display font-semibold text-deepGreen mb-2 group-hover:text-gold transition-colors">
                    {area.title}
                  </h2>
                  <p className="text-sm text-charcoal/60 leading-relaxed">
                    {area.description}
                  </p>
                  <span className="inline-block mt-3 text-sm text-deepGreen font-semibold group-hover:underline">
                    Learn More &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
