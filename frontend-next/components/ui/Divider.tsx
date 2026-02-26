'use client';

interface DividerProps {
  variant?: 'gold' | 'cream' | 'charcoal';
  width?: 'sm' | 'md' | 'lg' | 'full';
  align?: 'left' | 'center' | 'right';
  className?: string;
  ornamental?: boolean;
}

const colorMap: Record<string, string> = {
  gold: 'bg-gold',
  cream: 'bg-cream/40',
  charcoal: 'bg-charcoal/20',
};

const widthMap: Record<string, string> = {
  sm: 'w-12',
  md: 'w-24',
  lg: 'w-40',
  full: 'w-full',
};

const alignMap: Record<string, string> = {
  left: '',
  center: 'mx-auto',
  right: 'ml-auto',
};

export const Divider = ({
  variant = 'gold',
  width = 'md',
  align = 'center',
  className = '',
  ornamental = false,
}: DividerProps) => {
  if (ornamental) {
    return (
      <div className={`flex items-center gap-3 ${alignMap[align]} ${className}`}>
        <div className={`h-px ${widthMap[width]} ${colorMap[variant]}`} />
        <div className="h-1.5 w-1.5 rotate-45 bg-gold" />
        <div className={`h-px ${widthMap[width]} ${colorMap[variant]}`} />
      </div>
    );
  }

  return (
    <div
      className={`h-0.5 ${widthMap[width]} ${colorMap[variant]} ${alignMap[align]} ${className}`}
    />
  );
};
