import { useMemo, type ReactNode } from 'react';
import styles from './styles.module.css';

export type MetricAccent = 'energy' | 'water' | 'brand' | 'carbon' | 'danger';

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
  entryDelay?: number;
  trend?: TrendData;
  sparkline?: number[];
}

const accentBarMap: Record<MetricAccent, string> = {
  energy: styles.accentEnergy,
  water: styles.accentWater,
  brand: styles.accentBrand,
  carbon: styles.accentCarbon,
  danger: styles.accentDanger,
};

const iconBgMap: Record<MetricAccent, string> = {
  energy: styles.iconEnergy,
  water: styles.iconWater,
  brand: styles.iconBrand,
  carbon: styles.iconCarbon,
  danger: styles.iconDanger,
};

const entryDelayClassMap = [
  styles.delay0,
  styles.delay1,
  styles.delay2,
  styles.delay3,
];

const SPARK_WIDTH = 120;
const SPARK_HEIGHT = 28;

function buildSparklinePath(values: number[]): {
  linePath: string;
  areaPath: string;
} | null {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = SPARK_WIDTH / (values.length - 1);
  const padY = 2;
  const usableHeight = SPARK_HEIGHT - padY * 2;

  const coords = values.map((value, index) => {
    const x = index * step;
    const y = padY + usableHeight - ((value - min) / range) * usableHeight;
    return { x, y };
  });

  const linePath = coords
    .map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L ${SPARK_WIDTH} ${SPARK_HEIGHT} L 0 ${SPARK_HEIGHT} Z`;

  return { linePath, areaPath };
}

export function MetricCard({
  label,
  value,
  unit,
  accent,
  icon,
  entryDelay = 0,
  trend,
  sparkline,
}: MetricCardProps) {
  const sparkPaths = useMemo(
    () => (sparkline ? buildSparklinePath(sparkline) : null),
    [sparkline],
  );

  return (
    <article
      className={`${styles.metricCard} ${
        entryDelayClassMap[entryDelay] ?? styles.delay0
      } ${accentBarMap[accent]}`}
    >
      <div className={styles.accentBar} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <div className={`${styles.icon} ${iconBgMap[accent]}`}>{icon}</div>
        </div>

        <div className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          <span className={styles.unit}>{unit}</span>
        </div>

        <div className={styles.footerRow}>
          {trend && (
            <div
              className={`${styles.trend} ${
                trend.direction === 'positive'
                  ? styles.trendPositive
                  : styles.trendNegative
              }`}
            >
              <span aria-hidden="true">
                {trend.direction === 'positive' ? '↑' : '↓'}
              </span>
              <span>{trend.value}</span>
            </div>
          )}

          {sparkPaths && (
            <svg
              className={styles.sparkline}
              viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={sparkPaths.areaPath} className={styles.sparkArea} />
              <path d={sparkPaths.linePath} className={styles.sparkLine} />
            </svg>
          )}
        </div>
      </div>
    </article>
  );
}
