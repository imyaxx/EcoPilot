import * as XLSX from 'xlsx';
import type { UtilityTariff } from '../transformed';

type TariffUtilityType = UtilityTariff['utilityType'];

const ASSUMPTIONS_SHEET_NAME = 'Assumptions_for_Dashboard';
const VALUE_COLUMN_INDEX = 1;

const TARIFF_ROW_INDEX = {
  electricity: 2,
  water: 4,
} satisfies Record<TariffUtilityType, number>;

const TARIFF_METADATA = {
  electricity: {
    label: 'Electricity tariff for budget organizations',
    unit: 'kWh',
    currency: 'KZT',
    sourceLabel: 'Assumptions for Dashboard',
  },
  water: {
    label: 'Water tariff baseline',
    unit: 'm³',
    currency: 'KZT',
    sourceLabel: 'Assumptions for Dashboard',
  },
} satisfies Record<
  TariffUtilityType,
  Omit<UtilityTariff, 'price' | 'utilityType'>
>;

function getWorksheet(workbook: XLSX.WorkBook): XLSX.WorkSheet {
  const worksheet = workbook.Sheets[ASSUMPTIONS_SHEET_NAME];

  if (!worksheet) {
    throw new Error(`Worksheet "${ASSUMPTIONS_SHEET_NAME}" not found`);
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
    throw new Error(`Invalid ${fieldName} value in "${ASSUMPTIONS_SHEET_NAME}"`);
  }

  return cellValue;
}

export function extractTariffs(workbook: XLSX.WorkBook): UtilityTariff[] {
  const worksheet = getWorksheet(workbook);

  return (Object.entries(TARIFF_ROW_INDEX) as Array<[TariffUtilityType, number]>).map(
    ([utilityType, rowIndex]) => ({
      utilityType,
      price: getNumericCellValue(
        worksheet,
        rowIndex,
        VALUE_COLUMN_INDEX,
        `${utilityType} tariff`,
      ),
      ...TARIFF_METADATA[utilityType],
    }),
  );
}
