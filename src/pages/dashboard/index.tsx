import type { ReactNode } from 'react';
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
  CalendarBlank,
} from '@phosphor-icons/react';
import type {
  DashboardMetricKey,
  DashboardTrendSummary,
  SystemInsightCategory,
  SystemInsightSeverity,
} from '../../shared/data/transformed';
import { dashboardDataset } from '../../shared/data/transformed';
import { selectDashboardDerivedData } from '../../shared/data/selectors';
import { Badge, Button } from '../../shared/ui';
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

function formatChartSummary(summary: DashboardTrendSummary, unit: string) {
  return `Latest: ${summary.currentValue.toLocaleString()} ${unit} · Prev: ${summary.previousValue.toLocaleString()} ${unit} · Change: ${summary.percentageChange}%`;
}

export function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const dataset = dashboardDataset;
  const derivedData = selectDashboardDerivedData(dataset);
  const energyUnit = dataset.energyTrend[dataset.energyTrend.length - 1]?.unit ?? '';
  const waterUnit = dataset.waterTrend[dataset.waterTrend.length - 1]?.unit ?? '';

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
          {dataset.metrics.map((metric) => {
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
          })}
        </div>
      </section>

      {/* ── Charts ── */}
      <section className={styles.section}>
        <div className={styles.chartsGrid}>
          <div className={styles.chartWrapper}>
            <ChartSkeleton
              title={t('dashboard:charts.energyTrend')}
              period={t('dashboard:period.thisMonth')}
              accent="energy"
              data={dataset.energyTrend.map((point) => ({
                label: point.label,
                value: point.value,
              }))}
              unit={energyUnit}
            />
            <p className={styles.chartSummary}>
              {formatChartSummary(derivedData.energySummary, energyUnit)}
            </p>
          </div>
          <div className={styles.chartWrapper}>
            <ChartSkeleton
              title={t('dashboard:charts.waterUsage')}
              period={t('dashboard:period.thisMonth')}
              accent="water"
              data={dataset.waterTrend.map((point) => ({
                label: point.label,
                value: point.value,
              }))}
              unit={waterUnit}
            />
            <p className={styles.chartSummary}>
              {formatChartSummary(derivedData.waterSummary, waterUnit)}
            </p>
          </div>
        </div>
      </section>

      {/* ── Insights ── */}
      <section className={styles.section}>
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
      </section>

      {/* ── Controls ── */}
      <div className={styles.controlsBar}>
        <Button
          variant="secondary"
          size="small"
          icon={<CalendarBlank size={13} weight="regular" />}
        >
          {t('dashboard:controls.dateRange')}
        </Button>
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
