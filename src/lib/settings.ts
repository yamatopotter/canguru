import 'server-only';
import { prisma } from './prisma';

export const SETTING_KEYS = {
  companyName: 'company_name',
  companyLogoPath: 'company_logo_path',
  vuuptApiToken: 'vuupt_api_token',
  smtpHost: 'smtp_host',
  smtpPort: 'smtp_port',
  smtpSecure: 'smtp_secure',
  smtpUser: 'smtp_user',
  smtpPassword: 'smtp_password',
  smtpFrom: 'smtp_from',
  zohoClientId: 'zoho_client_id',
  zohoClientSecret: 'zoho_client_secret',
  zohoRedirectUri: 'zoho_redirect_uri',
  zohoAccountsBaseUrl: 'zoho_accounts_base_url',
  paymentOptionsEnabled: 'payment_options_enabled',
  signatureEnabled: 'signature_enabled',
  labelMarginTop: 'label_margin_top',
  labelMarginBottom: 'label_margin_bottom',
  labelMarginLeft: 'label_margin_left',
  labelMarginRight: 'label_margin_right',
} as const;

// Valores default de margem (mm) usados quando a Setting ainda não existe.
export const DEFAULT_LABEL_MARGIN_MM = 2;
export const DEFAULT_LABEL_MARGIN_X_MM = 3;

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

export interface PublicSettings {
  companyName: string;
  logoUrl: string | null;
}

export async function getPublicSettings(): Promise<PublicSettings> {
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

export function parseLabelMargin(value: string, fallback = DEFAULT_LABEL_MARGIN_MM): number {
  // Number('') é 0, então vazio (Setting inexistente) cai no default.
  const parsed = value.trim() === '' ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
