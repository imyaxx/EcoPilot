export type ResourceUnitKey = 'mlnKwh' | 'mlnM3';

export const DASHBOARD_DATASET_URLS = {
  electricity: '/datasets/electricity-consumption-kazakhstan.xlsx',
  tariffs: '/datasets/tariffs-kazakhstan.xlsx',
} as const;

export const DASHBOARD_FACTORS = {
  carbonPerEnergyUnit: 0.5,
  sparklineLength: 8,
} as const;

export const ENERGY_TOTAL_MARKER = 'ИТОГО';
export const WATER_TOTAL_MARKER = 'ИТОГО';

export const ENERGY_SHEET_CONFIG = {
  year: {
    sheetName: 'Annual_Consumption_GWh',
    startRowIndex: 2,
    labelColumnIndex: 0,
    valueColumnIndex: 1,
    unitKey: 'mlnKwh',
  },
  month: {
    sheetName: 'Monthly_Profile_2024_modeled',
    startRowIndex: 3,
    labelColumnIndex: 0,
    valueColumnIndex: 2,
    unitKey: 'mlnKwh',
  },
} as const;

export const WATER_SHEET_CONFIG = {
  year: {
    sheetName: 'Water_Consumption_Almaty_Annual',
    startRowIndex: 3,
    labelColumnIndex: 0,
    valueColumnIndex: 1,
    unitKey: 'mlnM3',
  },
  month: {
    sheetName: 'Monthly_Water_2025_modeled',
    startRowIndex: 2,
    labelColumnIndex: 0,
    valueColumnIndex: 3,
    unitKey: 'mlnM3',
  },
} as const;

export const TARIFF_SHEET_CONFIG = {
  sheetName: 'Assumptions_for_Dashboard',
  valueColumnIndex: 1,
  rowIndexByUtility: {
    electricity: 1,
    water: 2,
  },
} as const;
