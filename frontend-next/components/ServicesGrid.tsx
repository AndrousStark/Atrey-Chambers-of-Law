'use client';

import { PRACTICE_AREAS } from '@/lib/data/practice-areas';
import { assetPath } from '@/lib/utils';

const topPracticeAreas = PRACTICE_AREAS.slice(0, 12);

const practiceIcons: Record<string, JSX.Element> = {
  'constitutional-law-pil': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10"><path d="M3 21h18M3 10h18M5 6l7-3 7 3" /><line x1="7" y1="10" x2="7" y2="21" /><line x1="12" y1="10" x2="12" y2="21" /><line x1="17" y1="10" x2="17" y2="21" /></svg>,
  'supreme-court-litigation': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10"><circle cx="12" cy="5" r="3" /><path d="M12 8v4M6 20l6-8 6 8M4 20h16" /></svg>,
  'environmental-law-ngt': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10"><path d="M12 22c4-4 8-7 8-12a8 8 0 1 0-16 0c0 5 4 8 8 12z" /><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>,
  'government-litigation': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10"><path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" /><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /></svg>,
};

const defaultIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /><path d="M9 12l2 2 4-4" /></svg>;

export const ServicesGrid = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-10">
      <h2 className="mb-4 text-4xl font-display font-bold text-cream md:text-5xl text-center">
        Our <span className="text-gold">Practice Areas</span>
      </h2>
      <p className="text-center text-cream/60 mb-12 max-w-2xl mx-auto font-accent italic">
        Comprehensive legal expertise across 32 critical areas of Indian law
      </p>

      <div className="services-row">
        {topPracticeAreas.map((area) => (
          <div key={area.slug} className="card">
            <div className="cover">
              {/* Emblem icon watermark */}
              <div className="cover-logo">
                <div className="text-cream/20">
                  {practiceIcons[area.slug] || defaultIcon}
                </div>
              </div>
              <p className="service-title">{area.shortTitle.toUpperCase()}</p>
              <span className="price">
                <span className="text-cream/30">
                  {practiceIcons[area.slug] || defaultIcon}
                </span>
              </span>
            </div>
            <div className="card-back">
              <a href={assetPath(`/practice-area/${area.slug}`)}>
                {area.description}
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href={assetPath("/practice-area")}
          className="inline-block rounded border border-cream/30 bg-cream/10 px-8 py-3 text-sm text-cream font-semibold hover:bg-cream/20 transition-colors backdrop-blur-sm"
        >
          View All Practice Areas &rarr;
        </a>
      </div>
    </div>
  );
};
