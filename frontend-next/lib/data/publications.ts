export interface Book {
  title: string;
  publisher: string;
  year: string;
  foreword?: string;
  description: string;
}

export interface Article {
  title: string;
  source: string;
  year: string;
  topic?: string;
}

export interface TVAppearance {
  show: string;
  channel: string;
  dates: string;
  topic?: string;
}

export const BOOKS: Book[] = [
  {
    title: 'Law of Writs, Practice & Procedure',
    publisher: 'Kamal Publishers (Lawman), New Delhi',
    year: 'August 2014',
    description: 'A comprehensive treatise on writ jurisdiction under Articles 32 and 226 of the Constitution of India, covering practice and procedure before the Supreme Court and High Courts.',
  },
  {
    title: 'Law of Witnesses: Role of Witnesses in Criminal Justice System, A Need to Reform',
    publisher: 'Kamal Publishers (Lawman), New Delhi',
    year: 'March 2015',
    foreword: "Hon'ble Mr. Justice T.S. Thakur, Judge, Supreme Court of India",
    description: 'An in-depth analysis of the role of witnesses in the Indian criminal justice system, with a foreword by the former Chief Justice of India, advocating reforms for witness protection and reliability.',
  },
  {
    title: 'Yadein (यादें) — Hindi Poems',
    publisher: 'Hindi Poetry Collection',
    year: '2019',
    description: 'A collection of Hindi poems reflecting on life, values, and the human experience — showcasing the literary side of Dr. Atrey beyond legal scholarship.',
  },
];

export const ARTICLES: Article[] = [
  { title: 'Game-Changer for Indian Arbitration Law! — Lancor Holdings Analysis', source: 'SSRN / Atrey Chambers', year: 'December 2025', topic: 'Arbitration Law' },
  { title: 'Employer-Employee Relationship in Contract Labour', source: 'SSRN / Atrey Chambers', year: '2025', topic: 'Labour Law' },
  { title: 'Supreme Court on Homebuyer Rights — GMADA v. Anupam Garg', source: 'SSRN / Atrey Chambers', year: 'August 2025', topic: 'Property Law' },
  { title: 'Landmark Ruling on Corruption Conviction', source: 'SSRN / Atrey Chambers', year: '2025', topic: 'Criminal Law' },
  { title: 'Inter-bank Arbitration Under SARFAESI Act', source: 'SSRN / Atrey Chambers', year: 'June 2025', topic: 'Banking Law' },
  { title: 'IBC: Avoidance Transactions vs. Fraudulent Trading — Piramal v. 63 Moons', source: 'SSRN / Atrey Chambers', year: '2025', topic: 'Insolvency Law' },
  { title: 'A Himalayan Task — on Uniform Civil Code', source: 'India Legal Magazine', year: 'June 2023', topic: 'Constitutional Law' },
  { title: 'Separation of Powers — States and Union Territories', source: 'India Legal Magazine', year: 'April 2023', topic: 'Constitutional Law' },
  { title: 'No Set Formula for Bail', source: 'India Legal Magazine', year: 'March 2023', topic: 'Criminal Law' },
  { title: 'Tussle for Power — Delhi Government and LG', source: 'India Legal Magazine', year: 'January 2023', topic: 'Constitutional Law' },
  { title: 'Age of Consent', source: 'India Legal Magazine', year: 'January 2023', topic: 'Criminal Law' },
  { title: 'A Matter of Choice', source: 'India Legal Magazine', year: 'November 2022', topic: 'Constitutional Law' },
  { title: 'Judging the Judges', source: 'India Legal Magazine', year: 'October 2022', topic: 'Judiciary' },
  { title: 'Waqf Act — Playing with the Constitution', source: 'Dainik Jagran Newspaper', year: 'October 2022', topic: 'Property Law' },
  { title: "China's Land Border Law: A Serious Concern for India", source: 'India Legal Live', year: 'January 2022', topic: 'International Law' },
  { title: 'Anti Conversion Laws and their Constitutionality', source: 'India Legal Live', year: 'January 2021', topic: 'Constitutional Law' },
  { title: 'Farm Laws 2020: Beginning of a New Era', source: 'India Legal Live', year: 'January 2021', topic: 'Agricultural Law' },
  { title: 'Contempt of Most Powerful Court @ Re.1', source: 'India Legal Live', year: 'September 2020', topic: 'Contempt Law' },
  { title: 'Law of Contempt Versus Independence of Judiciary', source: 'India Legal Live', year: 'August 2020', topic: 'Judiciary' },
  { title: 'Dilution of Labour Laws: Is this the Package', source: 'India Legal Live', year: 'May 2020', topic: 'Labour Law' },
  { title: 'Risky Business: Doctrine of Frustration', source: 'India Legal Live', year: 'May 2020', topic: 'Contract Law' },
  { title: 'Framework and Challenges to CAA and NRC', source: 'India Legal Live', year: 'January 2020', topic: 'Constitutional Law' },
  { title: 'Important Judgments of Supreme Court: An Analysis', source: 'Nyay Pravah', year: 'Oct–Dec 2018', topic: 'Judiciary' },
  { title: 'Ecology and Environment: Crisis and Remedies', source: 'Nyay Pravah', year: 'Apr–Jun 2017', topic: 'Environmental Law' },
  { title: 'Finance Act, 2017: A Fight for Supremacy', source: 'Nyay Pravah', year: 'Jul–Sep 2017', topic: 'Finance Law' },
  { title: 'Sushant Singh Rajput — Homicide or Suicide: Legal Analysis', source: 'Atrey Chambers Blog', year: 'August 2020', topic: 'Criminal Law' },
  { title: 'Pro-Active Court: A Longing Requisite', source: 'Atrey Chambers Blog', year: 'August 2020', topic: 'Judiciary' },
  { title: 'Preying on Innocence — Child Safety in Indian Law', source: 'Atrey Chambers Blog', year: 'July 2020', topic: 'Criminal Law' },
  { title: 'Covid-19: Resumption of Regular Courts', source: 'Atrey Chambers Blog', year: 'May 2020', topic: 'Judiciary' },
];

export const TV_APPEARANCES: TVAppearance[] = [
  { show: 'Desh Deshantar', channel: 'Rajya Sabha TV / Sansad TV', dates: '2018–2021 (6+ appearances)', topic: 'Constitutional & Legal Analysis' },
  { show: 'Law of the Land', channel: 'Rajya Sabha TV', dates: '2018–2019 (5+ appearances)', topic: 'Legal Analysis' },
  { show: 'Big Picture', channel: 'Rajya Sabha TV', dates: 'January 2019', topic: 'National Policy' },
  { show: 'Nyay Chakra', channel: 'Lok Sabha TV', dates: 'February 2019', topic: 'Legal Analysis' },
  { show: 'Aapka Kanoon', channel: 'Rajya Sabha TV', dates: 'December 2019', topic: 'Citizens\' Legal Rights' },
  { show: 'Policy Watch', channel: 'Rajya Sabha TV', dates: 'November 2020', topic: 'Policy Analysis' },
  { show: 'Aaj Ki Charcha', channel: 'Rajya Sabha TV', dates: '2020–2021', topic: 'Current Affairs' },
  { show: 'Bills and Acts', channel: 'Sansad TV', dates: '2022–2023', topic: 'Legislative Analysis' },
  { show: 'Loktantra', channel: 'APN News', dates: '2020–2021 (7+ appearances)', topic: 'Democracy & Law' },
  { show: 'Legal Helpline', channel: 'APN News', dates: '2021 (6+ appearances)', topic: 'Legal Awareness' },
  { show: 'Mudda', channel: 'APN News', dates: 'July 2021', topic: 'Current Legal Issues' },
  { show: 'Murder Mystery', channel: 'News India', dates: 'January 2023', topic: 'Criminal Law Analysis' },
];

export const PUBLICATION_STATS = {
  books: BOOKS.length,
  articles: ARTICLES.length,
  tvAppearances: TV_APPEARANCES.length,
};
