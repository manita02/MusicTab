# Research — decisiones ya tomadas (Pua)

Registro de porqués del diseño actual. No reabrir sin spec-delta.

## R1. LangGraph lineal, no agente con tools

**Decisión:** tres nodos fijos `understand → act → reply`.

**Por qué:** el catálogo debe consultarse con TypeScript, no con function-calling que pueda alucinar argumentos o saltarse Prisma. `MAX_TOOL_ROUNDS = 1`.

**Consecuencia:** no hay nodo de clarificación. Un `count_by_artist` sin artista se responde con template pidiendo el nombre, no con un segundo turno de LLM.

## R2. Gemini + Zod en understand; temperature 0

**Decisión:** `withStructuredOutput(UnderstandOutputSchema)`, `thinkingLevel: LOW`, `maxRetries: 0`.

**Por qué:** intents cerrados (enum de 15). Un JSON inválido o timeout → 503, no un intent “inventado” silencioso hacia el usuario (el placeholder interno es `out_of_scope` solo antes de classify).

**Riesgo:** 429/outage de Gemini tumba tanto clasificación como reply. Mitigación: templates cubren intents factuales; listados pueden forzar `COPILOT_TEMPLATE_REPLY=true`.

## R3. Templates para hechos, LLM para prosa de listados

**Decisión:** conteos, facetas, help, quota, out_of_scope, uploader, last viewed, my views → string determinista. Gemini reply solo si hay hits en intents de ranking/búsqueda.

**Por qué:** los números (`matchCount`) no deben redondearse ni sustituirse. El test de templates exige “4 tabs” con 3 hits.

## R4. Respuestas siempre en inglés

**Decisión:** `REPLY_SYSTEM` y todos los templates en inglés. El usuario puede preguntar en español.

**Por qué:** producto/demo en inglés consistente. Es un gap P2 (i18n) si se quiere espejar idioma; no es un bug del as-is.

## R5. Cuota en API, increment post-éxito

**Decisión:** `assertCanConsume` antes del grafo; `increment` después. Fallo Gemini no cobra. Cooldown anclado a `lastCopilotMessageAt` solo en increment.

**Por qué:** no penalizar al usuario por 503. El turno `my_quota` sí cobra (es un mensaje) y el texto se realinea post-increment.

**Calendario:** día AR sin DST (`UTC−3` fijo) para `date` y `resetAt`.

## R6. 100 caracteres, 10/día, 60 s, 3 hits, 4 history

**Decisión:** constantes duplicadas FE/BE a propósito (no hay paquete shared de constantes de Pua).

**Por qué:** costo Gemini + abuso. El DTO history más holgado (20) es defensa en profundidad; el recorte a 4 es el contrato real.

## R7. Hits sin PDF; chips → búsqueda por título

**Decisión:** `clipHits` + `sanitizeCopilotHits`; chip navega `/tabs?search=title`.

**Por qué:** no filtrar URLs de storage en el chat (el catálogo público tampoco expone PDF a guests). La navegación reutiliza el buscador existente, no un deep-link por id.

## R8. Modelo `gemini-3.6-flash`

**Decisión:** default en `COPILOT.MODEL`; override env `COPILOT_MODEL`.

**Por qué:** comentario en código: IDs Flash vigentes en AI Studio; 2.5 deja de aceptar cuentas nuevas. `maxOutputTokens: 1024` porque el thinking recortaba el JSON de understand a 384.

## R9. userId solo del JWT

**Decisión:** prompt: “Do not extract userId from the text.” Intents personales usan `state.userId`.

**Por qué:** no permitir enumerar historial de otro usuario pegando un id.

## R10. Preguntas abiertas (no asumir)

- ¿El follow-up “¿y de piano?” con history=4 es suficiente? No hay eval de diálogo multi-turno en CI.
- ¿Electric Guitar debe existir en seed o quitarse del prompt?
- ¿Exponer `intent` en la respuesta de chat ayudaría a evals/UI? Hoy no se expone.
