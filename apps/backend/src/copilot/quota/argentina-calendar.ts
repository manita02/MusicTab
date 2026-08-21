import { COPILOT_TZ } from '../copilot.constants';

/** YYYY-MM-DD en America/Argentina/Buenos_Aires. */
export function calendarDateInArgentina(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: COPILOT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * Próxima medianoche del calendario AR como ISO-8601 UTC.
 * Argentina no usa DST (offset fijo UTC−3).
 */
export function nextResetAtIso(now = new Date()): string {
  const [year, month, day] = calendarDateInArgentina(now).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1, 3, 0, 0)).toISOString();
}
