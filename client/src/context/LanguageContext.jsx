import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import ur from '../i18n/ur.json';

const translations = { en, ur };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('meethacart_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('meethacart_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  }, [lang]);

  // Nested key resolver, e.g. t('auth.loginTitle')
  const t = (path) => {
    const keys = path.split('.');
    let current = translations[lang];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English if key missing in Urdu
        let fallback = translations.en;
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return '';
          }
        }
        return fallback;
      }
    }
    return current !== undefined ? current : '';
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const translateCategory = (nameOrSlug) => {
    if (!nameOrSlug) return '';
    const isUr = lang === 'ur';
    const slug = String(nameOrSlug).toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-');

    if (slug.includes('mithai') || slug.includes('traditional')) {
      return isUr ? 'روایتی مٹھائی' : 'Traditional Mithai';
    }
    if (slug.includes('pastr') || slug.includes('cupcake')) {
      return isUr ? 'پیسٹریز اور کپ کیکس' : 'Pastries & Cupcakes';
    }
    if (slug.includes('cake') || slug.includes('custom')) {
      return isUr ? 'کسٹم کیکس' : 'Custom Cakes';
    }
    if (slug.includes('cookie') || slug.includes('biscuit')) {
      return isUr ? 'کوکیز اور بسکٹ' : 'Cookies & Biscuits';
    }
    if (slug.includes('bread') || slug.includes('bun') || slug.includes('artisan')) {
      return isUr ? 'روایتی بریڈز اور نان' : 'Artisanal Breads';
    }
    if (slug === 'all' || slug === 'all-items') {
      return isUr ? 'تمام اشیاء' : 'All items';
    }
    return nameOrSlug;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, translateCategory, isUrdu: lang === 'ur' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
