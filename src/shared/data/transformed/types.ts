export type DashboardMetricKey =
  | 'totalEnergy'
  | 'totalWater'
  | 'carbonFootprint'
  | 'efficiencyScore';

export type EnergyPeriod = 'month' | 'year';
export type WaterPeriod = 'year';

export type DashboardMetricTrendDirection = 'up' | 'down' | 'neutral';

export interface DashboardMetricSnapshot {
  key: DashboardMetricKey;
  label: string;
  value: number;
  formattedValue: string;
  unit: string;
  deltaPercentage: number;
  trendDirection: DashboardMetricTrendDirection;
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

export interface SystemInsight {
  id: string;
  title: string;
  description: string;
  severity: SystemInsightSeverity;
  category: SystemInsightCategory;
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
