// Agenda um backup diário do banco enquanto o servidor de produção estiver
// no ar (só faz sentido em "next start", já que em "next dev" o
// register() pode rodar várias vezes por causa do hot-reload). Pra um
// backup mais resistente a reinícios/crashes, rode "npm run backup" via
// cron/Agendador de Tarefas do Windows — os dois métodos podem coexistir,
// backupDatabase() é idempotente (só copia e poda os mais antigos).
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV !== 'production') return;

  const { backupDatabase } = await import('./lib/backup');
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const runBackup = () => {
    backupDatabase().catch((err) => console.error('[backup] falhou:', err));
  };

  runBackup();
  setInterval(runBackup, ONE_DAY_MS);
}
