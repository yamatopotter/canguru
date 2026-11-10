import 'server-only';
import { prisma } from './prisma';
import {
  DEFAULT_LABEL_STYLE,
  LABEL_FONT_SECTIONS,
  LABEL_FONT_SIZE_RANGE,
  LABEL_SCALE_RANGE,
  type LabelFontSizes,
  type LabelFontWeight,
  type LabelSize,
  type LabelStyle,
} from '@/types';

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
  labelSize: 'label_size',
  labelFontWeight: 'label_font_weight',
  labelScale: 'label_scale',
  dateEnabled: 'date_enabled',
  documentEnabled: 'document_enabled',
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

export function parseLabelSize(value: string): LabelSize {
  return value === '10x15' ? '10x15' : '72mm';
}

export function parseLabelMargin(value: string, fallback = DEFAULT_LABEL_MARGIN_MM): number {
  // Number('') é 0, então vazio (Setting inexistente) cai no default.
  const parsed = value.trim() === '' ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const LABEL_FONT_SETTING_KEYS: Record<keyof LabelFontSizes, string> = {
  title: 'label_font_title',
  name: 'label_font_name',
  phone: 'label_font_phone',
  address: 'label_font_address',
  date: 'label_font_date',
  payment: 'label_font_payment',
  fields: 'label_font_fields',
};

function parseInRange(value: string | undefined, range: { min: number; max: number }, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= range.min && parsed <= range.max ? parsed : fallback;
}

export function parseLabelFontWeight(value: string): LabelFontWeight {
  return value === 'normal' || value === 'bold' ? value : 'semibold';
}

// Lê peso, escala e tamanhos de fonte da etiqueta numa query só; valores
// ausentes ou inválidos caem no padrão.
export async function getLabelStyle(): Promise<LabelStyle> {
  const keys = [SETTING_KEYS.labelFontWeight, SETTING_KEYS.labelScale, ...Object.values(LABEL_FONT_SETTING_KEYS)];
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const raw = new Map(rows.map((row) => [row.key, row.value]));

  const sizes = { ...DEFAULT_LABEL_STYLE.sizes };
  for (const { key } of LABEL_FONT_SECTIONS) {
    sizes[key] = parseInRange(raw.get(LABEL_FONT_SETTING_KEYS[key]), LABEL_FONT_SIZE_RANGE, sizes[key]);
  }

  return {
    weight: parseLabelFontWeight(raw.get(SETTING_KEYS.labelFontWeight) ?? ''),
    scale: parseInRange(raw.get(SETTING_KEYS.labelScale), LABEL_SCALE_RANGE, DEFAULT_LABEL_STYLE.scale),
    sizes,
  };
}
