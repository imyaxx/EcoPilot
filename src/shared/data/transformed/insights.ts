import type { SystemInsight, ResourceTrendPoint } from './types';

export function generateInsights(
  energyTrend: ResourceTrendPoint[],
  waterTrend: ResourceTrendPoint[],
): SystemInsight[] {
  const insights: SystemInsight[] = [];

  // Energy trend analysis
  if (energyTrend.length >= 2) {
    const last = energyTrend[energyTrend.length - 1].value;
    const prev = energyTrend[energyTrend.length - 2].value;
    const delta = ((last - prev) / prev) * 100;

    if (delta > 5) {
      insights.push({
        id: 'energy-growth-high',
        title: 'Высокий рост потребления электроэнергии',
        description: `Потребление выросло на ${delta.toFixed(1)}% по сравнению с предыдущим периодом (${prev.toLocaleString()} → ${last.toLocaleString()} млн кВт·ч).`,
        severity: 'critical',
        category: 'energy',
      });
    } else if (delta > 2) {
      insights.push({
        id: 'energy-growth-moderate',
        title: 'Умеренный рост потребления электроэнергии',
        description: `Потребление выросло на ${delta.toFixed(1)}% (${prev.toLocaleString()} → ${last.toLocaleString()} млн кВт·ч). Рекомендуется проверить эффективность систем.`,
        severity: 'warning',
        category: 'energy',
      });
    } else if (delta < 0) {
      insights.push({
        id: 'energy-reduction',
        title: 'Снижение потребления электроэнергии',
        description: `Потребление снизилось на ${Math.abs(delta).toFixed(1)}% (${prev.toLocaleString()} → ${last.toLocaleString()} млн кВт·ч). Меры по энергоэффективности дают результат.`,
        severity: 'info',
        category: 'energy',
      });
    }
  }

  // Water trend analysis
  if (waterTrend.length >= 2) {
    const last = waterTrend[waterTrend.length - 1].value;
    const prev = waterTrend[waterTrend.length - 2].value;
    const delta = ((last - prev) / prev) * 100;

    if (delta > 10) {
      insights.push({
        id: 'water-growth-high',
        title: 'Значительный рост водопотребления',
        description: `Объём водоснабжения вырос на ${delta.toFixed(1)}% (${prev} → ${last} млн м³). Возможны потери в сетях или рост нагрузки.`,
        severity: 'critical',
        category: 'water',
      });
    } else if (delta > 4) {
      insights.push({
        id: 'water-growth-moderate',
        title: 'Рост водопотребления',
        description: `Объём водоснабжения вырос на ${delta.toFixed(1)}% (${prev} → ${last} млн м³).`,
        severity: 'warning',
        category: 'water',
      });
    } else if (delta < 0) {
      insights.push({
        id: 'water-reduction',
        title: 'Снижение водопотребления',
        description: `Объём водоснабжения снизился на ${Math.abs(delta).toFixed(1)}% (${prev} → ${last} млн м³).`,
        severity: 'info',
        category: 'water',
      });
    }
  }

  // Carbon footprint insight based on energy
  if (energyTrend.length >= 1) {
    const last = energyTrend[energyTrend.length - 1].value;
    const carbonMln = (last * 0.5).toFixed(0);
    insights.push({
      id: 'carbon-footprint-info',
      title: 'Углеродный след энергосистемы',
      description: `При текущем потреблении ${last.toLocaleString()} млн кВт·ч расчётный выброс CO₂ составляет ~${carbonMln} млн кг. Казахстан генерирует ~85% электроэнергии из угля и газа.`,
      severity: 'info',
      category: 'carbon',
    });
  }

  return insights;
}