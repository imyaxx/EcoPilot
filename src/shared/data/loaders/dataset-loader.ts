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
} from '../adapters';
import { loadWorkbook } from './workbook-loader';

const ELECTRICITY_WORKBOOK_URL = '/datasets/electricity-consumption-kazakhstan.xlsx';
const TARIFFS_WORKBOOK_URL = '/datasets/tariffs-kazakhstan.xlsx';

const CARBON_FACTOR = 0.5;
const SPARKLINE_LENGTH = 8;

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
  return trend.slice(-SPARKLINE_LENGTH).map((point) => point.value);
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

  const carbon = Number((lastEnergy * CARBON_FACTOR).toFixed(0));
  const prevCarbon = Number((prevEnergy * CARBON_FACTOR).toFixed(0));
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
  const carbonSpark = energySpark.map((value) => value * CARBON_FACTOR);

  return [
    {
      key: 'totalEnergy',
      value: lastEnergy,
      formattedValue: lastEnergy.toLocaleString(),
      deltaPercentage: Math.abs(energyDelta),
      trendDirection: directionFor(energyDelta),
      sparkline: energySpark,
    },
    {
      key: 'totalWater',
      value: lastWater,
      formattedValue: lastWater.toLocaleString(),
      deltaPercentage: Math.abs(waterDelta),
      trendDirection: directionFor(waterDelta),
      sparkline: waterSpark,
    },
    {
      key: 'carbonFootprint',
      value: carbon,
      formattedValue: carbon.toLocaleString(),
      deltaPercentage: Math.abs(carbonDelta),
      trendDirection: directionFor(carbonDelta),
      sparkline: carbonSpark,
    },
    {
      key: 'efficiencyScore',
      value: efficiencyScore,
      formattedValue: String(efficiencyScore),
      deltaPercentage: Math.abs(efficiencyDelta),
      trendDirection: directionFor(efficiencyDelta),
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
  };
}
