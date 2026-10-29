import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// O usuário administrador padrão (admin/admin) é criado direto pela
// migration "seed_default_admin", não por aqui — assim ele existe mesmo
// que "npm run seed" nunca seja rodado (ex.: "prisma migrate deploy" no
// Docker). Este script só garante os valores default das Configurações
// (tabela Setting), que continuam editáveis pela tela administrativa.
async function ensureSetting(key: string, value: string) {
  const existing = await prisma.setting.findUnique({ where: { key } });
  if (existing) return;

  await prisma.setting.create({ data: { key, value } });
}

async function main() {
  await ensureSetting('company_name', 'Minha Empresa');
  await ensureSetting('company_logo_path', '');
  await ensureSetting('vuupt_api_token', '');
  await ensureSetting('smtp_host', '');
  await ensureSetting('smtp_port', '');
  await ensureSetting('smtp_secure', 'false');
  await ensureSetting('smtp_user', '');
  await ensureSetting('smtp_password', '');
  await ensureSetting('smtp_from', '');
  await ensureSetting('payment_options_enabled', 'true');
  await ensureSetting('signature_enabled', 'false');
  await ensureSetting('label_margin_top', '2');
  await ensureSetting('label_margin_bottom', '2');
  await ensureSetting('label_margin_left', '3');
  await ensureSetting('label_margin_right', '3');

  const vuuptToken = await prisma.setting.findUnique({ where: { key: 'vuupt_api_token' } });
  if (!vuuptToken?.value) {
    console.warn(
      '[seed] Token da Vuupt não configurado — configure pela tela administrativa de Configurações antes de gerar rotas.',
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
