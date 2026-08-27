# Spec Driven Development en MusicTab

Pua (el copiloto de catálogo) ya está en producción. SDD se inyecta en **brownfield**: primero se documenta lo que el código hace hoy, después se completa lo que falta. No se reescribe el grafo.

## Ciclo

| Fase | Artefacto | Pregunta |
|------|-----------|----------|
| 0 Constitution | `docs/sdd/constitution.md` | ¿Qué no se puede romper? |
| 1 Specify (as-is) | `specs/001-pua-copilot/spec.md` | ¿Qué hace Pua hoy? |
| 1b Specify (to-be) | `specs/001-pua-copilot/spec-delta.md` | ¿Qué se agrega sin cambiar el diseño? |
| 2 Plan | `specs/001-pua-copilot/plan.md` | ¿Cómo encaja en Nest / LangGraph / domain / React? |
| 3 Tasks | `specs/001-pua-copilot/tasks.md` | ¿Qué se implementa, en qué orden? |
| 4 Implement | código de runtime | Solo lo que una task cita. |
| 5 Verify | tests + `evals/` | ¿La spec se demuestra? |

## Dónde está cada cosa

```
docs/sdd/
  README.md              ← este archivo
  constitution.md
specs/001-pua-copilot/
  spec.md                ← reverse-spec (fuente de verdad as-is)
  spec-delta.md          ← gaps P0/P1/P2
  plan.md
  tasks.md
  data-model.md
  research.md
  quickstart.md
  contracts/copilot.openapi.yaml
  evals/golden-questions.yaml
  evals/intent-matrix.md
```

Runtime (no mover a `specs/`):

- Grafo: `apps/backend/src/copilot/graph/copilot.graph.ts`
- Prompts: `apps/backend/src/copilot/graph/copilot.prompts.ts`
- Schema Zod: `apps/backend/src/copilot/graph/copilot.schema.ts`
- API: `apps/backend/src/copilot/copilot.controller.ts`
- UI: `apps/frontend/src/components/Copilot/CopilotDrawer.tsx`
- Use-cases: `domain/src/use-cases/*`

## Cómo agregar un intent

1. Historia + Gherkin en `spec-delta.md`.
2. Fila en `evals/intent-matrix.md` y utterances en `golden-questions.yaml`.
3. Enum + slots en `copilot.schema.ts`.
4. Ejemplos EN/ES en `UNDERSTAND_SYSTEM`.
5. Rama en `act` (use-case de dominio; crear el use-case si no existe).
6. Template o reglas en `REPLY_SYSTEM`.
7. Tests: dominio (Vitest) → servicio/grafo → UI si hay estado nuevo.
8. Task marcada done solo con evidencia de tests.

## Qué no hacer

- Pedirle al LLM que “busque en internet” o lea el PDF.
- Poner la spec solo en el system prompt.
- Consumir cuota cuando Gemini falla.
- Implementar P2 (i18n de replies, streaming, RAG) sin una spec-delta aceptada.
