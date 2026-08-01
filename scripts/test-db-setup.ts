import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Recria o banco SQLite dedicado aos testes (prisma/test.db) do zero e
// aplica as migrations, garantindo um estado limpo a cada "npm test".
// Roda antes de "vitest run" via o script "pretest" do package.json.
const testDbPath = path.join(process.cwd(), 'prisma', 'test.db');
for (const file of [testDbPath, `${testDbPath}-journal`]) {
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

execSync('npx prisma migrate deploy', {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env, DATABASE_URL: 'file:./test.db' },
});
