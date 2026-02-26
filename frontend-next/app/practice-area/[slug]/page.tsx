import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PRACTICE_AREAS, getPracticeArea } from '@/lib/data/practice-areas';
import { Divider } from '@/components/ui/Divider';
import { notFound } from 'next/navigation';
import { assetPath } from '@/lib/utils';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return PRACTICE_AREAS.map((area) => ({ slug: area.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const area = getPracticeArea(params.slug);
  if (!area) return { title: 'Practice Area' };
  return {
    title: area.title,
    description: area.description,
  };
}

export default function PracticeAreaDetailPage({ params }: Props) {
  const area = getPracticeArea(params.slug);
  if (!area) return notFound();

  const otherAreas = PRACTICE_AREAS.filter((a) => a.slug !== area.slug).slice(0, 5);

  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            {/* Main content */}
            <div>
              <div className="mb-8">
                <a href={assetPath("/practice-area")} className="text-sm text-charcoal/50 hover:text-deepGreen transition-colors">
                  &larr; All Practice Areas
                </a>
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold text-deepGreen mb-4">
                {area.title}
              </h1>
              <Divider variant="gold" width="md" align="left" className="mb-6" />

              <div className="space-y-5 mb-10">
                {area.fullDescription.map((para, i) => (
                  <p key={i} className="text-charcoal/80 leading-relaxed text-lg">{para}</p>
                ))}
              </div>

              {/* Key Matters */}
              <div className="mb-10">
                <h2 className="text-xl font-display font-semibold text-deepGreen mb-4">Key Matters</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {area.keyMatters.map((matter, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-charcoal/10 bg-white">
                      <span className="h-2 w-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-charcoal/80">{matter}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Articles */}
              {area.relatedArticles.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-display font-semibold text-deepGreen mb-4">
                    Related Publications by Dr. Atrey
                  </h2>
                  <div className="space-y-2">
                    {area.relatedArticles.map((article, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-creamWarm/50">
                        <span className="text-gold">&#9733;</span>
                        <span className="text-charcoal/80">{article}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-lg bg-deepGreen p-8 text-center">
                <h3 className="text-xl font-display font-bold text-cream mb-3">
                  Need Legal Assistance in {area.shortTitle}?
                </h3>
                <p className="text-cream/70 mb-6 max-w-lg mx-auto">
                  Schedule a consultation with Dr. Abhishek Atrey to discuss your matter.
                </p>
                <a
                  href={assetPath("/schedule")}
                  className="inline-block rounded bg-gold px-8 py-3 text-sm font-semibold text-white hover:bg-goldLight transition-colors"
                >
                  Schedule Consultation
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-lg border border-charcoal/10 bg-white p-6">
                <h3 className="font-display font-semibold text-deepGreen mb-4">Other Practice Areas</h3>
                <div className="space-y-2">
                  {otherAreas.map((other) => (
                    <a
                      key={other.slug}
                      href={assetPath(`/practice-area/${other.slug}`)}
                      className="block text-sm text-charcoal/70 hover:text-deepGreen py-1.5 border-b border-charcoal/5 last:border-0 transition-colors"
                    >
                      {other.shortTitle}
                    </a>
                  ))}
                  <a
                    href={assetPath("/practice-area")}
                    className="block text-sm text-gold font-semibold pt-2 hover:underline"
                  >
                    View All &rarr;
                  </a>
                </div>
              </div>

              <div className="rounded-lg border border-gold/20 bg-gradient-to-b from-creamWarm to-cream p-6">
                <h3 className="font-display font-semibold text-deepGreen mb-3">Contact Us</h3>
                <p className="text-sm text-charcoal/70 mb-4">
                  24, Gyan Kunj, Basement,<br />
                  Laxmi Nagar, Delhi - 110092
                </p>
                <p className="text-sm text-charcoal/70">+91-11-22053080</p>
                <p className="text-sm text-charcoal/70">support@atreychambers.com</p>
                <a
                  href={assetPath("/schedule")}
                  className="mt-4 block w-full text-center rounded bg-deepGreen py-2.5 text-sm font-semibold text-cream hover:bg-deepGreenLight transition-colors"
                >
                  Schedule Call
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
