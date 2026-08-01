import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'server-only': path.resolve(__dirname, 'src/test/stubs/server-only.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.ts'],
    // Todos os testes de integração compartilham um único arquivo SQLite
    // (prisma/test.db); rodar arquivos de teste em paralelo causaria
    // SQLITE_BUSY por escritas concorrentes.
    fileParallelism: false,
    env: {
      // Banco SQLite dedicado a testes (populado via "npm run pretest",
      // que roda "prisma migrate deploy" contra esta mesma URL). Nunca usar
      // o dev.db real aqui para não misturar dados de teste com uso normal.
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'vitest-jwt-secret-nao-usar-em-producao',
      COOKIE_SECURE: 'false',
    },
  },
});
