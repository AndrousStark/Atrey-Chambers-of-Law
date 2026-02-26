'use client';

const awards = [
  'Advocate-on-Record, Supreme Court of India (2006)',
  "'A' Panel Counsel, Government of India — Supreme Court",
  'Standing Counsel, Govt. of Uttarakhand — Supreme Court',
  'Standing Counsel, MoEFCC — National Green Tribunal',
  'Sr. Panel Counsel, CAQM — Delhi HC & NGT',
  'Panel Counsel, Association of Indian Universities',
  'Nyaymurti Prem Shankar Gupt Hindi Sahitya Samman (2021)',
  '3 Books Authored | 20+ Articles | 30+ TV Appearances',
  '2025 Webby Awards Winner — Best Home Page',
  'GSAP Site of the Month — Oct & Nov 2024',
];

export const AwardsMarquee = () => {
  const duplicated = [...awards, ...awards, ...awards];

  return (
    <section className="relative bg-deepGreen py-6 overflow-hidden border-y border-gold/20">
      {/* Gradient fade edges - wider for smooth cutoff */}
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-deepGreen via-deepGreen/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-deepGreen via-deepGreen/80 to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee whitespace-nowrap">
        {duplicated.map((award, i) => (
          <span key={i} className="mx-10 inline-flex items-center gap-4 text-sm md:text-base text-cream/80 tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
            {award}
          </span>
        ))}
      </div>
    </section>
  );
};
