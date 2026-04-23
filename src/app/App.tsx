/**
 * App — shell: loads the dataset once, renders the sticky nav, switches
 * between Dashboard and Calculator pages, and mounts the footer.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf } from '@phosphor-icons/react';
import { AppProviders } from './providers';
import { DashboardPage } from '../pages/dashboard';
import { CalculatorPage } from '../pages/calculator';
import { BrandMark, Button, LanguageSwitcher } from '../shared/ui';
import type { DashboardDataset } from '../shared/data/transformed';
import styles from './App.module.css';

import './styles/base.css';

type ActivePage = 'dashboard' | 'calculator';
type DatasetStatus = 'loading' | 'ready' | 'error';

interface AppContentProps {
  dataset: DashboardDataset | null;
  datasetStatus: DatasetStatus;
  onRetryLoad: () => void;
}

function AppContent({ dataset, datasetStatus, onRetryLoad }: AppContentProps) {
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

          <nav className={styles.navTabs} aria-label={t('nav.label')}>
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
              disabled={datasetStatus !== 'ready'}
            >
              {t('nav.calculator')}
            </button>
          </nav>

          <LanguageSwitcher />
        </div>
      </header>

      <main className={styles.pageContainer}>
        {datasetStatus === 'ready' && dataset ? (
          <div className={styles.pageSwitcher}>
            {page === 'dashboard' && <DashboardPage dataset={dataset} />}
            {page === 'calculator' && (
              <CalculatorPage
                electricityTariff={electricityTariff}
                waterTariff={waterTariff}
              />
            )}
          </div>
        ) : (
          <section className={styles.datasetState}>
            <div className={styles.datasetStateCard}>
              <div className={styles.datasetStateIcon} aria-hidden="true">
                <Leaf size={18} weight="fill" />
              </div>
              <div className={styles.datasetStateCopy}>
                <h1 className={styles.datasetStateTitle}>
                  {datasetStatus === 'loading'
                    ? t('dataset.loadingTitle')
                    : t('dataset.errorTitle')}
                </h1>
                <p className={styles.datasetStateDescription}>
                  {datasetStatus === 'loading'
                    ? t('dataset.loadingDescription')
                    : t('dataset.errorDescription')}
                </p>
              </div>
              {datasetStatus === 'error' && (
                <Button variant="secondary" onClick={onRetryLoad}>
                  {t('dataset.retry')}
                </Button>
              )}
            </div>
          </section>
        )}
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
  const [datasetStatus, setDatasetStatus] = useState<DatasetStatus>('loading');

  const requestDataset = useCallback((handlers: { onSuccess?: () => void } = {}) => {
    let isMounted = true;

    void import('../shared/data/loaders')
      .then(({ loadDashboardDataset }) => loadDashboardDataset())
      .then((loaded) => {
        if (!isMounted) return;
        setDataset(loaded);
        setDatasetStatus('ready');
        handlers.onSuccess?.();
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setDataset(null);
        setDatasetStatus('error');
        if (import.meta.env.DEV) {
          console.error('Failed to load dataset', error);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetryLoad = useCallback(() => {
    setDataset(null);
    setDatasetStatus('loading');
    return requestDataset();
  }, [requestDataset]);

  useEffect(() => {
    return requestDataset();
  }, [requestDataset]);

  return (
    <AppProviders>
      <AppContent
        dataset={dataset}
        datasetStatus={datasetStatus}
        onRetryLoad={handleRetryLoad}
      />
    </AppProviders>
  );
}
