'use client';

import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'gold';
  hover?: boolean;
}

export const GlassCard = ({ children, className, variant = 'light', hover = true }: GlassCardProps) => {
  const variants = {
    light: 'bg-white/60 border-charcoal/10 backdrop-blur-md',
    dark: 'bg-deepGreen/80 border-cream/10 backdrop-blur-md text-cream',
    gold: 'bg-white/60 border-gold/20 backdrop-blur-md',
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-6 transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-xl hover:border-gold/30 hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
};
