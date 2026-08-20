<section align="center">
    <img src="./apps/frontend/public/screenshots/logo.png">
</section>

![Node.js](https://img.shields.io/badge/Node.js-green?style=for-the-badge&logo=node.js)
![NestJS](https://img.shields.io/badge/NestJS-red?style=for-the-badge&logo=nestjs)
![React](https://img.shields.io/badge/React-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-purple?style=for-the-badge&logo=vite)
![Prisma](https://img.shields.io/badge/Prisma-ORM-black?style=for-the-badge&logo=prisma)
![Storybook](https://img.shields.io/badge/Storybook-pink?style=for-the-badge&logo=storybook)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?style=for-the-badge&logo=docker)
![Yarn](https://img.shields.io/badge/Yarn-blue?style=for-the-badge&logo=yarn)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen?style=for-the-badge)

## Index

* [Overview](#overview)
* [Technologies](#technologies)
* [Prerequisites](#prerequisites)
* [Project Installation](#project-installation)
    * [Running the Backend Locally](#running-the-backend-locally)
    * [Prisma Client generation](#prisma-client-generation)
    * [Running Backend Tests](#running-backend-tests)
    * [Running the Frontend Locally](#running-the-frontend-locally)
    * [Running Frontend Tests](#running-frontend-tests)
    * [Running Storybook](#running-storybook)
* [Docker Setup](#docker-setup)
* [Main Features](#main-features)
* [Screenshots](#screenshots)
* [Author](#author)


## Overview
MusicTab is a **full-stack application** that allows users to browse, manage, and interact with tablature for different instruments.

It includes:

* A **NestJS backend** with **Prisma ORM**
* A **Vite + React frontend**
* A **SQLite database**
* A complete **Docker Compose environment** to run the whole system with a single command

## Technologies
## Backend
| Node.js | NestJS | TypeScript | Prisma ORM | SQLite | ts-node | Vitest |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="50"/> | <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/NestJS.svg/1200px-NestJS.svg.png" width="60"/> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="50"/> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" width="60"/> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" width="60"/> | <img src="https://typestrong.org/ts-node/img/logo-icon.svg" width="70"/> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitest/vitest-original.svg" width="60"/> |


## Frontend
| React | TypeScript | Vite | Material UI | Storybook | Vitest |
|:--:|:--:|:--:|:--:|:--:|:--:|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="60"/> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="50"/> | <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Vitejs-logo.svg/2078px-Vitejs-logo.svg.png" width="60"/> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg" width="50"/> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/storybook/storybook-original.svg" width="50"/> | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitest/vitest-original.svg" width="60"/> |

## DevOps
| Docker | Docker Compose |
|:--:|:--:|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="60"/> | <img src="https://d2zv2ciw0ln4h1.cloudfront.net/uploads/docker_compose_button_39e60f2557.jpeg" width="150"/> |


## Prerequisites

Before installing or running the project, ensure you have:

### Required Tools
* **Node.js** ($\ge$ 18; **20** recommended, matching the Dockerfiles)
* **Corepack** (ships with Node $\ge$ 16.10) — this repo pins **Yarn 4.10.3** (`packageManager` in the root `package.json`). Do not install classic Yarn globally.
* **npm** (for backend scripts such as `start:dev`)
* **Docker & Docker Compose** (optional if you run Node locally; required for the Docker setup)
* **Git**
* **A code editor** like **VS Code**

On a **fresh clone** (including **Windows** / PowerShell), enable Yarn 4 before `yarn install`:

```bash
corepack enable
corepack prepare yarn@4.10.3 --activate
yarn -v
```

## Project Installation
### 1. Clone the repository
```bash
git clone https://github.com/manita02/MusicTab
cd MusicTab
```

### 2. Install root dependencies
```bash
yarn install
```

### 3. Install backend dependencies
```bash
cd apps/backend
npm install
```

### 4. Install frontend dependencies
```bash
cd ../frontend
yarn install
```

## Running the Backend Locally

From `apps/backend` (after `npm install` there). On a **fresh clone** (including **Windows**), apply Prisma migrations first so SQLite exists (`apps/backend/prisma/music_tab.db`):

```bash
cd apps/backend
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
```

The seed is **idempotent**. It creates a default **ADMIN** (registration always assigns `USER`) and the catalog rows needed to create tabs:

| Field | Value |
|--------|--------|
| Username | `admin` |
| Email (login) | `admin@admin.com` |
| Password | `admin` |

| Catalog | Values |
|--------|--------|
| Instruments | Guitar, Piano, Ukulele |
| Genres | Rock, Jazz, Pop, Blues, Metal, Folklore, Classical, Country, Reggae, Funk, Soul, R&B, Indie, Alternative, Punk, Latin, Flamenco, Soundtrack |

The login form uses **email**, not username.

Then start the API:

```bash
npm run start:dev
```

This script runs, in order: **`prisma:generate`** (Prisma Client), **`build:domain`** (shared domain package), then **`nest start --watch`**. The API listens by default at **http://localhost:3000**.

Other useful commands from the same folder:

| Command | Purpose |
|--------|---------|
| `npx prisma migrate deploy` | Apply existing migrations and create the SQLite file on a fresh clone |
| `npm run prisma:seed` | Create (or promote) the default admin user and seed instruments/genres |
| `npm run prisma:generate` | Regenerate the Prisma Client from `prisma/schema.prisma` |
| `npm run build` | Production build (`prebuild` runs Prisma + domain build first) |
| `npm run start:prod` | Run compiled output (`node dist/main`) after `npm run build` |

### Prisma Client generation

Nest imports `PrismaClient` from `@prisma/client`. That package is **not** complete until you run **`prisma generate`**, which writes the generated client under the workspace `node_modules` (for example `node_modules/@prisma/client` and `node_modules/.prisma/client` when dependencies are hoisted).

You should **not** see this in normal flow because `npm run start:dev` and `npm run build` already invoke **`npm run prisma:generate`** via the backend scripts.

If you still get:

```text
@prisma/client did not initialize yet. Please run "prisma generate"
```

typical causes are a fresh clone without having started the backend yet, removing `node_modules`, or clearing Prisma’s generated files. Fix it once from `apps/backend`:

```bash
npm run prisma:generate
```

After **any change** to `prisma/schema.prisma`, run `npm run prisma:generate` again (or rely on `start:dev` / `build`, which run it for you). The Docker image for the backend already runs `npx prisma generate` during the image build.

## Running Backend Tests
```bash
yarn vitest run
```

## Running the Frontend Locally
```bash
cd apps/frontend
yarn dev
```

Frontend will be available at: **http://localhost:5173**

## Running Frontend Tests
```bash
cd apps/frontend
yarn test
```

## Running Storybook
```bash
cd apps/frontend
yarn storybook
```

## Docker Setup
The project includes a fully working `docker-compose.yaml` file that runs:

* **✔ Backend** (NestJS)
* **✔ Frontend** (Vite)
* **✔ SQLite database** (volume persisted)

### Build and run everything
```bash
docker-compose up --build
```

### Run without rebuilding
```bash
docker-compose up
```

### Stop all containers
```bash
docker-compose down
```

#### Services will be available at:

* **Frontend:** `http://localhost:5173`
* **Backend:** `http://localhost:3000`
* **Database file:** persisted in Docker volume `sqlite-data:/data`

## Main Features

- **User Authentication**
  - User **sign up** and **sign in**
  - JWT-based sessions validated on the server (with Prisma `Session` records)
  - Protected routes require a valid `Authorization: Bearer` token

- **User Account Management**
  - Authenticated users can **update** or **delete only their own** profile (`PUT` / `DELETE /users/:id` must match the logged-in user)
  - Upload and update profile image

- **Roles & tab permissions (source of truth: backend)**
  - **Admin (`ADMIN`)** — Full tablature **CRUD**: create, edit, delete; browse all tabs; download PDFs; admin-only UI controls.
  - **Registered user (`USER`)** — Browse tabs with full details (including PDF links from authenticated APIs), **download** PDFs; **cannot** create, edit, or delete tabs or call admin mutation endpoints.
  - **Guest (not signed in)** — Can browse the **public** tab catalogue and see previews (YouTube embed via `youtubeVideoId`, cover image via a **same-origin proxy** so stored image URLs are not exposed in public JSON). **Download**, **create**, **edit**, and **delete** are disabled in the UI and blocked by the API for mutations; PDF is not returned on public list endpoints.

- **Tabs Management**
  - Tabs include YouTube link, preview image, PDF file, genre, and instrument
  - **Only admins** perform create / update / delete (domain rules + NestJS `RolesGuard`)
  - Public read endpoints: `GET /tabs/public`, `GET /tabs/latest/public`; authenticated listing: `GET /tabs`, `GET /tabs/latest`

- **Filtering & Categorization**
  - Tabs categorized by **genre** and **instrument**
  - **“My tabs”** filter is available **only to admins** (they are the only role that can manage tabs)

- **Responsive UI**
  - Desktop and mobile layout
  - Route-level **lazy loading** for heavier pages (Home, Tabs, Login, Sign In)

- **Developer Experience**
  - API built with **NestJS + Prisma**
  - Frontend built with **React + Vite**
  - Storybook for isolated UI component development
  - Unit tests with **Vitest** (domain + frontend)
  - Fully Dockerized with **Docker Compose** for one-command startup

## Screenshots

### Desktop Views

| Home | New Tab | Delete Tab |
|:--:|:--:|:--:|
| <img src="./apps/frontend/public/screenshots/home.png" /> | <img src="./apps/frontend/public/screenshots/new-tab.png" /> | <img src="./apps/frontend/public/screenshots/delete-tab.png" /> |

| Manage Users | Tabs Page | Sign In |
|:--:|:--:|:--:|
| <img src="./apps/frontend/public/screenshots/manage-user.png" /> | <img src="./apps/frontend/public/screenshots/tabs-page.png" /> | <img src="./apps/frontend/public/screenshots/sign-in.png" /> |


### Mobile View

| Mobile Login |
|:--:|
| <img src="./apps/frontend/public/screenshots/mobile-login.png" width="150" height="300"/> |


## Author
| [<img src="https://i.pinimg.com/736x/93/20/a8/9320a8e2254149d3ecabdb53b0a6f0d8.jpg" width=115><br><sub>Ana Lucia Juarez</sub>](https://github.com/manita02) | 
| :---: |
