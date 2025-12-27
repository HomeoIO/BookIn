import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import zhHKCommon from './locales/zh-HK/common.json';
import zhHKBooks from './locales/zh-HK/books.json';
import zhHKTraining from './locales/zh-HK/training.json';
import zhHKStreak from './locales/zh-HK/streak.json';
import zhHKPayment from './locales/zh-HK/payment.json';
import zhHKTodos from './locales/zh-HK/todos.json';
import zhHKCollection from './locales/zh-HK/collection.json';

import enCommon from './locales/en/common.json';
import enBooks from './locales/en/books.json';
import enTraining from './locales/en/training.json';
import enStreak from './locales/en/streak.json';
import enPayment from './locales/en/payment.json';
import enTodos from './locales/en/todos.json';
import enCollection from './locales/en/collection.json';

// Language resources
const resources = {
  'zh-HK': {
    common: zhHKCommon,
    books: zhHKBooks,
    training: zhHKTraining,
    streak: zhHKStreak,
    payment: zhHKPayment,
    todos: zhHKTodos,
    collection: zhHKCollection,
  },
  'en': {
    common: enCommon,
    books: enBooks,
    training: enTraining,
    streak: enStreak,
    payment: enPayment,
    todos: enTodos,
    collection: enCollection,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'zh-HK', // Cantonese (Hong Kong) as primary
    defaultNS: 'common',
    ns: ['common', 'books', 'training', 'streak', 'payment', 'todos', 'collection'],

    // Language detection options
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache language in localStorage
      caches: ['localStorage'],
      // LocalStorage key
      lookupLocalStorage: 'bookin-language',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Development options
    debug: false, // Set to true to see i18n logs in console
  });

export default i18n;
