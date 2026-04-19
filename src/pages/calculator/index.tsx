import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lightning,
  CalendarBlank,
  TrendDown,
  Leaf,
  Drop,
  Thermometer,
  Sun,
  House,
  Sparkle,
  Buildings,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardBody, Button } from '../../shared/ui';
import styles from './styles.module.css';

type BuildingType = 'school' | 'residential' | 'office';

type RecommendationKey = 'led' | 'smartMeters' | 'hvac' | 'insulation' | 'solar';

interface RecommendationConfig {
  key: RecommendationKey;
  icon: ReactNode;
  impactPercent: number;
  iconTone: 'energy' | 'water' | 'brand' | 'carbon';
}

const RECOMMENDATIONS: RecommendationConfig[] = [
  {
    key: 'led',
    icon: <Lightning size={18} weight="fill" />,
    impactPercent: 40,
    iconTone: 'energy',
  },
  {
    key: 'hvac',
    icon: <Thermometer size={18} weight="fill" />,
    impactPercent: 25,
    iconTone: 'brand',
  },
  {
    key: 'insulation',
    icon: <House size={18} weight="fill" />,
    impactPercent: 30,
    iconTone: 'carbon',
  },
  {
    key: 'solar',
    icon: <Sun size={18} weight="fill" />,
    impactPercent: 18,
    iconTone: 'energy',
  },
  {
    key: 'smartMeters',
    icon: <Drop size={18} weight="fill" />,
    impactPercent: 17,
    iconTone: 'water',
  },
];

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

const BUILDING_ICON: Record<BuildingType, ReactNode> = {
  school: <Buildings size={16} weight="fill" />,
  residential: <House size={16} weight="fill" />,
  office: <Sparkle size={16} weight="fill" />,
};

/**
 * Approximate upfront investment (KZT / m²) required to achieve the full
 * potential of the efficiency measures mapped here. This is a rough rule-of-
 * thumb used to estimate payback in months.
 */
const INVESTMENT_PER_M2 = 7500;
const CO2_FACTOR = 0.5;

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

function parseOptionalNumber(value: string): number | null {
  if (value === '') return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function CalculatorPage({
  electricityTariff,
  waterTariff,
}: CalculatorPageProps) {
  const { t, i18n } = useTranslation('calculator');
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

  const hasInput =
    areaNum > 0 || manualElectricityNum !== null || manualWaterNum !== null;

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

  const reductionRatio = form.reductionPct / 100;
  const savedMonthly = monthlyTotal * reductionRatio;
  const savedYearly = savedMonthly * 12;
  const savedCO2yearly = electricityKwh * 12 * reductionRatio * CO2_FACTOR;
  const savedWaterYearly = monthlyWaterCost * reductionRatio * 12;

  /**
   * Rough payback: upfront investment = INVESTMENT_PER_M2 × area × (reduction share).
   * We assume larger targets require larger up-front spend, not linearly — scale by sqrt.
   */
  const investment = areaNum * INVESTMENT_PER_M2 * Math.sqrt(reductionRatio);
  const paybackMonths =
    savedMonthly > 0 ? Math.round(investment / savedMonthly) : 0;

  const electricityShare =
    monthlyTotal > 0 ? monthlyElectricityCost / monthlyTotal : 0;

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }),
    [i18n.language],
  );

  const displayCurrency = (value: number): string =>
    hasInput ? numberFormatter.format(Math.round(value)) : '—';

  const sortedRecommendations = useMemo(
    () => [...RECOMMENDATIONS].sort((a, b) => b.impactPercent - a.impactPercent),
    [],
  );

  const handleBuildingTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      buildingType: event.target.value as BuildingType,
    }));
  };

  const handleTextChange =
    (field: 'area' | 'manualElectricity' | 'manualWater') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleReductionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      reductionPct: Number(event.target.value),
    }));
  };

  const handleUseCityAverages = () => {
    // Presets differ per building type; we seed the form with typical Almaty
    // building scales so that judges see live numbers with a single click.
    const presets: Record<BuildingType, string> = {
      school: '4500',
      residential: '7200',
      office: '3200',
    };
    setForm((prev) => ({
      ...prev,
      area: presets[prev.buildingType],
      manualElectricity: '',
      manualWater: '',
    }));
  };

  // Donut geometry
  const DONUT_SIZE = 140;
  const DONUT_STROKE = 18;
  const radius = (DONUT_SIZE - DONUT_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <span className={styles.heroEyebrow}>{t('hero.eyebrow')}</span>
        <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
        <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
      </header>

      <div className={styles.layout}>
        {/* ── LEFT column: form + breakdown ── */}
        <div className={styles.leftColumn}>
          {/* Form */}
          <Card>
            <CardHeader
              title={t('form.title')}
              action={
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleUseCityAverages}
                >
                  {t('form.useBuildingData')}
                </Button>
              }
            />
            <CardBody>
              {/* Building type segmented control */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="buildingType">
                  {t('form.buildingType')}
                </label>
                <div className={styles.segmented} role="radiogroup">
                  {(Object.keys(ELECTRICITY_FACTOR) as BuildingType[]).map(
                    (type) => {
                      const isActive = form.buildingType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          className={`${styles.segmentedButton} ${
                            isActive ? styles.segmentedButtonActive : ''
                          }`}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              buildingType: type,
                            }))
                          }
                        >
                          <span className={styles.segmentedIcon}>
                            {BUILDING_ICON[type]}
                          </span>
                          {t(`form.buildingTypes.${type}`)}
                        </button>
                      );
                    },
                  )}
                </div>
                {/* preserve native select for a11y fallback */}
                <select
                  id="buildingType"
                  className={styles.visuallyHidden}
                  value={form.buildingType}
                  onChange={handleBuildingTypeChange}
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <option value="school">
                    {t('form.buildingTypes.school')}
                  </option>
                  <option value="residential">
                    {t('form.buildingTypes.residential')}
                  </option>
                  <option value="office">
                    {t('form.buildingTypes.office')}
                  </option>
                </select>
              </div>

              {/* Area */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="area">
                  {t('form.area')}{' '}
                  <span className={styles.fieldUnit}>
                    ({t('form.areaUnit')})
                  </span>
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

              {/* Manual toggle */}
              <div className={styles.fieldGroup}>
                <button
                  type="button"
                  className={styles.manualToggle}
                  onClick={() => setShowManualInputs((prev) => !prev)}
                  aria-expanded={showManualInputs}
                >
                  {showManualInputs
                    ? t('form.manualToggleHide')
                    : t('form.manualToggleShow')}
                  <span
                    className={
                      showManualInputs
                        ? styles.manualToggleArrowOpen
                        : styles.manualToggleArrow
                    }
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>

                <div
                  className={`${styles.manualFields} ${
                    showManualInputs ? styles.manualFieldsOpen : ''
                  }`}
                >
                  <div className={styles.manualFieldInner}>
                    <div className={styles.manualFieldRow}>
                      <label
                        className={styles.fieldLabel}
                        htmlFor="manualElectricity"
                      >
                        {t('form.manualElectricity')}{' '}
                        <span className={styles.fieldUnit}>
                          ({t('form.manualElectricityUnit')})
                        </span>
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

                    <div className={styles.manualFieldRow}>
                      <label
                        className={styles.fieldLabel}
                        htmlFor="manualWater"
                      >
                        {t('form.manualWater')}{' '}
                        <span className={styles.fieldUnit}>
                          ({t('form.manualWaterUnit')})
                        </span>
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

              {/* Reduction slider */}
              <div className={styles.fieldGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.fieldLabel} htmlFor="reductionPct">
                    {t('form.reductionTarget')}
                  </label>
                  <span className={styles.reductionBadge}>
                    {form.reductionPct}%
                  </span>
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

          {/* Cost breakdown (donut) */}
          <Card>
            <CardHeader title={t('breakdown.title')} />
            <CardBody>
              <p className={styles.breakdownSubtitle}>
                {t('breakdown.subtitle')}
              </p>

              {hasInput ? (
                <div className={styles.donutWrapper}>
                  <svg
                    className={styles.donut}
                    viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
                    role="img"
                    aria-label={t('breakdown.title')}
                  >
                    {/* background ring */}
                    <circle
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={radius}
                      fill="none"
                      className={styles.donutTrack}
                      strokeWidth={DONUT_STROKE}
                    />
                    {/* water segment (full ring beneath) */}
                    <circle
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={radius}
                      fill="none"
                      strokeWidth={DONUT_STROKE}
                      className={styles.donutWater}
                      strokeDasharray={circumference}
                      strokeDashoffset={0}
                      transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
                    />
                    {/* electricity segment (on top, clipped to share) */}
                    <circle
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={radius}
                      fill="none"
                      strokeWidth={DONUT_STROKE}
                      strokeLinecap="round"
                      className={styles.donutElectricity}
                      strokeDasharray={`${electricityShare * circumference} ${circumference}`}
                      strokeDashoffset={0}
                      transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
                    />
                  </svg>

                  <div className={styles.donutLegend}>
                    <div className={styles.donutLegendItem}>
                      <span
                        className={`${styles.legendDot} ${styles.legendDotElectricity}`}
                        aria-hidden="true"
                      />
                      <div className={styles.donutLegendText}>
                        <span className={styles.legendName}>
                          {t('breakdown.electricity')}
                        </span>
                        <span className={styles.legendValue}>
                          {displayCurrency(monthlyElectricityCost)}{' '}
                          <span className={styles.legendUnit}>
                            {t('common:units.kztPerMonth')}
                          </span>
                        </span>
                      </div>
                      <span className={styles.legendShare}>
                        {Math.round(electricityShare * 100)}%
                      </span>
                    </div>

                    <div className={styles.donutLegendItem}>
                      <span
                        className={`${styles.legendDot} ${styles.legendDotWater}`}
                        aria-hidden="true"
                      />
                      <div className={styles.donutLegendText}>
                        <span className={styles.legendName}>
                          {t('breakdown.water')}
                        </span>
                        <span className={styles.legendValue}>
                          {displayCurrency(monthlyWaterCost)}{' '}
                          <span className={styles.legendUnit}>
                            {t('common:units.kztPerMonth')}
                          </span>
                        </span>
                      </div>
                      <span className={styles.legendShare}>
                        {Math.round((1 - electricityShare) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>{t('results.empty')}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ── RIGHT column: result cards + recommendations ── */}
        <div className={styles.rightColumn}>
          <div className={styles.resultGrid}>
            <article className={styles.resultCard}>
              <div className={`${styles.resultIcon} ${styles.resultIconEnergy}`}>
                <Lightning size={16} weight="fill" />
              </div>
              <p className={styles.resultLabel}>{t('results.monthlyTotal')}</p>
              <p className={styles.resultValue}>
                {displayCurrency(monthlyTotal)}
              </p>
              <p className={styles.resultUnit}>
                {t('common:units.kzt')}
              </p>
            </article>

            <article className={styles.resultCard}>
              <div className={`${styles.resultIcon} ${styles.resultIconWater}`}>
                <CalendarBlank size={16} weight="fill" />
              </div>
              <p className={styles.resultLabel}>{t('results.yearlyTotal')}</p>
              <p className={styles.resultValue}>
                {displayCurrency(yearlyTotal)}
              </p>
              <p className={styles.resultUnit}>
                {t('common:units.kzt')}
              </p>
            </article>

            <article
              className={`${styles.resultCard} ${styles.resultCardHighlight}`}
            >
              <div className={`${styles.resultIcon} ${styles.resultIconBrand}`}>
                <TrendDown size={18} weight="fill" />
              </div>
              <p className={styles.resultLabel}>{t('results.yearlySavings')}</p>
              <p className={`${styles.resultValue} ${styles.resultValueHighlight}`}>
                {displayCurrency(savedYearly)}
              </p>
              <p className={styles.resultUnit}>
                {t('common:units.kzt')}
              </p>
              {paybackMonths > 0 && (
                <p className={styles.resultPayback}>
                  {t('results.paybackPeriod')}: {paybackMonths}{' '}
                  {t('results.paybackUnit')}
                </p>
              )}
            </article>

            <article className={styles.resultCard}>
              <div className={`${styles.resultIcon} ${styles.resultIconCarbon}`}>
                <Leaf size={16} weight="fill" />
              </div>
              <p className={styles.resultLabel}>{t('results.co2Reduction')}</p>
              <p className={styles.resultValue}>
                {displayCurrency(savedCO2yearly)}
              </p>
              <p className={styles.resultUnit}>
                {t('common:units.kgPerYear')}
              </p>
            </article>

            <article className={styles.resultCard}>
              <div className={`${styles.resultIcon} ${styles.resultIconWater}`}>
                <Drop size={16} weight="fill" />
              </div>
              <p className={styles.resultLabel}>{t('results.waterSavings')}</p>
              <p className={styles.resultValue}>
                {displayCurrency(savedWaterYearly)}
              </p>
              <p className={styles.resultUnit}>
                {t('common:units.kztPerYear')}
              </p>
            </article>
          </div>

          {/* Recommendations */}
          <section className={styles.recommendations}>
            <div className={styles.recommendationsHeader}>
              <h2 className={styles.recommendationsTitle}>
                {t('recommendations.title')}
              </h2>
              <p className={styles.recommendationsSubtitle}>
                {t('recommendations.subtitle')}
              </p>
            </div>

            <div className={styles.recommendationsList}>
              {sortedRecommendations.map((rec, index) => {
                const toneClass =
                  rec.iconTone === 'energy'
                    ? styles.recIconEnergy
                    : rec.iconTone === 'water'
                    ? styles.recIconWater
                    : rec.iconTone === 'carbon'
                    ? styles.recIconCarbon
                    : styles.recIconBrand;

                return (
                  <article
                    key={rec.key}
                    className={styles.recommendationCard}
                    style={
                      {
                        '--entry-delay': `${index * 60}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <div className={`${styles.recIcon} ${toneClass}`}>
                      {rec.icon}
                    </div>
                    <div className={styles.recContent}>
                      <div className={styles.recHeader}>
                        <h3 className={styles.recTitle}>
                          {t(`recommendations.items.${rec.key}.title`)}
                        </h3>
                        <span className={styles.recImpact}>
                          −{rec.impactPercent}%
                        </span>
                      </div>
                      <p className={styles.recDescription}>
                        {t(`recommendations.items.${rec.key}.description`)}
                      </p>
                      <div className={styles.recBar} aria-hidden="true">
                        <span
                          className={`${styles.recBarFill} ${toneClass}`}
                          style={{ width: `${rec.impactPercent * 2}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
