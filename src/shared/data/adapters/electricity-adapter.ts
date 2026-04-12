import * as XLSX from 'xlsx';
import type { DashboardPeriod, ResourceTrendPoint } from '../transformed';

type WorkbookEnergyPeriod = Extract<DashboardPeriod, 'month' | 'year'>;
type CellValue = XLSX.CellObject['v'] | null;

interface EnergySheetConfig {
  sheetName: string;
  startRowIndex: number;
  labelColumnIndex: number;
  valueColumnIndex: number;
}

const ENERGY_UNIT = 'млн кВт·ч';
const MONTH_TOTAL_LABEL = 'ИТОГО';

const ENERGY_SHEET_CONFIG = {
  year: {
    sheetName: 'Annual_Consumption_GWh',
    startRowIndex: 2,
    labelColumnIndex: 0,
    valueColumnIndex: 1,
  },
  month: {
    sheetName: 'Monthly_Profile_2024_modeled',
    startRowIndex: 3,
    labelColumnIndex: 0,
    valueColumnIndex: 2,
  },
} satisfies Record<WorkbookEnergyPeriod, EnergySheetConfig>;

function getWorksheet(
  workbook: XLSX.WorkBook,
  period: WorkbookEnergyPeriod,
): XLSX.WorkSheet {
  const worksheet = workbook.Sheets[ENERGY_SHEET_CONFIG[period].sheetName];

  if (!worksheet) {
    throw new Error(`Worksheet "${ENERGY_SHEET_CONFIG[period].sheetName}" not found`);
  }

  return worksheet;
}

function getLastRowIndex(worksheet: XLSX.WorkSheet): number {
  const worksheetRange = worksheet['!ref'];

  if (!worksheetRange) {
    return -1;
  }

  return XLSX.utils.decode_range(worksheetRange).e.r;
}

function getCell(
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  columnIndex: number,
): XLSX.CellObject | null {
  const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });

  return worksheet[cellAddress] ?? null;
}

function getCellValue(
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  columnIndex: number,
): CellValue {
  return getCell(worksheet, rowIndex, columnIndex)?.v ?? null;
}

export function extractEnergyYearTrend(workbook: XLSX.WorkBook): ResourceTrendPoint[] {
  const worksheet = getWorksheet(workbook, 'year');
  const { startRowIndex, labelColumnIndex, valueColumnIndex } =
    ENERGY_SHEET_CONFIG.year;
  const lastRowIndex = getLastRowIndex(worksheet);
  const yearTrend: ResourceTrendPoint[] = [];

  for (let rowIndex = startRowIndex; rowIndex <= lastRowIndex; rowIndex += 1) {
    const yearValue = getCellValue(worksheet, rowIndex, labelColumnIndex);

    if (typeof yearValue !== 'number' || !Number.isFinite(yearValue)) {
      break;
    }

    const consumptionValue = getCellValue(worksheet, rowIndex, valueColumnIndex);

    if (typeof consumptionValue !== 'number' || !Number.isFinite(consumptionValue)) {
      continue;
    }

    yearTrend.push({
      label: String(yearValue),
      value: consumptionValue,
      unit: ENERGY_UNIT,
    });
  }

  return yearTrend.sort((leftPoint, rightPoint) => {
    return Number(leftPoint.label) - Number(rightPoint.label);
  });
}

export function extractEnergyMonthTrend(workbook: XLSX.WorkBook): ResourceTrendPoint[] {
  const worksheet = getWorksheet(workbook, 'month');
  const { startRowIndex, labelColumnIndex, valueColumnIndex } =
    ENERGY_SHEET_CONFIG.month;
  const lastRowIndex = getLastRowIndex(worksheet);
  const monthTrend: ResourceTrendPoint[] = [];

  for (let rowIndex = startRowIndex; rowIndex <= lastRowIndex; rowIndex += 1) {
    const monthLabel = getCellValue(worksheet, rowIndex, labelColumnIndex);

    if (monthLabel === null || monthLabel === MONTH_TOTAL_LABEL) {
      break;
    }

    if (typeof monthLabel !== 'string') {
      continue;
    }

    const consumptionValue = getCellValue(worksheet, rowIndex, valueColumnIndex);

    if (typeof consumptionValue !== 'number' || !Number.isFinite(consumptionValue)) {
      continue;
    }

    monthTrend.push({
      label: monthLabel,
      value: consumptionValue,
      unit: ENERGY_UNIT,
    });
  }

  return monthTrend;
}
