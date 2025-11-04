# MusicTab

### * Requirements

- Node.js runtime
- NestJS framework (backend)
- Yarn or npm
- TypeScript
- Prisma ORM (for DB)

### * Run backend
```bash
npx ts-node --project apps/backend/tsconfig.json -r tsconfig-paths/register apps/backend/src/main.ts
```

### * Run backend tests
```bash
yarn vitest run
```

---

### * Run frontend
```bash
cd apps/frontend
yarn dev
```

### * Run frontend tests
```bash
cd apps/frontend
yarn test
```

### * Run storybook
```bash
cd apps/frontend
yarn storybook
```

