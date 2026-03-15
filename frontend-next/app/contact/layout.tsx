import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
  description: 'Contact Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey) and the Atrey Chambers team at 32 & 33, 4th Floor, C-Block, Technopark, Plot No.5, Noida, UP – 201313. Call +91 120 4587083 or email support@atreychambers.com. Consult Advocate Abhishek Atrey for Supreme Court matters, constitutional law, environmental cases, criminal defence, and corporate advisory. Meet Mr. Atrey, Mrs. Ambika Atrey, and Mr. Aniruddh Atrey at Atrey Chambers of Law LLP.',
  keywords: ['contact Dr. Abhishek Atrey', 'Abhishek Atrey contact', 'Mr. Atrey phone', 'Mr. Abhishek contact', 'Atrey contact', 'Abhishek contact', 'A. Atrey contact', 'Atrey Chambers address', 'Dr. Abhishek Atrey consultation', 'Atrey Chambers Delhi', 'Supreme Court lawyer contact', 'legal consultation Delhi'],
  openGraph: {
    title: 'Contact Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
    description: 'Reach Advocate Abhishek Atrey for expert legal counsel. Atrey Chambers, Delhi — serving clients across India.',
    url: 'https://www.atreychambers.com/contact',
  },
  alternates: { canonical: 'https://www.atreychambers.com/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
