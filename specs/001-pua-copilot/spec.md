# Spec as-is — Pua (copiloto de catálogo MusicTab)

**Estado:** reverse-spec del sistema que **hoy funciona**. Fuente de verdad: código. Si este documento y el README discrepan, gana el código (ver § Drift).

**Producto:** MusicTab, monorepo Yarn. Pua es el drawer chatbot de catálogo.

**Fuera de este archivo:** cambios deseados → `spec-delta.md`.

---

## 1. Problema y valor

Usuarios autenticados quieren consultar el catálogo de tablaturas en lenguaje natural (inglés o español) sin inventar canciones. Pua clasifica la pregunta, consulta PostgreSQL vía use-cases de dominio y responde en inglés, con hasta 3 hits clicables.

## 2. Actores

| Actor | Puede |
|-------|--------|
| Invitado (no JWT) | Ver el FAB y el drawer. No chatea. CTA a `/login`. |
| Usuario autenticado (`USER` o `ADMIN`) | `GET /copilot/quota`, `POST /copilot/chat`. Preguntar sobre catálogo, visitas propias y cupo. |
| Sistema (Gemini) | Solo nodos `understand` y (a veces) `reply`. Nunca `act`. |

No hay rol especial de Pua: admin y user tienen las mismas preguntas de catálogo. Las tabs las suben admins; `search_by_uploader` lista por username de cualquier rol.

## 3. Alcance actual (goals)

- Chat en drawer desde `MainLayout` (todas las rutas con ese layout).
- 15 intents en `COPILOT_INTENTS`.
- Límites de cuota, cooldown, longitud, historial y hits.
- Respuestas de plantilla para hechos (conteos, facetas, help, quota, out of scope) y Gemini para listados con hits cuando `COPILOT_TEMPLATE_REPLY` no está en `true`.

## 4. No-goals actuales

- Leer el PDF, dar acordes, letras o tabulatura.
- Descargar, like, ranking de descargas.
- Mutar catálogo o usuarios.
- Responder en el idioma del usuario (siempre inglés).
- Streaming, memoria long-term, tool-calling libre, RAG.
- Chat para invitados.

## 5. Límites (alineados backend / frontend)

| Constante | Valor | Dónde |
|-----------|-------|--------|
| Marca | Pua | `COPILOT_UI.BRAND_NAME` |
| Input | 1–100 chars (trim) | `COPILOT.MAX_INPUT_CHARS` / `COPILOT_UI` |
| Historial enviado al grafo | 4 mensajes | `HISTORY_MESSAGES` |
| Historial DTO HTTP | hasta 20 ítems, content ≤ 2000 | `CopilotChatDto` (el servicio recorta a 4) |
| Hits | 3 | `RESULT_LIMIT` / `COPILOT_RESULT_LIMIT` en domain |
| Cuota diaria | 10 / usuario / día AR | `DAILY_MESSAGE_LIMIT`, TZ `America/Argentina/Buenos_Aires` |
| Cooldown | 60 s tras envío **exitoso** | `SEND_COOLDOWN_MS`, `User.lastCopilotMessageAt` |
| Timeout Gemini | 25 s por nodo `understand`/`reply` | `GEMINI_TIMEOUT_MS` |
| Temperature | 0 | `createModel` |
| Modelo default | `gemini-3.6-flash` | override `COPILOT_MODEL` |
| Stale | 7 días | `STALE_AFTER_DAYS` |
| Flag plantillas globales | `COPILOT_TEMPLATE_REPLY=true` | fuerza template también en listados |

Reset de cuota: próxima medianoche calendario AR (`nextResetAtIso` → UTC 03:00).

## 6. Arquitectura (as-is)

```
UI CopilotDrawer
  → GET /copilot/quota (al abrir, si logged in)
  → POST /copilot/chat { message, history }
       → JwtAuthGuard
       → validación 100 chars
       → quota.assertCanConsume (cooldown + daily)
       → CopilotGraphService.run
            understand (Gemini + Zod)
            act (domain / Prisma, sin LLM)
            reply (template o Gemini)
       → quota.increment (solo si el grafo resolvió)
       → { reply, hits, quota }
```

Si `intent === my_quota`, `CopilotService.chat` **reescribe** `reply` con `quotaReply` usando el snapshot **ya incrementado** (el turno de “cuántos me quedan” también consume 1 mensaje).

## 7. Contrato HTTP (resumen)

Detalle en `contracts/copilot.openapi.yaml`.

- Ambos endpoints: `Authorization: Bearer`. Sin token → 401.
- Códigos de negocio en el body: `code` (`INPUT_TOO_LONG`, `COPILOT_COOLDOWN`, `COPILOT_DAILY_LIMIT`, `GEMINI_UNAVAILABLE`, `BAD_REQUEST`).
- Cuota de `POST /chat` **no** incluye `resetAt`. El frontend conserva el `resetAt` previo del GET.

## 8. Grafo y estado

Estado LangGraph (`CopilotGraphState`): `userId`, `message`, `history`, `intent`, `slots`, `hits`, `matchCount`, `extraCount`, `facetValues`, `subjectLabel`, `replyText`.

Default de intent si algo falla antes de clasificar: no se expone; un fallo de Gemini en `understand` → 503 `GEMINI_UNAVAILABLE`. El invoke inicial usa `intent: 'out_of_scope'` como placeholder.

Nodos: timeout en understand/reply; `retryPolicy.maxAttempts = 1`.

### 8.1 Slots (`CopilotSlots`)

`artist`, `genre`, `instrument`, `title`, `facet` (`genre`|`instrument`|`artist`), `uploader`, `sort` (`recent`|`views`), `order` (`desc`|`asc`).

Normalización en `act`:

- Instrumento: alias `ukelele`/`ukulele` → Ukulele; `guitarra`/`guitar` → Guitar; `guitarra eléctrica` / `electric guitar` → Electric Guitar.
- Uploader `yo|mí|me|mine|…` → el usuario autenticado.
- `userId` no se extrae del texto.

### 8.2 Modo de reply

Siempre template (no Gemini): `out_of_scope`, `help`, `count_by_artist`, `count_catalog`, `list_facets`, `last_viewed_me`, `count_my_views`, `search_by_uploader`, `my_quota`.

Gemini (si hay hits y `COPILOT_TEMPLATE_REPLY` ≠ `true`): `search_catalog`, `latest`, `top_viewed_me`, `top_viewed_global`, `stale_for_me`, `never_viewed_me`.

Si hits vacíos en esos listados → `emptyHitsReply`. Si Gemini falla o devuelve texto vacío → 503 o fallback a template de hits.

`REPLY_SYSTEM`: inglés, 4–6 líneas, máximo 3 ítems, formato `title — artist — genre — instrument`, sin URLs.

---

## 9. Capacidades por intent

Nombres canónicos de instrumentos/géneros: los del seed (Guitar, Piano, Ukulele; Rock, Jazz, … Chamamé, Cuarteto). El prompt también menciona Electric Guitar (puede no existir en el seed).

### 9.1 `search_catalog`

Buscar tabs por artista, género, instrumento, título o combinación. No es un conteo.

**Use-case:** `SearchTabs` (`sort` default `recent`).

**Ejemplos:** “Are there tabs by Milo J?” / “¿hay tabs de Milo J?” / “Do you have Bohemian Rhapsody?” / “Rock by Milo J”.

```gherkin
Given un usuario autenticado con cupo
And el catálogo tiene tabs del artista "Milo J"
When envía "¿hay tabs de Milo J?"
Then understand clasifica search_catalog con slots.artist ≈ "Milo J"
And act devuelve hasta 3 CopilotTabHit sin urlPdf
And reply lista solo esos hits (template o Gemini)
```

```gherkin
Given no hay tabs que matcheen
When el usuario busca un título inexistente
Then reply indica que no hay resultados en MusicTab
And hits es []
```

### 9.2 `count_by_artist`

Cuántas tabs hay de un artista. Slot `artist` obligatorio para un conteo útil.

**Use-cases:** `CountTabsByArtist` + `SearchTabs` (muestras).

```gherkin
Given 4 tabs de "Milo J"
When el usuario pregunta "how many tabs by Milo J"
Then matchCount es 4
And reply dice el total 4 aunque hits esté recortado a 3
And no menciona urlPdf
```

```gherkin
When count_by_artist llega sin artist
Then reply pide el artista (template countByArtistReply)
```

### 9.3 `count_catalog`

Cuántas tabs hay en total, por género y/o instrumento (y opcionalmente artista). No usar `count_by_artist` si la pregunta es de género/instrumento.

**Use-case:** `CountCatalog` + `SearchTabs`.

```gherkin
When el usuario pregunta "cuántas tabs de rock"
Then intent es count_catalog y slots.genre es Rock (o equivalente)
And matchCount es el total real en DB
```

```gherkin
When pregunta "cuántas tabs hay" / "how many tabs are there" sin filtros
Then count_catalog sin slots de filtro
```

### 9.4 `list_facets`

Qué hay cargado: géneros, instrumentos o artistas.

**Use-cases:** `GetGenres` | `GetInstruments` | `ListDistinctArtists`. Default facet: `genre`.

```gherkin
When pregunta "qué géneros hay"
Then intent list_facets facet=genre
And reply lista nombres reales, hits []
```

No confundir con `search_catalog`.

### 9.5 `last_viewed_me`

Última tab cuyo PDF abrió **este** usuario (`TabView`). No es `stale_for_me`.

**Use-case:** `GetLastViewedByUser`.

```gherkin
Given el usuario abrió el PDF de "Song A" más recientemente
When pregunta "cuál fue la última que abrí"
Then hits tiene 1 ítem Song A
And reply template lastViewedReply (puede citar lastViewedAt)
```

```gherkin
Given nunca abrió un PDF
Then emptyHitsReply de historial de visitas
```

### 9.6 `count_my_views`

Cuántos eventos de View PDF y cuántas tabs distintas.

**Use-case:** `CountMyViews` → `matchCount` = events, `extraCount` = distinctTabs.

```gherkin
Given 2 opens de 1 tab
When pregunta "cuántos PDFs abrí"
Then reply menciona 2 times y 1 distinct tab
And hits []
```

### 9.7 `search_by_uploader`

Tabs que subió un username (cualquier rol). “las mías” / “mine” → uploader = usuario actual.

**Use-cases:** `UserPrismaRepository.findByUsernameInsensitive` + `GetTabsByUser`.

```gherkin
Given el usuario "pepe" subió 1 tab
When pregunta "tabs que subió pepe"
Then matchCount es 1 y subjectLabel es el username canónico
```

```gherkin
When el username no existe o no tiene tabs
Then reply honesta de “no encontré tabs subidas por …”
```

### 9.8 `help`

Qué puede hacer Pua. Template `HELP_REPLY`. Sin DB. Hits [].

```gherkin
When pregunta "qué podés hacer" / "what can you do"
Then intent help
And reply es HELP_REPLY en inglés
And no llama use-cases de catálogo
```

### 9.9 `my_quota`

Mensajes restantes hoy. `act` lee cuota **antes** del increment; `CopilotService` alinea el texto **después** del increment.

```gherkin
Given used=2 remaining=8 limit=10 antes del turno
When pregunta "cuántos mensajes me quedan"
Then el turno consume 1
And reply refleja used=3 remaining=7 (post-increment)
```

### 9.10 `latest`

Tabs más recientes del catálogo, sin filtro.

**Use-case:** `GetLatestTabs` + nombres de género/instrumento.

```gherkin
When pregunta "las más recientes" / "most recent tabs"
Then hasta 3 hits ordenados por createdAt desc
```

### 9.11 `top_viewed_me`

Ranking por conteo de visitas **de este usuario**. `order=desc` más visitadas; `asc` menos.

**Use-case:** `GetTopViewedByUser`.

```gherkin
When pregunta "las que más visité"
Then order desc y hits personales
```

No confundir con `top_viewed_global` ni `stale_for_me`.

### 9.12 `top_viewed_global`

Ranking por `Tab.viewCount`. “most viewed” desc; “least viewed” / “menos visitadas” = **asc global**, no fecha.

**Use-case:** `GetTopViewedGlobal`.

### 9.13 `stale_for_me`

Ranking por **fecha** de última visita. “hace rato no visito” / “haven't opened in a while”. Umbral 7 días.

**Use-case:** `GetStaleViewedByUser`.

```gherkin
Given tabs visitadas hace más de 7 días
When pregunta "hace rato no visito"
Then intent stale_for_me (no top_viewed_global asc)
```

### 9.14 `never_viewed_me`

Tabs que este usuario nunca visitó.

**Use-case:** `GetNeverViewedByUser`.

```gherkin
When pregunta "nunca visité" / "ones I never visited"
Then intent never_viewed_me
And empty state distinto al de last_viewed_me
```

### 9.15 `out_of_scope`

Fuera del catálogo (hora, clima, letras, recetas, biografías, etc.) en EN o ES.

```gherkin
When pregunta "what's the weather" o "pasame la letra de Bohemian Rhapsody"
Then intent out_of_scope
And reply es OUT_OF_SCOPE_REPLY
And hits []
And act no consulta catálogo
```

---

## 10. Desambiguación (as-is, del prompt understand)

| Utterance | Intent correcto | No es |
|-----------|-----------------|-------|
| least viewed / menos visitadas | `top_viewed_global` order=asc | stale |
| haven't opened in a while / hace rato no visito | `stale_for_me` | least viewed |
| the last one I opened / la última que abrí | `last_viewed_me` | stale |
| never visited / nunca visité | `never_viewed_me` | stale |
| how many tabs are there (total/género/instrumento) | `count_catalog` | count_by_artist |
| how many by Milo J | `count_by_artist` | count_catalog |
| what genres are there / qué géneros hay | `list_facets` | search_catalog |
| are there tabs by X (listar, no contar) | `search_catalog` | count_by_artist |

## 11. UX (as-is)

- FAB fijo (`data-testid=copilot-fab`), naranja, overlay sobre el layout. Tooltip: “Pua” o “Sign in to use Pua”.
- Drawer: mobile bottom (`min(88dvh)`), desktop right 380–420px.
- Guest: Alert “Sign in to chat with Pua…” + botón “Go to login”; textarea disabled; Send disabled; **no** GET/POST copilot.
- Logged-in empty: “Ask me about an artist, genre, or instrument…”.
- Header: `messages today {used}/{limit}`.
- Pending: “Thinking…”.
- Chips: hasta 3, `Search tab {title}` → navega `/tabs?search={title}`.
- Burbuja assistant: se recortan URLs que parezcan PDF.
- Input: `maxLength=100`, helper `{n}/100`, Enter envía, Shift+Enter newline.
- Daily limit: Alert warning, input disabled.
- Cooldown: `Wait m:ss` (`data-testid=copilot-cooldown`), Send disabled; no POST.
- Errores: Alert; 401 redirige a login; cooldown dispara refetch de quota.

## 12. Errores y cuota (as-is)

| Situación | HTTP | `code` | ¿Grafo? | ¿Increment? |
|-----------|------|--------|---------|-------------|
| Sin JWT | 401 | (Nest) | no | no |
| Mensaje vacío o >100 | 400 | `INPUT_TOO_LONG` | no | no |
| History inválido | 400 | `BAD_REQUEST` | no | no |
| Cooldown activo | 429 | `COPILOT_COOLDOWN` + `retryAfterMs` | no | no |
| 10/10 ya usados | 429 | `COPILOT_DAILY_LIMIT` | no | no |
| Sin `GEMINI_API_KEY`, timeout, 429 Gemini | 503 | `GEMINI_UNAVAILABLE` | aborta | no |
| Grafo 2xx | 201/200 default Nest 201 para POST | — | sí | sí |

Frontend mapea esos códigos en `copilotErrorFromUnknown`.

```gherkin
Given cooldownRemainingMs > 0
When POST /copilot/chat
Then 429 COPILOT_COOLDOWN
And Gemini no se invoca
And count diario no sube
```

```gherkin
Given GEMINI_API_KEY ausente
When un usuario logueado envía un mensaje válido
Then 503 GEMINI_UNAVAILABLE
And used no incrementa
```

```gherkin
Given un invitado
When abre el drawer
Then no hay llamadas a /copilot/quota ni /copilot/chat
And el input está disabled
```

## 13. Persistencia

- `CopilotDailyUsage`: unique `(userId, date)` con `date` = `YYYY-MM-DD` AR; `count`.
- `User.lastCopilotMessageAt`: ancla del cooldown.
- `TabView`: historial de “View PDF” para intents personales.
- Borrar usuario hace cascade de `copilotUsage` (e2e users).

## 14. Tests que cubren esta spec (as-is)

| Capa | Qué cubre | Qué no cubre |
|------|-----------|--------------|
| domain Vitest (`SearchTabs`, rankings, CopilotCatalogHelpers, …) | use-cases y tope de 3 | clasificación LLM |
| `copilot.service.spec.ts` | longitud, increment post-2xx, cooldown, my_quota alineado | nodos del grafo |
| `copilot.quota.service.spec.ts` | snapshot, 429, increment | calendario e2e TZ |
| `copilot.templates.spec.ts` | count total vs 3 hits, quota text | todos los templates |
| `copilot.controller.spec.ts` | 400 INPUT_TOO_LONG (sin JWT guard en ese test module) | 401 |
| `copilot.e2e-spec.ts` | 401 en quota y chat | happy path |
| frontend `CopilotDrawer.spec.tsx` | guest, chips sin urlPdf, cooldown UI | todos los errores 503/429 daily |
| `copilotErrors.spec.ts` | mapeo 401/400/429/503 | — |

No hay `copilot.graph.spec.ts`: el nodo `understand`/`act`/`reply` no está testeado con LLM mockeado.

## 15. Drift documentado

| Tema | README / prompt | Código |
|------|-----------------|--------|
| Spec de producto | vive en `UNDERSTAND_SYSTEM` / README Pua | este `spec.md` pasa a ser la fuente SDD |
| Electric Guitar | listado en el prompt understand | seed típico: Guitar, Piano, Ukulele |
| Historial | 4 en constantes | DTO permite 20; se recorta a 4 en servicio/grafo |
| Reply language | usuarios preguntan EN o ES | replies siempre inglés (`REPLY_SYSTEM` y templates) |
| POST status | no documentado | Nest default 201 Created si no hay `@HttpCode` |

---

Fin del as-is. Deltas en `spec-delta.md`.
