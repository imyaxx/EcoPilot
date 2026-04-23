import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from './locales/en/common.json';
import dashboardEn from './locales/en/dashboard.json';
import calculatorEn from './locales/en/calculator.json';

import commonRu from './locales/ru/common.json';
import dashboardRu from './locales/ru/dashboard.json';
import calculatorRu from './locales/ru/calculator.json';

import commonKk from './locales/kk/common.json';
import dashboardKk from './locales/kk/dashboard.json';
import calculatorKk from './locales/kk/calculator.json';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'kk'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'ecopilot:lang';
const DEFAULT_LANGUAGE: SupportedLanguage = 'ru';

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value !== null && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

function syncDocumentLanguage(language: SupportedLanguage): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('lang', language);
}

function detectInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // localStorage blocked — ignore and fall back to navigator
  }

  const browserLanguage = window.navigator.language.slice(0, 2).toLowerCase();
  if (isSupportedLanguage(browserLanguage)) return browserLanguage;

  return DEFAULT_LANGUAGE;
}

export function persistLanguage(lang: SupportedLanguage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // ignore storage errors
  }
}

const resources = {
  en: {
    common: commonEn,
    dashboard: dashboardEn,
    calculator: calculatorEn,
  },
  ru: {
    common: commonRu,
    dashboard: dashboardRu,
    calculator: calculatorRu,
  },
  kk: {
    common: commonKk,
    dashboard: dashboardKk,
    calculator: calculatorKk,
  },
} as const;

const initialLanguage = detectInitialLanguage();

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  ns: ['common', 'dashboard', 'calculator'],
  interpolation: {
    escapeValue: false,
  },
});

syncDocumentLanguage(initialLanguage);

export default i18n;
