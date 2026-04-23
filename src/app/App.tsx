/**
 * App — shell: loads the dataset once, renders the sticky nav, switches
 * between Dashboard and Calculator pages, and mounts the footer.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf } from '@phosphor-icons/react';
import { AppProviders } from './providers';
import { DashboardPage } from '../pages/dashboard';
import { CalculatorPage } from '../pages/calculator';
import { loadDashboardDataset } from '../shared/data/loaders';
import { BrandMark, LanguageSwitcher } from '../shared/ui';
import type { DashboardDataset } from '../shared/data/transformed';
import styles from './App.module.css';

import './styles/base.css';

type ActivePage = 'dashboard' | 'calculator';

interface AppContentProps {
  dataset: DashboardDataset | null;
}

function AppContent({ dataset }: AppContentProps) {
  const { t } = useTranslation('common');
  const [page, setPage] = useState<ActivePage>('dashboard');

  const electricityTariff =
    dataset?.tariffs.find((tariff) => tariff.utilityType === 'electricity')?.price ?? 0;
  const waterTariff =
    dataset?.tariffs.find((tariff) => tariff.utilityType === 'water')?.price ?? 0;

  return (
    <>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <div className={styles.navBrandIcon} aria-hidden="true">
              <Leaf size={16} weight="fill" />
            </div>
            <div className={styles.navBrandText}>
              <span className={styles.navBrandName}>{t('appName')}</span>
              <span className={styles.navBrandTag}>{t('track.energyResources')}</span>
            </div>
          </div>

          <nav className={styles.navTabs} aria-label={t('nav.dashboard')}>
            <button
              type="button"
              className={`${styles.navTab} ${page === 'dashboard' ? styles.navTabActive : ''}`}
              onClick={() => setPage('dashboard')}
              aria-pressed={page === 'dashboard'}
            >
              {t('nav.dashboard')}
            </button>
            <button
              type="button"
              className={`${styles.navTab} ${page === 'calculator' ? styles.navTabActive : ''}`}
              onClick={() => setPage('calculator')}
              aria-pressed={page === 'calculator'}
            >
              {t('nav.calculator')}
            </button>
          </nav>

          <LanguageSwitcher />
        </div>
      </header>

      <main className={styles.pageContainer}>
        <div
          className={styles.pageSwitcher}
          key={page}
        >
          {page === 'dashboard' && <DashboardPage dataset={dataset} />}
          {page === 'calculator' && (
            <CalculatorPage
              electricityTariff={electricityTariff}
              waterTariff={waterTariff}
            />
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <BrandMark size="lg" className={styles.footerMark} />
        <div className={styles.footerTextGroup}>
          <p className={styles.footerBrand}>{t('appName')}</p>
          <p className={styles.footerCaption}>{t('footer.copyright')}</p>
        </div>
      </footer>
    </>
  );
}

export function App() {
  const [dataset, setDataset] = useState<DashboardDataset | null>(null);

  useEffect(() => {
    let isMounted = true;

    void loadDashboardDataset()
      .then((loaded) => {
        if (isMounted) setDataset(loaded);
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) {
          console.error('Failed to load dataset', error);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppProviders>
      <AppContent dataset={dataset} />
    </AppProviders>
  );
}
