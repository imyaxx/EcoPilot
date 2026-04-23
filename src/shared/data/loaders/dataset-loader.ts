import { DASHBOARD_DATASET_URLS, DASHBOARD_FACTORS } from '../../config/dashboard-data';
import type {
  DashboardDataset,
  DashboardMetricSnapshot,
  DashboardMetricTrendDirection,
  ResourceTrendPoint,
} from '../transformed';
import {
  extractEnergyMonthTrend,
  extractEnergyYearTrend,
  extractTariffs,
  extractWaterYearTrend,
  extractWaterMonthTrend,
  getEnergyMonthYear,
  getWaterMonthYear,
} from '../adapters';
import { loadWorkbook } from './workbook-loader';

function computeDelta(last: number, prev: number): number {
  if (prev === 0) return 0;
  return Number((((last - prev) / prev) * 100).toFixed(1));
}

function directionFor(delta: number): DashboardMetricTrendDirection {
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'neutral';
}

function tailSparkline(trend: ResourceTrendPoint[]): number[] {
  if (trend.length === 0) return [];
  return trend.slice(-DASHBOARD_FACTORS.sparklineLength).map((point) => point.value);
}

function buildMetrics(
  energyTrend: ResourceTrendPoint[],
  waterTrend: ResourceTrendPoint[],
): DashboardMetricSnapshot[] {
  const lastEnergy = energyTrend[energyTrend.length - 1]?.value ?? 0;
  const prevEnergy = energyTrend[energyTrend.length - 2]?.value ?? lastEnergy;
  const lastWater = waterTrend[waterTrend.length - 1]?.value ?? 0;
  const prevWater = waterTrend[waterTrend.length - 2]?.value ?? lastWater;

  const energyDelta = computeDelta(lastEnergy, prevEnergy);
  const waterDelta = computeDelta(lastWater, prevWater);

  const carbon = Number((lastEnergy * DASHBOARD_FACTORS.carbonPerEnergyUnit).toFixed(0));
  const prevCarbon = Number((prevEnergy * DASHBOARD_FACTORS.carbonPerEnergyUnit).toFixed(0));
  const carbonDelta = computeDelta(carbon, prevCarbon);

  const efficiencyScore = Number(
    Math.min(
      100,
      Math.max(0, 100 - Math.max(0, energyDelta) * 0.5 - Math.max(0, waterDelta) * 0.3),
    ).toFixed(1),
  );
  const prevEfficiency = Number(
    Math.min(
      100,
      Math.max(
        0,
        100 - Math.max(0, energyDelta - 1) * 0.5 - Math.max(0, waterDelta - 1) * 0.3,
      ),
    ).toFixed(1),
  );
  const efficiencyDelta = Number((efficiencyScore - prevEfficiency).toFixed(1));

  const energySpark = tailSparkline(energyTrend);
  const waterSpark = tailSparkline(waterTrend);
  const carbonSpark = energySpark.map((value) => value * DASHBOARD_FACTORS.carbonPerEnergyUnit);

  return [
    {
      key: 'totalEnergy',
      value: lastEnergy,
      precision: 0,
      deltaPercentage: Math.abs(energyDelta),
      trendDirection: directionFor(energyDelta),
      sparkline: energySpark,
    },
    {
      key: 'totalWater',
      value: lastWater,
      precision: 0,
      deltaPercentage: Math.abs(waterDelta),
      trendDirection: directionFor(waterDelta),
      sparkline: waterSpark,
    },
    {
      key: 'carbonFootprint',
      value: carbon,
      precision: 0,
      deltaPercentage: Math.abs(carbonDelta),
      trendDirection: directionFor(carbonDelta),
      sparkline: carbonSpark,
    },
    {
      key: 'efficiencyScore',
      value: efficiencyScore,
      precision: 1,
      deltaPercentage: Math.abs(efficiencyDelta),
      trendDirection: directionFor(efficiencyDelta),
    },
  ];
}

export async function loadDashboardDataset(): Promise<DashboardDataset> {
  const [electricityWorkbook, tariffsWorkbook] = await Promise.all([
    loadWorkbook(DASHBOARD_DATASET_URLS.electricity),
    loadWorkbook(DASHBOARD_DATASET_URLS.tariffs),
  ]);

  const energyMonthTrend = extractEnergyMonthTrend(electricityWorkbook);
  const energyYearTrend = extractEnergyYearTrend(electricityWorkbook);
  const waterYearTrend = extractWaterYearTrend(tariffsWorkbook);
  const waterMonthTrend = extractWaterMonthTrend(tariffsWorkbook);

  return {
    metrics: {
      month: buildMetrics(energyMonthTrend, waterMonthTrend),
      year: buildMetrics(energyYearTrend, waterYearTrend),
    },
    energyTrend: {
      month: energyMonthTrend,
      year: energyYearTrend,
    },
    waterTrend: {
      month: waterMonthTrend,
      year: waterYearTrend,
    },
    tariffs: extractTariffs(tariffsWorkbook),
    monthlyYears: {
      energy: getEnergyMonthYear(),
      water: getWaterMonthYear(),
    },
  };
}
