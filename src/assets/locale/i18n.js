import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Language JSON files (assuming you have translations for 'en' and 'fr')
import en from './translations/en.json';


i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
     
    },
    fallbackLng: 'en',
    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'querystring', 'htmlTag', 'path', 'subdomain'],
      caches: ['cookie'],
    },
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
