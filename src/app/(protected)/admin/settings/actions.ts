'use server';

import path from 'node:path';
import fs from 'node:fs/promises';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/guards';
import { getSetting, setSetting, SETTING_KEYS } from '@/lib/settings';
import { verifySmtpConnection, MailerError } from '@/lib/mailer';
import { checkVuuptConnection, VuuptError } from '@/lib/vuupt';
import { ACTIVITY_ACTIONS, logActivity } from '@/lib/activity';

const ALLOWED_LOGO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const MAX_LABEL_MARGIN_MM = 15;

export interface SettingsFormState {
  error?: string;
  success?: string;
}

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const admin = await requireAdmin();

  const companyName = String(formData.get('companyName') ?? '').trim();
  const vuuptApiToken = String(formData.get('vuuptApiToken') ?? '').trim();

  if (!companyName) {
    return { error: 'Informe o nome da empresa.' };
  }

  await setSetting(SETTING_KEYS.companyName, companyName);

  if (vuuptApiToken) {
    await setSetting(SETTING_KEYS.vuuptApiToken, vuuptApiToken);
  }

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.settingsUpdate,
    metadata: { companyName, vuuptTokenChanged: Boolean(vuuptApiToken) },
  });

  revalidatePath('/', 'layout');
  return { success: 'Configurações salvas.' };
}

export async function updateLabelSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const admin = await requireAdmin();

  const paymentOptionsEnabled = formData.get('paymentOptionsEnabled') === 'on';
  const signatureEnabled = formData.get('signatureEnabled') === 'on';
  const marginTop = Number(formData.get('marginTop'));
  const marginBottom = Number(formData.get('marginBottom'));
  const marginLeft = Number(formData.get('marginLeft'));
  const marginRight = Number(formData.get('marginRight'));

  if (
    [marginTop, marginBottom, marginLeft, marginRight].some(
      (value) => !Number.isFinite(value) || value < 0 || value > MAX_LABEL_MARGIN_MM,
    )
  ) {
    return { error: `As margens devem ser números entre 0 e ${MAX_LABEL_MARGIN_MM}mm.` };
  }

  await Promise.all([
    setSetting(SETTING_KEYS.paymentOptionsEnabled, String(paymentOptionsEnabled)),
    setSetting(SETTING_KEYS.signatureEnabled, String(signatureEnabled)),
    setSetting(SETTING_KEYS.labelMarginTop, String(marginTop)),
    setSetting(SETTING_KEYS.labelMarginBottom, String(marginBottom)),
    setSetting(SETTING_KEYS.labelMarginLeft, String(marginLeft)),
    setSetting(SETTING_KEYS.labelMarginRight, String(marginRight)),
  ]);

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.settingsUpdate,
    metadata: { paymentOptionsEnabled, signatureEnabled, marginTop, marginBottom, marginLeft, marginRight },
  });

  revalidatePath('/', 'layout');
  return { success: 'Configurações da etiqueta salvas.' };
}

export async function uploadLogoAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const admin = await requireAdmin();

  const file = formData.get('logo');

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Selecione um arquivo de imagem.' };
  }

  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    return { error: 'Formato de imagem não suportado. Use PNG, JPEG, WEBP ou SVG.' };
  }

  if (file.size > MAX_LOGO_SIZE) {
    return { error: 'Arquivo muito grande (máximo 2MB).' };
  }

  // Fora de public/ de propósito: o build "standalone" (imagem Docker) só
  // serve os arquivos de public/ que existiam no momento do build, então um
  // upload em runtime ali resultaria em 404. Os arquivos daqui são servidos
  // por src/app/uploads/[filename]/route.ts, que lê do disco a cada request.
  const uploadsDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || '.png';
  const filename = `logo-${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, filename), buffer);

  const previousPath = await getSetting(SETTING_KEYS.companyLogoPath);
  await setSetting(SETTING_KEYS.companyLogoPath, `/uploads/${filename}`);

  if (previousPath) {
    const previousFile = path.join(uploadsDir, path.basename(previousPath));
    fs.unlink(previousFile).catch(() => {
      // arquivo antigo pode já não existir; não é um erro fatal
    });
  }

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.logoUpdate,
  });

  revalidatePath('/', 'layout');
  return { success: 'Logo atualizada.' };
}

export async function updateSmtpSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const admin = await requireAdmin();

  const host = String(formData.get('smtpHost') ?? '').trim();
  const port = String(formData.get('smtpPort') ?? '').trim();
  const secure = formData.get('smtpSecure') === 'on';
  const user = String(formData.get('smtpUser') ?? '').trim();
  const password = String(formData.get('smtpPassword') ?? '');
  const from = String(formData.get('smtpFrom') ?? '').trim();

  if (!host || !port) {
    return { error: 'Informe pelo menos o host e a porta do SMTP.' };
  }

  if (Number.isNaN(Number(port))) {
    return { error: 'A porta do SMTP deve ser um número.' };
  }

  await Promise.all([
    setSetting(SETTING_KEYS.smtpHost, host),
    setSetting(SETTING_KEYS.smtpPort, port),
    setSetting(SETTING_KEYS.smtpSecure, String(secure)),
    setSetting(SETTING_KEYS.smtpUser, user),
    setSetting(SETTING_KEYS.smtpFrom, from),
  ]);

  if (password) {
    await setSetting(SETTING_KEYS.smtpPassword, password);
  }

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.smtpUpdate,
    metadata: { host, port, passwordChanged: Boolean(password) },
  });

  return { success: 'Configurações de e-mail salvas.' };
}

export async function testSmtpAction(
  _prevState: SettingsFormState,
  _formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();

  try {
    await verifySmtpConnection();
  } catch (err) {
    const message = err instanceof MailerError ? err.message : 'Não foi possível conectar ao servidor SMTP.';
    return { error: message };
  }

  return { success: 'Conexão com o servidor SMTP funcionou.' };
}

export async function updateZohoSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const admin = await requireAdmin();

  const clientId = String(formData.get('zohoClientId') ?? '').trim();
  const clientSecret = String(formData.get('zohoClientSecret') ?? '');
  const redirectUri = String(formData.get('zohoRedirectUri') ?? '').trim();
  const accountsBaseUrl = String(formData.get('zohoAccountsBaseUrl') ?? '').trim();

  if ((clientId || redirectUri) && !(clientId && redirectUri)) {
    return { error: 'Para habilitar o login via Zoho, informe o Client ID e o Redirect URI.' };
  }

  await Promise.all([
    setSetting(SETTING_KEYS.zohoClientId, clientId),
    setSetting(SETTING_KEYS.zohoRedirectUri, redirectUri),
    setSetting(SETTING_KEYS.zohoAccountsBaseUrl, accountsBaseUrl),
  ]);

  if (clientSecret) {
    await setSetting(SETTING_KEYS.zohoClientSecret, clientSecret);
  }

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.settingsUpdate,
    metadata: { zohoConfigured: Boolean(clientId && redirectUri) },
  });

  revalidatePath('/admin/settings');
  revalidatePath('/login');
  return { success: 'Configurações do Zoho salvas.' };
}

export async function testVuuptConnectionAction(
  _prevState: SettingsFormState,
  _formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();

  try {
    await checkVuuptConnection();
  } catch (err) {
    const message = err instanceof VuuptError ? err.message : 'Não foi possível conectar à API da Vuupt.';
    return { error: message };
  }

  return { success: 'Conexão com a Vuupt funcionou.' };
}
