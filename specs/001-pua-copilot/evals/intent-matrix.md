# Intent matrix — Pua as-is

Fuente: `copilot.schema.ts`, `copilot.graph.ts` (`act` / `reply`), `copilot.templates.ts`. Cada fila debe tener ≥2 utterances en `golden-questions.yaml`.

| Intent | Slots típicos | Use-case(s) | Reply mode | Empty / edge | Notas |
|--------|---------------|-------------|------------|--------------|-------|
| `search_catalog` | artist, genre, instrument, title, sort | `SearchTabs` | Gemini si hits; si no `emptyHitsReply` | “No results in MusicTab for that search.” | Listar, no contar. sort default `recent`. |
| `count_by_artist` | artist | `CountTabsByArtist` + `SearchTabs` | template `countByArtistReply` | sin artist: pide ejemplo; count 0: no tabs for X | `matchCount` es la verdad; hits ≤3. |
| `count_catalog` | genre, instrument, artist? | `CountCatalog` + `SearchTabs` | template `countCatalogReply` | count 0 con/sin label | Total / género / instrumento. |
| `list_facets` | facet: genre\|instrument\|artist | `GetGenres` / `GetInstruments` / `ListDistinctArtists` | template `listFacetsReply` | “There's no catalog data to list.” | Default facet `genre`. hits []. |
| `last_viewed_me` | — | `GetLastViewedByUser` | template `lastViewedReply` | emptyHitsReply visitas | Un solo hit. No es stale. |
| `count_my_views` | — | `CountMyViews` | template `countMyViewsReply` | 0 events: open a PDF | matchCount=events, extraCount=distinct. hits []. |
| `search_by_uploader` | uploader (`me` / username) | user repo + `GetTabsByUser` | template `uploaderReply` | user missing o total 0 | “mine” → viewer. Cualquier rol. |
| `help` | — | ninguno | `HELP_REPLY` | n/a | act no consulta DB. |
| `my_quota` | — | `quota.getQuota` en act; `quotaReply` post-increment en service | template, realineado | remaining 0: all 10 used | El turno consume 1 mensaje. |
| `latest` | — | `GetLatestTabs` | Gemini si hits | “No results in MusicTab.” | Sin filtro. |
| `top_viewed_me` | order desc\|asc | `GetTopViewedByUser` | Gemini si hits | emptyHitsReply visitas | Visitas de ESTE user. |
| `top_viewed_global` | order desc\|asc | `GetTopViewedGlobal` | Gemini si hits | “No results in MusicTab.” | `viewCount`. least viewed = asc. |
| `stale_for_me` | — | `GetStaleViewedByUser` (7 días) | Gemini si hits; lastViewedAt en template | emptyHitsReply visitas | Fecha, no conteo global. |
| `never_viewed_me` | — | `GetNeverViewedByUser` | Gemini si hits | “couldn't find tabs you haven't visited” | Distinto empty vs last_viewed. |
| `out_of_scope` | — | ninguno | `OUT_OF_SCOPE_REPLY` | n/a | Letras, clima, etc. hits []. |

## Reply mode legend

- **template:** string en `copilot.templates.ts`; no Gemini en `reply`.
- **Gemini:** `REPLY_SYSTEM` + JSON de hits (sin URLs). Fallback template si texto vacío; 503 si el modelo falla.
- Flag `COPILOT_TEMPLATE_REPLY=true`: Gemini reply desactivado también en listados.

## Instrument aliases (act)

`ukelele`/`ukulele` → Ukulele; `guitarra`/`guitar` → Guitar; `electric guitar` / `guitarra electrica` / `guitarra eléctrica` → Electric Guitar.
