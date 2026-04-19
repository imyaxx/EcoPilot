import * as XLSX from 'xlsx';
import type { UtilityTariff } from '../transformed';

type TariffUtilityType = UtilityTariff['utilityType'];

const ASSUMPTIONS_SHEET_NAME = 'Assumptions_for_Dashboard';
const VALUE_COLUMN_INDEX = 1;

// Row indices in Assumptions_for_Dashboard sheet (0-based):
// 0: header, 1: electricity tariff, 2: water tariff (baseline)
const TARIFF_ROW_INDEX = {
  electricity: 1,
  water: 2,
} satisfies Record<TariffUtilityType, number>;

/**
 * Language-agnostic metadata for each tariff. The human-readable label and
 * source come from i18n ("dataSource" in common.json and calculator UI), so
 * we keep only stable technical identifiers here.
 */
const TARIFF_METADATA: Record<
  TariffUtilityType,
  Omit<UtilityTariff, 'price' | 'utilityType'>
> = {
  electricity: {
    label: 'electricity.tariff.almaty',
    unit: 'kWh',
    currency: 'KZT',
    sourceLabel: 'esalmaty.kz',
  },
  water: {
    label: 'water.tariff.almaty',
    unit: 'm³',
    currency: 'KZT',
    sourceLabel: 'Almaty Su',
  },
};

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
