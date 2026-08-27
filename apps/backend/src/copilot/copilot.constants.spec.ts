import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { COPILOT } from './copilot.constants';

const FRONTEND_CONSTANTS = path.resolve(
  __dirname,
  '../../../frontend/src/api/copilot.constants.ts',
);

function numberConst(source: string, name: string): number {
  const match = source.match(new RegExp(`${name}:\\s*([0-9_]+)`));
  if (!match) {
    throw new Error(`Missing ${name} in frontend copilot.constants.ts`);
  }
  return Number(match[1].replace(/_/g, ''));
}

describe('COPILOT vs COPILOT_UI limits', () => {
  const frontend = readFileSync(FRONTEND_CONSTANTS, 'utf8');

  it('keeps shared numeric limits aligned', () => {
    expect(COPILOT.MAX_INPUT_CHARS).toBe(100);
    expect(COPILOT.HISTORY_MESSAGES).toBe(4);
    expect(COPILOT.DAILY_MESSAGE_LIMIT).toBe(10);
    expect(COPILOT.RESULT_LIMIT).toBe(3);
    expect(COPILOT.SEND_COOLDOWN_MS).toBe(60_000);

    expect(numberConst(frontend, 'MAX_INPUT_CHARS')).toBe(COPILOT.MAX_INPUT_CHARS);
    expect(numberConst(frontend, 'HISTORY_MESSAGES')).toBe(COPILOT.HISTORY_MESSAGES);
    expect(numberConst(frontend, 'DAILY_MESSAGE_LIMIT')).toBe(COPILOT.DAILY_MESSAGE_LIMIT);
    expect(numberConst(frontend, 'RESULT_LIMIT')).toBe(COPILOT.RESULT_LIMIT);
    expect(numberConst(frontend, 'SEND_COOLDOWN_MS')).toBe(COPILOT.SEND_COOLDOWN_MS);
  });
});
