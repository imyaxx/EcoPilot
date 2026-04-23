/**
 * CalculatorPage — estimates monthly/yearly utility cost for a building and
 * recommends actions via the AiAdvisor. Pure computation lives in the
 * `use-calculator-metrics` hook; this file is layout + bindings only.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lightning,
  CalendarBlank,
  TrendDown,
  Leaf,
  Drop,
} from '@phosphor-icons/react';
import { Card, CardHeader, CardBody, Button } from '../../shared/ui';
import { AiAdvisor } from '../../widgets/ai-advisor';
import { CostBreakdownDonut } from '../../widgets/cost-breakdown-donut';
import { ResultCard } from '../../widgets/result-card';
import {
  BUILDING_ICON,
  CITY_AVERAGE_AREA,
  ELECTRICITY_FACTOR,
  type BuildingType,
} from './constants';
import {
  useCalculatorMetrics,
  type CalculatorFormState,
} from './use-calculator-metrics';
import styles from './styles.module.css';

const BUILDING_TYPES = Object.keys(ELECTRICITY_FACTOR) as BuildingType[];

export interface CalculatorPageProps {
  electricityTariff: number;
  waterTariff: number;
}

export function CalculatorPage({
  electricityTariff,
  waterTariff,
}: CalculatorPageProps) {
  const { t, i18n } = useTranslation('calculator');
  const [showManualInputs, setShowManualInputs] = useState(false);
  const [form, setForm] = useState<CalculatorFormState>({
    buildingType: 'school',
    area: '',
    manualElectricity: '',
    manualWater: '',
    reductionPct: 20,
  });

  const metrics = useCalculatorMetrics(form, {
    electricityTariff,
    waterTariff,
  });

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }),
    [i18n.language],
  );

  const displayCurrency = (value: number): string =>
    metrics.hasBuildingData ? numberFormatter.format(Math.round(value)) : '—';

  const handleTextChange =
    (field: 'area' | 'manualElectricity' | 'manualWater') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleReductionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, reductionPct: Number(event.target.value) }));
  };

  const handleUseCityAverages = () => {
    setForm((prev) => ({
      ...prev,
      area: CITY_AVERAGE_AREA[prev.buildingType],
      manualElectricity: '',
      manualWater: '',
    }));
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.heroEyebrow}>{t('hero.eyebrow')}</span>
        <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
        <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.leftColumn}>
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
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>{t('form.buildingType')}</span>
                <div className={styles.segmented} role="radiogroup">
                  {BUILDING_TYPES.map((type) => {
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
                          setForm((prev) => ({ ...prev, buildingType: type }))
                        }
                      >
                        <span className={styles.segmentedIcon}>
                          {BUILDING_ICON[type]}
                        </span>
                        {t(`form.buildingTypes.${type}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="area">
                  {t('form.area')}{' '}
                  <span className={styles.fieldUnit}>({t('form.areaUnit')})</span>
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
                      <label className={styles.fieldLabel} htmlFor="manualWater">
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

          <Card>
            <CardHeader title={t('breakdown.title')} />
            <CardBody>
              <p className={styles.breakdownSubtitle}>
                {t('breakdown.subtitle')}
              </p>
              <CostBreakdownDonut
                electricityCost={metrics.monthlyElectricityCost}
                waterCost={metrics.monthlyWaterCost}
                hasData={metrics.hasBuildingData}
                formatCurrency={displayCurrency}
              />
            </CardBody>
          </Card>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.resultGrid}>
            <ResultCard
              label={t('results.monthlyTotal')}
              value={displayCurrency(metrics.monthlyTotal)}
              unit={t('common:units.kzt')}
              icon={<Lightning size={16} weight="fill" />}
              accent="energy"
            />
            <ResultCard
              label={t('results.yearlyTotal')}
              value={displayCurrency(metrics.yearlyTotal)}
              unit={t('common:units.kzt')}
              icon={<CalendarBlank size={16} weight="fill" />}
              accent="water"
            />
            <ResultCard
              label={t('results.yearlySavings')}
              value={displayCurrency(metrics.yearlySavings)}
              unit={t('common:units.kzt')}
              icon={<TrendDown size={18} weight="fill" />}
              accent="brand"
              highlighted
              footnote={
                metrics.paybackMonths > 0
                  ? `${t('results.paybackPeriod')}: ${metrics.paybackMonths} ${t('results.paybackUnit')}`
                  : undefined
              }
            />
            <ResultCard
              label={t('results.co2Reduction')}
              value={displayCurrency(metrics.yearlyCo2Reduction)}
              unit={t('common:units.kgPerYear')}
              icon={<Leaf size={16} weight="fill" />}
              accent="carbon"
            />
            <ResultCard
              label={t('results.waterSavings')}
              value={displayCurrency(metrics.yearlyWaterSavings)}
              unit={t('common:units.kztPerYear')}
              icon={<Drop size={16} weight="fill" />}
              accent="water"
            />
          </div>

          <AiAdvisor
            disabled={!metrics.hasBuildingData}
            input={{
              buildingType: form.buildingType,
              area: metrics.areaM2,
              electricityKwh: metrics.electricityKwh,
              waterM3: metrics.waterM3,
              monthlyTotal: metrics.monthlyTotal,
              savedYearly: metrics.yearlySavings,
              reductionPct: form.reductionPct,
              language: i18n.language,
            }}
          />
        </div>
      </div>
    </div>
  );
}
