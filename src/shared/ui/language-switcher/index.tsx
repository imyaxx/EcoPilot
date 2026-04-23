import { useTranslation } from 'react-i18next';
import { Translate } from '@phosphor-icons/react';
import { useLanguage } from '../../config/i18n/useLanguage';
import type { SupportedLanguage } from '../../config/i18n/i18n';
import styles from './styles.module.css';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t } = useTranslation('common');
  const { current, supported, change } = useLanguage();

  const rootClassName = [styles.wrapper, className].filter(Boolean).join(' ');

  const currentIndex = supported.indexOf(current);
  const nextLanguage =
    supported[(currentIndex + 1) % supported.length] ?? supported[0];

  return (
    <div className={rootClassName}>
      <div
        className={styles.segmented}
        role="group"
        aria-label={t('language.label')}
      >
        {supported.map((code) => {
          const isActive = code === current;
          const buttonClassName = [
            styles.button,
            isActive ? styles.buttonActive : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={code}
              type="button"
              className={buttonClassName}
              onClick={() => change(code as SupportedLanguage)}
              aria-pressed={isActive}
              aria-label={t(`language.${code}`)}
            >
              {t(`language.short.${code}`)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.cycleButton}
        onClick={() => change(nextLanguage)}
        aria-label={`${t('language.label')}: ${t(`language.${nextLanguage}`)}`}
      >
        <Translate size={16} weight="bold" aria-hidden="true" />
        <span className={styles.cycleCode}>{t(`language.short.${current}`)}</span>
      </button>
    </div>
  );
}
