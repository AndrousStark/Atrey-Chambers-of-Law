'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BOOKS, ARTICLES, TV_APPEARANCES } from '@/lib/data/publications';
import { BookCard } from '@/components/BookCard';
import { Divider } from '@/components/ui/Divider';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';

export default function PublicationsPage() {
  const prefersReducedMotion = useReducedMotion();
  const [articleFilter, setArticleFilter] = useState<string>('all');

  const topics = ['all', ...Array.from(new Set(ARTICLES.map((a) => a.topic).filter(Boolean)))];

  const filteredArticles = articleFilter === 'all'
    ? ARTICLES
    : ARTICLES.filter((a) => a.topic === articleFilter);

  return (
    <>
      <Header />
      <main className="pt-28 md:pt-36 pb-16 bg-cream min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          {/* Hero */}
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-deepGreen mb-4">
              Publications & Media
            </h1>
            <Divider variant="gold" width="md" align="center" className="mb-4" />
            <p className="max-w-2xl mx-auto text-lg text-charcoal/70 font-accent italic mb-6">
              Scholarly contributions and expert commentary by Dr. Abhishek Atrey
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-center">
              <div>
                <span className="text-3xl font-display font-bold text-gold">{BOOKS.length}</span>
                <p className="text-sm text-charcoal/50">Books</p>
              </div>
              <div className="w-px bg-charcoal/10" />
              <div>
                <span className="text-3xl font-display font-bold text-gold">{ARTICLES.length}+</span>
                <p className="text-sm text-charcoal/50">Articles</p>
              </div>
              <div className="w-px bg-charcoal/10" />
              <div>
                <span className="text-3xl font-display font-bold text-gold">{TV_APPEARANCES.length}+</span>
                <p className="text-sm text-charcoal/50">TV Appearances</p>
              </div>
            </div>
          </div>

          {/* Books Section */}
          <section id="books" className="mb-20">
            <h2 className="text-2xl font-display font-bold text-deepGreen mb-8">Authored Books</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {BOOKS.map((book, i) => (
                <BookCard key={i} book={book} />
              ))}
            </div>
          </section>

          {/* Articles Section */}
          <section id="articles" className="mb-20">
            <h2 className="text-2xl font-display font-bold text-deepGreen mb-6">Articles & Legal Writing</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setArticleFilter(topic as string)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    articleFilter === topic
                      ? 'bg-deepGreen text-cream'
                      : 'bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10'
                  }`}
                >
                  {topic === 'all' ? 'All Topics' : topic}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredArticles.map((article, i) => (
                <motion.div
                  key={`${article.title}-${i}`}
                  variants={prefersReducedMotion ? {} : fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-4 rounded-lg border border-charcoal/10 bg-white hover:border-gold/20 transition-colors"
                >
                  <span className="text-xs text-charcoal/40 w-24 flex-shrink-0 pt-0.5">{article.year}</span>
                  <div>
                    <p className="font-medium text-charcoal">{article.title}</p>
                    <p className="text-sm text-charcoal/50 mt-1">{article.source}</p>
                    {article.topic && (
                      <span className="inline-block mt-2 rounded-full bg-gold/10 text-gold px-2.5 py-0.5 text-xs font-medium">
                        {article.topic}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* TV Appearances Section */}
          <section id="media" className="mb-16">
            <h2 className="text-2xl font-display font-bold text-deepGreen mb-8">Television Appearances</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {TV_APPEARANCES.map((appearance, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-charcoal/10 bg-white p-5 hover:border-gold/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-semibold text-deepGreen">{appearance.show}</h3>
                  </div>
                  <p className="text-sm text-gold font-medium">{appearance.channel}</p>
                  <p className="text-xs text-charcoal/50 mt-1">{appearance.dates}</p>
                  {appearance.topic && (
                    <span className="inline-block mt-2 rounded-full bg-deepGreen/5 text-deepGreen px-2.5 py-0.5 text-xs">
                      {appearance.topic}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
