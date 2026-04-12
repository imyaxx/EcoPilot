import type { DashboardDataset } from './types';
import { dashboardMetrics } from './dashboard-metrics';
import { energyTrend } from './energy-trend';
import { waterTrend } from './water-trend';
import { systemInsights } from './insights';
import { utilityTariffs } from './tariffs';

export const dashboardDataset: DashboardDataset = {
  metrics: dashboardMetrics,
  energyTrend,
  waterTrend,
  insights: systemInsights,
  tariffs: utilityTariffs,
};