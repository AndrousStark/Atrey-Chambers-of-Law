'use client';

import { type Book } from '@/lib/data/publications';

interface BookCardProps {
  book: Book;
}

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <div className="group rounded-lg border border-gold/20 bg-white overflow-hidden hover:shadow-lg transition-all">
      {/* Book cover - realistic book spine design */}
      <div className="h-56 relative overflow-hidden">
        {/* Book background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-deepGreen via-deepGreenDark to-[#051a14]" />
        {/* Leather texture effect */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M0 0h20v20H0zM20 20h20v20H20z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        {/* Gold spine line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
        {/* Gold border frame */}
        <div className="absolute top-4 left-10 right-4 bottom-4 border border-gold/30 rounded-sm" />
        {/* Scales of Justice watermark */}
        <div className="absolute top-6 right-6 opacity-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-16 h-16 text-gold">
            <path d="M12 3v18M6 7l6-4 6 4M3 11l3-4 3 4M15 11l3-4 3 4M3 11c0 2 1.5 3 3 3s3-1 3-3M15 11c0 2 1.5 3 3 3s3-1 3-3" />
          </svg>
        </div>
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
          <p className="text-gold/80 text-[10px] uppercase tracking-[0.3em] mb-3">Dr. Abhishek Atrey</p>
          <div className="h-px w-12 bg-gold/40 mb-3" />
          <p className="text-cream font-display font-bold text-lg leading-tight mb-2">
            {book.title}
          </p>
          <div className="h-px w-12 bg-gold/40 mt-2 mb-2" />
          <p className="text-cream/50 text-[10px] uppercase tracking-widest">{book.year}</p>
        </div>
        {/* Bottom gold accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0" />
      </div>

      <div className="p-5">
        <h3 className="font-display font-semibold text-deepGreen text-base mb-2 leading-tight">
          {book.title}
        </h3>
        <p className="text-sm text-charcoal/60 mb-1">{book.publisher}</p>
        <p className="text-xs text-charcoal/40 mb-3">{book.year}</p>

        {book.foreword && (
          <div className="mt-3 p-3 rounded bg-gold/5 border border-gold/10">
            <p className="text-xs text-goldDark font-accent italic">
              Foreword by {book.foreword}
            </p>
          </div>
        )}

        <p className="text-sm text-charcoal/70 mt-3 leading-relaxed">{book.description}</p>
      </div>
    </div>
  );
};
