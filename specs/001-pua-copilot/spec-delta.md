# Spec delta — completar Pua sin reescribirlo

Separado del as-is (`spec.md`). Nada de esto está implementado salvo lo marcado **hecho en esta corrida SDD** (solo artefactos de documentación).

## Hecho en esta corrida (docs + tests ancla, sin tocar el grafo)

- T-009 README → SDD.
- T-010 test de límites `COPILOT` vs `COPILOT_UI`.
- T-011 cobertura de templates / empty states.
- T-014/T-015 lint de goldens + `normalizeUnderstandOutput`.

## Hecho (P0 documentación, esta corrida)

- Constitution, reverse-spec, data-model, research, quickstart.
- Intent matrix + golden questions (EN/ES, 15 intents + desambiguación).
- OpenAPI alineado al código.
- Este delta, plan y tasks.

No se tocó runtime del grafo ni la UI.

---

## P0 — trazabilidad y corrección (hacer primero)

### P0-1. Evals ejecutables de clasificación

**Story:** Como maintainer, quiero que `golden-questions.yaml` falle en CI si `understand` se desvía (con Gemini mockeado o un clasificador de fixture).

**Aceptación:**

```gherkin
Given el YAML de evals
When corro el harness de copilot evals
Then cada case.id reporta pass/fail de intent (y slots no nulos esperados)
And el harness no llama a Google si hay mock
```

**Impacto:** test nuevo (Vitest backend). No cambia el grafo. Extraer `normalizeUnderstandOutput` ya es testeable hoy sin LLM.

### P0-2. Tests del nodo `act` (sin LLM)

**Story:** Cada rama del `switch` de `act` está cubierta con repos fake.

**Aceptación:** table-driven: intent+slots → use-case invocado / hits recortados a 3 / `out_of_scope` y `help` no tocan DB.

**Impacto:** `copilot.graph` es un `@Injectable` grande; extraer `act` a función pura o testear vía servicio con graph parcial. Preferir extraer helpers antes que un rewrite.

### P0-3. Drift de constantes FE/BE

**Story:** Un test o script falla si `COPILOT` y `COPILOT_UI` discrepan en `MAX_INPUT_CHARS`, `HISTORY_MESSAGES`, `DAILY_MESSAGE_LIMIT`, `RESULT_LIMIT`, `SEND_COOLDOWN_MS`.

**Aceptación:** valores actuales (100, 4, 10, 3, 60000) pinneados; cambiar uno obliga a cambiar el otro o el test.

### P0-4. Enlace SDD desde el README raíz

**Aceptación:** el Index apunta a `docs/sdd/README.md` para Pua.

---

## P1 — completar producto sin cambiar arquitectura

### P1-1. Cobertura de templates y empty states

Hoy `copilot.templates.spec.ts` solo prueba count-by-artist y quota.

**Aceptación:** un test por función pública de `copilot.templates.ts` (help, oos, facets, last viewed, my views, uploader, emptyHits por intent, hitsTemplate con lastViewedAt).

### P1-2. UI: daily limit y 503

**Aceptación:**

```gherkin
Given quota remaining=0
When el usuario abre Pua
Then ve el warning de 10 mensajes y no puede enviar
```

```gherkin
Given POST chat 503 GEMINI_UNAVAILABLE
Then el Alert muestra el copy de AI unavailable
And no se agrega burbuja assistant falsa
```

### P1-3. E2E autenticado de validación (sin Gemini)

**Aceptación:** con JWT válido, POST de 101 chars → 400 `INPUT_TOO_LONG` y GET quota → 200 con `limit=10`. No requiere `GEMINI_API_KEY`.

### P1-4. Goldens de follow-up (historial)

**Aceptación:** 4+ cases en YAML con `history` (ej. user: “¿hay rock?” assistant: lista; user: “¿y de piano?”) documentando el intent esperado. El as-is no garantiza clarificación; esto **documenta** el comportamiento actual, no agrega un nodo.

### P1-5. Drift Electric Guitar

El prompt understand lista Electric Guitar; el seed es Guitar, Piano, Ukulele.

**Aceptación (elegir una, no las dos):**

- A) Quitar Electric Guitar del prompt y de `INSTRUMENT_ALIASES`, o
- B) Sembrar Electric Guitar y dejar alias.

Hasta decidirlo: queda como pregunta en `research.md` R10. **No implementar ciego.**

### P1-6. Extraer `act`/`clipHits` para testear sin instanciar Gemini

Hoy `CopilotGraphService` construye el grafo en el constructor y avisa si falta API key. Tests de `act` no deberían requerir key.

**Aceptación:** funciones puras o métodos testeables importables; el grafo compilado sigue igual para runtime.

---

## P2 — opcional (no implementar en la siguiente corrida)

| ID | Idea | Por qué espera |
|----|------|----------------|
| P2-1 | Replies en el idioma del usuario | Cambia `REPLY_SYSTEM` + todos los templates; producto as-is es inglés |
| P2-2 | Nodo `clarify` si faltan slots | Rompe grafo lineal; constitution II.1 |
| P2-3 | Exponer `intent` en JSON de chat | Útil para evals/UI; no está en el contrato as-is |
| P2-4 | Streaming de reply | Cambio de API y drawer |
| P2-5 | Paquete shared de constantes Pua | Refactor de workspaces |
| P2-6 | RAG / lectura de PDF | Fuera de alcance constitution IV |
| P2-7 | Historial > 4 o memoria | Costo y contrato |

## Fuera de alcance permanente (salvo constitution nueva)

Agente autónomo, tool-calling libre, mutaciones de catálogo vía chat, invitados chateando, multi-LLM.
