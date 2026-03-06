import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Firm — Founded by Dr. Abhishek Atrey, AOR Supreme Court',
  description: 'Atrey Chambers of Law LLP was founded in 1997 by Dr. Abhishek Atrey (Mr. Abhishek Atrey / Abhishek / Mr. Atrey / A. Atrey), LL.D., Advocate-on-Record at the Supreme Court of India. Abhishek built the firm into a premier legal institution with 29+ years of excellence. Mr. Atrey\'s vision of justice-driven advocacy — now continued by his son Mr. Aniruddh Atrey and wife Mrs. Ambika Atrey — has led to 500+ landmark cases across 32 practice areas. Learn about Atrey\'s journey from the Bar Council of Delhi to India\'s most distinguished Supreme Court practice.',
  keywords: ['Dr. Abhishek Atrey', 'Abhishek Atrey', 'Mr. Atrey', 'Mr. Abhishek', 'Abhishek', 'Atrey', 'A. Atrey', 'Mr. A. Atrey', 'Dr. Atrey', 'Atrey Chambers history', 'Dr. Abhishek Atrey founder', 'Atrey advocate Delhi', 'Abhishek Atrey Supreme Court', 'Mr. Aniruddh Atrey', 'Mrs. Ambika Atrey', 'Atrey family', 'law firm Delhi', 'Advocate-on-Record'],
  openGraph: {
    title: 'Our Firm — Dr. Abhishek Atrey\'s Atrey Chambers of Law LLP',
    description: 'Founded in 1997 by Abhishek Atrey. Dr. Atrey\'s 29+ years of Supreme Court practice. Advocate-on-Record since 2006.',
    url: 'https://www.atreychambers.com/our-firm',
  },
  alternates: { canonical: 'https://www.atreychambers.com/our-firm' },
};

export default function OurFirmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
