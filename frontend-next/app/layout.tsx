import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, Cormorant_Garamond } from 'next/font/google';
import LayoutProviders from '@/components/LayoutProviders';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-playfair',
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-dm-sans',
  preload: true,
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'Atrey Chambers of Law LLP | Expert Legal Services',
    template: '%s | Atrey Chambers'
  },
  description: 'Atrey Chambers of Law LLP is a premier Indian law firm headed by Dr. Abhishek Atrey, LL.D., Advocate-on-Record, Supreme Court of India. 29+ years of practice, 500+ cases, specializing in Constitutional Law, Supreme Court Litigation, Environmental Law, and Government Litigation.',
  keywords: ['law firm', 'legal services', 'Supreme Court', 'Advocate-on-Record', 'constitutional law', 'PIL', 'environmental law', 'NGT', 'government litigation', 'India law firm', 'Delhi lawyer', 'Dr. Abhishek Atrey'],
  authors: [{ name: 'Atrey Chambers of Law LLP' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Atrey Chambers of Law LLP',
    title: 'Atrey Chambers of Law LLP | Expert Legal Services',
    description: 'Premier Indian law firm headed by Dr. Abhishek Atrey, Advocate-on-Record, Supreme Court. 29+ years, 500+ cases in Constitutional Law, Environmental Law, and Government Litigation.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/logo ac.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo ac.png" />
        <link rel="shortcut icon" href="/logo ac.png" type="image/png" />
      </head>
      <body className={`min-h-screen bg-cream text-charcoal antialiased font-sans ${dmSans.className}`} style={{ backgroundColor: '#F2EBDD', color: '#333333' }}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-deepGreen focus:text-cream focus:rounded focus:outline-none focus:ring-2 focus:ring-deepGreen focus:ring-offset-2">
          Skip to main content
        </a>
        <LayoutProviders>{children}</LayoutProviders>
      </body>
    </html>
  );
}


