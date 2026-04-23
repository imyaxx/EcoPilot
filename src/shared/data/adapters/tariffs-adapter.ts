import * as XLSX from 'xlsx';
import { TARIFF_SHEET_CONFIG } from '../../config/dashboard-data';
import type { UtilityTariff } from '../transformed';

type TariffUtilityType = UtilityTariff['utilityType'];

function getWorksheet(workbook: XLSX.WorkBook): XLSX.WorkSheet {
  const worksheet = workbook.Sheets[TARIFF_SHEET_CONFIG.sheetName];

  if (!worksheet) {
    throw new Error(`Worksheet "${TARIFF_SHEET_CONFIG.sheetName}" not found`);
  }

  return worksheet;
}

function getCell(
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  columnIndex: number,
): XLSX.CellObject | null {
  const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
  return worksheet[cellAddress] ?? null;
}

function getNumericCellValue(
  worksheet: XLSX.WorkSheet,
  rowIndex: number,
  columnIndex: number,
  fieldName: string,
): number {
  const cell = getCell(worksheet, rowIndex, columnIndex);
  const cellValue = cell?.v ?? null;

  if (typeof cellValue !== 'number' || !Number.isFinite(cellValue)) {
    throw new Error(`Invalid ${fieldName} value in "${TARIFF_SHEET_CONFIG.sheetName}"`);
  }

  return cellValue;
}

export function extractTariffs(workbook: XLSX.WorkBook): UtilityTariff[] {
  const worksheet = getWorksheet(workbook);

  return (
    Object.entries(TARIFF_SHEET_CONFIG.rowIndexByUtility) as Array<[TariffUtilityType, number]>
  ).map(([utilityType, rowIndex]) => ({
    utilityType,
    price: getNumericCellValue(
      worksheet,
      rowIndex,
      TARIFF_SHEET_CONFIG.valueColumnIndex,
      `${utilityType} tariff`,
    ),
  }));
}
