import styles from './styles.module.css';

interface ChartSkeletonProps {
  title: string;
  period: string;
  accentColor: string;
}

const BAR_HEIGHTS = [45, 62, 38, 80, 55, 72, 48, 90, 65, 42, 78, 58];

export function ChartSkeleton({
  title,
  period,
  accentColor,
}: ChartSkeletonProps) {
  return (
    <div className={styles.chartSkeleton}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>{title}</span>
        <span className={styles.chartPeriod}>{period}</span>
      </div>

      <div className={styles.barsContainer}>
        {BAR_HEIGHTS.map((heightPercent, index) => (
          <div
            key={index}
            className={styles.bar}
            style={{
              height: `${heightPercent}%`,
              backgroundColor: accentColor,
            }}
          />
        ))}
      </div>

      <div className={styles.axis} />
    </div>
  );
}
