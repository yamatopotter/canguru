import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { backupDatabase } from '@/lib/backup';

let tmpDir: string;
let originalCwd: string;
let originalDatabaseUrl: string | undefined;

beforeEach(async () => {
  originalCwd = process.cwd();
  originalDatabaseUrl = process.env.DATABASE_URL;
  // backupDatabase() agora deriva o caminho do banco de DATABASE_URL — este
  // teste não usa o banco de testes global (test.db), então força de volta
  // pro nome "dev.db" que é o que o cenário aqui simula.
  process.env.DATABASE_URL = 'file:./dev.db';

  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vuupt-backup-test-'));
  await fs.mkdir(path.join(tmpDir, 'prisma'), { recursive: true });
  await fs.writeFile(path.join(tmpDir, 'prisma', 'dev.db'), 'conteudo-fake-do-banco');
  process.chdir(tmpDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.env.DATABASE_URL = originalDatabaseUrl;
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('backupDatabase', () => {
  it('retorna null quando não há prisma/dev.db', async () => {
    await fs.rm(path.join(tmpDir, 'prisma', 'dev.db'));
    expect(await backupDatabase()).toBeNull();
  });

  it('copia o banco para backups/ com timestamp no nome', async () => {
    const backupPath = await backupDatabase();

    expect(backupPath).not.toBeNull();
    const content = await fs.readFile(backupPath!, 'utf-8');
    expect(content).toBe('conteudo-fake-do-banco');
  });

  it('aceita DATABASE_URL com caminho absoluto (cenário Docker)', async () => {
    const absoluteDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vuupt-backup-abs-'));
    const absoluteDbPath = path.join(absoluteDir, 'dev.db');
    await fs.writeFile(absoluteDbPath, 'conteudo-absoluto');
    process.env.DATABASE_URL = `file:${absoluteDbPath}`;

    const backupPath = await backupDatabase();

    expect(backupPath).not.toBeNull();
    expect(await fs.readFile(backupPath!, 'utf-8')).toBe('conteudo-absoluto');

    await fs.rm(absoluteDir, { recursive: true, force: true });
  });

  it('mantém no máximo 14 backups, removendo os mais antigos primeiro', async () => {
    const backupsDir = path.join(tmpDir, 'backups');
    await fs.mkdir(backupsDir, { recursive: true });

    // 15 backups "antigos" pré-existentes, com nomes que ordenam cronologicamente.
    for (let i = 0; i < 15; i++) {
      const suffix = String(i).padStart(2, '0');
      await fs.writeFile(path.join(backupsDir, `dev-2026-01-01T00-00-${suffix}.db`), 'antigo');
    }

    await backupDatabase();

    const files = (await fs.readdir(backupsDir)).filter((name) => name.startsWith('dev-'));
    expect(files.length).toBe(14);
    // Os backups mais antigos (00 e 01) devem ter sido removidos primeiro.
    expect(files).not.toContain('dev-2026-01-01T00-00-00.db');
    expect(files).not.toContain('dev-2026-01-01T00-00-01.db');
  });
});
