# Quickstart — Pua local + tests

Requisitos generales: README raíz (Node 20, Yarn 4.10.3 via Corepack, Postgres).

## 1. Arrancar API con Pua

```bash
yarn db:up
cd apps/backend
# copiar .env.example → .env y completar GEMINI_API_KEY
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
npm run start:dev
```

Sin `GEMINI_API_KEY`, el chat autenticado responde **503** `GEMINI_UNAVAILABLE` (esperado). El resto de MusicTab funciona.

Opcional en `.env`:

```
COPILOT_MODEL=gemini-3.6-flash
COPILOT_TEMPLATE_REPLY=false
```

`COPILOT_TEMPLATE_REPLY=true` evita Gemini en el nodo reply (siguen haciendo falta classify + key).

## 2. Frontend

```bash
cd apps/frontend
yarn dev
```

Login seed: `admin@gmail.com` / `admin`. El FAB de Pua está en `MainLayout`. Invitado: drawer con “Go to login”.

## 3. Tests que tocan Pua

```bash
# dominio (use-cases de catálogo / copilot helpers)
cd domain && npm test

# Nest Jest (controller HTTP de validación, e2e 401)
cd apps/backend && npm test

# Vitest backend: service, quota, templates, cooldown
cd apps/backend && npx vitest run

# frontend drawer + errores + hooks
cd apps/frontend && yarn test
```

No hay hoy un test de grafo con Gemini mockeado (`tasks.md` T-011).

## 4. Contrato

Al cambiar DTO o status codes: actualizar `contracts/copilot.openapi.yaml` y tipos en `apps/frontend/src/api/copilot.types.ts` en la misma task.

## 5. Eval manual rápido

Con usuario logueado y catálogo seedeado, probar al menos:

1. `qué podés hacer` → help, inglés.
2. `¿hay tabs de Milo J?` o un artista del seed → search / empty honesto.
3. `cuántos mensajes me quedan` → número coherente con header `used/limit`.
4. `what's the weather` → out of scope.
5. Segundo mensaje inmediato → cooldown UI `Wait m:ss`.
