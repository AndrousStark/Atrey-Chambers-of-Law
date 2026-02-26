'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'green' | 'outline' | 'subtle';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, string> = {
  gold: 'bg-gold/10 text-gold border border-gold/30',
  green: 'bg-deepGreen/10 text-deepGreen border border-deepGreen/30',
  outline: 'bg-transparent text-charcoal border border-charcoal/30',
  subtle: 'bg-charcoal/5 text-charcoal/80 border border-transparent',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export const Badge = ({
  children,
  variant = 'gold',
  size = 'sm',
  className = '',
}: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
