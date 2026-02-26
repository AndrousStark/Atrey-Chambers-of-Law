import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PRACTICE_AREAS, getPracticeArea } from '@/lib/data/practice-areas';
import { Divider } from '@/components/ui/Divider';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { notFound } from 'next/navigation';
import { assetPath } from '@/lib/utils';
import { generateServiceSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/schema';
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

  const title = `${area.title} — Expert Legal Services`;
  const description = area.description.length > 155
    ? area.description.slice(0, 155) + '…'
    : area.description;

  return {
    title,
    description,
    keywords: [
      area.title,
      area.shortTitle,
      'lawyer India',
      'advocate Delhi',
      ...area.keyMatters.slice(0, 4),
    ],
    openGraph: {
      title,
      description,
      url: `https://www.atreychambers.com/practice-area/${area.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: area.title,
      description,
    },
    alternates: {
      canonical: `https://www.atreychambers.com/practice-area/${area.slug}`,
    },
  };
}

const PRACTICE_AREA_FAQS: Record<string, { question: string; answer: string }[]> = {
  'constitutional-law-pil': [
    { question: 'What is Public Interest Litigation (PIL) in India?', answer: 'PIL is a legal action initiated in a court of law for the enforcement of public interest. Any citizen can file a PIL in the Supreme Court under Article 32 or in a High Court under Article 226 for the enforcement of fundamental rights of any person or group.' },
    { question: 'How can Atrey Chambers help with constitutional law matters?', answer: 'With 29+ years of Supreme Court practice and AOR designation, Dr. Abhishek Atrey provides expert representation in fundamental rights challenges, constitutional validity disputes, writs, and PILs before the Supreme Court and High Courts.' },
    { question: 'What types of writ petitions can be filed?', answer: 'Five types of writs can be filed: Habeas Corpus (unlawful detention), Mandamus (duty enforcement), Certiorari (quashing orders), Prohibition (preventing excess jurisdiction), and Quo Warranto (challenging authority to hold office).' },
  ],
  'supreme-court-litigation': [
    { question: 'What is an Advocate-on-Record (AOR) at the Supreme Court?', answer: 'An AOR is a specially designated advocate authorized to file cases directly in the Supreme Court of India. Only an AOR can sign and file pleadings in the Supreme Court. Dr. Abhishek Atrey has held AOR designation since 2006.' },
    { question: 'How do I file a case in the Supreme Court of India?', answer: 'Cases in the Supreme Court can only be filed through an Advocate-on-Record (AOR). The process involves drafting the petition, filing through the AOR, and appearing before the designated bench. Contact Atrey Chambers for direct Supreme Court filing.' },
    { question: 'What types of cases does the Supreme Court hear?', answer: 'The Supreme Court hears Special Leave Petitions (SLPs), Civil and Criminal Appeals, Transfer Petitions, Original Jurisdiction matters between states, Review and Curative Petitions, and Advisory opinions under Article 143.' },
  ],
  'environmental-law-ngt': [
    { question: 'What is the National Green Tribunal (NGT)?', answer: 'The NGT is a specialized tribunal for handling environmental disputes involving enforcement of environmental laws including the Water Act, Air Act, Environment Protection Act, Forest Conservation Act, and Biodiversity Act.' },
    { question: 'How can I file a complaint about environmental pollution?', answer: 'Environmental complaints can be filed before the NGT, State Pollution Control Board, or through a writ petition in the High Court. Atrey Chambers provides expert representation as former Standing Counsel for MoEFCC at the NGT.' },
    { question: 'What experience does Atrey Chambers have in environmental law?', answer: 'Dr. Atrey served as Standing Counsel for the Ministry of Environment, Forest & Climate Change at the NGT (2015-2018) and currently serves as Senior Panel Counsel for CAQM, bringing unmatched institutional expertise.' },
  ],
  'criminal-law': [
    { question: 'What types of bail applications can be filed?', answer: 'Three types: Anticipatory Bail (before arrest, under Section 438 CrPC), Regular Bail (after arrest, under Section 439 CrPC), and Default Bail (statutory bail under Section 167 CrPC when charge sheet is not filed within prescribed time).' },
    { question: 'Can I get my FIR quashed?', answer: 'Yes, FIRs can be quashed under Section 482 CrPC or Article 226 if they disclose no cognizable offense, are maliciously filed, or in matrimonial disputes where parties settle. Expert legal representation significantly improves success rates.' },
    { question: 'Does Atrey Chambers handle criminal appeals in the Supreme Court?', answer: 'Yes, as an Advocate-on-Record, Dr. Atrey directly files and argues criminal appeals, SLPs against conviction orders, and bail applications before the Supreme Court of India.' },
  ],
  'family-law': [
    { question: 'What are the grounds for divorce under Hindu Marriage Act?', answer: 'Grounds include cruelty, desertion (2+ years), adultery, conversion, mental disorder, venereal disease, renunciation, and presumption of death (7+ years unheard). Mutual consent divorce is also available under Section 13B.' },
    { question: 'How is child custody determined in Indian courts?', answer: 'Indian courts prioritize the welfare of the child. Factors include the child\'s age (mother preferred for young children), financial stability, emotional bond, educational needs, and the child\'s own preference (if sufficiently mature).' },
    { question: 'What maintenance can be claimed in matrimonial disputes?', answer: 'Maintenance can be claimed under Section 125 CrPC (by any spouse), Hindu Adoptions & Maintenance Act (Hindu spouses), and DV Act (domestic violence cases). Courts consider income, assets, lifestyle, and needs.' },
  ],
};

export default function PracticeAreaDetailPage({ params }: Props) {
  const area = getPracticeArea(params.slug);
  if (!area) return notFound();

  const otherAreas = PRACTICE_AREAS.filter((a) => a.slug !== area.slug).slice(0, 5);
  const faqs = PRACTICE_AREA_FAQS[area.slug] || [];

  const serviceSchema = generateServiceSchema(area);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Practice Areas', url: '/practice-area' },
    { name: area.shortTitle, url: `/practice-area/${area.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(faqs)) }}
        />
      )}
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: assetPath('/') },
              { label: 'Practice Areas', href: assetPath('/practice-area') },
              { label: area.shortTitle },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            {/* Main content */}
            <div>
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

              {/* Our Approach */}
              <div className="mb-10">
                <h2 className="text-xl font-display font-semibold text-deepGreen mb-4">Our Approach</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { step: '01', title: 'Case Assessment', desc: 'Thorough analysis of facts, applicable law, and strategic options.' },
                    { step: '02', title: 'Strategy Development', desc: 'Tailored legal strategy aligned with your objectives and timelines.' },
                    { step: '03', title: 'Execution & Resolution', desc: 'Aggressive advocacy with focus on achieving the best outcome.' },
                  ].map((item) => (
                    <div key={item.step} className="p-5 rounded-lg border border-charcoal/10 bg-white">
                      <span className="text-3xl font-display font-bold text-gold/30">{item.step}</span>
                      <h3 className="text-sm font-semibold text-deepGreen mt-2 mb-1">{item.title}</h3>
                      <p className="text-xs text-charcoal/60 leading-relaxed">{item.desc}</p>
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

              {/* FAQs */}
              {faqs.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-display font-semibold text-deepGreen mb-4">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <details key={i} className="group rounded-lg border border-charcoal/10 bg-white">
                        <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-semibold text-deepGreen hover:text-gold transition-colors">
                          {faq.question}
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="flex-shrink-0 ml-2 transition-transform group-open:rotate-180"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </summary>
                        <div className="px-4 pb-4 text-sm text-charcoal/70 leading-relaxed">
                          {faq.answer}
                        </div>
                      </details>
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
