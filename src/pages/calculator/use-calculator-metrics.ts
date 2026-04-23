/**
 * useCalculatorMetrics — turns the raw CalculatorPage form state + tariffs
 * into fully derived numbers (monthly/yearly cost, savings, CO₂ impact,
 * payback) so the React component stays presentational and JSX stays free of
 * business arithmetic.
 */

import { useMemo } from 'react';
import {
  type BuildingType,
  CO2_FACTOR,
  ELECTRICITY_FACTOR,
  INVESTMENT_PER_M2,
  WATER_FACTOR,
} from './constants';

export interface CalculatorFormState {
  buildingType: BuildingType;
  area: string;
  manualElectricity: string;
  manualWater: string;
  reductionPct: number;
}

export interface CalculatorTariffs {
  electricityTariff: number;
  waterTariff: number;
}

export interface CalculatorMetrics {
  areaM2: number;
  manualElectricityKwh: number | null;
  manualWaterM3: number | null;
  hasBuildingData: boolean;
  electricityKwh: number;
  waterM3: number;
  monthlyElectricityCost: number;
  monthlyWaterCost: number;
  monthlyTotal: number;
  yearlyTotal: number;
  monthlySavings: number;
  yearlySavings: number;
  yearlyCo2Reduction: number;
  yearlyWaterSavings: number;
  paybackMonths: number;
}

function parseOptionalNumber(value: string): number | null {
  if (value === '') return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function useCalculatorMetrics(
  form: CalculatorFormState,
  { electricityTariff, waterTariff }: CalculatorTariffs,
): CalculatorMetrics {
  return useMemo(() => {
    const areaM2 = parseFloat(form.area) || 0;
    const manualElectricityKwh = parseOptionalNumber(form.manualElectricity);
    const manualWaterM3 = parseOptionalNumber(form.manualWater);

    const hasBuildingData =
      areaM2 > 0 || manualElectricityKwh !== null || manualWaterM3 !== null;

    const electricityKwh =
      manualElectricityKwh !== null
        ? manualElectricityKwh
        : areaM2 * ELECTRICITY_FACTOR[form.buildingType];

    const waterM3 =
      manualWaterM3 !== null
        ? manualWaterM3
        : areaM2 * WATER_FACTOR[form.buildingType];

    const monthlyElectricityCost = electricityKwh * electricityTariff;
    const monthlyWaterCost = waterM3 * waterTariff;
    const monthlyTotal = monthlyElectricityCost + monthlyWaterCost;
    const yearlyTotal = monthlyTotal * 12;

    const reductionRatio = form.reductionPct / 100;
    const monthlySavings = monthlyTotal * reductionRatio;
    const yearlySavings = monthlySavings * 12;
    const yearlyCo2Reduction = electricityKwh * 12 * reductionRatio * CO2_FACTOR;
    const yearlyWaterSavings = monthlyWaterCost * reductionRatio * 12;

    /**
     * Rough payback: upfront investment scales with area × INVESTMENT_PER_M2,
     * damped by sqrt of the reduction target (larger targets need more spend,
     * but not linearly).
     */
    const investment = areaM2 * INVESTMENT_PER_M2 * Math.sqrt(reductionRatio);
    const paybackMonths =
      monthlySavings > 0 ? Math.round(investment / monthlySavings) : 0;

    return {
      areaM2,
      manualElectricityKwh,
      manualWaterM3,
      hasBuildingData,
      electricityKwh,
      waterM3,
      monthlyElectricityCost,
      monthlyWaterCost,
      monthlyTotal,
      yearlyTotal,
      monthlySavings,
      yearlySavings,
      yearlyCo2Reduction,
      yearlyWaterSavings,
      paybackMonths,
    };
  }, [form, electricityTariff, waterTariff]);
}
