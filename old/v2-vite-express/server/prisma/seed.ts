import path from 'node:path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Administrador';

  if (!email || !password) {
    console.warn(
      '[seed] ADMIN_EMAIL/ADMIN_PASSWORD não definidos no .env — nenhum administrador foi criado automaticamente.',
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] Usuário admin "${email}" já existe, nada a fazer.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'ADMIN',
      provider: 'LOCAL',
    },
  });

  console.log(`[seed] Administrador criado: ${email}`);
  console.log('[seed] Troque a senha padrão assim que fizer o primeiro login.');
}

async function ensureSetting(key: string, value: string | undefined, fallback = '') {
  const existing = await prisma.setting.findUnique({ where: { key } });
  if (existing) return;

  await prisma.setting.create({
    data: { key, value: value ?? fallback },
  });
}

async function main() {
  await ensureAdminUser();
  await ensureSetting('company_name', 'Minha Empresa');
  await ensureSetting('company_logo_path', '');
  await ensureSetting('vuupt_api_token', process.env.VUUPT_API_TOKEN);

  if (!process.env.VUUPT_API_TOKEN) {
    console.warn(
      '[seed] VUUPT_API_TOKEN não definido — configure o token da Vuupt pela tela administrativa antes de gerar rotas.',
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
