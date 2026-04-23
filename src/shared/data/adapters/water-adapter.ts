import * as XLSX from 'xlsx';
import { WATER_SHEET_CONFIG, WATER_TOTAL_MARKER } from '../../config/dashboard-data';
import type { ResourceTrendPoint } from '../transformed';

type CellValue = XLSX.CellObject['v'] | null;
type WorkbookWaterPeriod = keyof typeof WATER_SHEET_CONFIG;

/**
 * The monthly water sheet name encodes its dataset year (e.g.
 * `Monthly_Water_2025_modeled`). Parsed so the UI can label the period
 * without hardcoding the year in locale files.
 */
export function getWaterMonthYear(): number {
  const match = WATER_SHEET_CONFIG.month.sheetName.match(/(\d{4})/);
  return match ? Number(match[1]) : new Date().getFullYear();
}

function getWorksheet(workbook: XLSX.WorkBook, period: WorkbookWaterPeriod): XLSX.WorkSheet {
  const worksheet = workbook.Sheets[WATER_SHEET_CONFIG[period].sheetName];

  if (!worksheet) {
    throw new Error(`Worksheet "${WATER_SHEET_CONFIG[period].sheetName}" not found`);
  }

  return worksheet;
}

function getLastRowIndex(worksheet: XLSX.WorkSheet): number {
  const ref = worksheet['!ref'];

  if (!ref) {
    return -1;
  }

  return XLSX.utils.decode_range(ref).e.r;
}

function getCellValue(
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  columnIndex: number,
): CellValue {
  const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
  return worksheet[address]?.v ?? null;
}

export function extractWaterYearTrend(workbook: XLSX.WorkBook): ResourceTrendPoint[] {
  const worksheet = getWorksheet(workbook, 'year');
  const { startRowIndex, labelColumnIndex, valueColumnIndex, unitKey } = WATER_SHEET_CONFIG.year;
  const lastRowIndex = getLastRowIndex(worksheet);
  const trend: ResourceTrendPoint[] = [];

  for (let rowIndex = startRowIndex; rowIndex <= lastRowIndex; rowIndex += 1) {
    const year = getCellValue(worksheet, rowIndex, labelColumnIndex);

    if (typeof year !== 'number' || !Number.isFinite(year)) {
      break;
    }

    const volume = getCellValue(worksheet, rowIndex, valueColumnIndex);

    if (typeof volume !== 'number' || !Number.isFinite(volume)) {
      continue;
    }

    trend.push({ label: String(year), value: volume, unitKey });
  }

  return trend.sort((leftPoint, rightPoint) => {
    return Number(leftPoint.label) - Number(rightPoint.label);
  });
}

export function extractWaterMonthTrend(workbook: XLSX.WorkBook): ResourceTrendPoint[] {
  const worksheet = getWorksheet(workbook, 'month');
  const { startRowIndex, labelColumnIndex, valueColumnIndex, unitKey } = WATER_SHEET_CONFIG.month;
  const lastRowIndex = getLastRowIndex(worksheet);
  const trend: ResourceTrendPoint[] = [];

  for (let rowIndex = startRowIndex; rowIndex <= lastRowIndex; rowIndex += 1) {
    const label = getCellValue(worksheet, rowIndex, labelColumnIndex);

    if (typeof label !== 'string' || label === WATER_TOTAL_MARKER) {
      break;
    }

    const volume = getCellValue(worksheet, rowIndex, valueColumnIndex);

    if (typeof volume !== 'number' || !Number.isFinite(volume)) {
      continue;
    }

    trend.push({ label, value: volume, unitKey });
  }

  return trend;
}
