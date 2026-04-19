import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SUPPORTED_LANGUAGES,
  persistLanguage,
  type SupportedLanguage,
} from './i18n';

interface UseLanguageResult {
  current: SupportedLanguage;
  supported: readonly SupportedLanguage[];
  change: (next: SupportedLanguage) => void;
}

function isSupported(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function useLanguage(): UseLanguageResult {
  const { i18n } = useTranslation();
  const currentRaw = i18n.resolvedLanguage ?? i18n.language ?? 'ru';
  const current: SupportedLanguage = isSupported(currentRaw) ? currentRaw : 'ru';

  const change = useCallback(
    (next: SupportedLanguage) => {
      if (next === current) return;
      void i18n.changeLanguage(next);
      persistLanguage(next);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', next);
      }
    },
    [current, i18n],
  );

  return {
    current,
    supported: SUPPORTED_LANGUAGES,
    change,
  };
}
