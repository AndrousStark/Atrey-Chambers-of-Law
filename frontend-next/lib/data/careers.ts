export interface JobOpening {
  id: string;
  title: string;
  department: string;
  type: 'Full-time' | 'Part-time' | 'Internship';
  experience: string;
  location: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  datePosted: string;
  validThrough: string;
}

export const JOB_OPENINGS: JobOpening[] = [
  {
    id: 'senior-associate-constitutional',
    title: 'Senior Associate — Constitutional Law',
    department: 'Constitutional & Public Law',
    type: 'Full-time',
    experience: '5-8 years',
    location: 'Delhi',
    description:
      'We are seeking a Senior Associate with strong experience in constitutional law, fundamental rights litigation, and PIL to join our expanding practice. The ideal candidate will assist Dr. Atrey in Supreme Court and High Court matters.',
    responsibilities: [
      'Research and draft petitions, written submissions, and legal opinions in constitutional matters',
      'Assist in Supreme Court and High Court PIL and writ proceedings',
      'Independently manage trial court and tribunal hearings',
      'Mentor junior associates and legal interns',
      'Contribute to published articles and legal commentary',
    ],
    qualifications: [
      'LL.B. from a recognized university (LL.M. preferred)',
      '5-8 years of active litigation experience in constitutional law',
      'Bar Council enrollment and valid practice certificate',
      'Strong legal research and drafting skills',
      'Experience with Supreme Court or High Court proceedings preferred',
    ],
    datePosted: '2026-02-01',
    validThrough: '2026-06-30',
  },
  {
    id: 'associate-civil-litigation',
    title: 'Associate — Civil Litigation',
    department: 'Civil & Commercial Litigation',
    type: 'Full-time',
    experience: '3-5 years',
    location: 'Delhi',
    description:
      'We are looking for a motivated Associate to handle civil and commercial litigation matters across District Courts, High Courts, and tribunals. Strong drafting skills and courtroom confidence required.',
    responsibilities: [
      'Handle civil suits, recovery matters, and property disputes independently',
      'Draft plaints, written statements, applications, and legal notices',
      'Appear before District Courts and tribunals in Delhi NCR',
      'Support senior counsel in High Court and Supreme Court matters',
      'Maintain case files and track deadlines diligently',
    ],
    qualifications: [
      'LL.B. from a recognized university',
      '3-5 years of active civil litigation experience',
      'Bar Council enrollment and valid practice certificate',
      'Proficiency in Hindi and English (legal drafting in both)',
      'Strong organizational and time management skills',
    ],
    datePosted: '2026-02-01',
    validThrough: '2026-06-30',
  },
  {
    id: 'junior-associate-environmental',
    title: 'Junior Associate — Environmental Law',
    department: 'Environmental & Regulatory',
    type: 'Full-time',
    experience: '1-3 years',
    location: 'Delhi',
    description:
      'Opportunity to join our specialized environmental law practice assisting in NGT proceedings, CAQM matters, and environmental regulatory compliance. Ideal for candidates passionate about environmental protection.',
    responsibilities: [
      'Research environmental law issues and prepare case summaries',
      'Assist in drafting responses for NGT and CAQM proceedings',
      'Monitor environmental regulatory developments and compliance requirements',
      'Support senior counsel in High Court environmental matters',
      'Coordinate with government agencies and regulatory bodies',
    ],
    qualifications: [
      'LL.B. from a recognized university (environmental law specialization preferred)',
      '1-3 years of litigation experience (environmental law experience a plus)',
      'Bar Council enrollment and valid practice certificate',
      'Familiarity with Environment Protection Act, NGT Act, and Forest Conservation Act',
      'Strong research aptitude and attention to detail',
    ],
    datePosted: '2026-02-01',
    validThrough: '2026-06-30',
  },
  {
    id: 'legal-research-intern',
    title: 'Legal Research Intern',
    department: 'Research & Publications',
    type: 'Internship',
    experience: 'Law students (3rd year onwards)',
    location: 'Delhi',
    description:
      'A prestigious internship opportunity with direct mentorship from Dr. Abhishek Atrey. Interns gain hands-on experience in Supreme Court practice, legal research, and publication writing.',
    responsibilities: [
      'Conduct legal research on assigned constitutional and environmental law topics',
      'Assist in preparing case briefs and compilation of judgments',
      'Observe Supreme Court and High Court proceedings',
      'Contribute to research articles and legal publications',
      'Assist with client documentation and case management',
    ],
    qualifications: [
      'Currently enrolled in LL.B. (3-year or 5-year program, 3rd year onwards)',
      'Strong academic record with interest in constitutional or environmental law',
      'Excellent research and writing skills in English',
      'Proficiency in legal databases (SCC Online, Manupatra)',
      'Available for minimum 4-week in-person internship in Delhi',
    ],
    datePosted: '2026-02-01',
    validThrough: '2026-12-31',
  },
  {
    id: 'legal-secretary',
    title: 'Legal Secretary',
    department: 'Administration',
    type: 'Full-time',
    experience: '2-4 years',
    location: 'Delhi',
    description:
      'We seek an experienced Legal Secretary to manage daily office operations, coordinate court filings, and provide administrative support to the legal team.',
    responsibilities: [
      'Manage court filing schedules, listing dates, and cause list monitoring',
      'Coordinate with registry, court staff, and opposing counsel',
      'Maintain organized case files and documentation systems',
      'Handle client communications and appointment scheduling',
      'Oversee general office administration and billing',
    ],
    qualifications: [
      'Graduate degree (law background preferred but not required)',
      '2-4 years of experience in a law firm or legal department',
      'Proficiency in MS Office and legal management software',
      'Excellent organizational and communication skills in Hindi and English',
      'Knowledge of court filing procedures is a strong advantage',
    ],
    datePosted: '2026-02-01',
    validThrough: '2026-06-30',
  },
];

export const BENEFITS = [
  {
    title: 'Supreme Court Exposure',
    description: 'Work directly on Supreme Court matters with an Advocate-on-Record. Gain unmatched appellate litigation experience.',
    icon: 'Landmark',
  },
  {
    title: 'Mentorship by Dr. Atrey',
    description: 'Learn from 29+ years of expertise. Direct mentorship in constitutional law, government litigation, and courtroom advocacy.',
    icon: 'GraduationCap',
  },
  {
    title: 'Publication Opportunities',
    description: 'Contribute to legal publications, research articles, and books. Build your academic profile alongside practice.',
    icon: 'BookOpen',
  },
  {
    title: 'Government Case Experience',
    description: "As 'A' Panel Counsel, we handle matters for ISRO, Indian Army, NSG, and Railways. Exposure to landmark government cases.",
    icon: 'Building2',
  },
  {
    title: 'Professional Growth',
    description: 'Clear career progression from intern to associate to partner. We invest in your development with regular training and court exposure.',
    icon: 'TrendingUp',
  },
  {
    title: 'Work-Life Balance',
    description: 'Structured working hours, supportive team environment, and genuine respect for personal time and well-being.',
    icon: 'Heart',
  },
];
