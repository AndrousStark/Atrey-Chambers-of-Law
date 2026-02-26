'use client';

import { TV_APPEARANCES } from '@/lib/data/publications';

export const MediaGallery = () => {
  const channels = Array.from(new Set(TV_APPEARANCES.map((a) => a.channel)));

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        {channels.map((channel) => (
          <span
            key={channel}
            className="rounded-full bg-deepGreen/5 px-3 py-1 text-xs text-deepGreen font-medium"
          >
            {channel}
          </span>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TV_APPEARANCES.map((appearance, i) => (
          <div
            key={i}
            className="rounded-lg border border-charcoal/10 bg-white p-4 hover:border-gold/20 transition-colors"
          >
            <h3 className="font-semibold text-charcoal">{appearance.show}</h3>
            <p className="text-sm text-gold">{appearance.channel}</p>
            <p className="text-xs text-charcoal/50 mt-1">{appearance.dates}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
