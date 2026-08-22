import { calendarDateInArgentina, nextResetAtIso } from './argentina-calendar';

describe('argentina-calendar', () => {
  it('usa el calendario America/Argentina/Buenos_Aires (UTC−3)', () => {
    expect(calendarDateInArgentina(new Date('2026-08-22T02:30:00.000Z'))).toBe('2026-08-21');
    expect(calendarDateInArgentina(new Date('2026-08-22T03:00:00.000Z'))).toBe('2026-08-22');
  });

  it('resetAt es la próxima medianoche AR en ISO UTC', () => {
    expect(nextResetAtIso(new Date('2026-08-21T18:00:00.000Z'))).toBe('2026-08-22T03:00:00.000Z');
  });
});
