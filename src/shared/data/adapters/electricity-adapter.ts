import * as XLSX from 'xlsx';
import { ENERGY_SHEET_CONFIG, ENERGY_TOTAL_MARKER } from '../../config/dashboard-data';
import type { ResourceTrendPoint } from '../transformed';

type CellValue = XLSX.CellObject['v'] | null;
type WorkbookEnergyPeriod = keyof typeof ENERGY_SHEET_CONFIG;

/**
 * The monthly electricity sheet name encodes its dataset year (e.g.
 * `Monthly_Profile_2024_modeled`). Parsed so the UI can label the period
 * without hardcoding the year in locale files.
 */
export function getEnergyMonthYear(): number {
  const match = ENERGY_SHEET_CONFIG.month.sheetName.match(/(\d{4})/);
  return match ? Number(match[1]) : new Date().getFullYear();
}

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
  const { startRowIndex, labelColumnIndex, valueColumnIndex, unitKey } = ENERGY_SHEET_CONFIG.year;
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
      unitKey,
    });
  }

  return yearTrend.sort((leftPoint, rightPoint) => {
    return Number(leftPoint.label) - Number(rightPoint.label);
  });
}

export function extractEnergyMonthTrend(workbook: XLSX.WorkBook): ResourceTrendPoint[] {
  const worksheet = getWorksheet(workbook, 'month');
  const { startRowIndex, labelColumnIndex, valueColumnIndex, unitKey } = ENERGY_SHEET_CONFIG.month;
  const lastRowIndex = getLastRowIndex(worksheet);
  const monthTrend: ResourceTrendPoint[] = [];

  for (let rowIndex = startRowIndex; rowIndex <= lastRowIndex; rowIndex += 1) {
    const monthLabel = getCellValue(worksheet, rowIndex, labelColumnIndex);

    if (monthLabel === null || monthLabel === ENERGY_TOTAL_MARKER) {
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
      unitKey,
    });
  }

  return monthTrend;
}
