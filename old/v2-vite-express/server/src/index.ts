import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './env';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { adminSettingsRouter, publicSettingsRouter } from './routes/settings.routes';
import { vuuptRouter } from './routes/vuupt.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/admin/users', usersRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/settings/public', publicSettingsRouter);
app.use('/api', vuuptRouter);

// Em produção, o backend também serve os arquivos estáticos do frontend
// (build gerado por "npm run build" na raiz do projeto).
const frontendDist = path.resolve(__dirname, '..', '..', 'dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[server] rodando em http://localhost:${env.port}`);
});
