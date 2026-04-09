import { type ReactNode } from 'react';
import styles from './styles.module.css';

type MetricAccent = 'energy' | 'water' | 'brand' | 'danger';

interface TrendData {
  value: string;
  direction: 'positive' | 'negative';
}

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  accent: MetricAccent;
  icon: ReactNode;
  trend?: TrendData;
}

const accentBarMap: Record<MetricAccent, string> = {
  energy: styles.accentEnergy,
  water: styles.accentWater,
  brand: styles.accentBrand,
  danger: styles.accentDanger,
};

const iconBgMap: Record<MetricAccent, string> = {
  energy: styles.iconEnergy,
  water: styles.iconWater,
  brand: styles.iconBrand,
  danger: styles.iconDanger,
};

export function MetricCard({
  label,
  value,
  unit,
  accent,
  icon,
  trend,
}: MetricCardProps) {
  return (
    <article className={styles.metricCard}>
      <div className={`${styles.accentBar} ${accentBarMap[accent]}`} />

      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div className={`${styles.icon} ${iconBgMap[accent]}`}>{icon}</div>
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        <span className={styles.unit}>{unit}</span>
      </div>

      {trend && (
        <div
          className={`${styles.trend} ${
            trend.direction === 'positive'
              ? styles.trendPositive
              : styles.trendNegative
          }`}
        >
          <span>{trend.direction === 'positive' ? '\u2191' : '\u2193'}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </article>
  );
}
