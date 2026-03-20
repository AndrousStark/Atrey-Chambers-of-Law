import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from '@/lib/i18n-resources/en/common.json';
import casesEn from '@/lib/i18n-resources/en/cases.json';

import commonHi from '@/lib/i18n-resources/hi/common.json';
import casesHi from '@/lib/i18n-resources/hi/cases.json';

const resources = {
  en: { common: commonEn, cases: casesEn },
  hi: { common: commonHi, cases: casesHi },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'cases'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'atrey-cms-lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
