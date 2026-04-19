import type {
  DashboardDataset,
  DashboardSelectorResult,
  DashboardTrendSummary,
  EnergyPeriod,
  UtilityTariff,
  WaterPeriod,
} from '../transformed';

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
  dataset: DashboardDataset,
  energyPeriod: EnergyPeriod = 'month',
  waterPeriod: WaterPeriod = 'year',
): DashboardSelectorResult {
  const activeEnergyTrend = dataset.energyTrend[energyPeriod];
  const activeWaterTrend = dataset.waterTrend[waterPeriod];
  const metrics = dataset.metrics[energyPeriod];
  const energyValues = activeEnergyTrend.map((point) => point.value);
  const waterValues = activeWaterTrend.map((point) => point.value);

  return {
    energyPeriod,
    waterPeriod,
    metrics,
    activeEnergyTrend,
    activeWaterTrend,
    energySummary: buildTrendSummary(energyValues),
    waterSummary: buildTrendSummary(waterValues),
    electricityTariff: getTariffByType(dataset.tariffs, 'electricity'),
    waterTariff: getTariffByType(dataset.tariffs, 'water'),
  };
}
