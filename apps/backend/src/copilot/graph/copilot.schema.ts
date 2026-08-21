import { z } from 'zod';

export const COPILOT_INTENTS = [
  'search_catalog',
  'latest',
  'top_viewed_me',
  'top_viewed_global',
  'stale_for_me',
  'never_viewed_me',
  'out_of_scope',
] as const;

export type CopilotIntent = (typeof COPILOT_INTENTS)[number];

export const UnderstandOutputSchema = z.object({
  intent: z.enum(COPILOT_INTENTS),
  slots: z
    .object({
      artist: z.string().nullable().optional(),
      genre: z.string().nullable().optional(),
      instrument: z.string().nullable().optional(),
      sort: z.enum(['recent', 'views']).nullable().optional(),
      order: z.enum(['desc', 'asc']).nullable().optional(),
    })
    .optional()
    .default({}),
});

export type CopilotSlots = {
  artist?: string;
  genre?: string;
  instrument?: string;
  sort?: 'recent' | 'views';
  order?: 'desc' | 'asc';
};

export type UnderstandOutput = {
  intent: CopilotIntent;
  slots: CopilotSlots;
};

function optionalSlot(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeUnderstandOutput(raw: {
  intent: CopilotIntent;
  slots?: z.infer<typeof UnderstandOutputSchema>['slots'];
}): UnderstandOutput {
  const slots = raw.slots ?? {};
  return {
    intent: raw.intent,
    slots: {
      artist: optionalSlot(slots.artist),
      genre: optionalSlot(slots.genre),
      instrument: optionalSlot(slots.instrument),
      sort: slots.sort ?? undefined,
      order: slots.order ?? undefined,
    },
  };
}
