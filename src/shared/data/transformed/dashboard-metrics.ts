import type { DashboardMetricSnapshot } from './types';

export const dashboardMetrics: DashboardMetricSnapshot[] = [
  {
    key: 'totalEnergy',
    label: 'Total Energy',
    value: 2847,
    formattedValue: '2,847',
    unit: 'kWh',
    deltaPercentage: 12.5,
    trendDirection: 'down',
  },
  {
    key: 'totalWater',
    label: 'Total Water',
    value: 1203,
    formattedValue: '1,203',
    unit: 'm³',
    deltaPercentage: 3.2,
    trendDirection: 'up',
  },
  {
    key: 'carbonFootprint',
    label: 'Carbon Footprint',
    value: 482,
    formattedValue: '482',
    unit: 'kg',
    deltaPercentage: 8.1,
    trendDirection: 'up',
  },
  {
    key: 'efficiencyScore',
    label: 'Efficiency Score',
    value: 94.2,
    formattedValue: '94.2',
    unit: '%',
    deltaPercentage: 1.4,
    trendDirection: 'up',
  },
];