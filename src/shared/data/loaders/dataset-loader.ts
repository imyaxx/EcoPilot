import type {
  DashboardDataset,
  DashboardMetricSnapshot,
  EnergyPeriod,
  ResourceTrendPoint,
} from '../transformed';
import {
  extractEnergyMonthTrend,
  extractEnergyYearTrend,
  extractTariffs,
  extractWaterYearTrend,
  extractWaterMonthTrend,
} from '../adapters';
import { generateInsights } from '../transformed/insights';
import { loadWorkbook } from './workbook-loader';

const ELECTRICITY_WORKBOOK_URL = '/datasets/electricity-consumption-kazakhstan.xlsx';
const TARIFFS_WORKBOOK_URL = '/datasets/tariffs-kazakhstan.xlsx';

const CARBON_FACTOR = 0.5;

function buildMetrics(
  energyTrend: ResourceTrendPoint[],
  waterTrend: ResourceTrendPoint[],
  _period: EnergyPeriod,
): DashboardMetricSnapshot[] {
  const lastEnergy = energyTrend[energyTrend.length - 1]?.value ?? 0;
  const prevEnergy = energyTrend[energyTrend.length - 2]?.value ?? lastEnergy;
  const lastWater = waterTrend[waterTrend.length - 1]?.value ?? 0;
  const prevWater = waterTrend[waterTrend.length - 2]?.value ?? lastWater;

  const energyDelta = prevEnergy === 0 ? 0
    : Number((((lastEnergy - prevEnergy) / prevEnergy) * 100).toFixed(1));
  const waterDelta = prevWater === 0 ? 0
    : Number((((lastWater - prevWater) / prevWater) * 100).toFixed(1));

  const carbon = Number((lastEnergy * CARBON_FACTOR).toFixed(0));
  const prevCarbon = Number((prevEnergy * CARBON_FACTOR).toFixed(0));
  const carbonDelta = prevCarbon === 0 ? 0
    : Number((((carbon - prevCarbon) / prevCarbon) * 100).toFixed(1));

  const efficiencyScore = Number(
    Math.min(100, Math.max(0, 100 - Math.max(0, energyDelta) * 0.5 - Math.max(0, waterDelta) * 0.3)).toFixed(1),
  );
  const prevEfficiency = Number(
    Math.min(100, Math.max(0, 100 - Math.max(0, energyDelta - 1) * 0.5 - Math.max(0, waterDelta - 1) * 0.3)).toFixed(1),
  );
  const efficiencyDelta = Number((efficiencyScore - prevEfficiency).toFixed(1));

  return [
    {
      key: 'totalEnergy',
      label: 'Total Energy',
      value: lastEnergy,
      formattedValue: lastEnergy.toLocaleString(),
      unit: 'млн кВт·ч',
      deltaPercentage: Math.abs(energyDelta),
      trendDirection: energyDelta > 0 ? 'up' : energyDelta < 0 ? 'down' : 'neutral',
    },
    {
      key: 'totalWater',
      label: 'Total Water',
      value: lastWater,
      formattedValue: lastWater.toLocaleString(),
      unit: 'млн м³',
      deltaPercentage: Math.abs(waterDelta),
      trendDirection: waterDelta > 0 ? 'up' : waterDelta < 0 ? 'down' : 'neutral',
    },
    {
      key: 'carbonFootprint',
      label: 'Carbon Footprint',
      value: carbon,
      formattedValue: carbon.toLocaleString(),
      unit: 'млн кг CO₂',
      deltaPercentage: Math.abs(carbonDelta),
      trendDirection: carbonDelta > 0 ? 'up' : carbonDelta < 0 ? 'down' : 'neutral',
    },
    {
      key: 'efficiencyScore',
      label: 'Efficiency Score',
      value: efficiencyScore,
      formattedValue: String(efficiencyScore),
      unit: '%',
      deltaPercentage: Math.abs(efficiencyDelta),
      trendDirection: efficiencyDelta > 0 ? 'up' : efficiencyDelta < 0 ? 'down' : 'neutral',
    },
  ];
}

export async function loadDashboardDataset(): Promise<DashboardDataset> {
  const [electricityWorkbook, tariffsWorkbook] = await Promise.all([
    loadWorkbook(ELECTRICITY_WORKBOOK_URL),
    loadWorkbook(TARIFFS_WORKBOOK_URL),
  ]);

  const energyMonthTrend = extractEnergyMonthTrend(electricityWorkbook);
  const energyYearTrend = extractEnergyYearTrend(electricityWorkbook);
  const waterYearTrend = extractWaterYearTrend(tariffsWorkbook);
  const waterMonthTrend = extractWaterMonthTrend(tariffsWorkbook);

  return {
    metrics: {
      month: buildMetrics(energyMonthTrend, waterMonthTrend, 'month'),
      year: buildMetrics(energyYearTrend, waterYearTrend, 'year'),
    },
    energyTrend: {
      month: energyMonthTrend,
      year: energyYearTrend,
    },
    waterTrend: {
      month: waterMonthTrend,
      year: waterYearTrend,
    },
    insights: generateInsights(energyYearTrend, waterYearTrend),
    tariffs: extractTariffs(tariffsWorkbook),
  };
}