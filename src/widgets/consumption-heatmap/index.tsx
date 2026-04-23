import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/lib/number-format';
import styles from './styles.module.css';

interface HeatmapSeries {
  key: 'energy' | 'water';
  points: Array<{ label: string; value: number; unit: string }>;
}

interface ConsumptionHeatmapProps {
  series: HeatmapSeries[];
}

interface HoveredCell {
  seriesIndex: number;
  cellIndex: number;
}

function intensity(value: number, min: number, max: number): number {
  if (max <= min) return 0.5;
  return (value - min) / (max - min);
}

export function ConsumptionHeatmap({ series }: ConsumptionHeatmapProps) {
  const { t, i18n } = useTranslation('dashboard');
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const normalized = useMemo(
    () =>
      series.map((entry) => {
        const values = entry.points.map((p) => p.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        return {
          ...entry,
          min,
          max,
          cells: entry.points.map((point) => ({
            ...point,
            intensity: intensity(point.value, min, max),
          })),
        };
      }),
    [series],
  );

  const accentForKey = (key: HeatmapSeries['key']): string =>
    key === 'energy' ? styles.accentEnergy : styles.accentWater;

  return (
    <section className={styles.heatmap}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>{t('heatmap.title')}</h3>
          <p className={styles.subtitle}>{t('heatmap.subtitle')}</p>
        </div>
      </header>

      <div className={styles.grid}>
        {normalized.map((entry, seriesIndex) => (
          <div
            key={entry.key}
            className={`${styles.row} ${accentForKey(entry.key)}`}
          >
            <div className={styles.rowLabel}>
              {t(`heatmap.rows.${entry.key}`)}
            </div>
            <div className={styles.cells}>
              {entry.cells.map((cell, cellIndex) => {
                const isActive =
                  hovered?.seriesIndex === seriesIndex &&
                  hovered?.cellIndex === cellIndex;
                const formattedValue = formatNumber(cell.value, i18n.language, {
                  maximumFractionDigits: 0,
                });

                return (
                  <button
                    key={`${entry.key}-${cell.label}-${cellIndex}`}
                    type="button"
                    className={`${styles.cell} ${
                      isActive ? styles.cellActive : ''
                    }`}
                    style={
                      {
                        '--cell-intensity': cell.intensity.toFixed(3),
                      } as React.CSSProperties
                    }
                    onMouseEnter={() =>
                      setHovered({ seriesIndex, cellIndex })
                    }
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered({ seriesIndex, cellIndex })}
                    onBlur={() => setHovered(null)}
                    aria-label={`${t(`heatmap.rows.${entry.key}`)} — ${
                      cell.label
                    }: ${formattedValue} ${cell.unit}`}
                  >
                    <span className={styles.cellInner} />
                    {isActive && (
                      <span className={styles.cellTooltip} role="tooltip">
                        <span className={styles.cellTooltipLabel}>
                          {cell.label}
                        </span>
                        <span className={styles.cellTooltipValue}>
                          {formattedValue} {cell.unit}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.xAxis} aria-hidden="true">
        <div className={styles.xAxisSpacer} />
        <div className={styles.xAxisLabels}>
          {(normalized[0]?.cells ?? []).map((cell, index) => {
            const total = normalized[0]?.cells.length ?? 0;
            const shouldSkip = total > 12 && index % 2 !== 0;
            if (shouldSkip) return <span key={index} />;
            return (
              <span key={index} className={styles.xAxisLabel}>
                {cell.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
