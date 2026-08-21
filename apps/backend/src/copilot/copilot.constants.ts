export const COPILOT = {
  MODEL: 'gemini-2.5-flash', // ID Flash vigente en AI Studio
  MAX_OUTPUT_TOKENS: 384, // banda 256–512
  HISTORY_MESSAGES: 4,
  RESULT_LIMIT: 3, // top N de TODAS las consultas del bot
  MAX_INPUT_CHARS: 280,
  DAILY_MESSAGE_LIMIT: 5, // por usuario, calendario AR
  MAX_TOOL_ROUNDS: 1,
  GEMINI_TIMEOUT_MS: 15_000,
  SEND_COOLDOWN_MS: 2_500, // UI: pausa entre envíos (RPM de Google ~10–15/min)
  STALE_AFTER_DAYS: 7, // “hace rato no visito”
} as const;

export const COPILOT_TZ = 'America/Argentina/Buenos_Aires';

export function copilotModelName(envModel?: string): string {
  const fromEnv = envModel?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : COPILOT.MODEL;
}

export function copilotTemplateReplyEnabled(raw?: string): boolean {
  return raw?.trim().toLowerCase() === 'true';
}
