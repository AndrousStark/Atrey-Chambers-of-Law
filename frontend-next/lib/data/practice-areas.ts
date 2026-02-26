export interface PracticeArea {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  fullDescription: string[];
  icon: string;
  keyMatters: string[];
  relatedArticles: string[];
}

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    slug: 'constitutional-law-pil',
    title: 'Constitutional Law & Public Interest Litigation',
    shortTitle: 'Constitutional Law & PIL',
    description: 'Expert representation in fundamental rights, constitutional challenges, and public interest litigation before the Supreme Court and High Courts of India.',
    fullDescription: [
      'Our constitutional law practice is at the core of what we do. With Dr. Abhishek Atrey\'s 29+ years of experience as an Advocate-on-Record, we handle matters involving fundamental rights, constitutional validity of legislation, and landmark public interest litigation.',
      'We have represented the Government of India, State Governments, and private parties in significant constitutional matters before the Supreme Court of India. Our expertise covers Articles 12 through 35 (Fundamental Rights), writs under Articles 32 and 226, and challenges to legislative and executive action.',
    ],
    icon: 'Scale',
    keyMatters: [
      'Fundamental Rights litigation under Articles 14, 19, 21',
      'Writ Petitions (Habeas Corpus, Mandamus, Certiorari, Prohibition, Quo Warranto)',
      'Constitutional validity challenges',
      'Public Interest Litigation (PIL)',
      'Separation of Powers disputes',
      'Federal disputes between Centre and States',
    ],
    relatedArticles: [
      'A Himalayan Task — on Uniform Civil Code',
      'Separation of Powers — States and Union Territories',
      'Framework and Challenges to CAA and NRC',
    ],
  },
  {
    slug: 'supreme-court-litigation',
    title: 'Supreme Court Litigation (AOR)',
    shortTitle: 'Supreme Court Litigation',
    description: 'As an Advocate-on-Record since 2006, Dr. Atrey provides direct filing and comprehensive representation before the Supreme Court of India.',
    fullDescription: [
      'As one of the select Advocates-on-Record designated by the Supreme Court of India, Dr. Abhishek Atrey holds the exclusive right to file cases and appear directly before the apex court. This designation, obtained in 2006 after rigorous examination, represents the highest tier of Supreme Court practice.',
      'Our Supreme Court practice covers the full spectrum of original, appellate, and advisory jurisdiction, including Special Leave Petitions, Civil Appeals, Criminal Appeals, Transfer Petitions, and Review Petitions. With 500+ cases argued, we bring unmatched depth of experience.',
    ],
    icon: 'Landmark',
    keyMatters: [
      'Special Leave Petitions (SLP)',
      'Civil and Criminal Appeals',
      'Transfer Petitions',
      'Original Jurisdiction matters',
      'Review and Curative Petitions',
      'Advisory opinions under Article 143',
    ],
    relatedArticles: [
      'Important Judgments of Supreme Court: An Analysis',
      'Contempt of Most Powerful Court @ Re.1',
    ],
  },
  {
    slug: 'environmental-law-ngt',
    title: 'Environmental Law & National Green Tribunal',
    shortTitle: 'Environmental Law & NGT',
    description: 'Specialized expertise in environmental litigation, NGT proceedings, and regulatory compliance with extensive experience as Standing Counsel for MoEFCC.',
    fullDescription: [
      'Dr. Atrey served as Standing Counsel for the Ministry of Environment, Forest & Climate Change (MoEFCC) at the National Green Tribunal from 2015 to 2018. This deep institutional experience gives our firm unmatched insight into environmental law and regulatory proceedings.',
      'We handle matters ranging from environmental clearance challenges, forest conservation disputes, pollution control enforcement, to wildlife protection cases. Our practice extends to the Commission for Air Quality Management (CAQM), where Dr. Atrey currently serves as Senior Panel Counsel.',
    ],
    icon: 'TreePine',
    keyMatters: [
      'National Green Tribunal proceedings',
      'Environmental Impact Assessment challenges',
      'Forest Conservation Act matters',
      'Air and Water Pollution cases',
      'Wildlife Protection Act enforcement',
      'CAQM proceedings and air quality regulation',
    ],
    relatedArticles: [
      'Ecology and Environment: Crisis and Remedies',
    ],
  },
  {
    slug: 'government-litigation',
    title: 'Government & Public Sector Litigation',
    shortTitle: 'Government Litigation',
    description: "Representing the Union of India, State Governments, and public sector bodies as 'A' Panel Counsel with proven track record in sovereign litigation.",
    fullDescription: [
      "As 'A' Panel Counsel for the Government of India at the Supreme Court since 2014, and Standing Counsel for the Government of Uttarakhand, Dr. Atrey has extensive experience representing sovereign entities in the highest courts of India.",
      'Our government litigation practice covers matters involving ISRO, Indian Army, NSG, Ministry of Railways, Ministry of Environment, Comptroller and Auditor General, Indian Postal Services, and numerous other government bodies. We understand the unique demands and protocols of representing the state.',
    ],
    icon: 'Building2',
    keyMatters: [
      'Union of India representation in Supreme Court',
      'State Government matters before apex court',
      'Public sector undertaking disputes',
      'Service and employment matters',
      'Government contract disputes',
      'Regulatory and administrative law',
    ],
    relatedArticles: [
      'Tussle for Power — Delhi Government and LG',
      'Finance Act, 2017: A Fight for Supremacy',
    ],
  },
  {
    slug: 'temple-rights-religious-law',
    title: 'Temple Rights & Religious Law',
    shortTitle: 'Temple Rights & Religious Law',
    description: 'Advocacy for temple rights, religious freedom, and matters of Hindu dharmic law including landmark temple management and protection cases.',
    fullDescription: [
      'Our practice in temple rights and religious law reflects a deep commitment to protecting the rights of Hindu temples and religious institutions. We handle matters involving temple management, endowment disputes, religious property protection, and freedom of religion under Articles 25–28 of the Constitution.',
      'We provide expert counsel on the legal framework governing Hindu religious institutions, including the Hindu Religious Institutions and Charitable Endowments Act, and state-specific temple management legislation.',
    ],
    icon: 'Building',
    keyMatters: [
      'Temple management and governance disputes',
      'Religious endowment matters',
      'Freedom of religion litigation (Articles 25–28)',
      'Temple property protection',
      'Anti-conversion law challenges',
      'Religious institution regulatory compliance',
    ],
    relatedArticles: [
      'Anti Conversion Laws and their Constitutionality',
    ],
  },
  {
    slug: 'criminal-law',
    title: 'Criminal Law & Defense',
    shortTitle: 'Criminal Law & Defense',
    description: 'Vigorous defense representation in criminal matters including bail applications, criminal appeals, and white-collar crime defense.',
    fullDescription: [
      'Our criminal law practice provides robust defense representation across the full spectrum of criminal matters. From bail applications to criminal appeals before the Supreme Court, we bring strategic thinking and courtroom experience to every case.',
      'Dr. Atrey\'s book "Law of Witnesses: Role of Witnesses in Criminal Justice System, A Need to Reform" — with a foreword by Hon\'ble Mr. Justice T.S. Thakur — reflects his scholarly expertise in criminal procedure and evidence law.',
    ],
    icon: 'Shield',
    keyMatters: [
      'Bail applications (anticipatory, regular, default)',
      'Criminal appeals before Supreme Court and High Courts',
      'Quashing of FIR proceedings',
      'White-collar and economic offenses',
      'Criminal contempt matters',
      'Victim representation',
    ],
    relatedArticles: [
      'No Set Formula for Bail',
      'Law of Contempt Versus Independence of Judiciary',
    ],
  },
  {
    slug: 'civil-commercial-litigation',
    title: 'Civil & Commercial Litigation',
    shortTitle: 'Civil & Commercial Litigation',
    description: 'Comprehensive civil litigation services including contract disputes, property matters, arbitration, and commercial law before all courts and tribunals.',
    fullDescription: [
      'Our civil and commercial litigation practice handles complex disputes across multiple forums — from district courts to the Supreme Court. We bring strategic advocacy to contract disputes, property litigation, recovery proceedings, injunction matters, and commercial arbitration.',
      'With a deep understanding of civil procedure and commercial law, we represent a diverse clientele including corporations, financial institutions, real estate developers, and individual litigants.',
    ],
    icon: 'Briefcase',
    keyMatters: [
      'Contract disputes and enforcement',
      'Property and real estate litigation',
      'Commercial arbitration',
      'Recovery and insolvency proceedings',
      'Injunction and specific performance',
      'Partnership and LLP disputes',
    ],
    relatedArticles: [
      'Risky Business: Doctrine of Frustration',
    ],
  },
  {
    slug: 'waqf-property-law',
    title: 'Waqf & Property Law',
    shortTitle: 'Waqf & Property Law',
    description: 'Expert representation in Waqf property disputes, land acquisition matters, and property law with deep constitutional law perspective.',
    fullDescription: [
      'Our practice in Waqf and property law combines expertise in religious property law with constitutional analysis. We handle complex disputes involving Waqf property claims, land acquisition challenges, and property rights litigation.',
      'Dr. Atrey has written extensively on the Waqf Act and its constitutional implications, bringing scholarly depth to every property dispute we handle.',
    ],
    icon: 'Home',
    keyMatters: [
      'Waqf property disputes',
      'Land acquisition challenges',
      'Title and ownership disputes',
      'Encroachment and eviction matters',
      'Revenue and mutation proceedings',
      'Property registration disputes',
    ],
    relatedArticles: [
      'Waqf Act — Playing with the Constitution',
    ],
  },
  {
    slug: 'air-quality-regulation',
    title: 'Air Quality & Environmental Regulation (CAQM)',
    shortTitle: 'Air Quality Regulation',
    description: 'Specialized practice in air quality management, CAQM proceedings, and environmental regulatory compliance as Senior Panel Counsel.',
    fullDescription: [
      'As Senior Panel Counsel for the Commission for Air Quality Management (CAQM) in the NCR and Adjoining Areas since 2022, Dr. Atrey has developed specialized expertise in air quality regulation and environmental compliance.',
      'This niche practice covers proceedings before the CAQM, Delhi High Court, and NGT involving air quality standards, pollution control measures, GRAP implementation, and regulatory enforcement in the National Capital Region.',
    ],
    icon: 'Wind',
    keyMatters: [
      'CAQM proceedings and compliance',
      'Graded Response Action Plan (GRAP) matters',
      'Air pollution control enforcement',
      'Industrial emission standards',
      'Stubble burning regulation',
      'NCR environmental compliance',
    ],
    relatedArticles: [],
  },
  {
    slug: 'university-education-law',
    title: 'University & Education Law (AIU)',
    shortTitle: 'University & Education Law',
    description: 'Legal counsel for universities and educational institutions as Panel Counsel for the Association of Indian Universities.',
    fullDescription: [
      'As Panel Counsel for the Association of Indian Universities (AIU) before the Supreme Court of India and High Court of Delhi since 2020, Dr. Atrey brings specialized expertise in education law and university governance.',
      'Our practice covers matters involving university recognition, degree equivalence, examination disputes, faculty service matters, and regulatory compliance with UGC, AICTE, and other educational regulatory bodies.',
    ],
    icon: 'GraduationCap',
    keyMatters: [
      'University recognition and equivalence disputes',
      'UGC and AICTE regulatory matters',
      'Examination and admission disputes',
      'Faculty and staff service matters',
      'Education policy implementation',
      'Affiliation and accreditation issues',
    ],
    relatedArticles: [],
  },
];

export function getPracticeArea(slug: string): PracticeArea | undefined {
  return PRACTICE_AREAS.find((pa) => pa.slug === slug);
}
