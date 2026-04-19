import type {
  ResourceTrendPoint,
  SystemInsight,
  SystemInsightId,
} from './types';

const CARBON_FACTOR = 0.5;

function buildEnergyInsight(
  trend: ResourceTrendPoint[],
): SystemInsight | null {
  if (trend.length < 2) return null;

  const last = trend[trend.length - 1].value;
  const prev = trend[trend.length - 2].value;
  if (prev === 0) return null;

  const delta = ((last - prev) / prev) * 100;
  const values = {
    delta: Math.abs(delta).toFixed(1),
    prev: prev.toLocaleString(),
    last: last.toLocaleString(),
  };

  let id: SystemInsightId | null = null;
  let severity: SystemInsight['severity'] = 'info';

  if (delta > 5) {
    id = 'energy-growth-high';
    severity = 'critical';
  } else if (delta > 2) {
    id = 'energy-growth-moderate';
    severity = 'warning';
  } else if (delta < 0) {
    id = 'energy-reduction';
    severity = 'info';
  }

  if (!id) return null;
  return { id, severity, category: 'energy', values };
}

function buildWaterInsight(trend: ResourceTrendPoint[]): SystemInsight | null {
  if (trend.length < 2) return null;

  const last = trend[trend.length - 1].value;
  const prev = trend[trend.length - 2].value;
  if (prev === 0) return null;

  const delta = ((last - prev) / prev) * 100;
  const values = {
    delta: Math.abs(delta).toFixed(1),
    prev: prev.toLocaleString(),
    last: last.toLocaleString(),
  };

  let id: SystemInsightId | null = null;
  let severity: SystemInsight['severity'] = 'info';

  if (delta > 10) {
    id = 'water-growth-high';
    severity = 'critical';
  } else if (delta > 4) {
    id = 'water-growth-moderate';
    severity = 'warning';
  } else if (delta < 0) {
    id = 'water-reduction';
    severity = 'info';
  }

  if (!id) return null;
  return { id, severity, category: 'water', values };
}

function buildCarbonInsight(
  trend: ResourceTrendPoint[],
): SystemInsight | null {
  if (trend.length < 1) return null;
  const last = trend[trend.length - 1].value;
  const carbon = Math.round(last * CARBON_FACTOR);

  return {
    id: 'carbon-footprint-info',
    severity: 'info',
    category: 'carbon',
    values: {
      last: last.toLocaleString(),
      carbon: carbon.toLocaleString(),
    },
  };
}

export function generateInsights(
  energyTrend: ResourceTrendPoint[],
  waterTrend: ResourceTrendPoint[],
): SystemInsight[] {
  return [
    buildEnergyInsight(energyTrend),
    buildWaterInsight(waterTrend),
    buildCarbonInsight(energyTrend),
  ].filter((insight): insight is SystemInsight => insight !== null);
}
