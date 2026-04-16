import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from './locales/en/common.json';
import dashboardEn from './locales/en/dashboard.json';
import calculatorEn from './locales/en/calculator.json';

const resources = {
  en: {
    common: commonEn,
    dashboard: dashboardEn,
    calculator: calculatorEn,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'dashboard', 'calculator'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
