import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../config/i18n/useLanguage';
import type { SupportedLanguage } from '../../config/i18n/i18n';
import styles from './styles.module.css';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t } = useTranslation('common');
  const { current, supported, change } = useLanguage();

  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div
      className={rootClassName}
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
  );
}
