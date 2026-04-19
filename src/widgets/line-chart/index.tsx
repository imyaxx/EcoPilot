import { useId, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

type ChartAccent = 'energy' | 'water' | 'brand' | 'carbon';

export interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  title: string;
  subtitle?: string;
  accent: ChartAccent;
  data: LineChartPoint[];
  unit: string;
  headerAction?: ReactNode;
}

const VIEWBOX_WIDTH = 720;
const VIEWBOX_HEIGHT = 260;
const PADDING = { top: 24, right: 24, bottom: 36, left: 52 };
const GRID_ROWS = 4;

const accentClassMap: Record<ChartAccent, string> = {
  energy: styles.accentEnergy,
  water: styles.accentWater,
  brand: styles.accentBrand,
  carbon: styles.accentCarbon,
};

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const fraction = value / magnitude;
  let nice: number;
  if (fraction <= 1) nice = 1;
  else if (fraction <= 2) nice = 2;
  else if (fraction <= 5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}

function formatAxisValue(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

function buildCatmullRomPath(
  points: Array<{ x: number; y: number }>,
): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function LineChart({
  title,
  subtitle,
  accent,
  data,
  unit,
  headerAction,
}: LineChartProps) {
  const { t } = useTranslation('dashboard');
  const gradientId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const geometry = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map((point) => point.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const range = rawMax - rawMin || 1;
    const yMin = Math.max(0, rawMin - range * 0.08);
    const yMax = niceCeil(rawMax + range * 0.08);

    const innerWidth = VIEWBOX_WIDTH - PADDING.left - PADDING.right;
    const innerHeight = VIEWBOX_HEIGHT - PADDING.top - PADDING.bottom;

    const step =
      data.length > 1 ? innerWidth / (data.length - 1) : innerWidth / 2;
    const baseX = data.length > 1 ? PADDING.left : PADDING.left + innerWidth / 2;

    const points = data.map((point, index) => {
      const x = baseX + step * index;
      const y =
        PADDING.top +
        innerHeight - ((point.value - yMin) / (yMax - yMin)) * innerHeight;
      return { x, y, value: point.value, label: point.label };
    });

    const gridLines: number[] = [];
    for (let r = 0; r <= GRID_ROWS; r += 1) {
      const ratio = r / GRID_ROWS;
      const y = PADDING.top + innerHeight * (1 - ratio);
      gridLines.push(y);
    }

    const axisValues: number[] = [];
    for (let r = 0; r <= GRID_ROWS; r += 1) {
      const value = yMin + ((yMax - yMin) * r) / GRID_ROWS;
      axisValues.push(value);
    }

    const linePath = buildCatmullRomPath(points);
    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x} ${
            PADDING.top + innerHeight
          } L ${points[0].x} ${PADDING.top + innerHeight} Z`
        : '';

    return {
      points,
      gridLines,
      axisValues,
      linePath,
      areaPath,
      innerHeight,
      innerWidth,
      step,
    };
  }, [data]);

  if (!geometry || data.length === 0) {
    return (
      <section className={`${styles.chart} ${accentClassMap[accent]}`}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h3 className={styles.title}>{title}</h3>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {headerAction && (
            <div className={styles.headerAction}>{headerAction}</div>
          )}
        </header>
        <div className={styles.empty}>{t('charts.empty')}</div>
      </section>
    );
  }

  const activePoint =
    activeIndex !== null ? geometry.points[activeIndex] : null;

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const localX = ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH;
    let closestIndex = 0;
    let closestDistance = Infinity;
    geometry.points.forEach((point, index) => {
      const distance = Math.abs(point.x - localX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveIndex(closestIndex);
  };

  const tooltipValue = activePoint
    ? `${activePoint.value.toLocaleString()} ${unit}`
    : '';

  const tooltipDelta =
    activeIndex !== null && activeIndex > 0
      ? ((geometry.points[activeIndex].value -
          geometry.points[activeIndex - 1].value) /
          geometry.points[activeIndex - 1].value) *
        100
      : null;

  const tooltipLeftPct = activePoint
    ? (activePoint.x / VIEWBOX_WIDTH) * 100
    : 0;

  return (
    <section className={`${styles.chart} ${accentClassMap[accent]}`}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {headerAction && (
          <div className={styles.headerAction}>{headerAction}</div>
        )}
      </header>

      <div className={styles.svgWrapper}>
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className={styles.svg}
          role="img"
          aria-label={title}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" className={styles.gradientStart} />
              <stop offset="100%" className={styles.gradientEnd} />
            </linearGradient>
          </defs>

          {/* grid rows */}
          {geometry.gridLines.map((y, index) => (
            <line
              key={`grid-${index}`}
              x1={PADDING.left}
              x2={VIEWBOX_WIDTH - PADDING.right}
              y1={y}
              y2={y}
              className={styles.gridLine}
            />
          ))}

          {/* y axis labels */}
          {geometry.axisValues.map((value, index) => {
            const y = geometry.gridLines[index];
            return (
              <text
                key={`axis-y-${index}`}
                x={PADDING.left - 10}
                y={y}
                className={styles.axisLabel}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatAxisValue(value)}
              </text>
            );
          })}

          {/* x axis labels */}
          {geometry.points.map((point, index) => {
            const totalLabels = geometry.points.length;
            const shouldSkip =
              totalLabels > 8 && index % Math.ceil(totalLabels / 8) !== 0;
            if (shouldSkip && index !== totalLabels - 1) return null;
            return (
              <text
                key={`axis-x-${index}`}
                x={point.x}
                y={VIEWBOX_HEIGHT - PADDING.bottom + 18}
                className={styles.axisLabel}
                textAnchor="middle"
              >
                {point.label}
              </text>
            );
          })}

          {/* area fill */}
          {geometry.areaPath && (
            <path
              d={geometry.areaPath}
              fill={`url(#${gradientId})`}
              className={styles.area}
            />
          )}

          {/* main line */}
          <path d={geometry.linePath} className={styles.line} />

          {/* active indicator (vertical guide + halo) */}
          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={PADDING.top}
                y2={VIEWBOX_HEIGHT - PADDING.bottom}
                className={styles.guideLine}
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={10}
                className={styles.pointHalo}
              />
            </>
          )}

          {/* data points */}
          {geometry.points.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r={activeIndex === index ? 4.5 : 3}
              className={styles.point}
            />
          ))}
        </svg>

        {activePoint && (
          <div
            className={styles.tooltip}
            style={{ left: `${tooltipLeftPct}%` }}
            role="tooltip"
          >
            <div className={styles.tooltipLabel}>{activePoint.label}</div>
            <div className={styles.tooltipValue}>{tooltipValue}</div>
            {tooltipDelta !== null && (
              <div
                className={
                  tooltipDelta >= 0
                    ? styles.tooltipDeltaUp
                    : styles.tooltipDeltaDown
                }
              >
                {tooltipDelta >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(tooltipDelta).toFixed(1)}%{' '}
                <span className={styles.tooltipDeltaHint}>
                  {t('charts.tooltip.change')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
