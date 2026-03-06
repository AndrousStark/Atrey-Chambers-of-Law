import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mrs. Ambika Atrey — Senior Partner at Dr. Abhishek Atrey\'s Atrey Chambers',
  description: 'Mrs. Ambika Atrey (Ambika Atrey / Mrs. Atrey), Senior Partner at Atrey Chambers of Law LLP, the firm founded by Dr. Abhishek Atrey. Ambika is the wife of Mr. Abhishek Atrey and mother of Mr. Aniruddh Atrey. Mrs. Ambika Atrey is an experienced advocate specializing in family law, civil litigation, and legal advisory. She works alongside Advocate Abhishek Atrey and the Atrey family legal team across Indian courts.',
  keywords: ['Mrs. Ambika Atrey', 'Ambika Atrey', 'Ambika', 'Mrs. Atrey', 'Ambika Atrey advocate', 'Ambika Atrey wife of Dr. Abhishek Atrey', 'mother of Aniruddh Atrey', 'Atrey Chambers senior partner', 'family law advocate Delhi', 'Dr. Abhishek Atrey wife', 'Atrey family', 'Atrey law firm partner'],
  openGraph: {
    title: 'Ambika Atrey — Senior Partner, Atrey Chambers of Law LLP',
    description: 'Senior Partner at Dr. Abhishek Atrey\'s Atrey Chambers. Family law, civil litigation, legal advisory.',
    url: 'https://www.atreychambers.com/our-team/ambika-atrey',
  },
  alternates: { canonical: 'https://www.atreychambers.com/our-team/ambika-atrey' },
};

export default function AmbikaAtreyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
