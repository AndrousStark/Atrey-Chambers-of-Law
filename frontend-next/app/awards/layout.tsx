import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Awards & Recognition — Dr. Abhishek Atrey\'s Accolades & Honours',
  description: 'Awards, honours, and recognition received by Dr. Abhishek Atrey, Advocate-on-Record, Supreme Court of India. Abhishek Atrey\'s distinguished government appointments include Standing Counsel for Uttarakhand and MoEFCC at NGT. Dr. Atrey and Atrey Chambers of Law LLP have been recognized for outstanding legal practice, PIL advocacy, and constitutional law expertise.',
  keywords: ['Dr. Abhishek Atrey awards', 'Abhishek Atrey recognition', 'Mr. Atrey awards', 'Mr. Abhishek awards', 'Atrey awards', 'Abhishek awards', 'Dr. Atrey honours', 'A. Atrey accolades', 'Dr. Abhishek Atrey government appointment', 'Atrey Chambers awards', 'Supreme Court advocate recognition', 'legal awards India', 'Mr. A. Atrey achievements'],
  openGraph: {
    title: 'Awards & Recognition — Dr. Abhishek Atrey, Atrey Chambers of Law LLP',
    description: 'Honours and accolades of Advocate Abhishek Atrey. Government appointments, legal excellence awards.',
    url: 'https://www.atreychambers.com/awards',
  },
  alternates: { canonical: 'https://www.atreychambers.com/awards' },
};

export default function AwardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
