export interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'services' | 'process' | 'fees';
}

export const FAQ_DATA: FAQItem[] = [
  // General
  {
    question: 'What is Atrey Chambers of Law LLP?',
    answer: 'Atrey Chambers of Law LLP is a premier Indian law firm established in 1997, headed by Dr. Abhishek Atrey, LL.D., Advocate-on-Record, Supreme Court of India. We offer comprehensive legal services across 32 practice areas from our office in Delhi.',
    category: 'general',
  },
  {
    question: 'Who leads the firm?',
    answer: "The firm is led by Dr. Abhishek Atrey, who holds a Doctorate in Law (LL.D.) and is an Advocate-on-Record at the Supreme Court of India since 2006. He also serves as 'A' Panel Counsel for the Government of India and Senior Panel Counsel for CAQM.",
    category: 'general',
  },
  {
    question: 'Where is your office located?',
    answer: 'Our office is located at 24, Gyan Kunj, Basement, Laxmi Nagar, Delhi - 110092. We also regularly appear at the Supreme Court of India and Delhi High Court.',
    category: 'general',
  },
  {
    question: 'What are your office hours?',
    answer: 'Our office operates Monday through Saturday, 10:00 AM to 6:00 PM. Appointments outside these hours can be arranged for urgent matters. We are closed on Sundays and gazetted holidays.',
    category: 'general',
  },
  {
    question: 'Do you offer virtual consultations?',
    answer: 'Yes, we offer virtual consultations via video conferencing for clients who cannot visit our office. This is especially useful for clients outside Delhi or international clients. Please schedule a call through our website.',
    category: 'general',
  },
  // Services
  {
    question: 'What practice areas does the firm cover?',
    answer: 'We cover 32 practice areas including Constitutional Law & PIL, Supreme Court Litigation (AOR), Environmental Law & NGT, Government Litigation, Criminal Law, Civil & Commercial Litigation, Arbitration, Corporate Law, Family Law, Taxation, IP, and more.',
    category: 'services',
  },
  {
    question: 'Can you file cases directly in the Supreme Court?',
    answer: 'Yes. Dr. Abhishek Atrey is an Advocate-on-Record (AOR) at the Supreme Court of India, which means he has the exclusive right to file cases and appear directly before the apex court without needing another AOR.',
    category: 'services',
  },
  {
    question: 'Do you handle government litigation?',
    answer: "Yes, Dr. Atrey serves as 'A' Panel Counsel for the Government of India at the Supreme Court since 2014, and as Standing Counsel for the Government of Uttarakhand. We have represented ISRO, Indian Army, NSG, Ministry of Railways, and many other government bodies.",
    category: 'services',
  },
  {
    question: 'Do you handle environmental law cases?',
    answer: 'Yes, environmental law is one of our core strengths. Dr. Atrey served as Standing Counsel for the Ministry of Environment at the NGT (2015-2018) and currently serves as Senior Panel Counsel for CAQM. We handle NGT proceedings, pollution cases, and environmental compliance matters.',
    category: 'services',
  },
  {
    question: 'Can you help with international legal matters?',
    answer: 'Yes, we advise international clients on FDI structuring, FEMA compliance, cross-border transactions, and international arbitration. Current international clients include Tethys Systems Ltd. (Switzerland) and Webieez Pte Ltd. (Singapore).',
    category: 'services',
  },
  {
    question: 'Do you handle criminal cases?',
    answer: 'Yes, our criminal law practice covers bail applications (anticipatory, regular, default), criminal appeals before the Supreme Court and High Courts, FIR quashing, white-collar crime defense, and criminal contempt matters.',
    category: 'services',
  },
  // Process
  {
    question: 'How do I schedule a consultation?',
    answer: 'You can schedule a consultation through our website using the "Schedule Call" feature, by calling +91-11-22053080, or by emailing support@atreychambers.com. We will confirm a convenient time within 24 hours.',
    category: 'process',
  },
  {
    question: 'What should I bring to my first consultation?',
    answer: 'Please bring all relevant documents including court orders, notices, agreements, correspondence, and any previous legal opinions. A summary of your matter in writing helps us prepare effectively for the consultation.',
    category: 'process',
  },
  {
    question: 'How long does a typical case take?',
    answer: 'Case duration varies significantly based on the court, complexity, and type of matter. Supreme Court SLPs may take 6-18 months, High Court writ petitions 3-12 months, and trial court matters 1-5 years. We provide realistic timelines during initial consultation.',
    category: 'process',
  },
  {
    question: 'Will Dr. Atrey personally handle my case?',
    answer: 'Dr. Atrey personally oversees all significant matters and appears in Supreme Court and High Court cases. Day-to-day case management and tribunal appearances are handled by our experienced team of associates under his guidance.',
    category: 'process',
  },
  {
    question: 'Do you provide regular case updates?',
    answer: 'Yes, we provide regular updates on all case developments including hearing dates, orders passed, and next steps. Clients have direct communication with their assigned counsel and can request updates at any time.',
    category: 'process',
  },
  // Fees
  {
    question: 'How are your legal fees structured?',
    answer: 'Our fees are structured based on the nature and complexity of the matter. We offer fixed-fee arrangements for specific tasks (drafting, opinions) and retainer arrangements for ongoing matters. Detailed fee structures are discussed during initial consultation.',
    category: 'fees',
  },
  {
    question: 'Do you charge for the initial consultation?',
    answer: 'A nominal consultation fee applies for the initial meeting, which covers case assessment and preliminary legal advice. This fee is adjusted against the total fees if you engage us for the matter.',
    category: 'fees',
  },
  {
    question: 'Do you offer pro bono services?',
    answer: 'Yes, we selectively take up pro bono matters, especially in constitutional law, human rights, and environmental law cases of significant public interest. Eligibility is assessed on a case-by-case basis.',
    category: 'fees',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bank transfers (NEFT/RTGS/IMPS), UPI payments, demand drafts, and cash payments (as per legal limits). All payments are receipted and accounted for as per Bar Council guidelines.',
    category: 'fees',
  },
];

export const FAQ_CATEGORIES = [
  { id: 'general' as const, label: 'General' },
  { id: 'services' as const, label: 'Our Services' },
  { id: 'process' as const, label: 'Process' },
  { id: 'fees' as const, label: 'Fees & Billing' },
];
