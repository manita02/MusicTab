export const COPILOT = {
  MODEL: 'gemini-3.6-flash', // ID Flash vigente en AI Studio (2.5 ya no acepta cuentas nuevas)
  MAX_OUTPUT_TOKENS: 1024, // Gemini 3 thinking cuenta contra el budget; 384 recortaba el JSON de understand
  HISTORY_MESSAGES: 4,
  RESULT_LIMIT: 3, // top N de TODAS las consultas del bot
  MAX_INPUT_CHARS: 100,
  DAILY_MESSAGE_LIMIT: 10, // 10 msgs/usuario/día AR + 60s entre mensajes exitosos
  MAX_TOOL_ROUNDS: 1,
  GEMINI_TIMEOUT_MS: 25_000,
  SEND_COOLDOWN_MS: 60_000, // server-enforced pause between successful sends
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
