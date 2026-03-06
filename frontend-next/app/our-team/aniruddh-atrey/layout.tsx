import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mr. Aniruddh Atrey — Associate, Son of Dr. Abhishek Atrey | Atrey Chambers',
  description: 'Mr. Aniruddh Atrey (Aniruddh Atrey / Aniruddh), Associate at Atrey Chambers of Law LLP. Aniruddh is the son of Dr. Abhishek Atrey (Founder & Managing Partner, AOR Supreme Court) and Mrs. Ambika Atrey (Senior Partner). Mr. Aniruddh Atrey works under the mentorship of his father Mr. Abhishek Atrey, supporting Supreme Court litigation, legal research, case strategy, and technology-driven legal solutions at the Atrey family law firm.',
  keywords: ['Mr. Aniruddh Atrey', 'Aniruddh Atrey', 'Aniruddh', 'Mr. Aniruddh', 'Aniruddh Atrey son of Dr. Abhishek Atrey', 'son of Abhishek Atrey', 'Dr. Abhishek Atrey son', 'Atrey Chambers associate', 'Aniruddh Atrey advocate', 'Mrs. Ambika Atrey son', 'Atrey family legal team', 'legal strategist Delhi', 'Atrey family law firm'],
  openGraph: {
    title: 'Aniruddh Atrey — Associate, Atrey Chambers of Law LLP',
    description: 'Associate at Dr. Abhishek Atrey\'s Atrey Chambers. Legal research, case strategy, Supreme Court support.',
    url: 'https://www.atreychambers.com/our-team/aniruddh-atrey',
  },
  alternates: { canonical: 'https://www.atreychambers.com/our-team/aniruddh-atrey' },
};

export default function AniruddhAtreyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
