import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, Cormorant_Garamond } from 'next/font/google';
import LayoutProviders from '@/components/LayoutProviders';
import { generateOrganizationSchema, generateWebSiteSchema, generateSiteNavigationSchema, generateAttorneySchema, generateProfessionalServiceSchema } from '@/lib/schema';
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
    default: 'Atrey Chambers of Law LLP | Dr. Abhishek Atrey | Premier Indian Law Firm | Supreme Court',
    template: '%s | Atrey Chambers of Law LLP — Dr. Abhishek Atrey',
  },
  description:
    'Atrey Chambers of Law LLP is a premier Indian law firm founded and headed by Dr. Abhishek Atrey (Abhishek Atrey / Mr. Abhishek Atrey), LL.D., Advocate-on-Record (AOR), Supreme Court of India. Abhishek brings 29+ years of distinguished legal practice with 500+ landmark cases across 32 practice areas. Dr. Atrey — father of Mr. Aniruddh Atrey (Associate) and husband of Mrs. Ambika Atrey (Senior Partner) — leads a family of legal professionals. Mr. Atrey is a constitutional law expert, environmental law advocate at NGT, and former Standing Counsel for Government of Uttarakhand. Consult Atrey for Supreme Court litigation, PIL, criminal defence, corporate advisory, arbitration, and family law.',
  keywords: [
    'Dr. Abhishek Atrey',
    'Abhishek Atrey',
    'Dr. Atrey',
    'Atrey',
    'Abhishek',
    'Mr. Atrey',
    'Mr. Abhishek',
    'Mr. Abhishek Atrey',
    'A. Atrey',
    'Mr. A. Atrey',
    'Atrey advocate',
    'Abhishek Atrey lawyer',
    'Abhishek Atrey Supreme Court',
    'Dr. Abhishek Atrey advocate',
    'Dr. Abhishek Atrey LL.D.',
    'Advocate Abhishek Atrey',
    'AOR Abhishek Atrey',
    'Abhishek Atrey AOR',
    'Dr. Abhishek Atrey Supreme Court',
    'Atrey Chambers',
    'Atrey Chambers of Law',
    'Atrey law firm',
    'Atrey law firm Delhi',
    'Dr. Abhishek Atrey constitutional law',
    'Dr. Abhishek Atrey environmental law',
    'Dr. Abhishek Atrey criminal lawyer',
    'Abhishek Atrey Delhi advocate',
    'Mr. Aniruddh Atrey',
    'Aniruddh Atrey',
    'Mrs. Ambika Atrey',
    'Ambika Atrey',
    'Atrey family law firm',
    'law firm India',
    'legal services Delhi',
    'Supreme Court lawyer',
    'Advocate-on-Record',
    'constitutional law India',
    'PIL lawyer',
    'environmental law NGT',
    'government litigation',
    'best law firm Delhi',
    'Supreme Court advocate',
    'criminal lawyer Delhi',
    'corporate lawyer India',
    'family law advocate',
    'arbitration lawyer',
    'Dr. Abhishek Atrey Standing Counsel',
    'Abhishek Atrey MoEFCC',
    'Dr. Atrey Supreme Court advocate',
    'Atrey advocate Supreme Court',
    'Abhishek Atrey father of Aniruddh',
    'Atrey Chambers Delhi',
  ],
  authors: [
    { name: 'Dr. Abhishek Atrey', url: 'https://www.atreychambers.com/our-team/abhishek-atrey' },
    { name: 'Atrey Chambers of Law LLP', url: 'https://www.atreychambers.com' },
  ],
  creator: 'Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
  publisher: 'Atrey Chambers of Law LLP',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/logo.png', color: '#0E3B2F' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Atrey Chambers of Law LLP — Dr. Abhishek Atrey',
    title: 'Atrey Chambers of Law LLP | Dr. Abhishek Atrey | Premier Indian Law Firm',
    description:
      'Premier Indian law firm founded by Dr. Abhishek Atrey, LL.D., Advocate-on-Record, Supreme Court of India. Abhishek Atrey — 29+ years, 500+ cases, 32 practice areas. Constitutional Law, Environmental Law, Supreme Court Litigation.',
    url: 'https://www.atreychambers.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Atrey Chambers of Law LLP — Dr. Abhishek Atrey, Advocate-on-Record, Supreme Court of India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Abhishek Atrey | Atrey Chambers of Law LLP | Supreme Court AOR',
    description:
      'Dr. Abhishek Atrey, Advocate-on-Record, Supreme Court of India. Founder of Atrey Chambers of Law LLP. 29+ years, 500+ cases across 32 practice areas.',
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
  const websiteSchema = generateWebSiteSchema();
  const navSchema = generateSiteNavigationSchema();
  const attorneySchema = generateAttorneySchema();
  const professionalServiceSchema = generateProfessionalServiceSchema();

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(attorneySchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
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
