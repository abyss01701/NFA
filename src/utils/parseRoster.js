import ExcelJS from 'exceljs';
import { emailToName, joinName } from './normalizeName';

/**
 * Parse a crew roster Excel file and return a map of normalized names → numbers.
 * Column 1 = "Data SIM Number"
 * Column 2 = "Flight Ops Crew Deployed (Fiji Airways)" (email or firstname.lastname)
 */
export async function parseRoster(file) {
  const workbook = new ExcelJS.Workbook();
  const buf = await file.arrayBuffer();
  await workbook.xlsx.load(buf);

  if (workbook.worksheets.length === 0) {
    throw new Error('No worksheets found in the Excel file');
  }

  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount === 0) {
    throw new Error('Worksheet is empty');
  }

  const mapByName = new Map();
  const rows = [];

  // Loop through rows (skip header row 1)
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    if (!row.hasValues) continue;

    const number = row.getCell(1).value;  // "Data SIM Number"
    const crewRaw = row.getCell(2).value; // "Flight Ops Crew Deployed"

    if (!number || !crewRaw) continue;

    let f = '', l = '';
    if (typeof crewRaw === 'string') {
      if (crewRaw.includes('@')) {
        // It's an email
        const parsed = emailToName(crewRaw);
        f = parsed.first;
        l = parsed.last;
      } else {
        // Assume it's "Firstname Lastname"
        const parts = crewRaw.trim().split(/[.\s]+/);
        f = parts[0];
        l = parts[parts.length - 1];
      }
    }

    if (f && l) {
      const normalFL = joinName(f, l); // damien frost
      const normalLF = joinName(l, f); // frost damien

      mapByName.set(normalFL, String(number).trim());
      mapByName.set(normalLF, String(number).trim());
    }
  }

  console.log("Built roster map:", Array.from(mapByName.entries()).slice(0, 10));
  return { mapByName, rows };
}
