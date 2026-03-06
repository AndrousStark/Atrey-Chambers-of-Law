import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Clients — Dr. Abhishek Atrey\'s Government & Corporate Clientele',
  description: 'Dr. Abhishek Atrey and Atrey Chambers represent Government of India ministries, state governments, PSUs, corporations, and individuals. Abhishek Atrey served as Standing Counsel for Govt. of Uttarakhand in the Supreme Court and MoEFCC at NGT. Dr. Atrey is trusted by CAQM, leading corporations, and high-profile individuals across India.',
  keywords: ['Dr. Abhishek Atrey clients', 'Abhishek Atrey government cases', 'Mr. Atrey clients', 'Mr. Abhishek clients', 'Atrey clients', 'Abhishek clients', 'Dr. Atrey Standing Counsel', 'Atrey MoEFCC', 'Abhishek Atrey Uttarakhand', 'Dr. Abhishek Atrey CAQM', 'A. Atrey government', 'Atrey Chambers clients', 'government litigation India', 'corporate clients law firm'],
  openGraph: {
    title: 'Our Clients — Dr. Abhishek Atrey, Atrey Chambers of Law LLP',
    description: 'Trusted by Government of India, state governments, PSUs, and leading corporations. Led by Advocate Abhishek Atrey.',
    url: 'https://www.atreychambers.com/our-clients',
  },
  alternates: { canonical: 'https://www.atreychambers.com/our-clients' },
};

export default function OurClientsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
