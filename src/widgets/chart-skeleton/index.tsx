import styles from './styles.module.css';

type ChartAccent = 'energy' | 'water';

interface ChartDatum {
  label: string;
  value: number;
}

interface ChartSkeletonProps {
  title: string;
  period: string;
  accent: ChartAccent;
  data: ChartDatum[];
  unit: string;
}

const accentClassMap: Record<ChartAccent, string> = {
  energy: styles.barEnergy,
  water: styles.barWater,
};

const barHeightClassMap: Record<ChartAccent, string[]> = {
  energy: [
    styles.height44,
    styles.height58,
    styles.height40,
    styles.height78,
    styles.height54,
    styles.height68,
    styles.height48,
    styles.height86,
    styles.height62,
    styles.height42,
    styles.height74,
    styles.height56,
  ],
  water: [
    styles.height52,
    styles.height44,
    styles.height48,
    styles.height66,
    styles.height72,
    styles.height58,
    styles.height82,
    styles.height64,
    styles.height46,
    styles.height76,
    styles.height54,
    styles.height60,
  ],
};

export function ChartSkeleton({
  title,
  period,
  accent,
  data,
  unit,
}: ChartSkeletonProps) {
  const accentClassName = accentClassMap[accent];
  const heightClassNames = barHeightClassMap[accent];

  return (
    <div className={styles.chartSkeleton}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>{title}</span>
        <span className={styles.chartPeriod}>{period}</span>
      </div>

      <div className={styles.barsContainer}>
        {data.map((datum, index) => (
          <button
            key={datum.label}
            type="button"
            className={`${styles.bar} ${accentClassName} ${
              heightClassNames[index] ?? styles.height44
            }`}
            aria-label={`${datum.label}: ${datum.value.toLocaleString()} ${unit}`}
          >
            <span className={styles.tooltip}>
              <span className={styles.tooltipLabel}>{datum.label}</span>
              <span className={styles.tooltipValue}>
                {datum.value.toLocaleString()}
                <span className={styles.tooltipUnit}>{unit}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className={styles.axis} />
    </div>
  );
}
