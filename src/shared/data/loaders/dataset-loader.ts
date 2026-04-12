import type { DashboardDataset } from '../transformed';
import { extractEnergyMonthTrend, extractEnergyYearTrend, extractTariffs } from '../adapters';
import { dashboardMetrics } from '../transformed/dashboard-metrics';
import { energyTrend } from '../transformed/energy-trend';
import { systemInsights } from '../transformed/insights';
import { waterTrend } from '../transformed/water-trend';
import { loadWorkbook } from './workbook-loader';

const ELECTRICITY_WORKBOOK_URL = '/datasets/electricity-consumption-kazakhstan.xlsx';
const TARIFFS_WORKBOOK_URL = '/datasets/tariffs-kazakhstan.xlsx';

export async function loadDashboardDataset(): Promise<DashboardDataset> {
  const [electricityWorkbook, tariffsWorkbook] = await Promise.all([
    loadWorkbook(ELECTRICITY_WORKBOOK_URL),
    loadWorkbook(TARIFFS_WORKBOOK_URL),
  ]);

  return {
    metrics: dashboardMetrics,
    energyTrend: {
      week: energyTrend.week,
      month: extractEnergyMonthTrend(electricityWorkbook),
      year: extractEnergyYearTrend(electricityWorkbook),
    },
    waterTrend,
    insights: systemInsights,
    tariffs: extractTariffs(tariffsWorkbook),
  };
}
