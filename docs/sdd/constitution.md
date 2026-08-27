# Constitution — MusicTab / Pua

Principios no negociables. Un cambio de Pua que los viole se rechaza aunque “mejore” la conversación.

Esta constitution gobierna `specs/001-pua-copilot/` y cualquier spec futura del copiloto. El código de runtime implementa la spec; los prompts de Gemini son implementación, no fuente de verdad.

## I. Catálogo como única verdad de datos

1. Pua no inventa tablaturas, títulos, artistas, géneros, instrumentos, conteos, IDs, fechas, URLs ni usuarios.
2. Toda fila que se liste o se cuente sale de use-cases TypeScript en `domain/` vía Prisma. El nodo `act` no llama al LLM.
3. Si el catálogo está vacío o no hay match, la respuesta lo dice. No se rellena con canciones de ejemplo.
4. Los hits nunca incluyen `urlPdf`, `urlYoutube`, `urlImagen`, emails, passwords ni IDs internos en el texto visible (el `id` numérico puede viajar en JSON para chips de UI, no para que el modelo lo recite).

## II. Arquitectura del grafo

1. El flujo permanece `understand → act → reply` salvo que una spec-delta lo cambie con justificación y tasks.
2. `understand` solo clasifica intent + slots (Zod). No responde al usuario.
3. `reply` solo frasea (Gemini o template) a partir del estado ya poblado. No vuelve a consultar la DB.
4. `MAX_TOOL_ROUNDS = 1` y grafo lineal: no hay tool-calling libre ni loops de agente.
5. `userId` sale del JWT / sesión. Se ignora cualquier id que el usuario escriba.

## III. Seguridad y límites

1. `GET /copilot/quota` y `POST /copilot/chat` requieren JWT. Invitados no chatean.
2. Cuota (10 mensajes / usuario / día calendario `America/Argentina/Buenos_Aires`) y cooldown (60 s entre envíos exitosos) se aplican en la API, no solo en la UI.
3. La cuota se incrementa solo después de un turno 2xx del grafo. Fallo de Gemini no consume cupo.
4. Input máximo: 100 caracteres (backend y frontend alineados).
5. Historial efectivo: 4 mensajes. Hits: máximo 3.
6. No se exponen URLs almacenadas de PDF en el chat.

## IV. Alcance de producto

Pua es un asistente de **catálogo MusicTab**. Dentro de alcance:

- buscar y contar tabs por artista, género, instrumento, título
- listar facetas (géneros, instrumentos, artistas)
- rankings globales y personales de visitas a PDF
- tabs subidas por username (cualquier rol)
- ayuda y cupo restante

Fuera de alcance (intent `out_of_scope`):

- letras, acordes, lectura del PDF, tutoriales, biografías
- clima, hora, recetas, chat general
- descargas, likes, features que no existen
- mutaciones del catálogo (crear/editar/borrar tabs)

## V. Spec-first (brownfield)

1. El comportamiento **actual** vive en `specs/001-pua-copilot/spec.md` (reverse-spec). Gana el código si hay drift con README.
2. El comportamiento **deseado** vive en `spec-delta.md`, etiquetado y separado.
3. Un intent nuevo entra en este orden: spec → `copilot.schema.ts` → prompt `understand` → rama `act` → template o `REPLY_SYSTEM` → test de dominio → test de grafo/servicio → UI si aplica → fila en `evals/`.
4. No se agrega un intent solo en el prompt.
5. No se cambia stack (Nest, LangGraph, Gemini, Zod, `domain`) sin task explícita.

## VI. Tests y evals

1. Cada intent tiene criterios Given/When/Then y al menos 2 utterances de eval (inglés y español).
2. Los tests existentes no se rompen para “limpiar” deuda. Se amplían mapeados a la spec.
3. Evals de clasificación pueden mockear Gemini. Los use-cases de dominio se testean sin LLM.
4. El contrato HTTP en `contracts/copilot.openapi.yaml` debe coincidir con DTO + tipos del frontend.

## VII. UX y consistencia

1. Marca: **Pua**. Drawer en `MainLayout` (FAB fijo).
2. Invitado: CTA “Go to login”; input deshabilitado; no llama a `/copilot/*`.
3. Autenticado: cuota visible, cooldown visible, chips de hits navegan a `/tabs?search=<title>`.
4. Constantes `COPILOT` (backend) y `COPILOT_UI` (frontend) deben permanecer alineadas en límites.

## VIII. Enmiendas

Cambiar esta constitution requiere:

- actualizar este archivo con la razón
- revisar `spec.md` / `spec-delta.md` afectados
- no mergear código que quede en contradicción
