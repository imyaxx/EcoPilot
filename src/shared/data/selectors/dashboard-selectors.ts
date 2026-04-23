import type {
  DashboardDataset,
  DashboardSelectorResult,
  EnergyPeriod,
  WaterPeriod,
} from '../transformed';

export function selectDashboardDerivedData(
  dataset: DashboardDataset,
  energyPeriod: EnergyPeriod = 'month',
  waterPeriod: WaterPeriod = 'year',
): DashboardSelectorResult {
  return {
    energyPeriod,
    waterPeriod,
    metrics: dataset.metrics[energyPeriod],
    activeEnergyTrend: dataset.energyTrend[energyPeriod],
    activeWaterTrend: dataset.waterTrend[waterPeriod],
  };
}
