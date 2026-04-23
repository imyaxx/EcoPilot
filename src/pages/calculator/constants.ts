/**
 * Shared constants for the CalculatorPage — building-type factors and rule-of-
 * thumb coefficients used by the cost / savings computation. Kept in a
 * dedicated module so the page body and the `use-calculator-metrics` hook can
 * both consume them without circular imports.
 */

import type { ReactNode } from 'react';
import { Buildings, House, Sparkle } from '@phosphor-icons/react';
import { createElement } from 'react';

export type BuildingType = 'school' | 'residential' | 'office';

export const ELECTRICITY_FACTOR: Record<BuildingType, number> = {
  school: 15,
  residential: 8,
  office: 20,
};

export const WATER_FACTOR: Record<BuildingType, number> = {
  school: 0.05,
  residential: 0.06,
  office: 0.04,
};

export const BUILDING_ICON: Record<BuildingType, ReactNode> = {
  school: createElement(Buildings, { size: 16, weight: 'fill' }),
  residential: createElement(House, { size: 16, weight: 'fill' }),
  office: createElement(Sparkle, { size: 16, weight: 'fill' }),
};

/**
 * Approximate upfront investment (KZT / m²) required to reach the full
 * potential of the mapped efficiency measures. Rough rule-of-thumb used to
 * estimate payback in months.
 */
export const INVESTMENT_PER_M2 = 7500;

/** kg CO₂ per kWh — Kazakhstan grid average. */
export const CO2_FACTOR = 0.5;

/** One-click preset areas (m²) used by "Use city averages". */
export const CITY_AVERAGE_AREA: Record<BuildingType, string> = {
  school: '4500',
  residential: '7200',
  office: '3200',
};
