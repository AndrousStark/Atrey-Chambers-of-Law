import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dr. Abhishek Atrey — Advocate-on-Record, Supreme Court of India | Founder, Atrey Chambers',
  description: 'Dr. Abhishek Atrey (Mr. Abhishek Atrey / Abhishek / Mr. Atrey / A. Atrey), LL.D., is the Founder & Managing Partner of Atrey Chambers of Law LLP and a designated Advocate-on-Record (AOR) at the Supreme Court of India since 2006. Abhishek Atrey enrolled with the Bar Council of Delhi in 1997 and has 29+ years of distinguished practice. Dr. Abhishek Atrey is the father of Mr. Aniruddh Atrey (Associate at the firm) and husband of Mrs. Ambika Atrey (Senior Partner). Mr. Atrey served as Standing Counsel for the Government of Uttarakhand in the Supreme Court (2007-2015) and for MoEFCC at NGT (2015-2018). Atrey currently serves as Senior Panel Counsel for CAQM. Mr. Abhishek is an expert in Constitutional Law, PIL, Environmental Law, Criminal Law, and Supreme Court Litigation.',
  keywords: [
    'Dr. Abhishek Atrey', 'Abhishek Atrey', 'Dr. Atrey', 'Mr. Atrey',
    'Mr. Abhishek Atrey', 'Mr. Abhishek', 'Abhishek', 'Atrey', 'A. Atrey', 'Mr. A. Atrey',
    'Dr. Abhishek Atrey lawyer', 'Abhishek Atrey advocate', 'Dr. Abhishek Atrey LL.D.',
    'Abhishek Atrey Supreme Court', 'Dr. Atrey AOR', 'Advocate Abhishek Atrey',
    'AOR Abhishek Atrey', 'Abhishek Atrey AOR Supreme Court',
    'Dr. Abhishek Atrey Advocate-on-Record', 'Abhishek Atrey Delhi',
    'Dr. Abhishek Atrey constitutional law', 'Dr. Atrey environmental law',
    'Abhishek Atrey Standing Counsel', 'Dr. Abhishek Atrey MoEFCC',
    'Dr. Abhishek Atrey father of Aniruddh Atrey',
    'Mr. Aniruddh Atrey son of Dr. Abhishek Atrey',
    'Mrs. Ambika Atrey', 'Atrey family law firm',
    'Abhishek Atrey Uttarakhand', 'Dr. Abhishek Atrey CAQM',
    'Dr. Abhishek Atrey PIL', 'Abhishek Atrey criminal lawyer',
    'Dr. Atrey Supreme Court advocate', 'Atrey law firm founder',
    'Abhishek Atrey NGT', 'Dr. Abhishek Atrey bar council Delhi',
    'Abhishek Atrey LL.B. LL.M. LL.D.', 'Dr. A. Atrey',
    'Abhishek Atrey Atrey Chambers', 'Dr. Abhishek Atrey biography',
    'Abhishek Atrey profile', 'Atrey Supreme Court India',
  ],
  openGraph: {
    title: 'Dr. Abhishek Atrey — Advocate-on-Record, Supreme Court | Atrey Chambers of Law LLP',
    description: 'Abhishek Atrey, LL.D. — AOR Supreme Court since 2006. 29+ years of practice. Founder of Atrey Chambers. Former Standing Counsel for Uttarakhand & MoEFCC.',
    url: 'https://www.atreychambers.com/our-team/abhishek-atrey',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Abhishek Atrey — AOR, Supreme Court of India',
    description: 'Abhishek Atrey: Founder of Atrey Chambers, LL.D., Advocate-on-Record. 29+ years, 500+ cases, 32 practice areas.',
  },
  alternates: { canonical: 'https://www.atreychambers.com/our-team/abhishek-atrey' },
};

export default function AbhishekAtreyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
