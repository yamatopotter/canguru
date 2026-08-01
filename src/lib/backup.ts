// Sem "server-only" de propósito: este módulo também é usado pelo script
// de linha de comando (scripts/backup-db.ts), que roda fora do Next.js.
import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_BACKUPS = 14;

/**
 * Resolve o caminho do arquivo SQLite a partir de DATABASE_URL, do mesmo
 * jeito que o Prisma resolve: caminho relativo (ex. "file:./dev.db") é
 * relativo à pasta prisma/; caminho absoluto (ex. "file:/app/data/dev.db",
 * usado no container Docker) é usado como está. Retorna null se
 * DATABASE_URL não apontar para um arquivo SQLite (outro provider).
 */
function resolveSqliteDbPath(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith('file:')) return null;

  const rawPath = url.slice('file:'.length);
  return path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), 'prisma', rawPath);
}

/** Copia o banco SQLite atual pra backups/ com timestamp, e apaga os mais antigos além do limite. */
export async function backupDatabase(): Promise<string | null> {
  const dbPath = resolveSqliteDbPath();
  const backupsDir = path.join(process.cwd(), 'backups');

  if (!dbPath) return null;

  try {
    await fs.access(dbPath);
  } catch {
    return null; // sem banco SQLite local (ex.: outro provider configurado)
  }

  await fs.mkdir(backupsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupsDir, `dev-${timestamp}.db`);
  await fs.copyFile(dbPath, backupPath);

  await pruneOldBackups(backupsDir);

  return backupPath;
}

async function pruneOldBackups(backupsDir: string): Promise<void> {
  const files = (await fs.readdir(backupsDir)).filter((name) => name.startsWith('dev-') && name.endsWith('.db'));
  if (files.length <= MAX_BACKUPS) return;

  // Nomes com timestamp ISO ordenam cronologicamente como string.
  files.sort();
  const toDelete = files.slice(0, files.length - MAX_BACKUPS);

  await Promise.all(
    toDelete.map((name) =>
      fs.unlink(path.join(backupsDir, name)).catch(() => {
        // já pode ter sido removido; não é um erro fatal
      }),
    ),
  );
}
