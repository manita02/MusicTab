# Data model — Pua

Modelos y tipos que el runtime ya usa. No hay tablas nuevas en esta spec as-is.

## Persistencia (Prisma)

### `User` (campos Pua)

| Campo | Tipo | Rol |
|-------|------|-----|
| `id` | Int | `userId` del grafo; nunca del texto del usuario |
| `username` | String unique | resolución de `search_by_uploader` (case-insensitive) |
| `lastCopilotMessageAt` | DateTime? | inicio del cooldown de 60 s |

### `CopilotDailyUsage`

| Campo | Tipo | Rol |
|-------|------|-----|
| `userId` + `date` | unique | `date` = `YYYY-MM-DD` en `America/Argentina/Buenos_Aires` |
| `count` | Int | mensajes **exitosos** ese día calendario AR |
| `updatedAt` | DateTime | auditoría |
| onDelete | Cascade desde User | e2e users lo verifica |

### `Tab` / `TabView`

`TabView(userId, tabId, viewedAt)` alimenta `last_viewed_me`, `count_my_views`, `top_viewed_me`, `stale_for_me`, `never_viewed_me`. `Tab.viewCount` alimenta `top_viewed_global`. `Tab.userId` alimenta `search_by_uploader`.

Hits de copilot **no** proyectan `urlPdf`, `urlYoutube`, `urlImagen`.

## DTO de hit (`CopilotTabHit`)

Compartido en espíritu entre `domain/src/dto/CopilotTabHit.ts` y `apps/frontend/src/api/copilot.types.ts`.

| Campo | Dominio | Frontend | Notas |
|-------|---------|----------|-------|
| `id` | number | number | chips; Gemini no debe recitarlo |
| `title`, `artist`, `genre`, `instrument` | string | string | |
| `viewCount` | number | number | |
| `createdAt` | string ISO | string | |
| `lastViewedAt` | string? | string? | last/stale |
| `userViewCount` | number? (domain) | no en tipo UI | ranking personal; `clipHits` del grafo **no** lo reenvía |

`sanitizeCopilotHits`: descarta sin `title`, tope 3, ignora `urlPdf` si viniera.

## Slots (`UnderstandOutput`)

Zod: `UnderstandOutputSchema` en `copilot.schema.ts`. Tras `normalizeUnderstandOutput`, strings vacíos/null se vuelven `undefined`.

## Historial

```ts
type CopilotHistoryTurn = { role: 'user' | 'assistant'; content: string }
```

El grafo usa `history.slice(-4)` y recorta cada content a 100 chars al pasarlo a LangChain (`MAX_INPUT_CHARS`). El DTO HTTP permite content hasta 2000 y hasta 20 ítems.

## Cuota

**GET** `CopilotQuotaResponse`: `used`, `limit`, `remaining`, `cooldownUntil`, `cooldownRemainingMs`, `resetAt`.

**POST chat** `CopilotQuotaSnapshot`: igual sin `resetAt`.

`limit` es siempre `COPILOT.DAILY_MESSAGE_LIMIT` (10), no se persiste.

## Estado interno del grafo (no se serializa al cliente)

`intent`, `slots`, `matchCount`, `extraCount`, `facetValues`, `subjectLabel`, `replyText`.

El cliente recibe solo `{ reply, hits, quota }`. El intent **no** se expone en el JSON de chat.
