import { prisma } from '../db';

export const SETTING_KEYS = {
  companyName: 'company_name',
  companyLogoPath: 'company_logo_path',
  vuuptApiToken: 'vuupt_api_token',
} as const;

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? '';
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getPublicSettings() {
  const [companyName, companyLogoPath] = await Promise.all([
    getSetting(SETTING_KEYS.companyName),
    getSetting(SETTING_KEYS.companyLogoPath),
  ]);

  return {
    companyName: companyName || 'Minha Empresa',
    logoUrl: companyLogoPath || null,
  };
}

export function maskToken(token: string): string {
  if (!token) return '';
  if (token.length <= 4) return '••••';
  return `•••• ${token.slice(-4)}`;
}
