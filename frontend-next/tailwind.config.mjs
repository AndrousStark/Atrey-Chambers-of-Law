/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        deepGreen: '#0E3B2F',
        deepGreenLight: '#1A5A4A',
        deepGreenDark: '#082A20',
        cream: '#F2EBDD',
        creamWarm: '#F5F0E3',
        charcoal: '#333333',
        gold: '#B8860B',
        goldLight: '#D4A832',
        goldDark: '#8B6508',
        slate: '#64748B',
        background: '#F2EBDD',
        foreground: '#333333',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'system-ui', 'ui-sans-serif', 'sans-serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        accent: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      letterSpacing: {
        nav: '0.12em',
        wide: '0.25em',
      },
      fontWeight: {
        nav: '600',
      },
      animation: {
        'marquee': 'marquee 50s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'number-tick': 'number-tick 2s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-33.33%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'number-tick': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
