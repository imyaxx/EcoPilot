import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf } from '@phosphor-icons/react';
import { AppProviders } from './providers';
import { DashboardPage } from '../pages/dashboard';
import { CalculatorPage } from '../pages/calculator';
import { loadDashboardDataset } from '../shared/data/loaders';
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
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <Leaf size={20} weight="duotone" color="var(--color-brand-primary)" />
            <span className={styles.navBrandText}>EcoPilot</span>
          </div>
          <div className={styles.navTabs}>
            <button
              className={`${styles.navTab} ${page === 'dashboard' ? styles.navTabActive : ''}`}
              onClick={() => setPage('dashboard')}
            >
              {t('nav.dashboard')}
            </button>
            <button
              className={`${styles.navTab} ${page === 'calculator' ? styles.navTabActive : ''}`}
              onClick={() => setPage('calculator')}
            >
              {t('nav.calculator')}
            </button>
          </div>
        </div>
      </nav>

      {page === 'dashboard' && <DashboardPage dataset={dataset} />}
      {page === 'calculator' && (
        <CalculatorPage
          electricityTariff={electricityTariff}
          waterTariff={waterTariff}
        />
      )}
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
        console.error('Failed to load dataset', error);
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
