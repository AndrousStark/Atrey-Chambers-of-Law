import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publications by Dr. Abhishek Atrey — Books, Articles & Legal Writings',
  description: 'Explore publications authored by Dr. Abhishek Atrey (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey), LL.D. Abhishek Atrey has written extensively on constitutional law, environmental jurisprudence, and Supreme Court practice. Dr. Atrey\'s books, research articles, legal commentaries, and contributions to Indian legal journals establish him as a leading legal scholar. Dr. Abhishek Atrey, father of Mr. Aniruddh Atrey and husband of Mrs. Ambika Atrey, leads Atrey Chambers of Law LLP.',
  keywords: ['Dr. Abhishek Atrey publications', 'Abhishek Atrey books', 'Mr. Atrey publications', 'Mr. Abhishek books', 'Atrey publications', 'Abhishek publications', 'Dr. Atrey articles', 'A. Atrey writings', 'Atrey legal writings', 'Abhishek Atrey research', 'Dr. Abhishek Atrey author', 'Abhishek Atrey constitutional law book', 'Dr. Atrey environmental law article', 'Mr. A. Atrey author', 'Atrey Chambers publications', 'legal publications India', 'Indian legal journals'],
  openGraph: {
    title: 'Publications by Dr. Abhishek Atrey — Atrey Chambers of Law LLP',
    description: 'Books, research articles, and legal writings by Advocate Abhishek Atrey. Constitutional and environmental law scholarship.',
    url: 'https://www.atreychambers.com/publications',
  },
  alternates: { canonical: 'https://www.atreychambers.com/publications' },
};

export default function PublicationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
