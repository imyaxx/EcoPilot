import type {
  DashboardDataset,
  DashboardPeriod,
  DashboardSelectorResult,
  DashboardTrendSummary,
  UtilityTariff,
} from '../transformed';
import { dashboardDataset } from '../transformed';

function buildTrendSummary(values: number[]): DashboardTrendSummary {
  if (values.length < 2) {
    return {
      currentValue: values[0] ?? 0,
      previousValue: 0,
      absoluteChange: 0,
      percentageChange: 0,
    };
  }

  const currentValue = values[values.length - 1];
  const previousValue = values[values.length - 2];
  const absoluteChange = currentValue - previousValue;
  const percentageChange =
    previousValue === 0 ? 0 : Number(((absoluteChange / previousValue) * 100).toFixed(1));

  return {
    currentValue,
    previousValue,
    absoluteChange,
    percentageChange,
  };
}

function getTariffByType(
  tariffs: UtilityTariff[],
  utilityType: UtilityTariff['utilityType'],
): UtilityTariff | null {
  return tariffs.find((tariff) => tariff.utilityType === utilityType) ?? null;
}

export function selectDashboardDerivedData(
  dataset: DashboardDataset = dashboardDataset,
  period: DashboardPeriod = 'month',
): DashboardSelectorResult {
  const activeEnergyTrend = dataset.energyTrend[period];
  const activeWaterTrend = dataset.waterTrend[period];
  const metrics = dataset.metrics[period];
  const energyValues = activeEnergyTrend.map((point) => point.value);
  const waterValues = activeWaterTrend.map((point) => point.value);

  const criticalInsightsCount = dataset.insights.filter(
    (insight) => insight.severity === 'critical',
  ).length;

  const warningInsightsCount = dataset.insights.filter(
    (insight) => insight.severity === 'warning',
  ).length;

  const infoInsightsCount = dataset.insights.filter(
    (insight) => insight.severity === 'info',
  ).length;

  return {
    period,
    metrics,
    activeEnergyTrend,
    activeWaterTrend,
    energySummary: buildTrendSummary(energyValues),
    waterSummary: buildTrendSummary(waterValues),
    criticalInsightsCount,
    warningInsightsCount,
    infoInsightsCount,
    electricityTariff: getTariffByType(dataset.tariffs, 'electricity'),
    waterTariff: getTariffByType(dataset.tariffs, 'water'),
  };
}
