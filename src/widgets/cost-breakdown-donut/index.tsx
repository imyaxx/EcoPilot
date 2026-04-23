/**
 * CostBreakdownDonut — two-segment donut chart showing the electricity-vs-water
 * split of a building's monthly utility bill, plus a legend with exact values.
 * Pure presentational widget: it takes already-computed cost figures and an
 * optional currency formatter, and emits zero side effects.
 */

import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

interface CostBreakdownDonutProps {
  electricityCost: number;
  waterCost: number;
  hasData: boolean;
  formatCurrency: (value: number) => string;
}

const DONUT_SIZE = 140;
const DONUT_STROKE = 18;

export function CostBreakdownDonut({
  electricityCost,
  waterCost,
  hasData,
  formatCurrency,
}: CostBreakdownDonutProps) {
  const { t } = useTranslation('calculator');

  if (!hasData) {
    return (
      <div className={styles.emptyState}>
        <p>{t('results.empty')}</p>
      </div>
    );
  }

  const monthlyTotal = electricityCost + waterCost;
  const electricityShare = monthlyTotal > 0 ? electricityCost / monthlyTotal : 0;

  const radius = (DONUT_SIZE - DONUT_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.donut}
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        role="img"
        aria-label={t('breakdown.title')}
      >
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          fill="none"
          className={styles.track}
          strokeWidth={DONUT_STROKE}
        />
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          fill="none"
          strokeWidth={DONUT_STROKE}
          className={styles.water}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
        />
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          fill="none"
          strokeWidth={DONUT_STROKE}
          strokeLinecap="round"
          className={styles.electricity}
          strokeDasharray={`${electricityShare * circumference} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
        />
      </svg>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotElectricity}`} aria-hidden="true" />
          <div className={styles.legendText}>
            <span className={styles.legendName}>{t('breakdown.electricity')}</span>
            <span className={styles.legendValue}>
              {formatCurrency(electricityCost)}{' '}
              <span className={styles.legendUnit}>{t('common:units.kztPerMonth')}</span>
            </span>
          </div>
          <span className={styles.legendShare}>{Math.round(electricityShare * 100)}%</span>
        </div>

        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.dotWater}`} aria-hidden="true" />
          <div className={styles.legendText}>
            <span className={styles.legendName}>{t('breakdown.water')}</span>
            <span className={styles.legendValue}>
              {formatCurrency(waterCost)}{' '}
              <span className={styles.legendUnit}>{t('common:units.kztPerMonth')}</span>
            </span>
          </div>
          <span className={styles.legendShare}>{Math.round((1 - electricityShare) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
