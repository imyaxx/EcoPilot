import * as XLSX from 'xlsx';

export async function loadWorkbook(url: string): Promise<XLSX.WorkBook> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load workbook: ${url}`);
  }

  const workbookBuffer = await response.arrayBuffer();

  return XLSX.read(workbookBuffer, { type: 'array' });
}
