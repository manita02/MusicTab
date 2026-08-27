# Tasks — 001-pua-copilot

Checklist ordenado. Cada ítem es pequeño y tiene “done” verificable. No hay rewrite del grafo como task 1.

Leyenda: **docs** = ya entregado en esta corrida SDD. **next** = implementable sin romper Pua.

## Fase A — artefactos SDD (P0 docs)

- [x] **T-001** Constitution `docs/sdd/constitution.md`. Done: 8 secciones + enmiendas.
- [x] **T-002** Guía `docs/sdd/README.md` (ciclo specify→plan→tasks).
- [x] **T-003** Reverse-spec `specs/001-pua-copilot/spec.md` (15 intents, Gherkin, UX, errores, drift).
- [x] **T-004** `data-model.md` + `research.md` + `quickstart.md`.
- [x] **T-005** `evals/intent-matrix.md` (15 filas).
- [x] **T-006** `evals/golden-questions.yaml` (≥2 utterances EN/ES por intent + DIS-*).
- [x] **T-007** `contracts/copilot.openapi.yaml` alineado a DTO/excepciones (POST 201 as-is).
- [x] **T-008** `spec-delta.md` + `plan.md` + este `tasks.md`.

## Fase B — descubribilidad y anclas (P0, runtime intacto)

- [x] **T-009** P0-4 — En el Index del README raíz, link a `docs/sdd/README.md` (y opcional ancla Pua). Done: un contributor llega a la spec desde el README. Archivos: `README.md`. Tests: ninguno.
- [x] **T-010** P0-3 — Test que pinnea límites compartidos 100 / 4 / 10 / 3 / 60000 entre `apps/backend/src/copilot/copilot.constants.ts` y `apps/frontend/src/api/copilot.constants.ts`. Done: `npx vitest run` (backend o frontend) falla si un lado cambia solo. Archivos: un `*.spec.ts` nuevo. No cambiar valores de producto.

## Fase C — tests que demuestran la spec as-is (P0/P1, sin nuevos intents)

- [x] **T-011** P1-1 — Specs de templates restantes (`HELP_REPLY`, `OUT_OF_SCOPE_REPLY`, `listFacetsReply`, `lastViewedReply`, `countMyViewsReply`, `uploaderReply`, `emptyHitsReply`, `hitsTemplateReply`, `countCatalogReply`). Done: `apps/backend` `npx vitest run` verde; cada empty state de la matrix tiene un expect. Archivos: `copilot.templates.spec.ts`.
- [ ] **T-012** P1-6 — Extraer `runCopilotAct` (o equivalente) de `copilot.graph.ts` **sin** cambiar comportamiento. Done: el drawer/API se comportan igual; el módulo Nest sigue compilando. Archivos: `copilot.act.ts` + import en graph. Criterio: diff de `act` es movimiento, no lógica nueva.
- [ ] **T-013** P0-2 — Vitest table-driven sobre `runCopilotAct` con repos fake (reusar fakes de `domain/tests` o mocks). Casos mínimos: `help`/`out_of_scope` no consultan tabs; `search_catalog` llama search con take≤3; `count_by_artist` sin artist no search obligatorio según código actual; `my_quota` lee quota. Done: `npx vitest run` cubre esas ramas. Sin `GEMINI_API_KEY`.
- [x] **T-014** P0-1 — Harness que lee `golden-questions.yaml` y valida **al menos** que cada `intent` está en `COPILOT_INTENTS` y que no hay id duplicado (lint del YAML). Done: test Vitest parsea el YAML. (Clasificación real con mock de Gemini = T-015.)
- [x] **T-015** P0-1b — Test de `normalizeUnderstandOutput` (slots vacíos/null). Clasificación con mock de Gemini de 5 goldens sigue pendiente si se quiere un harness de LLM. Archivos: `copilot.evals.spec.ts`.

## Fase D — HTTP y UI (P1)

- [ ] **T-016** P1-3 — Con JWT (e2e existente o controller+guard), `GET /copilot/quota` 200 incluye `limit=10` y `resetAt`; `POST /copilot/chat` 101 chars → 400 `INPUT_TOO_LONG` **con** usuario autenticado. Done: `apps/backend` `npm test` / e2e. No invocar grafo.
- [ ] **T-017** P1-2 — `CopilotDrawer.spec.tsx`: remaining=0 muestra warning y Send disabled; `api.post` reject 503 muestra copy de AI unavailable. Done: `yarn test` en frontend.
- [ ] **T-018** P1-4 — Agregar sección `followups:` en `golden-questions.yaml` (mínimo 2 diálogos). Done: YAML válido; T-014 sigue pasando.

## Fase E — drift de catálogo (P1, decisión humana)

- [ ] **T-019** P1-5 — Decidir A o B (quitar Electric Guitar del prompt/aliases vs seed). Implementar **solo** la opción acordada + una nota en `research.md`. Done: prompt y seed coherentes. No hacer las dos.

## Fase F — explícitamente no hacer

- [ ] ~~Nuevo intent~~ — requiere spec-delta nueva, no este backlog.
- [ ] ~~P2-1 i18n replies~~
- [ ] ~~P2-2 nodo clarify~~
- [ ] ~~P2-3 campo `intent` en el JSON~~ (salvo que T-015 lo necesite internamente; no exponer al cliente)
- [ ] ~~Cambiar POST 201 → 200~~

## Comandos de verificación (cuando haya código)

```bash
cd domain && npm test
cd apps/backend && npx vitest run && npm test
cd apps/frontend && yarn test
```

## Siguiente corrida recomendada

Empezar por **T-012/T-013** (extraer `act` + tests sin Gemini). Después **T-016/T-017** (e2e quota + UI 503/daily). **T-019** espera decisión A/B sobre Electric Guitar.
