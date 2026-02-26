import type { PracticeArea } from '@/lib/data/practice-areas';
import type { TeamMember } from '@/lib/data/team';

const BASE_URL = 'https://www.atreychambers.com';
const FIRM_NAME = 'Atrey Chambers of Law LLP';
const LOGO_URL = `${BASE_URL}/logo ac.png`;

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LegalService', 'LocalBusiness'],
    '@id': `${BASE_URL}/#organization`,
    name: FIRM_NAME,
    alternateName: 'Atrey Chambers',
    url: BASE_URL,
    logo: LOGO_URL,
    image: LOGO_URL,
    description:
      'Premier Indian law firm headed by Dr. Abhishek Atrey, Advocate-on-Record, Supreme Court of India. 29+ years of practice across Constitutional Law, Environmental Law, Government Litigation, and 32 practice areas.',
    foundingDate: '1997',
    founder: {
      '@type': 'Person',
      name: 'Dr. Abhishek Atrey',
      jobTitle: 'Founder & Managing Partner',
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
