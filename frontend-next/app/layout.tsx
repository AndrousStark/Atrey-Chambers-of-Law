import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, Cormorant_Garamond } from 'next/font/google';
import LayoutProviders from '@/components/LayoutProviders';
import { generateOrganizationSchema } from '@/lib/schema';
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
  metadataBase: new URL('https://www.atreychambers.com'),
  title: {
    default: 'Atrey Chambers of Law LLP | Premier Indian Law Firm | Supreme Court',
    template: '%s | Atrey Chambers of Law LLP',
  },
  description:
    'Atrey Chambers of Law LLP is a premier Indian law firm headed by Dr. Abhishek Atrey, LL.D., Advocate-on-Record, Supreme Court of India. 29+ years of practice, 500+ cases across 32 practice areas including Constitutional Law, Supreme Court Litigation, Environmental Law, and Government Litigation.',
  keywords: [
    'law firm India',
    'legal services Delhi',
    'Supreme Court lawyer',
    'Advocate-on-Record',
    'constitutional law India',
    'PIL lawyer',
    'environmental law NGT',
    'government litigation',
    'Dr. Abhishek Atrey',
    'Atrey Chambers',
    'best law firm Delhi',
    'Supreme Court advocate',
    'criminal lawyer Delhi',
    'corporate lawyer India',
    'family law advocate',
    'arbitration lawyer',
  ],
  authors: [{ name: 'Atrey Chambers of Law LLP', url: 'https://www.atreychambers.com' }],
  creator: 'Atrey Chambers of Law LLP',
  publisher: 'Atrey Chambers of Law LLP',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Atrey Chambers of Law LLP',
    title: 'Atrey Chambers of Law LLP | Premier Indian Law Firm',
    description:
      'Premier Indian law firm headed by Dr. Abhishek Atrey, Advocate-on-Record, Supreme Court. 29+ years, 500+ cases across 32 practice areas.',
    url: 'https://www.atreychambers.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Atrey Chambers of Law LLP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atrey Chambers of Law LLP | Premier Indian Law Firm',
    description:
      'Premier Indian law firm headed by Dr. Abhishek Atrey, AoR, Supreme Court. 29+ years, 500+ cases.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.atreychambers.com',
  },
  verification: {},
  category: 'Legal Services',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateOrganizationSchema();

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/logo ac.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo ac.png" />
        <link rel="shortcut icon" href="/logo ac.png" type="image/png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body
        className={`min-h-screen bg-cream text-charcoal antialiased font-sans ${dmSans.className}`}
        style={{ backgroundColor: '#F2EBDD', color: '#333333' }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-deepGreen focus:text-cream focus:rounded focus:outline-none focus:ring-2 focus:ring-deepGreen focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <LayoutProviders>{children}</LayoutProviders>
      </body>
    </html>
  );
}
