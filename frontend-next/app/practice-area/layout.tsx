import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Practice Areas — 32 Legal Specializations by Dr. Abhishek Atrey',
  description: 'Explore 32 practice areas led by Dr. Abhishek Atrey at Atrey Chambers of Law LLP. Abhishek Atrey provides expert representation in Constitutional Law, Supreme Court Litigation, Environmental Law & NGT, Criminal Law, Corporate Law, Arbitration, Family Law, and Government Litigation. Dr. Atrey\'s expertise spans PIL, writ petitions, bail applications, and appellate advocacy across all Indian courts.',
  keywords: ['Dr. Abhishek Atrey practice areas', 'Abhishek Atrey constitutional law', 'Mr. Atrey practice areas', 'Mr. Abhishek legal services', 'Abhishek practice areas', 'Atrey practice areas', 'Dr. Atrey environmental law', 'Atrey criminal lawyer', 'Abhishek Atrey corporate law', 'Dr. Abhishek Atrey arbitration', 'Atrey family law', 'Abhishek Atrey PIL', 'Dr. Atrey Supreme Court litigation', 'A. Atrey lawyer', 'practice areas law firm India', 'constitutional law', 'Supreme Court litigation', 'environmental law NGT', 'criminal law Delhi'],
  openGraph: {
    title: 'Practice Areas — Dr. Abhishek Atrey, Atrey Chambers of Law LLP',
    description: '32 areas of legal expertise. Dr. Abhishek Atrey — Constitutional Law, Environmental Law, Supreme Court Litigation, and more.',
    url: 'https://www.atreychambers.com/practice-area',
  },
  alternates: { canonical: 'https://www.atreychambers.com/practice-area' },
};

export default function PracticeAreaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
