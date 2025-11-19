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
* **Node.js** ($\ge$ 18)
* **Yarn** or **npm**
* **Docker & Docker Compose**
* **Git**
* **A code editor** like **VS Code**

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
From the project root:
```bash
npx ts-node --project apps/backend/tsconfig.json -r tsconfig-paths/register apps/backend/src/main.ts
```

The backend runs by default at: **http://localhost:3000**

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
  - Secure session handling

- **User Account Management**
  - Update account information
  - Delete user account
  - Upload and update profile image

- **Tabs Management (CRUD)**
  - Authenticated users can **create**, **edit**, and **delete** their own tabs
  - Tabs include YouTube link, preview image, PDF file, genre and instrument

- **Public Tabs Access**
  - Non-authenticated users can **browse** all tabs
  - Public users can **view** and **download** tablatures
  - Access to tab details without creating an account

- **Filtering & Categorization**
  - Tabs categorized by **genre** and **instrument**
  - User-specific tabs page

- **Responsive UI**
  - Desktop and mobile layout

- **Developer Experience**
  - API built with **NestJS + Prisma**
  - Frontend built with **React + Vite**
  - Storybook for isolated UI component development
  - Unit tests with **Vitest**
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
