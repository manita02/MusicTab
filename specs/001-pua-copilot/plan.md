# Plan técnico — SDD sobre Pua existente

Objetivo: inyectar SDD y cerrar P0/P1 **sin** reemplazar LangGraph, Nest `CopilotModule`, ni el drawer.

## 1. Qué se crea vs qué se toca

| Crear (docs / tests) | Tocar runtime solo si una task P1 lo exige |
|----------------------|--------------------------------------------|
| `docs/sdd/*` | `copilot.prompts.ts` (P1-5 si se elige alinear Electric Guitar) |
| `specs/001-pua-copilot/*` | extraer helpers de `copilot.graph.ts` (P1-6) |
| tests nuevos junto a los `*.spec.ts` actuales | `CopilotDrawer.spec.tsx` (P1-2) |
| README índice (P0-4) | no DTO, no Prisma, no intents nuevos |

Archivos de runtime que **no** se mueven a `specs/`: el grafo, prompts, schema Zod, templates, quota, drawer.

## 2. Cómo versionar un intent

Una sola unidad de cambio:

1. Fila en `evals/intent-matrix.md` + cases en `golden-questions.yaml`.
2. Enum `COPILOT_INTENTS` + slots Zod.
3. Ejemplos EN/ES en `UNDERSTAND_SYSTEM`.
4. `switch` en `act` → use-case `domain/` (crear use-case + test Vitest si no existe).
5. Template o reglas `REPLY_SYSTEM`.
6. Si el JSON de chat cambia: OpenAPI + `copilot.types.ts` en el mismo PR.

El prompt **no** es el lugar para un intent huérfano (constitution V.3).

## 3. Estrategia de tests

```
domain Vitest          → datos (ya existe)
templates Vitest       → prosa factual (ampliar P1-1)
quota / service Vitest → límites (ya existe)
act helpers Vitest     → ramas sin Gemini (P0-2 / P1-6)
understand harness     → goldens con output Zod fake (P0-1)
controller / e2e       → HTTP 401, 400, quota GET (P1-3)
frontend Vitest        → guest, chips, cooldown, 503, daily (P1-2)
```

Nunca llamar a Google en CI. `ChatGoogleGenerativeAI` se mockea o no se instancia.

## 4. Extraer para testear el grafo (diseño mínimo)

`CopilotGraphService` hoy instancia use-cases y `compile()` en el constructor. Plan P1-6:

- Extraer `clipHits`, `normalizeInstrument`, resolución de uploader (ya hay métodos privados).
- Extraer el `switch` de `act` a `runCopilotAct(deps, state)` en un archivo `copilot.act.ts` importado por el servicio.
- El `StateGraph` sigue en `copilot.graph.ts` y solo delega.

No introducir un segundo orquestador.

## 5. Constantes FE/BE (P0-3)

Opciones (elegir la más chica):

- **A (preferida para no crear paquete):** test en frontend o script que lea ambos archivos con regex/valores pinneados duplicados en el spec del test.
- **B:** reexportar números en un comentario “keep in sync” y test snapshot de ambos objetos.

No crear un workspace nuevo en P0.

## 6. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Extraer `act` rompe closures del servicio | extraer función pura con deps inyectados; mismo `switch` |
| E2E con AppModule necesita DB | P1-3 puede ser test de controller con JWT mock o e2e existente + login |
| Goldens demasiado estrictos en strings de slots | comparar intent exacto; slots con igualdad case-insensitive trim |
| OpenAPI 201 vs clientes que esperan 200 | documentar as-is; no cambiar `@HttpCode` en P0 |

## 7. Orden de implementación

Ver `tasks.md`. Resumen: docs ya hechos → README link → test constantes → templates specs → extraer `act` + tests → harness goldens (mock) → UI 503/daily → e2e quota/validación. P2 no entra.
