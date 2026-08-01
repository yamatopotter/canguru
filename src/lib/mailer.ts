import 'server-only';
import nodemailer from 'nodemailer';
import { getSetting, SETTING_KEYS } from './settings';

export class MailerError extends Error {}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const [host, port, secure, user, password, from] = await Promise.all([
    getSetting(SETTING_KEYS.smtpHost),
    getSetting(SETTING_KEYS.smtpPort),
    getSetting(SETTING_KEYS.smtpSecure),
    getSetting(SETTING_KEYS.smtpUser),
    getSetting(SETTING_KEYS.smtpPassword),
    getSetting(SETTING_KEYS.smtpFrom),
  ]);

  if (!host || !port) return null;

  return {
    host,
    port: Number(port),
    secure: secure === 'true',
    user,
    password,
    from: from || user || 'no-reply@localhost',
  };
}

async function createTransport(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    // secure=true faz TLS implícito desde a conexão (porta 465, geralmente).
    // Em qualquer outra porta (587, 25...) o servidor espera uma conexão
    // em texto plano que é promovida via STARTTLS logo em seguida — usar
    // secure=true nessas portas quebra o handshake (erro "wrong version
    // number"). requireTLS garante que o STARTTLS seja obrigatório mesmo
    // com secure=false, evitando um downgrade silencioso para texto plano.
    secure: config.secure,
    requireTLS: !config.secure,
    auth: config.user ? { user: config.user, pass: config.password } : undefined,
  });
}

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const config = await getSmtpConfig();
  if (!config) {
    throw new MailerError(
      'Servidor SMTP não configurado. Peça a um administrador para configurá-lo na tela de Configurações.',
    );
  }

  const transport = await createTransport(config);
  await transport.sendMail({ from: config.from, to, subject, html });
}

export async function verifySmtpConnection(): Promise<void> {
  const config = await getSmtpConfig();
  if (!config) {
    throw new MailerError('Preencha ao menos o host e a porta do SMTP antes de testar.');
  }

  const transport = await createTransport(config);
  await transport.verify();
}
