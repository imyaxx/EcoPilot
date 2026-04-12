import * as XLSX from 'xlsx';
import type { ResourceTrendPoint } from '../transformed';

type CellValue = XLSX.CellObject['v'] | null;

const WATER_SHEET_NAME = 'Water_Consumption_Almaty_Annual';
const WATER_DATA_START_ROW_INDEX = 3;
const WATER_YEAR_COLUMN_INDEX = 0;
const WATER_VOLUME_COLUMN_INDEX = 1;
const WATER_UNIT = 'млн м³';

function getWorksheet(workbook: XLSX.WorkBook): XLSX.WorkSheet {
  const worksheet = workbook.Sheets[WATER_SHEET_NAME];

  if (!worksheet) {
    throw new Error(`Worksheet "${WATER_SHEET_NAME}" not found`);
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

export function extractWaterYearTrend(workbook: XLSX.WorkBook): ResourceTrendPoint[] {
  const worksheet = getWorksheet(workbook);
  const lastRowIndex = getLastRowIndex(worksheet);
  const yearTrend: ResourceTrendPoint[] = [];

  for (
    let rowIndex = WATER_DATA_START_ROW_INDEX;
    rowIndex <= lastRowIndex;
    rowIndex += 1
  ) {
    const yearValue = getCellValue(worksheet, rowIndex, WATER_YEAR_COLUMN_INDEX);

    if (typeof yearValue !== 'number' || !Number.isFinite(yearValue)) {
      break;
    }

    const volumeValue = getCellValue(worksheet, rowIndex, WATER_VOLUME_COLUMN_INDEX);

    if (typeof volumeValue !== 'number' || !Number.isFinite(volumeValue)) {
      continue;
    }

    yearTrend.push({
      label: String(yearValue),
      value: volumeValue,
      unit: WATER_UNIT,
    });
  }

  return yearTrend.sort((leftPoint, rightPoint) => {
    return Number(leftPoint.label) - Number(rightPoint.label);
  });
}
