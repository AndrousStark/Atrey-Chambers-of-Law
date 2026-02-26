'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FAQ_DATA, FAQ_CATEGORIES } from '@/lib/data/faq';
import { assetPath } from '@/lib/utils';
import { generateFAQSchema, generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/schema';

const faqSchema = generateFAQSchema(FAQ_DATA.map((f) => ({ question: f.question, answer: f.answer })));
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'FAQ', url: '/faq' },
]);
const pageSchema = generateWebPageSchema({
  name: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Atrey Chambers of Law LLP.',
  url: '/faq',
});

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('general');

  const filteredFAQs = FAQ_DATA.filter((faq) => faq.category === activeCategory);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-4xl px-4 md:px-10">
          <Breadcrumbs items={[{ label: 'Home', href: assetPath('/') }, { label: 'FAQ' }]} />

          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              Frequently Asked <span className="text-gold">Questions</span>
            </h1>
            <div className="h-0.5 w-16 bg-gold mx-auto mb-4" />
            <p className="max-w-2xl mx-auto text-lg text-charcoal/70 font-accent italic">
              Everything you need to know about working with Atrey Chambers
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-deepGreen text-cream shadow-md'
                    : 'bg-white border border-charcoal/15 text-charcoal/60 hover:border-deepGreen/30 hover:text-deepGreen'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {filteredFAQs.map((faq, i) => (
              <details key={i} className="group rounded-lg border border-charcoal/10 bg-white">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-sm font-semibold text-deepGreen hover:text-gold transition-colors">
                  <span className="pr-4">{faq.question}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="flex-shrink-0 transition-transform group-open:rotate-180"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-charcoal/70 leading-relaxed border-t border-charcoal/5 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 rounded-lg bg-deepGreen p-8 md:p-12 text-center">
            <h3 className="text-xl md:text-2xl font-display font-bold text-cream mb-3">
              Still Have Questions?
            </h3>
            <p className="text-cream/70 mb-6 max-w-lg mx-auto">
              Our team is ready to help. Schedule a consultation or reach out directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={assetPath('/contact')}
                className="inline-block rounded bg-gold px-8 py-3 text-sm font-semibold text-white hover:bg-goldLight transition-colors"
              >
                Contact Us
              </a>
              <a
                href={assetPath('/schedule')}
                className="inline-block rounded border border-cream/30 px-8 py-3 text-sm font-semibold text-cream hover:bg-cream/10 transition-colors"
              >
                Schedule Call
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
