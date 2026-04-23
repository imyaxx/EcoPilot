import type { ResourceUnitKey } from '../../config/dashboard-data';

export type DashboardMetricKey =
  | 'totalEnergy'
  | 'totalWater'
  | 'carbonFootprint'
  | 'efficiencyScore';

export type EnergyPeriod = 'month' | 'year';
export type WaterPeriod = 'month' | 'year';

export type DashboardMetricTrendDirection = 'up' | 'down' | 'neutral';

export interface DashboardMetricSnapshot {
  key: DashboardMetricKey;
  value: number;
  precision?: number;
  deltaPercentage: number;
  trendDirection: DashboardMetricTrendDirection;
  sparkline?: number[];
}

export interface ResourceTrendPoint {
  label: string;
  value: number;
  unitKey: ResourceUnitKey;
}

export type UtilityType = 'electricity' | 'water';

export interface UtilityTariff {
  utilityType: UtilityType;
  price: number;
}

export interface DashboardDataset {
  metrics: Record<EnergyPeriod, DashboardMetricSnapshot[]>;
  energyTrend: Record<EnergyPeriod, ResourceTrendPoint[]>;
  waterTrend: Record<WaterPeriod, ResourceTrendPoint[]>;
  tariffs: UtilityTariff[];
  monthlyYears: {
    energy: number;
    water: number;
  };
}

export interface DashboardSelectorResult {
  energyPeriod: EnergyPeriod;
  waterPeriod: WaterPeriod;
  metrics: DashboardMetricSnapshot[];
  activeEnergyTrend: ResourceTrendPoint[];
  activeWaterTrend: ResourceTrendPoint[];
}
