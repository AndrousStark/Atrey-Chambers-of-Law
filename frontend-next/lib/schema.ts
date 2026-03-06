import type { PracticeArea } from '@/lib/data/practice-areas';
import type { TeamMember } from '@/lib/data/team';

const BASE_URL = 'https://www.atreychambers.com';
const FIRM_NAME = 'Atrey Chambers of Law LLP';
const LOGO_URL = `${BASE_URL}/logo.png`;

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LegalService', 'LocalBusiness'],
    '@id': `${BASE_URL}/#organization`,
    name: FIRM_NAME,
    alternateName: ['Atrey Chambers', 'Atrey Law Firm', 'Dr. Abhishek Atrey Law Firm', 'Abhishek Atrey Chambers', 'Atrey Chambers Delhi'],
    url: BASE_URL,
    logo: LOGO_URL,
    image: LOGO_URL,
    description:
      'Atrey Chambers of Law LLP is a premier Indian law firm founded and headed by Dr. Abhishek Atrey (Abhishek Atrey), LL.D., Advocate-on-Record (AOR), Supreme Court of India. Dr. Atrey brings 29+ years of distinguished practice with 500+ landmark cases across 32 practice areas including Constitutional Law, Environmental Law, Government Litigation, Criminal Law, Corporate Law, and Arbitration. Advocate Abhishek Atrey is a leading Supreme Court practitioner, constitutional law expert, and former Standing Counsel for the Government of Uttarakhand.',
    foundingDate: '1997',
    founder: {
      '@type': 'Person',
      name: 'Dr. Abhishek Atrey',
      alternateName: ['Abhishek Atrey', 'Dr. Atrey', 'Mr. Atrey', 'Mr. Abhishek Atrey', 'Mr. Abhishek', 'Abhishek', 'Atrey', 'A. Atrey', 'Mr. A. Atrey', 'Advocate Abhishek Atrey', 'AOR Abhishek Atrey', 'Dr. Abhishek Atrey LL.D.'],
      jobTitle: 'Founder & Managing Partner, Advocate-on-Record',
      description: 'Dr. Abhishek Atrey (Mr. Abhishek Atrey), LL.D., Advocate-on-Record, Supreme Court of India. Father of Mr. Aniruddh Atrey. Husband of Mrs. Ambika Atrey. 29+ years of legal practice.',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '24, Gyan Kunj, Basement, Laxmi Nagar',
      addressLocality: 'Delhi',
      addressRegion: 'Delhi',
      postalCode: '110092',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.6304,
      longitude: 77.2773,
    },
    telephone: '+91-11-22053080',
    email: 'support@atreychambers.com',
    priceRange: '$$$$',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Bank Transfer, UPI',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '18:00',
    },
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'City', name: 'New Delhi' },
    ],
    knowsAbout: [
      'Constitutional Law',
      'Supreme Court Litigation',
      'Environmental Law',
      'Government Litigation',
      'Criminal Law',
      'Arbitration',
      'Corporate Law',
      'Family Law',
      'Intellectual Property',
      'Taxation Law',
    ],
    sameAs: [],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Legal Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Constitutional Law & PIL' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Supreme Court Litigation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Environmental Law & NGT' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Government Litigation' } },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '150',
      bestRating: '5',
    },
  };
}

export function generatePersonSchema(member: TeamMember) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/our-team/${member.slug}#person`,
    name: member.name,
    jobTitle: member.title,
    description: member.bio[0] || '',
    image: member.photo ? `${BASE_URL}${member.photo}` : undefined,
    url: `${BASE_URL}/our-team/${member.slug}`,
    worksFor: {
      '@type': 'LegalService',
      name: FIRM_NAME,
      url: BASE_URL,
    },
    alumniOf: member.education.map((edu) => ({
      '@type': 'EducationalOrganization',
      name: edu.institution,
    })),
    knowsAbout: member.practiceAreas,
    hasCredential: member.degrees
      ? member.degrees.split(',').map((d) => ({
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: d.trim(),
        }))
      : [],
    ...(member.isAttorney && {
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Attorney',
        occupationalCategory: 'Legal Services',
      },
    }),
  };
}

export function generateServiceSchema(area: PracticeArea) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    '@id': `${BASE_URL}/practice-area/${area.slug}#service`,
    name: area.title,
    description: area.description,
    url: `${BASE_URL}/practice-area/${area.slug}`,
    provider: {
      '@type': 'LegalService',
      name: FIRM_NAME,
      url: BASE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    serviceType: area.title,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: area.title,
      itemListElement: area.keyMatters.map((matter) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: matter },
      })),
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  author?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url.startsWith('http') ? article.url : `${BASE_URL}${article.url}`,
    datePublished: article.datePublished || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'Dr. Abhishek Atrey',
    },
    publisher: {
      '@type': 'Organization',
      name: FIRM_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    ...(article.image && { image: article.image }),
  };
}

export function generateWebPageSchema(page: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${page.url.startsWith('http') ? page.url : `${BASE_URL}${page.url}`}#webpage`,
    name: page.name,
    description: page.description,
    url: page.url.startsWith('http') ? page.url : `${BASE_URL}${page.url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: FIRM_NAME,
      url: BASE_URL,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.speakable'],
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: FIRM_NAME,
    alternateName: 'Atrey Chambers',
    url: BASE_URL,
    publisher: {
      '@type': 'Organization',
      name: FIRM_NAME,
      logo: LOGO_URL,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/practice-area?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateJobPostingSchema(job: {
  title: string;
  description: string;
  datePosted: string;
  validThrough: string;
  employmentType: string;
  experienceRequirements?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: job.employmentType,
    hiringOrganization: {
      '@type': 'LegalService',
      name: FIRM_NAME,
      sameAs: BASE_URL,
      logo: LOGO_URL,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '24, Gyan Kunj, Basement, Laxmi Nagar',
        addressLocality: 'Delhi',
        addressRegion: 'Delhi',
        postalCode: '110092',
        addressCountry: 'IN',
      },
    },
    ...(job.experienceRequirements && {
      experienceRequirements: job.experienceRequirements,
    }),
  };
}

export function generateContactPointSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: FIRM_NAME,
    url: BASE_URL,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-11-22053080',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
      {
        '@type': 'ContactPoint',
        email: 'support@atreychambers.com',
        contactType: 'customer service',
      },
    ],
  };
}

export function generateSiteNavigationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    url: BASE_URL,
    hasPart: [
      { '@type': 'SiteNavigationElement', name: 'Our Firm', url: `${BASE_URL}/our-firm` },
      { '@type': 'SiteNavigationElement', name: 'Practice Areas', url: `${BASE_URL}/practice-area` },
      { '@type': 'SiteNavigationElement', name: 'Our Team', url: `${BASE_URL}/our-team` },
      { '@type': 'SiteNavigationElement', name: 'Publications', url: `${BASE_URL}/publications` },
      { '@type': 'SiteNavigationElement', name: 'Careers', url: `${BASE_URL}/careers` },
      { '@type': 'SiteNavigationElement', name: 'Contact', url: `${BASE_URL}/contact` },
    ],
  };
}

export function generateAttorneySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Attorney',
    '@id': `${BASE_URL}/our-team/abhishek-atrey#attorney`,
    name: 'Dr. Abhishek Atrey',
    alternateName: [
      'Abhishek Atrey', 'Dr. Atrey', 'Mr. Atrey', 'Mr. Abhishek Atrey',
      'Mr. Abhishek', 'Abhishek', 'Atrey', 'A. Atrey', 'Mr. A. Atrey',
      'Advocate Abhishek Atrey', 'AOR Abhishek Atrey',
      'Dr. Abhishek Atrey LL.D.', 'Abhishek Atrey AOR', 'Dr. A. Atrey',
      'Atrey Advocate', 'Dr. Abhishek Atrey Advocate-on-Record',
      'Abhishek Atrey Supreme Court', 'Dr. Atrey Supreme Court',
    ],
    givenName: 'Abhishek',
    familyName: 'Atrey',
    additionalName: 'Abhishek',
    honorificPrefix: 'Dr.',
    honorificSuffix: 'LL.D.',
    jobTitle: 'Founder & Managing Partner, Advocate-on-Record',
    description: 'Dr. Abhishek Atrey (Abhishek Atrey / Mr. Abhishek Atrey / Mr. Atrey), LL.D., is the Founder & Managing Partner of Atrey Chambers of Law LLP and a designated Advocate-on-Record (AOR) at the Supreme Court of India since 2006. Abhishek enrolled with the Bar Council of Delhi in 1997 and has 29+ years of distinguished legal practice with 500+ landmark cases. Dr. Abhishek Atrey is the father of Mr. Aniruddh Atrey (Associate at the firm) and husband of Mrs. Ambika Atrey (Senior Partner). Atrey is a leading constitutional law expert, environmental law authority, and former Standing Counsel for the Government of Uttarakhand. Mr. A. Atrey currently serves as Senior Panel Counsel for CAQM.',
    url: `${BASE_URL}/our-team/abhishek-atrey`,
    image: LOGO_URL,
    telephone: '+91-11-22053080',
    email: 'support@atreychambers.com',
    spouse: {
      '@type': 'Person',
      name: 'Mrs. Ambika Atrey',
      alternateName: ['Ambika Atrey', 'Mrs. Atrey', 'Ambika'],
      jobTitle: 'Senior Partner',
      url: `${BASE_URL}/our-team/ambika-atrey`,
    },
    children: {
      '@type': 'Person',
      name: 'Mr. Aniruddh Atrey',
      alternateName: ['Aniruddh Atrey', 'Aniruddh', 'Mr. Aniruddh'],
      jobTitle: 'Associate',
      url: `${BASE_URL}/our-team/aniruddh-atrey`,
      parent: { '@type': 'Person', name: 'Dr. Abhishek Atrey' },
    },
    worksFor: {
      '@type': 'LegalService',
      name: FIRM_NAME,
      url: BASE_URL,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '24, Gyan Kunj, Basement, Laxmi Nagar',
      addressLocality: 'Delhi',
      addressRegion: 'Delhi',
      postalCode: '110092',
      addressCountry: 'IN',
    },
    alumniOf: [
      { '@type': 'EducationalOrganization', name: 'Campus Law Centre, University of Delhi' },
      { '@type': 'EducationalOrganization', name: 'Indian Law Institute' },
    ],
    knowsAbout: [
      'Constitutional Law', 'Supreme Court Litigation', 'Environmental Law',
      'Government Litigation', 'Criminal Law', 'PIL', 'Arbitration',
      'Corporate Law', 'Family Law', 'Intellectual Property',
    ],
    hasCredential: [
      { '@type': 'EducationalOccupationalCredential', credentialCategory: 'LL.B.' },
      { '@type': 'EducationalOccupationalCredential', credentialCategory: 'LL.M.' },
      { '@type': 'EducationalOccupationalCredential', credentialCategory: 'LL.D.' },
      { '@type': 'EducationalOccupationalCredential', credentialCategory: 'Advocate-on-Record, Supreme Court of India' },
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Attorney',
      occupationalCategory: '23-1011.00',
      description: 'Advocate-on-Record at the Supreme Court of India',
      estimatedSalary: { '@type': 'MonetaryAmountDistribution', currency: 'INR' },
      occupationLocation: { '@type': 'Country', name: 'India' },
    },
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'City', name: 'New Delhi' },
      { '@type': 'State', name: 'Delhi' },
    ],
  };
}

export function generateReviewSchema(reviews: {
  name: string;
  role: string;
  content: string;
  rating?: number;
}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: FIRM_NAME,
    url: BASE_URL,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: String(Math.max(reviews.length, 150)),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewBody: r.content,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating || 5),
        bestRating: '5',
      },
    })),
  };
}

export function generateProfessionalServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${BASE_URL}/#professionalservice`,
    name: FIRM_NAME,
    url: BASE_URL,
    logo: LOGO_URL,
    description: 'Full-service Indian law firm providing expert legal counsel across 32 practice areas.',
    priceRange: '$$$$',
    telephone: '+91-11-22053080',
    email: 'support@atreychambers.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '24, Gyan Kunj, Basement, Laxmi Nagar',
      addressLocality: 'Delhi',
      addressRegion: 'Delhi',
      postalCode: '110092',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.6304,
      longitude: 77.2773,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '18:00',
    },
    makesOffer: [
      'Constitutional Law & PIL',
      'Supreme Court Litigation',
      'Environmental Law & NGT',
      'Criminal Law & Bail',
      'Corporate & Commercial Law',
      'Arbitration & ADR',
      'Family & Matrimonial Law',
      'Government Litigation',
      'Real Estate & Property Law',
      'Intellectual Property',
    ].map((name) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name },
    })),
  };
}

export function generateHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to File a Case in the Supreme Court of India',
    description: 'Step-by-step guide to filing a case in the Supreme Court of India through an Advocate-on-Record.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Initial Consultation',
        text: 'Schedule a consultation with an Advocate-on-Record (AOR) to discuss your case. Contact Atrey Chambers at +91-11-22053080.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Case Assessment',
        text: 'The AOR reviews case facts, applicable laws, and evaluates merit for Supreme Court filing.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Draft & File Petition',
        text: 'The AOR drafts the petition (SLP, Writ, or Appeal) and files it directly with the Supreme Court registry.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Court Hearing',
        text: 'Appear before the designated bench. The AOR argues the case or engages a Senior Advocate if needed.',
      },
    ],
    totalTime: 'P30D',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: 'Varies by case complexity',
    },
  };
}
