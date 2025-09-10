export function normalize(str) {
  if (!str) return '';
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function emailToName(email) {
  const m = String(email || '').split('@')[0].split('.');
  if (m.length >= 2) return { first: m[0], last: m[m.length - 1] };
  return { first: m[0] || '', last: '' };
}

export function joinName(first, last) {
  return normalize(`${first} ${last}`.trim());
}
