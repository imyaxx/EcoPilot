import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lightning,
  CalendarBlank,
  TrendDown,
  Leaf,
  Drop,
  Thermometer,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardBody } from '../../shared/ui';
import styles from './styles.module.css';

type BuildingType = 'school' | 'residential' | 'office';

export interface CalculatorPageProps {
  electricityTariff: number;
  waterTariff: number;
}

interface FormState {
  buildingType: BuildingType;
  area: string;
  manualElectricity: string;
  manualWater: string;
  reductionPct: number;
}

type PhosphorIcon = React.FC<{ size?: number; weight?: string; color?: string }>;

interface RecommendationItem {
  RecommendationIcon: PhosphorIcon;
  title: string;
  description: string;
  iconColor: string;
}

const ELECTRICITY_FACTOR: Record<BuildingType, number> = {
  school: 15,
  residential: 8,
  office: 20,
};

const WATER_FACTOR: Record<BuildingType, number> = {
  school: 0.05,
  residential: 0.06,
  office: 0.04,
};

const CO2_FACTOR = 0.5;
const CHART_HEIGHT = 160;
const BAR_WIDTH = 70;

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    RecommendationIcon: Lightning,
    title: 'LED Lighting Upgrade',
    description:
      'Replacing fluorescent lights with LED reduces electricity consumption by 30–50%',
    iconColor: 'var(--color-energy)',
  },
  {
    RecommendationIcon: Drop,
    title: 'Smart Water Meters',
    description:
      'Installing individual meters reduces water consumption by 15–20% through awareness alone',
    iconColor: 'var(--color-water)',
  },
  {
    RecommendationIcon: Thermometer,
    title: 'HVAC Scheduling',
    description:
      'Programming heating/cooling to off-hours schedules saves 20–30% of energy costs',
    iconColor: 'var(--color-brand-primary)',
  },
];

function parseOptionalNumber(value: string): number | null {
  if (value === '') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

export function CalculatorPage({ electricityTariff, waterTariff }: CalculatorPageProps) {
  const { t } = useTranslation('calculator');
  const [showManualInputs, setShowManualInputs] = useState(false);

  const [form, setForm] = useState<FormState>({
    buildingType: 'school',
    area: '',
    manualElectricity: '',
    manualWater: '',
    reductionPct: 20,
  });

  const areaNum = parseFloat(form.area) || 0;
  const manualElectricityNum = parseOptionalNumber(form.manualElectricity);
  const manualWaterNum = parseOptionalNumber(form.manualWater);

  const hasInput = areaNum > 0 || manualElectricityNum !== null || manualWaterNum !== null;

  const electricityKwh =
    manualElectricityNum !== null
      ? manualElectricityNum
      : areaNum * ELECTRICITY_FACTOR[form.buildingType];

  const waterM3 =
    manualWaterNum !== null
      ? manualWaterNum
      : areaNum * WATER_FACTOR[form.buildingType];

  const monthlyElectricityCost = electricityKwh * electricityTariff;
  const monthlyWaterCost = waterM3 * waterTariff;
  const monthlyTotal = monthlyElectricityCost + monthlyWaterCost;
  const yearlyTotal = monthlyTotal * 12;

  const savedMonthly = monthlyTotal * (form.reductionPct / 100);
  const savedYearly = savedMonthly * 12;
  const savedCO2yearly = electricityKwh * 12 * (form.reductionPct / 100) * CO2_FACTOR;
  const savedWaterMonthly = waterM3 * waterTariff * (form.reductionPct / 100);
  const savedWaterYearly = savedWaterMonthly * 12;

  const afterYearly = yearlyTotal - savedYearly;
  const maxBarValue = Math.max(yearlyTotal, 1);
  const scaleCurrentBar = yearlyTotal / maxBarValue;
  const scaleSavingsBar = afterYearly / maxBarValue;

  const displayCurrency = (value: number): string =>
    hasInput ? Math.round(value).toLocaleString('ru-KZ') : '—';

  const displayCO2 = (value: number): string =>
    hasInput ? Math.round(value).toLocaleString('ru-KZ') : '—';

  const handleBuildingTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, buildingType: e.target.value as BuildingType }));
  };

  const handleTextChange =
    (field: 'area' | 'manualElectricity' | 'manualWater') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleReductionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, reductionPct: Number(e.target.value) }));
  };

  return (
    <div className={styles.page}>

      {/* ── form ── */}
      <div className={styles.formSection}>
        <Card>
          <CardHeader title={t('form.title')} />
          <CardBody>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="buildingType">
                {t('form.buildingType')}
              </label>
              <select
                id="buildingType"
                className={styles.select}
                value={form.buildingType}
                onChange={handleBuildingTypeChange}
              >
                <option value="school">{t('form.buildingTypes.school')}</option>
                <option value="residential">{t('form.buildingTypes.residential')}</option>
                <option value="office">{t('form.buildingTypes.office')}</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="area">
                {t('form.area')}
              </label>
              <input
                id="area"
                type="number"
                min={0}
                className={styles.input}
                placeholder={t('form.areaPlaceholder')}
                value={form.area}
                onChange={handleTextChange('area')}
              />
            </div>

            <div className={styles.fieldGroup}>
              <button
                type="button"
                className={styles.manualToggle}
                onClick={() => setShowManualInputs((prev) => !prev)}
                aria-expanded={showManualInputs}
              >
                {showManualInputs ? 'Hide manual inputs' : 'Enter consumption manually'}
                <span
                  className={`${styles.toggleArrow} ${showManualInputs ? styles.toggleArrowOpen : ''}`}
                >
                  →
                </span>
              </button>

              <div
                className={`${styles.manualFields} ${showManualInputs ? styles.manualFieldsOpen : ''}`}
              >
                <div className={styles.manualFieldInner}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="manualElectricity">
                      {t('form.manualElectricity')}
                    </label>
                    <input
                      id="manualElectricity"
                      type="number"
                      min={0}
                      className={styles.input}
                      placeholder={t('form.manualElectricityPlaceholder')}
                      value={form.manualElectricity}
                      onChange={handleTextChange('manualElectricity')}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="manualWater">
                      {t('form.manualWater')}
                    </label>
                    <input
                      id="manualWater"
                      type="number"
                      min={0}
                      className={styles.input}
                      placeholder={t('form.manualWaterPlaceholder')}
                      value={form.manualWater}
                      onChange={handleTextChange('manualWater')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.sliderHeader}>
                <label className={styles.fieldLabel} htmlFor="reductionPct">
                  {t('form.reductionTarget')}
                </label>
                <span className={styles.reductionBadge}>{form.reductionPct}%</span>
              </div>
              <input
                id="reductionPct"
                type="range"
                min={5}
                max={50}
                step={5}
                className={styles.slider}
                value={form.reductionPct}
                onChange={handleReductionChange}
              />
              <div className={styles.sliderTicks}>
                <span>5%</span>
                <span>50%</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── results ── */}
      <div className={styles.resultsSection}>
        <div className={styles.resultCards}>
          <Card padding="compact" className={styles.resultCard}>
            <div className={styles.resultCardContent}>
              <Lightning size={16} weight="duotone" color="var(--color-energy)" />
              <div>
                <p className={styles.resultLabel}>{t('results.monthlyTotal')}</p>
                <p className={styles.resultValue}>{displayCurrency(monthlyTotal)}</p>
                <p className={styles.resultUnit}>{t('results.currency')}</p>
              </div>
            </div>
          </Card>

          <Card padding="compact" className={styles.resultCard}>
            <div className={styles.resultCardContent}>
              <CalendarBlank size={16} weight="duotone" color="var(--color-water)" />
              <div>
                <p className={styles.resultLabel}>{t('results.yearlyTotal')}</p>
                <p className={styles.resultValue}>{displayCurrency(yearlyTotal)}</p>
                <p className={styles.resultUnit}>{t('results.currency')}</p>
              </div>
            </div>
          </Card>

          <Card
            padding="compact"
            className={`${styles.resultCard} ${styles.resultCardHighlight}`}
          >
            <div className={styles.resultCardContent}>
              <TrendDown size={18} weight="duotone" color="var(--color-brand-primary)" />
              <div>
                <p className={styles.resultLabel}>{t('results.yearlySavings')}</p>
                <p className={`${styles.resultValue} ${styles.resultValueHighlight}`}>
                  {displayCurrency(savedYearly)}
                </p>
                <p className={styles.resultUnit}>{t('results.currency')}</p>
              </div>
            </div>
          </Card>

          <Card padding="compact" className={styles.resultCard}>
            <div className={styles.resultCardContent}>
              <Leaf size={16} weight="duotone" color="var(--color-brand-soft)" />
              <div>
                <p className={styles.resultLabel}>{t('results.co2Reduction')}</p>
                <p className={styles.resultValue}>{displayCO2(savedCO2yearly)}</p>
                <p className={styles.resultUnit}>{t('results.co2Unit')}</p>
              </div>
            </div>
          </Card>

          <Card padding="compact" className={styles.resultCard}>
            <div className={styles.resultCardContent}>
              <Drop size={16} weight="duotone" color="var(--color-water)" />
              <div>
                <p className={styles.resultLabel}>Water Savings</p>
                <p className={styles.resultValue}>
                  {hasInput ? Math.round(savedWaterYearly).toLocaleString('ru-KZ') : '—'}
                </p>
                <p className={styles.resultUnit}>тенге/год</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── chart ── */}
      <div className={styles.chartSection}>
        <Card>
          <CardHeader title={t('chart.title')} />
          <CardBody>
            {hasInput ? (
              <div
                className={styles.chartWrapper}
                style={
                  {
                    '--scale-current': scaleCurrentBar,
                    '--scale-savings': scaleSavingsBar,
                  } as React.CSSProperties
                }
              >
                <svg
                  viewBox={`0 0 240 ${CHART_HEIGHT + 48}`}
                  className={styles.chartSvg}
                  role="img"
                  aria-label={t('chart.title')}
                >
                  <rect
                    x={30}
                    y={0}
                    width={BAR_WIDTH}
                    height={CHART_HEIGHT}
                    className={styles.barCurrent}
                    rx={4}
                  />
                  <rect
                    x={140}
                    y={0}
                    width={BAR_WIDTH}
                    height={CHART_HEIGHT}
                    className={styles.barSavings}
                    rx={4}
                  />
                  <text
                    x={65}
                    y={CHART_HEIGHT + 24}
                    className={styles.barLabel}
                    textAnchor="middle"
                  >
                    {t('chart.current')}
                  </text>
                  <text
                    x={175}
                    y={CHART_HEIGHT + 24}
                    className={styles.barLabel}
                    textAnchor="middle"
                  >
                    {t('chart.afterSavings')}
                  </text>
                </svg>
              </div>
            ) : (
              <div className={styles.chartEmptyState}>
                <p className={styles.chartEmptyText}>
                  Enter building area to see comparison
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* ── recommendations ── */}
      <div className={styles.recsSection}>
        {hasInput && (
          <div className={styles.recommendations}>
            <p className={styles.recommendationsTitle}>Recommendations</p>
            {RECOMMENDATIONS.map((rec) => (
              <Card key={rec.title} padding="compact">
                <div className={styles.recommendationCard}>
                  <div className={styles.recommendationIcon}>
                    <rec.RecommendationIcon
                      size={18}
                      weight="duotone"
                      color={rec.iconColor}
                    />
                  </div>
                  <div className={styles.recommendationContent}>
                    <p className={styles.recommendationTitle}>{rec.title}</p>
                    <p className={styles.recommendationDescription}>{rec.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
