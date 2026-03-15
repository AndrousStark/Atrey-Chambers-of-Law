import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Legal Questions Answered by Dr. Abhishek Atrey\'s Team',
  description: 'Find answers to common legal questions from Atrey Chambers of Law LLP. Dr. Abhishek Atrey\'s (Mr. Abhishek Atrey / Mr. Atrey / Abhishek / Atrey) team explains Supreme Court practice, PIL filing procedures, bail applications, divorce proceedings, environmental complaints at NGT, and more. Abhishek Atrey\'s distinguished experience since 1997 informs every answer. Consult Dr. Atrey, father of Mr. Aniruddh Atrey, for detailed legal guidance.',
  keywords: ['Dr. Abhishek Atrey FAQ', 'Abhishek Atrey legal questions', 'Mr. Atrey FAQ', 'Mr. Abhishek questions', 'Atrey FAQ', 'Abhishek FAQ', 'Dr. Atrey Supreme Court questions', 'A. Atrey answers', 'Atrey Chambers FAQ', 'Abhishek Atrey PIL guide', 'legal FAQ India', 'Supreme Court questions', 'PIL how to file', 'bail application process', 'divorce lawyer FAQ', 'environmental complaint India', 'Mr. A. Atrey advice', 'Dr. Abhishek Atrey advice'],
  openGraph: {
    title: 'FAQ — Dr. Abhishek Atrey\'s Atrey Chambers of Law LLP',
    description: 'Legal questions answered by Dr. Abhishek Atrey\'s team. Supreme Court, PIL, bail, environmental law guidance.',
    url: 'https://www.atreychambers.com/faq',
  },
  alternates: { canonical: 'https://www.atreychambers.com/faq' },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
