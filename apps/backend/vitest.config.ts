import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: path.resolve(__dirname),
  test: {
    environment: 'node',
    include: ['src/copilot/**/*.spec.ts'],
    exclude: [
      'src/copilot/copilot.controller.spec.ts',
      'src/copilot/quota/argentina-calendar.spec.ts',
    ],
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, '../../domain/dist'),
    },
  },
});
