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
  formattedValue: string;
  deltaPercentage: number;
  trendDirection: DashboardMetricTrendDirection;
  /** Optional mini trend used to render inline sparklines. */
  sparkline?: number[];
}

export interface ResourceTrendPoint {
  label: string;
  value: number;
  unit: string;
}

export type SystemInsightSeverity = 'info' | 'warning' | 'critical';

export type SystemInsightCategory =
  | 'water'
  | 'energy'
  | 'efficiency'
  | 'carbon';

export type SystemInsightId =
  | 'energy-growth-high'
  | 'energy-growth-moderate'
  | 'energy-reduction'
  | 'water-growth-high'
  | 'water-growth-moderate'
  | 'water-reduction'
  | 'carbon-footprint-info';

/**
 * Raw insight record. Translation happens in the UI layer — we only carry
 * interpolation values here so the presentation stays language-agnostic.
 */
export interface SystemInsight {
  id: SystemInsightId;
  severity: SystemInsightSeverity;
  category: SystemInsightCategory;
  values: Record<string, string | number>;
}

export type UtilityType = 'electricity' | 'water';

export interface UtilityTariff {
  utilityType: UtilityType;
  label: string;
  price: number;
  unit: string;
  currency: string;
  sourceLabel: string;
}

export interface DashboardDataset {
  metrics: Record<EnergyPeriod, DashboardMetricSnapshot[]>;
  energyTrend: Record<EnergyPeriod, ResourceTrendPoint[]>;
  waterTrend: Record<WaterPeriod, ResourceTrendPoint[]>;
  insights: SystemInsight[];
  tariffs: UtilityTariff[];
}

export interface DashboardTrendSummary {
  currentValue: number;
  previousValue: number;
  absoluteChange: number;
  percentageChange: number;
}

export interface DashboardSelectorResult {
  energyPeriod: EnergyPeriod;
  waterPeriod: WaterPeriod;
  metrics: DashboardMetricSnapshot[];
  activeEnergyTrend: ResourceTrendPoint[];
  activeWaterTrend: ResourceTrendPoint[];
  energySummary: DashboardTrendSummary;
  waterSummary: DashboardTrendSummary;
  criticalInsightsCount: number;
  warningInsightsCount: number;
  infoInsightsCount: number;
  electricityTariff: UtilityTariff | null;
  waterTariff: UtilityTariff | null;
}
