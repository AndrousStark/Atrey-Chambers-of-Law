'use client';

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('hi') ? 'hi' : 'en';
  const nextLang = currentLang === 'en' ? 'hi' : 'en';
  const label = currentLang === 'en' ? 'हिन्दी' : 'EN';

  const toggleLanguage = useCallback(() => {
    i18n.changeLanguage(nextLang);
  }, [i18n, nextLang]);

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 border border-white/30 hover:bg-white/10 text-white cursor-pointer min-h-[36px]"
      aria-label={`Switch language to ${nextLang === 'hi' ? 'Hindi' : 'English'}`}
      title={`Switch to ${nextLang === 'hi' ? 'हिन्दी' : 'English'}`}
    >
      <Languages size={15} />
      {label}
    </button>
  );
}
