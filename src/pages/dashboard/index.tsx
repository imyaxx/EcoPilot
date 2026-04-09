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
import { Badge, Button } from '../../shared/ui';
import { MetricCard } from '../../widgets/metric-card';
import { ChartSkeleton } from '../../widgets/chart-skeleton';
import { InsightsPanel } from '../../widgets/insights-panel';
import styles from './styles.module.css';

export function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common']);

  const insights = [
    {
      id: 'water-spike',
      severity: 'warning' as const,
      icon: <Drop size={20} weight="duotone" />,
      title: t('dashboard:insights.waterSpike.title'),
      description: t('dashboard:insights.waterSpike.description'),
    },
    {
      id: 'night-energy',
      severity: 'danger' as const,
      icon: <Lightning size={20} weight="duotone" />,
      title: t('dashboard:insights.nightEnergy.title'),
      description: t('dashboard:insights.nightEnergy.description'),
    },
    {
      id: 'inefficiency',
      severity: 'info' as const,
      icon: <ThermometerHot size={20} weight="duotone" />,
      title: t('dashboard:insights.inefficiency.title'),
      description: t('dashboard:insights.inefficiency.description'),
    },
  ];

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
          <MetricCard
            label={t('dashboard:totalEnergy')}
            value="2,847"
            unit={t('common:units.kwh')}
            accent="energy"
            icon={<Lightning size={18} weight="duotone" />}
            trend={{ value: '12.5%', direction: 'negative' }}
          />
          <MetricCard
            label={t('dashboard:totalWater')}
            value="1,203"
            unit={t('common:units.cubicMeters')}
            accent="water"
            icon={<Drop size={18} weight="duotone" />}
            trend={{ value: '3.2%', direction: 'positive' }}
          />
          <MetricCard
            label={t('dashboard:carbonFootprint')}
            value="482"
            unit="kg"
            accent="brand"
            icon={<Gauge size={18} weight="duotone" />}
            trend={{ value: '8.1%', direction: 'positive' }}
          />
          <MetricCard
            label={t('dashboard:efficiency')}
            value="94.2"
            unit={t('common:units.percentage')}
            accent="brand"
            icon={<ShieldCheck size={18} weight="duotone" />}
            trend={{ value: '1.4%', direction: 'positive' }}
          />
        </div>
      </section>

      {/* ── Charts ── */}
      <section className={styles.section}>
        <div className={styles.chartsGrid}>
          <ChartSkeleton
            title={t('dashboard:charts.energyTrend')}
            period={t('dashboard:period.thisMonth')}
            accentColor="var(--color-energy)"
          />
          <ChartSkeleton
            title={t('dashboard:charts.waterUsage')}
            period={t('dashboard:period.thisMonth')}
            accentColor="var(--color-water)"
          />
        </div>
      </section>

      {/* ── Insights ── */}
      <section className={styles.section}>
        <InsightsPanel
          title={t('dashboard:insights.title')}
          items={insights}
        />
      </section>

      {/* ── Controls ── */}
      <div className={styles.controlsBar}>
        <Button
          variant="secondary"
          size="small"
          icon={<CalendarBlank size={16} weight="regular" />}
        >
          {t('dashboard:controls.dateRange')}
        </Button>
        <Button
          variant="ghost"
          size="small"
          icon={<Funnel size={16} weight="regular" />}
        >
          {t('common:filter')}
        </Button>
        <Button
          variant="ghost"
          size="small"
          icon={<Export size={16} weight="regular" />}
        >
          {t('dashboard:controls.export')}
        </Button>
        <Button
          variant="ghost"
          size="small"
          icon={<ArrowsClockwise size={16} weight="regular" />}
        >
          {t('common:reset')}
        </Button>
      </div>
    </div>
  );
}
