import { normalize } from './normalizeName';

export function extractCrewNamesFromPdfText(pdfText) {
  const rawNames = [];
  const regex = /-([A-Z]+[A-Za-z]+(?:\s+[A-Za-z]+){0,2})\([A-Z0-9]+\)/g;
  let m;
  while ((m = regex.exec(pdfText)) !== null) {
    const full = m[1].trim();
    rawNames.push(normalize(full));
  }
  return [...new Set(rawNames)];
}
