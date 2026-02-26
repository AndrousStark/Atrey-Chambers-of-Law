'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PRACTICE_AREAS } from '@/lib/data/practice-areas';
import { assetPath } from '@/lib/utils';

interface Category {
  id: string;
  label: string;
  slugs?: string[];
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All Areas' },
  { id: 'litigation', label: 'Litigation', slugs: ['constitutional-law-pil', 'supreme-court-litigation', 'high-court-litigation', 'criminal-law', 'civil-commercial-litigation', 'government-litigation'] },
  { id: 'regulatory', label: 'Regulatory & Environmental', slugs: ['environmental-law-ngt', 'air-quality-regulation', 'consumer-protection', 'competition-antitrust'] },
  { id: 'corporate', label: 'Corporate & Commercial', slugs: ['corporate-commercial-law', 'insolvency-bankruptcy', 'arbitration-adr', 'banking-finance-law', 'taxation-law', 'customs-foreign-trade', 'white-collar-crime'] },
  { id: 'specialized', label: 'Specialized', slugs: ['temple-rights-religious-law', 'family-law', 'real-estate-property', 'waqf-property-law', 'employment-labour-law', 'university-education-law', 'intellectual-property', 'media-entertainment-law', 'matrimonial-law-divorce', 'cyber-law-data-protection', 'immigration-law', 'human-rights-law', 'election-law', 'land-acquisition-larr', 'defense-military-law'] },
];

export default function PracticeAreaPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAreas = useMemo(() => {
    let areas = PRACTICE_AREAS;

    if (activeCategory !== 'all') {
      const cat = CATEGORIES.find((c) => c.id === activeCategory);
      if (cat?.slugs) {
        areas = areas.filter((a) => cat.slugs!.includes(a.slug));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      areas = areas.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.shortTitle.toLowerCase().includes(q)
      );
    }

    return areas;
  }, [activeCategory, searchQuery]);

  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <Breadcrumbs items={[{ label: 'Home', href: assetPath('/') }, { label: 'Practice Areas' }]} />

          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              Practice Areas
            </h1>
            <div className="h-0.5 w-16 bg-gold mx-auto mb-4" />
            <p className="max-w-2xl mx-auto text-lg text-charcoal/70 font-accent italic">
              Comprehensive legal expertise across 32 critical areas of Indian law
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search practice areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-charcoal/15 bg-white pl-11 pr-4 py-3 text-sm text-charcoal placeholder-charcoal/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {CATEGORIES.map((cat) => (
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

          {/* Results Count */}
          <p className="text-sm text-charcoal/40 mb-6 text-center">
            {filteredAreas.length} practice area{filteredAreas.length !== 1 ? 's' : ''}
          </p>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {filteredAreas.map((area, i) => (
                <motion.a
                  key={area.slug}
                  href={assetPath(`/practice-area/${area.slug}`)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
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
                </motion.a>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredAreas.length === 0 && (
            <div className="text-center py-16">
              <p className="text-charcoal/50 text-lg">No practice areas match your search.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-4 text-gold hover:underline font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
