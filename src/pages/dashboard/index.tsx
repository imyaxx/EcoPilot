import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Leaf,
  Lightning,
  Drop,
  Gauge,
  ShieldCheck,
  ThermometerHot,
  Funnel,
  ArrowsClockwise,
  Export,
} from '@phosphor-icons/react';
import type {
  DashboardDataset,
  DashboardMetricKey,
  EnergyPeriod,
  SystemInsightCategory,
  SystemInsightSeverity,
  WaterPeriod,
} from '../../shared/data/transformed';
import { selectDashboardDerivedData } from '../../shared/data/selectors';
import { Badge, Button, SkeletonCard } from '../../shared/ui';
import { MetricCard } from '../../widgets/metric-card';
import { ChartSkeleton } from '../../widgets/chart-skeleton';
import { InsightsPanel } from '../../widgets/insights-panel';
import styles from './styles.module.css';

const metricConfigMap = {
  totalEnergy: {
    accent: 'energy',
    icon: <Lightning size={16} weight="duotone" />,
    entryDelay: 0,
  },
  totalWater: {
    accent: 'water',
    icon: <Drop size={16} weight="duotone" />,
    entryDelay: 1,
  },
  carbonFootprint: {
    accent: 'brand',
    icon: <Gauge size={16} weight="duotone" />,
    entryDelay: 2,
  },
  efficiencyScore: {
    accent: 'brand',
    icon: <ShieldCheck size={16} weight="duotone" />,
    entryDelay: 3,
  },
} satisfies Record<
  DashboardMetricKey,
  {
    accent: 'energy' | 'water' | 'brand';
    icon: ReactNode;
    entryDelay: number;
  }
>;

const insightCategoryIconMap = {
  water: <Drop size={18} weight="duotone" />,
  energy: <Lightning size={18} weight="duotone" />,
  efficiency: <ThermometerHot size={18} weight="duotone" />,
  carbon: <Leaf size={18} weight="duotone" />,
} satisfies Record<SystemInsightCategory, ReactNode>;

const insightSeverityMap = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
} satisfies Record<SystemInsightSeverity, 'critical' | 'warning' | 'info'>;

const energyPeriodTranslationKeyMap = {
  month: 'dashboard:period.monthly2024',
  year: 'dashboard:period.annual',
} satisfies Record<EnergyPeriod, string>;

const waterPeriodTranslationKeyMap = {
  month: 'dashboard:period.monthly2025',
  year: 'dashboard:period.annual',
} satisfies Record<WaterPeriod, string>;

const availableEnergyPeriods: EnergyPeriod[] = ['month', 'year'];
const availableWaterPeriods: WaterPeriod[] = ['month', 'year'];

interface DashboardPageProps {
  dataset: DashboardDataset | null;
}

export function DashboardPage({ dataset }: DashboardPageProps) {
  const { t } = useTranslation(['dashboard', 'common']);
  const [energyPeriod, setEnergyPeriod] = useState<EnergyPeriod>('month');
  const [waterPeriod, setWaterPeriod] = useState<WaterPeriod>('month');

  const derivedData = dataset
    ? selectDashboardDerivedData(dataset, energyPeriod, waterPeriod)
    : null;
  const activeEnergyPeriodLabel = t(energyPeriodTranslationKeyMap[energyPeriod]);
  const activeWaterPeriodLabel = t(waterPeriodTranslationKeyMap[waterPeriod]);
  const activeEnergyTrend = derivedData?.activeEnergyTrend ?? [];
  const activeWaterTrend = derivedData?.activeWaterTrend ?? [];
  const energyUnit = activeEnergyTrend[activeEnergyTrend.length - 1]?.unit ?? '';
  const waterUnit = activeWaterTrend[activeWaterTrend.length - 1]?.unit ?? '';

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <Leaf size={32} weight="duotone" color="var(--color-brand-primary)" />
          <h1 className={styles.title}>{t('dashboard:title')}</h1>
        </div>
        <p className={styles.subtitle}>{t('dashboard:subtitle')}</p>
      </header>

      {/* ── Status Badges ── */}
      <div className={styles.statusBar}>
        <Badge variant="success">{t('dashboard:status.optimal')}</Badge>
        <Badge variant="warning">{t('dashboard:status.warning')}</Badge>
        <Badge variant="danger">{t('dashboard:status.critical')}</Badge>
      </div>

      {/* ── KPI Metrics ── */}
      <section className={styles.section}>
        <div className={styles.metricsGrid}>
          {derivedData
            ? derivedData.metrics.map((metric) => {
                const config = metricConfigMap[metric.key];
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
                    label={metric.label}
                    value={metric.formattedValue}
                    unit={metric.unit}
                    accent={config.accent}
                    icon={config.icon}
                    entryDelay={config.entryDelay}
                    trend={trend}
                  />
                );
              })
            : Array.from({ length: Object.keys(metricConfigMap).length }, (_, index) => (
                <SkeletonCard key={index} />
              ))}
        </div>
      </section>

      {/* ── Charts ── */}
      <section className={styles.section}>
        <div className={styles.chartsGrid}>
          <div className={styles.chartWrapper}>
            <ChartSkeleton
              title={t('dashboard:charts.energyTrend')}
              period={activeEnergyPeriodLabel}
              accent="energy"
              data={activeEnergyTrend.map((point) => ({
                label: point.label,
                value: point.value,
              }))}
              unit={energyUnit}
            />
            <div className={styles.titleRow}>
              {availableEnergyPeriods.map((periodOption) => (
                <Button
                  key={periodOption}
                  variant={energyPeriod === periodOption ? 'secondary' : 'ghost'}
                  size="small"
                  aria-pressed={energyPeriod === periodOption}
                  onClick={() => setEnergyPeriod(periodOption)}
                >
                  {t(energyPeriodTranslationKeyMap[periodOption])}
                </Button>
              ))}
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <ChartSkeleton
              title={t('dashboard:charts.waterUsage')}
              period={activeWaterPeriodLabel}
              accent="water"
              data={activeWaterTrend.map((point) => ({
                label: point.label,
                value: point.value,
              }))}
              unit={waterUnit}
            />
            <div className={styles.titleRow}>
              {availableWaterPeriods.map((periodOption) => (
                <Button
                  key={periodOption}
                  variant={waterPeriod === periodOption ? 'secondary' : 'ghost'}
                  size="small"
                  aria-pressed={waterPeriod === periodOption}
                  onClick={() => setWaterPeriod(periodOption)}
                >
                  {t(waterPeriodTranslationKeyMap[periodOption])}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Insights ── */}
      <section className={styles.section}>
        {dataset ? (
          <InsightsPanel
            title={t('dashboard:insights.title')}
            items={dataset.insights.map((insight) => ({
              id: insight.id,
              severity: insightSeverityMap[insight.severity],
              icon: insightCategoryIconMap[insight.category],
              title: insight.title,
              description: insight.description,
            }))}
          />
        ) : (
          <SkeletonCard />
        )}
      </section>

      {/* ── Controls ── */}
      <div className={styles.controlsBar}>
        <Button
          variant="ghost"
          size="small"
          icon={<Funnel size={13} weight="regular" />}
        >
          {t('common:filter')}
        </Button>
        <Button
          variant="ghost"
          size="small"
          icon={<Export size={13} weight="regular" />}
        >
          {t('dashboard:controls.export')}
        </Button>
        <Button
          variant="ghost"
          size="small"
          icon={<ArrowsClockwise size={13} weight="regular" />}
        >
          {t('common:reset')}
        </Button>
      </div>
    </div>
  );
}
