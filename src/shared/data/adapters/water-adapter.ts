import * as XLSX from 'xlsx';
import type { ResourceTrendPoint } from '../transformed';

type CellValue = XLSX.CellObject['v'] | null;

const WATER_YEAR_SHEET = 'Water_Consumption_Almaty_Annual';
const WATER_MONTH_SHEET = 'Monthly_Water_2025_modeled';
const WATER_UNIT = 'млн м³';

function getWorksheet(workbook: XLSX.WorkBook, sheetName: string): XLSX.WorkSheet {
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Worksheet "${sheetName}" not found`);
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
  const worksheet = getWorksheet(workbook, WATER_YEAR_SHEET);
  const lastRowIndex = getLastRowIndex(worksheet);
  const trend: ResourceTrendPoint[] = [];

  for (let rowIndex = 3; rowIndex <= lastRowIndex; rowIndex += 1) {
    const year = getCellValue(worksheet, rowIndex, 0);

    if (typeof year !== 'number' || !Number.isFinite(year)) {
      break;
    }

    const volume = getCellValue(worksheet, rowIndex, 1);

    if (typeof volume !== 'number' || !Number.isFinite(volume)) {
      continue;
    }

    trend.push({ label: String(year), value: volume, unit: WATER_UNIT });
  }

  return trend.sort((leftPoint, rightPoint) => {
    return Number(leftPoint.label) - Number(rightPoint.label);
  });
}

export function extractWaterMonthTrend(workbook: XLSX.WorkBook): ResourceTrendPoint[] {
  const worksheet = getWorksheet(workbook, WATER_MONTH_SHEET);
  const lastRowIndex = getLastRowIndex(worksheet);
  const trend: ResourceTrendPoint[] = [];

  for (let rowIndex = 2; rowIndex <= lastRowIndex; rowIndex += 1) {
    const label = getCellValue(worksheet, rowIndex, 0);

    if (typeof label !== 'string' || label === 'ИТОГО') {
      break;
    }

    const volume = getCellValue(worksheet, rowIndex, 3);

    if (typeof volume !== 'number' || !Number.isFinite(volume)) {
      continue;
    }

    trend.push({ label, value: volume, unit: WATER_UNIT });
  }

  return trend;
}
