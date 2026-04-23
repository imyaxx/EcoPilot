const LANGUAGE_TO_LOCALE: Record<string, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  kk: 'kk-KZ',
};

export function resolveLocale(language: string): string {
  return LANGUAGE_TO_LOCALE[language] ?? language;
}

export function formatNumber(
  value: number,
  language: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(resolveLocale(language), options).format(value);
}
