import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lightning,
  Drop,
  ShieldCheck,
  Cloud,
} from '@phosphor-icons/react';
import type {
  DashboardDataset,
  DashboardMetricKey,
  DashboardMetricSnapshot,
  EnergyPeriod,
  WaterPeriod,
} from '../../shared/data/transformed';
import { selectDashboardDerivedData } from '../../shared/data/selectors';
import { Button, SkeletonCard } from '../../shared/ui';
import { MetricCard, type MetricAccent } from '../../widgets/metric-card';
import { LineChart } from '../../widgets/line-chart';
import { CarbonPulse } from '../../widgets/carbon-pulse';
import { ConsumptionHeatmap } from '../../widgets/consumption-heatmap';
import styles from './styles.module.css';

interface MetricConfig {
  accent: MetricAccent;
  icon: ReactNode;
}

const METRIC_CONFIG: Record<DashboardMetricKey, MetricConfig> = {
  totalEnergy: {
    accent: 'energy',
    icon: <Lightning size={16} weight="fill" />,
  },
  totalWater: {
    accent: 'water',
    icon: <Drop size={16} weight="fill" />,
  },
  carbonFootprint: {
    accent: 'carbon',
    icon: <Cloud size={16} weight="fill" />,
  },
  efficiencyScore: {
    accent: 'brand',
    icon: <ShieldCheck size={16} weight="fill" />,
  },
};

const ENERGY_PERIODS: EnergyPeriod[] = ['month', 'year'];
const WATER_PERIODS: WaterPeriod[] = ['month', 'year'];

function periodKey(period: EnergyPeriod | WaterPeriod, fallback: string): string {
  if (period === 'year') return 'period.annual';
  return fallback;
}

interface DashboardPageProps {
  dataset: DashboardDataset | null;
  annualEnergyForPulse: number;
}

export function DashboardPage({
  dataset,
  annualEnergyForPulse,
}: DashboardPageProps) {
  const { t } = useTranslation('dashboard');
  const [energyPeriod, setEnergyPeriod] = useState<EnergyPeriod>('month');
  const [waterPeriod, setWaterPeriod] = useState<WaterPeriod>('month');

  const derivedData = dataset
    ? selectDashboardDerivedData(dataset, energyPeriod, waterPeriod)
    : null;

  const activeEnergyPeriodLabel = t(periodKey(energyPeriod, 'period.monthly2024'));
  const activeWaterPeriodLabel = t(periodKey(waterPeriod, 'period.monthly2025'));

  const activeEnergyTrend = derivedData?.activeEnergyTrend ?? [];
  const activeWaterTrend = derivedData?.activeWaterTrend ?? [];
  const energyUnit = activeEnergyTrend[0]?.unit ?? '';
  const waterUnit = activeWaterTrend[0]?.unit ?? '';

  const heatmapSeries = useMemo(() => {
    if (!dataset) return [];
    return [
      {
        key: 'energy' as const,
        points: dataset.energyTrend.month,
      },
      {
        key: 'water' as const,
        points: dataset.waterTrend.month,
      },
    ];
  }, [dataset]);

  const renderMetricCard = (metric: DashboardMetricSnapshot, index: number) => {
    const config = METRIC_CONFIG[metric.key];
    const trend =
      metric.trendDirection === 'neutral'
        ? undefined
        : {
            value: `${metric.deltaPercentage.toFixed(1)}%`,
            direction:
              metric.trendDirection === 'up'
                ? ('positive' as const)
                : ('negative' as const),
          };

    return (
      <MetricCard
        key={metric.key}
        label={t(`metrics.${metric.key}.label`)}
        value={metric.formattedValue}
        unit={t(`metrics.${metric.key}.unit`)}
        accent={config.accent}
        icon={config.icon}
        entryDelay={index}
        trend={trend}
        sparkline={metric.sparkline}
      />
    );
  };

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroEyebrow}>{t('hero.eyebrow')}</span>
          <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
          <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
        </div>

        {annualEnergyForPulse > 0 && (
          <div className={styles.heroPulse}>
            <CarbonPulse annualEnergyMlnKwh={annualEnergyForPulse} compact />
          </div>
        )}
      </header>

      {/* ── KPI Metrics ── */}
      <section className={styles.section}>
        <div className={styles.metricsGrid}>
          {derivedData
            ? derivedData.metrics.map(renderMetricCard)
            : Array.from({ length: 4 }, (_, index) => (
                <SkeletonCard key={index} height="160px" />
              ))}
        </div>
      </section>

      {/* ── Charts ── */}
      <section className={styles.chartsSection}>
        <div className={styles.chartsGrid}>
          <LineChart
            title={t('charts.energyTrend')}
            subtitle={activeEnergyPeriodLabel}
            accent="energy"
            data={activeEnergyTrend.map((point) => ({
              label: point.label,
              value: point.value,
            }))}
            unit={energyUnit}
            headerAction={
              <div className={styles.periodTabs}>
                {ENERGY_PERIODS.map((option) => (
                  <Button
                    key={option}
                    variant={energyPeriod === option ? 'secondary' : 'ghost'}
                    size="small"
                    aria-pressed={energyPeriod === option}
                    onClick={() => setEnergyPeriod(option)}
                  >
                    {t(option === 'year' ? 'period.annual' : 'period.monthly')}
                  </Button>
                ))}
              </div>
            }
          />
          <LineChart
            title={t('charts.waterUsage')}
            subtitle={activeWaterPeriodLabel}
            accent="water"
            data={activeWaterTrend.map((point) => ({
              label: point.label,
              value: point.value,
            }))}
            unit={waterUnit}
            headerAction={
              <div className={styles.periodTabs}>
                {WATER_PERIODS.map((option) => (
                  <Button
                    key={option}
                    variant={waterPeriod === option ? 'secondary' : 'ghost'}
                    size="small"
                    aria-pressed={waterPeriod === option}
                    onClick={() => setWaterPeriod(option)}
                  >
                    {t(option === 'year' ? 'period.annual' : 'period.monthly')}
                  </Button>
                ))}
              </div>
            }
          />
        </div>
      </section>

      {/* ── Heatmap ── */}
      {heatmapSeries.length > 0 && (
        <section className={styles.section}>
          <ConsumptionHeatmap series={heatmapSeries} />
        </section>
      )}
    </div>
  );
}
