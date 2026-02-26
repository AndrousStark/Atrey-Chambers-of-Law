export interface TeamMember {
  slug: string;
  name: string;
  title: string;
  subtitle: string;
  photo: string | null;
  initials: string;
  degrees: string;
  bio: string[];
  education: { degree: string; institution: string; year?: string }[];
  experience: { role: string; org: string; period?: string; detail?: string }[];
  empanelments?: string[];
  practiceAreas: string[];
  books?: { title: string; publisher: string; year: string; foreword?: string }[];
  articles?: { title: string; source: string; year: string }[];
  mediaAppearances?: { show: string; channel: string; dates: string }[];
  speakingEngagements?: string[];
  achievements?: string[];
  certifications?: { name: string; issuer: string }[];
  skills?: { category: string; items: string[] }[];
  publications?: { title: string; source: string; year: string }[];
  links: { label: string; url: string; icon: string }[];
  stats: { value: string; label: string; numericValue?: number }[];
  isAttorney: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    slug: 'abhishek-atrey',
    name: 'Dr. Abhishek Atrey',
    title: 'Founder & Managing Partner',
    subtitle: 'Advocate-on-Record, Supreme Court of India',
    photo: '/dr-abhishek-atrey.jpg',
    initials: 'AA',
    degrees: 'LL.D., LL.M., LL.B., B.Sc.',
    bio: [
      'Dr. Abhishek Atrey is a distinguished Supreme Court Advocate and Advocate-on-Record with nearly three decades of exceptional legal practice. Enrolled as an Advocate in 1997 and designated as Advocate-on-Record by the Supreme Court of India in 2006, he has represented the Government of India, State Governments, public sector undertakings, and significant institutions in landmark proceedings before the Supreme Court, High Courts, National Green Tribunal, and various tribunals across India.',
      'A prolific legal scholar, he has authored 3 books — including "Law of Witnesses" with a foreword by Hon\'ble Mr. Justice T.S. Thakur — published 20+ articles in leading legal journals, and made over 30 appearances on national television channels including Rajya Sabha TV, Sansad TV, and APN News, providing expert commentary on constitutional and legal matters of national importance.',
      'His distinguished service includes appointments as \'A\' Panel Counsel for Government of India at the Supreme Court (since 2014), Standing Counsel for the Government of Uttarakhand, Standing Counsel for MoEFCC at the National Green Tribunal, Panel Counsel for the Association of Indian Universities, and Senior Panel Counsel for the Commission for Air Quality Management.',
    ],
    education: [
      { degree: 'LL.D. (Doctor of Laws)', institution: 'University', year: '2012' },
      { degree: 'LL.M. (Master of Laws)', institution: 'University', year: '1999' },
      { degree: 'LL.B. (Bachelor of Laws)', institution: 'University', year: '1997' },
      { degree: 'B.Sc. (Bachelor of Science)', institution: 'University', year: '1992' },
    ],
    experience: [
      { role: 'Founder & Managing Partner', org: 'Atrey Chambers of Law LLP', detail: 'Full-service law firm under the LLP Act, 2008' },
      { role: 'Advocate-on-Record', org: 'Supreme Court of India', period: 'Since 2006', detail: 'Designated AoR practicing constitutional, civil, and public interest litigation' },
      { role: "'A' Panel Counsel for Government of India", org: 'Supreme Court of India', period: 'Since 2014', detail: 'Senior panel representing the Union of India' },
      { role: 'Standing Counsel for Govt. of Uttarakhand', org: 'Supreme Court of India', period: 'Since 2007', detail: 'Representing the State in all matters before the apex court' },
      { role: 'Standing Counsel for MoEFCC', org: 'National Green Tribunal', period: '2015–2018', detail: 'Ministry of Environment, Forest & Climate Change' },
      { role: 'Panel Counsel', org: 'Association of Indian Universities', period: 'Since 2020', detail: 'Supreme Court of India and High Court of Delhi' },
      { role: 'Senior Panel Counsel', org: 'CAQM (Commission for Air Quality Management)', period: 'Since 2022', detail: 'Delhi High Court and National Green Tribunal' },
      { role: 'Vice President', org: 'Supreme Court Young Lawyer\'s Forum' },
      { role: 'Coordinator', org: 'Adhivakta Parishad, Supreme Court', period: '2016–2018' },
      { role: 'President', org: 'Dard Se Hamdard Tak (NGO)', detail: 'Welfare of poor prisoners in India' },
    ],
    empanelments: [
      'Standing Counsel for Govt. of Uttarakhand in Supreme Court (since 2007)',
      "'A' Panel Counsel for Government of India in Supreme Court (since 2014)",
      'Standing Counsel for MoEFCC in National Green Tribunal (2015–2018)',
      'Panel Counsel for Association of Indian Universities — SC & Delhi HC (since 2020)',
      'Senior Panel Counsel for CAQM — Delhi HC & NGT (since 2022)',
    ],
    practiceAreas: [
      'Constitutional Law & PIL',
      'Supreme Court Litigation (AOR)',
      'Environmental Law & NGT',
      'Government & Public Sector Litigation',
      'Temple Rights & Religious Law',
      'Criminal Law & Defense',
      'Civil & Commercial Litigation',
      'Waqf & Property Law',
      'Air Quality & Environmental Regulation (CAQM)',
      'University & Education Law (AIU)',
    ],
    books: [
      {
        title: 'Law of Writs, Practice & Procedure',
        publisher: 'Kamal Publishers (Lawman), New Delhi',
        year: 'August 2014',
      },
      {
        title: 'Law of Witnesses: Role of Witnesses in Criminal Justice System, A Need to Reform',
        publisher: 'Kamal Publishers (Lawman), New Delhi',
        year: 'March 2015',
        foreword: "Hon'ble Mr. Justice T.S. Thakur, Judge, Supreme Court of India",
      },
      {
        title: 'Yadein (यादें) — Hindi Poems',
        publisher: 'Hindi Poetry Collection',
        year: '2019',
      },
    ],
    articles: [
      { title: 'A Himalayan Task — on Uniform Civil Code', source: 'India Legal Magazine', year: 'June 2023' },
      { title: 'Separation of Powers — States and Union Territories', source: 'India Legal Magazine', year: 'April 2023' },
      { title: 'No Set Formula for Bail', source: 'India Legal Magazine', year: 'March 2023' },
      { title: 'Tussle for Power — Delhi Government and LG', source: 'India Legal Magazine', year: 'January 2023' },
      { title: 'Age of Consent', source: 'India Legal Magazine', year: 'January 2023' },
      { title: 'A Matter of Choice', source: 'India Legal Magazine', year: 'November 2022' },
      { title: 'Judging the Judges', source: 'India Legal Magazine', year: 'October 2022' },
      { title: 'Waqf Act — Playing with the Constitution', source: 'Dainik Jagran Newspaper', year: 'October 2022' },
      { title: "China's Land Border Law: A Serious Concern for India", source: 'India Legal Live', year: 'January 2022' },
      { title: 'Anti Conversion Laws and their Constitutionality', source: 'India Legal Live', year: 'January 2021' },
      { title: 'Farm Laws 2020: Beginning of a New Era', source: 'India Legal Live', year: 'January 2021' },
      { title: 'Contempt of Most Powerful Court @ Re.1', source: 'India Legal Live', year: 'September 2020' },
      { title: 'Law of Contempt Versus Independence of Judiciary', source: 'India Legal Live', year: 'August 2020' },
      { title: 'Dilution of Labour Laws: Is this the Package', source: 'India Legal Live', year: 'May 2020' },
      { title: 'Risky Business: Doctrine of Frustration', source: 'India Legal Live', year: 'May 2020' },
      { title: 'Framework and Challenges to CAA and NRC', source: 'India Legal Live', year: 'January 2020' },
      { title: 'Important Judgments of Supreme Court: An Analysis', source: 'Nyay Pravah', year: 'Oct–Dec 2018' },
      { title: 'Ecology and Environment: Crisis and Remedies', source: 'Nyay Pravah', year: 'Apr–Jun 2017' },
      { title: 'Finance Act, 2017: A Fight for Supremacy', source: 'Nyay Pravah', year: 'Jul–Sep 2017' },
    ],
    mediaAppearances: [
      { show: 'Desh Deshantar', channel: 'Rajya Sabha TV / Sansad TV', dates: '2018–2021 (6+ appearances)' },
      { show: 'Law of the Land', channel: 'Rajya Sabha TV', dates: '2018–2019 (5+ appearances)' },
      { show: 'Big Picture', channel: 'Rajya Sabha TV', dates: 'January 2019' },
      { show: 'Nyay Chakra', channel: 'Lok Sabha TV', dates: 'February 2019' },
      { show: 'Aapka Kanoon', channel: 'Rajya Sabha TV', dates: 'December 2019' },
      { show: 'Policy Watch', channel: 'Rajya Sabha TV', dates: 'November 2020' },
      { show: 'Aaj Ki Charcha', channel: 'Rajya Sabha TV', dates: '2020–2021' },
      { show: 'Bills and Acts', channel: 'Sansad TV', dates: '2022–2023' },
      { show: 'Loktantra', channel: 'APN News', dates: '2020–2021 (7+ appearances)' },
      { show: 'Legal Helpline', channel: 'APN News', dates: '2021 (6+ appearances)' },
      { show: 'Mudda', channel: 'APN News', dates: 'July 2021' },
      { show: 'Murder Mystery', channel: 'News India', dates: 'January 2023' },
    ],
    speakingEngagements: [
      'Guest Speaker — BPS Girls University (2012–2014) — Annual Teachers Training Program',
      'Speaker — Seminar on Ecology, Environment & Role of Lawyers — Srinagar, J&K (2016)',
      'Chief Guest — IPEM College, Ghaziabad — Law Day Lecture on Environmental Threats (2016)',
      'Main Speaker — Uttarakhand Judicial Academy, Nainital — Environmental Laws for Trainee Judges (2018)',
      'Judge — National Moot Court Competitions — IP University, Delhi (2014–2016)',
      'Guest Speaker — North East Green Summit — IIT Guwahati (2019)',
      'Chairperson — International Seminar — SOA University, Bhubaneswar (2019)',
      'Guest Speaker — Vishwa Samvad Kendra Conclave — Gautam Budh University (2023)',
    ],
    achievements: [
      "Awarded 'Nyaymurti Prem Shankar Gupt Hindi Sahitya Samman' by Akhil Bhartiya Hindi Vidhi Pratishthan (2021)",
      'Drafted Municipal Bye-Laws for NOIDA Authority',
      "Published 3 books including foreword by Justice T.S. Thakur of Supreme Court",
      'Published 20+ articles in leading legal journals and national newspapers',
      '30+ television appearances as legal expert on national channels',
      'Represented Government of India in landmark environmental and constitutional cases',
    ],
    links: [
      { label: 'Email', url: 'mailto:abhishek@atreychambers.com', icon: 'email' },
      { label: 'Phone', url: 'tel:+919810047556', icon: 'phone' },
      { label: 'Atrey Chambers', url: 'https://www.atreychambers.com', icon: 'web' },
    ],
    stats: [
      { value: '29+', label: 'Years of Practice', numericValue: 29 },
      { value: 'AoR', label: 'Supreme Court' },
      { value: '500+', label: 'Cases Argued', numericValue: 500 },
      { value: '3', label: 'Books Authored', numericValue: 3 },
      { value: '20+', label: 'Articles Published', numericValue: 20 },
      { value: '30+', label: 'TV Appearances', numericValue: 30 },
    ],
    isAttorney: true,
  },
  {
    slug: 'ambika-atrey',
    name: 'Mrs. Ambika Atrey',
    title: 'Partner',
    subtitle: 'Advocate, Bar Council of Delhi',
    photo: null,
    initials: 'AA',
    degrees: 'M.Com., LL.M.',
    bio: [
      'Mrs. Ambika Atrey is a distinguished partner at Atrey Chambers of Law LLP. With a Master of Commerce and Master of Laws, she brings a unique combination of commercial acumen and legal expertise to the firm.',
      'Enrolled with the Bar Council of Delhi in 2009, Mrs. Atrey has developed extensive expertise across multiple practice areas. Her meticulous approach and dedication complement the firm\'s commitment to delivering exceptional legal services to its diverse clientele.',
    ],
    education: [
      { degree: 'LL.M. (Master of Laws)', institution: 'University' },
      { degree: 'M.Com. (Master of Commerce)', institution: 'University' },
    ],
    experience: [
      { role: 'Partner', org: 'Atrey Chambers of Law LLP', period: 'Since 2009' },
    ],
    practiceAreas: [
      'Civil & Commercial Litigation',
      'Real Estate & Property Law',
      'Family & Matrimonial Law',
      'Consumer Law',
    ],
    links: [
      { label: 'Email', url: 'mailto:support@atreychambers.com', icon: 'email' },
    ],
    stats: [
      { value: '15+', label: 'Years of Practice', numericValue: 15 },
      { value: 'Partner', label: 'Atrey Chambers' },
    ],
    isAttorney: true,
  },
  {
    slug: 'aniruddh-atrey',
    name: 'Aniruddh Atrey',
    title: 'Director of Technology',
    subtitle: 'AI Engineer | Cybersecurity Specialist | Entrepreneur',
    photo: '/aniruddh-atrey.png',
    initials: 'AN',
    degrees: 'M.S. (CS), B.Tech (CSE)',
    bio: [
      'Aniruddh Atrey is a technology entrepreneur, AI engineer, and cybersecurity specialist with 6+ years of experience building systems that protect, automate, and scale. He holds a Master of Science in Computer Science from the University of Florida and 18+ professional certifications from Stanford, Google, Cisco, EC-Council, IBM, and ISO.',
      'As Co-Founder & COO of F1Jobs.io and Founder & CTO of MetaMinds, he has architected AI systems with 95% precision, secured 50+ government web assets for the Ministry of Defence of India at INNEFU Labs (DRDO), and shipped production platforms at Arlo Technologies with 99.9% availability.',
    ],
    education: [
      { degree: 'M.S. in Computer Science', institution: 'University of Florida, USA', year: '2023–2024' },
      { degree: 'B.Tech in Computer Science & Engineering', institution: 'Amity University, India', year: '2019–2023' },
    ],
    experience: [
      { role: 'Co-Founder & COO', org: 'F1Jobs.io (NeuraScribe Inc)', detail: 'Career acceleration platform for global tech workforce' },
      { role: 'Founder & CTO', org: 'MetaMinds', detail: 'AI automation startup — RAG pipelines, LLM orchestration, AI agents' },
      { role: 'Data Science Engineer', org: 'SaveLIFE Foundation', detail: 'Road safety data science pipelines across India' },
      { role: 'Cybersecurity Engineer', org: 'INNEFU Labs (DRDO)', detail: 'Secured 50+ government web assets for Ministry of Defence' },
      { role: 'Software Engineer', org: 'Arlo Technologies', detail: 'AI-driven IoT solutions, 99.9% availability' },
    ],
    practiceAreas: [
      'AI/ML Engineering & Data Science',
      'Cybersecurity & VAPT',
      'Full-Stack Development',
      'Cloud Architecture & DevOps',
      'Legal Tech & Automation',
      'UI/UX Design & Brand Identity',
    ],
    certifications: [
      { name: 'Machine Learning Specialization', issuer: 'Stanford University' },
      { name: 'Cybersecurity Professional Certificate', issuer: 'Google' },
      { name: 'CCNA Enterprise Networking', issuer: 'Cisco' },
      { name: 'Ethical Hacking Essentials', issuer: 'EC-Council' },
      { name: 'ISO/IEC 27001 Information Security', issuer: 'SkillFront' },
      { name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI' },
      { name: 'AWS Cloud Practitioner Essentials', issuer: 'Amazon Web Services' },
      { name: 'Full-Stack Web Development', issuer: 'Meta' },
    ],
    publications: [
      { title: 'Real-Time Temperature Based Food Recommendation using AI', source: 'IEEE Xplore, 14th ICCCNT, IIT-Delhi', year: '2023' },
      { title: 'Urban Digital Twins for Sustainability: Singapore & Indian Smart Cities', source: 'IEEE Xplore, 2nd Global AI Summit', year: '2025' },
      { title: 'Perspective of Cyber Security and Ethical Hacking with VAET', source: 'Book Chapter — Big Data Analytics Framework', year: '2023' },
    ],
    skills: [
      { category: 'AI / Machine Learning', items: ['Python', 'TensorFlow', 'PyTorch', 'RAG Pipelines', 'LLM Fine-tuning', 'AI Agents', 'NLP'] },
      { category: 'Cybersecurity', items: ['VAPT', 'OWASP Top 10', 'Penetration Testing', 'MITRE ATT&CK', 'Incident Response'] },
      { category: 'Full-Stack', items: ['React', 'Next.js', 'Django', 'FastAPI', 'Node.js', 'PostgreSQL', 'MongoDB'] },
      { category: 'Cloud & DevOps', items: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'] },
      { category: 'Design', items: ['Figma', 'Three.js', 'GSAP', 'UI/UX Design'] },
    ],
    achievements: [
      '50+ Government web assets secured for Ministry of Defence (DRDO)',
      '3 IEEE / Book Chapter publications',
      '18+ professional certifications from Stanford, Google, Cisco, IBM',
      '2025 Webby Awards Winner — Best Home Page',
      'GSAP Site of the Month — Oct & Nov 2024',
    ],
    links: [
      { label: 'Portfolio', url: 'https://aniruddhatrey.com', icon: 'web' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/aniruddhatrey', icon: 'linkedin' },
      { label: 'GitHub', url: 'https://github.com/AndrousStark', icon: 'github' },
      { label: 'Email', url: 'mailto:atreyaniruddh@gmail.com', icon: 'email' },
    ],
    stats: [
      { value: '50+', label: 'Govt Assets Secured', numericValue: 50 },
      { value: '18+', label: 'Certifications', numericValue: 18 },
      { value: '3', label: 'IEEE Publications', numericValue: 3 },
      { value: '6+', label: 'Years Experience', numericValue: 6 },
    ],
    isAttorney: false,
  },
];

export function getTeamMember(slug: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.slug === slug);
}
