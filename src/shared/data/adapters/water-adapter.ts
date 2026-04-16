import * as XLSX from 'xlsx';
import type { ResourceTrendPoint } from '../transformed';

type CellValue = XLSX.CellObject['v'] | null;

const WATER_YEAR_SHEET = 'Water_Consumption_Almaty_Annual';
const WATER_MONTH_SHEET = 'Monthly_Water_2025_modeled';
const WATER_UNIT = 'млн м³';

function getWorksheet(workbook: XLSX.WorkBook, sheetName: string): XLSX.WorkSheet {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) throw new Error(`Worksheet "${sheetName}" not found`);
  return worksheet;
}

function getLastRowIndex(worksheet: XLSX.WorkSheet): number {
  const ref = worksheet['!ref'];
  if (!ref) return -1;
  return XLSX.utils.decode_range(ref).e.r;
}

function getCellValue(worksheet: XLSX.WorkSheet, rowIndex: number, columnIndex: number): CellValue {
  const addr = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
  return worksheet[addr]?.v ?? null;
}

export function extractWaterYearTrend(workbook: XLSX.WorkBook): ResourceTrendPoint[] {
  const worksheet = getWorksheet(workbook, WATER_YEAR_SHEET);
  const lastRowIndex = getLastRowIndex(worksheet);
  const trend: ResourceTrendPoint[] = [];

  // startRow=3: skip title, warning note, header (rows 0,1,2)
  for (let r = 3; r <= lastRowIndex; r++) {
    const year = getCellValue(worksheet, r, 0);
    if (typeof year !== 'number' || !Number.isFinite(year)) break;
    const vol = getCellValue(worksheet, r, 1);
    if (typeof vol !== 'number' || !Number.isFinite(vol)) continue;
    trend.push({ label: String(year), value: vol, unit: WATER_UNIT });
  }

  return trend.sort((a, b) => Number(a.label) - Number(b.label));
}

export function extractWaterMonthTrend(workbook: XLSX.WorkBook): ResourceTrendPoint[] {
  const worksheet = getWorksheet(workbook, WATER_MONTH_SHEET);
  const lastRowIndex = getLastRowIndex(worksheet);
  const trend: ResourceTrendPoint[] = [];

  // row 0: headers, row 1: warning note, rows 2+: data
  for (let r = 2; r <= lastRowIndex; r++) {
    const label = getCellValue(worksheet, r, 0);
    if (typeof label !== 'string' || label === 'ИТОГО') break;
    const vol = getCellValue(worksheet, r, 3); // column D = объём млн м³
    if (typeof vol !== 'number' || !Number.isFinite(vol)) continue;
    trend.push({ label, value: vol, unit: WATER_UNIT });
  }

  return trend;
}