import Fuse from 'fuse.js';

export function matchNamesInText(pdfText, rosterMap, { fuzzy = true } = {}) {
  const rosterNames = [...rosterMap.keys()];
  const found = [];
  const missing = [];

  for (const name of rosterNames) {
    if (pdfText.includes(name)) {
      found.push({ name, number: rosterMap.get(name), confidence: 1 });
    } else {
      missing.push({ name, number: rosterMap.get(name) });
    }
  }

  // Fuzzy match fallback
  if (fuzzy) {
    const fuse = new Fuse(rosterNames, { includeScore: true, threshold: 0.3 });
    for (const m of missing.slice()) {
      const result = fuse.search(m.name)[0];
      if (result && pdfText.includes(result.item)) {
        found.push({ name: m.name, number: m.number, confidence: 0.7 });
        missing.splice(missing.indexOf(m), 1);
      }
    }
  }

  return { found, missing };
}
