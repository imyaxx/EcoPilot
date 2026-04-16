import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  Lightning,
  CalendarBlank,
  TrendDown,
  Leaf,
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

function parseOptionalNumber(value: string): number | null {
  if (value === '') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

export function CalculatorPage({ electricityTariff, waterTariff }: CalculatorPageProps) {
  const { t } = useTranslation('calculator');

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

  const afterYearly = yearlyTotal - savedYearly;
  const maxBarValue = Math.max(yearlyTotal, 1);
  const scaleCurrentBar = yearlyTotal / maxBarValue;
  const scaleSavingsBar = afterYearly / maxBarValue;

  const formatCurrency = (value: number): string =>
    Math.round(value).toLocaleString('ru-KZ');

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
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <Calculator size={32} weight="duotone" color="var(--color-brand-primary)" />
          <h1 className={styles.title}>{t('title')}</h1>
        </div>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </header>

      <div className={styles.content}>
        {/* ── Left: Form ── */}
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

            <div className={styles.fieldGroup}>
              <div className={styles.sliderHeader}>
                <label className={styles.fieldLabel} htmlFor="reductionPct">
                  {t('form.reductionTarget')}
                </label>
                <span className={styles.sliderValue}>{form.reductionPct}%</span>
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

        {/* ── Right: Results ── */}
        <div className={styles.resultsColumn}>
          <div className={styles.resultCards}>
            <Card padding="compact" className={styles.resultCard}>
              <div className={styles.resultCardContent}>
                <Lightning size={16} weight="duotone" color="var(--color-energy)" />
                <div>
                  <p className={styles.resultLabel}>{t('results.monthlyTotal')}</p>
                  <p className={styles.resultValue}>{formatCurrency(monthlyTotal)}</p>
                  <p className={styles.resultUnit}>{t('results.currency')}</p>
                </div>
              </div>
            </Card>

            <Card padding="compact" className={styles.resultCard}>
              <div className={styles.resultCardContent}>
                <CalendarBlank size={16} weight="duotone" color="var(--color-water)" />
                <div>
                  <p className={styles.resultLabel}>{t('results.yearlyTotal')}</p>
                  <p className={styles.resultValue}>{formatCurrency(yearlyTotal)}</p>
                  <p className={styles.resultUnit}>{t('results.currency')}</p>
                </div>
              </div>
            </Card>

            <Card padding="compact" className={`${styles.resultCard} ${styles.resultCardHighlight}`}>
              <div className={styles.resultCardContent}>
                <TrendDown size={18} weight="duotone" color="var(--color-brand-primary)" />
                <div>
                  <p className={styles.resultLabel}>{t('results.yearlySavings')}</p>
                  <p className={`${styles.resultValue} ${styles.resultValueHighlight}`}>
                    {formatCurrency(savedYearly)}
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
                  <p className={styles.resultValue}>
                    {Math.round(savedCO2yearly).toLocaleString('ru-KZ')}
                  </p>
                  <p className={styles.resultUnit}>{t('results.co2Unit')}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Bar Chart ── */}
          <Card>
            <CardHeader title={t('chart.title')} />
            <CardBody>
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
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
