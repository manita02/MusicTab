import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { COPILOT_INTENTS, normalizeUnderstandOutput } from './graph/copilot.schema';

const GOLDEN = path.resolve(
  __dirname,
  '../../../../specs/001-pua-copilot/evals/golden-questions.yaml',
);

describe('golden-questions.yaml', () => {
  const yaml = readFileSync(GOLDEN, 'utf8');

  it('cubre los 15 intents y no duplica ids', () => {
    for (const intent of COPILOT_INTENTS) {
      expect(yaml, `missing intent ${intent}`).toContain(`intent: ${intent}`);
    }

    const ids = [...yaml.matchAll(/^\s*- id:\s*(\S+)/gm)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThanOrEqual(COPILOT_INTENTS.length * 2);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('normalizeUnderstandOutput', () => {
  it('limpia slots vacíos y null', () => {
    const out = normalizeUnderstandOutput({
      intent: 'search_catalog',
      slots: {
        artist: '  Milo J  ',
        genre: null,
        instrument: '  ',
        title: undefined,
        facet: 'genre',
        uploader: null,
        sort: 'recent',
        order: null,
      },
    });
    expect(out).toEqual({
      intent: 'search_catalog',
      slots: {
        artist: 'Milo J',
        genre: undefined,
        instrument: undefined,
        title: undefined,
        facet: 'genre',
        uploader: undefined,
        sort: 'recent',
        order: undefined,
      },
    });
  });
});
