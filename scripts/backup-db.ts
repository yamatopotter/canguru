import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { backupDatabase } from '../src/lib/backup';

backupDatabase()
  .then((backupPath) => {
    if (backupPath) {
      console.log(`[backup] banco copiado para ${backupPath}`);
    } else {
      console.log('[backup] nenhum banco SQLite encontrado em prisma/dev.db — nada a fazer.');
    }
  })
  .catch((err) => {
    console.error('[backup] falhou:', err);
    process.exitCode = 1;
  });
