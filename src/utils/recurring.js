import { daysInMonth, MESES_CORTO } from './formatters';

export const FREQUENCIES = [
  { id: 'none', label: 'No se repite' },
  { id: 'weekly', label: 'Cada semana' },
  { id: 'biweekly', label: 'Cada quincena (15 y fin de mes)' },
  { id: 'monthly', label: 'Cada mes' },
  { id: 'yearly', label: 'Cada año' },
];

export const FREQUENCY_SHORT = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  yearly: 'Anual',
};

const pad = (n) => String(n).padStart(2, '0');
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parseISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m - 1, d];
};

// Día del mes respetando meses cortos (el 31 cae el 30 o el 28/29)
const clampDay = (y, m, day) => Math.min(day, daysInMonth(y, m));

// Primera fecha de quincena (15 o último día del mes) en o después de `iso`
export function alignBiweekly(iso) {
  const [y, m, d] = parseISO(iso);
  if (d <= 15) return toISO(y, m, 15);
  return toISO(y, m, daysInMonth(y, m));
}

// Siguiente fecha después de `iso` según la frecuencia.
// `anchorDay` es el día original del mes, para no perderlo tras un febrero.
export function nextOccurrence(iso, frequency, anchorDay) {
  const [y, m, d] = parseISO(iso);

  if (frequency === 'weekly') {
    const date = new Date(y, m, d + 7);
    return toISO(date.getFullYear(), date.getMonth(), date.getDate());
  }

  if (frequency === 'biweekly') {
    if (d < 15) return toISO(y, m, 15);
    const last = daysInMonth(y, m);
    if (d < last) return toISO(y, m, last);
    const [ny, nm] = m === 11 ? [y + 1, 0] : [y, m + 1];
    return toISO(ny, nm, 15);
  }

  if (frequency === 'monthly') {
    const [ny, nm] = m === 11 ? [y + 1, 0] : [y, m + 1];
    return toISO(ny, nm, clampDay(ny, nm, anchorDay || d));
  }

  if (frequency === 'yearly') {
    return toISO(y + 1, m, clampDay(y + 1, m, anchorDay || d));
  }

  return null;
}

export function shortDate(iso) {
  if (!iso) return '';
  const [, m, d] = parseISO(iso);
  return `${d} ${MESES_CORTO[m].toLowerCase()}`;
}
