import { describe, expect, it } from 'vitest';
import { COPILOT } from '../copilot.constants';
import { cooldownUntilFrom, remainingMs } from './copilot-cooldown';

describe('cooldownUntilFrom', () => {
  const now = new Date('2026-08-25T18:00:00.000Z');

  it('devuelve null si nunca hubo mensaje', () => {
    expect(cooldownUntilFrom(null, now, COPILOT.SEND_COOLDOWN_MS)).toBeNull();
    expect(cooldownUntilFrom(undefined, now, COPILOT.SEND_COOLDOWN_MS)).toBeNull();
  });

  it('devuelve last+60s si el minuto no acabó', () => {
    const last = new Date(now.getTime() - 20_000);
    const until = cooldownUntilFrom(last, now, COPILOT.SEND_COOLDOWN_MS);
    expect(until?.toISOString()).toBe(new Date(last.getTime() + 60_000).toISOString());
  });

  it('devuelve null si el minuto ya pasó', () => {
    const last = new Date(now.getTime() - 61_000);
    expect(cooldownUntilFrom(last, now, COPILOT.SEND_COOLDOWN_MS)).toBeNull();
  });
});

describe('remainingMs', () => {
  const now = new Date('2026-08-25T18:00:00.000Z');

  it('es 0 si no hay until', () => {
    expect(remainingMs(null, now)).toBe(0);
  });

  it('no es negativo', () => {
    expect(remainingMs(new Date(now.getTime() - 5_000), now)).toBe(0);
  });
});
