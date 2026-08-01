import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name} (veja server/.env.example)`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  jwtSecret: required('JWT_SECRET'),
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  zohoClientId: process.env.ZOHO_CLIENT_ID ?? '',
  zohoClientSecret: process.env.ZOHO_CLIENT_SECRET ?? '',
  zohoRedirectUri: process.env.ZOHO_REDIRECT_URI ?? '',
  zohoAccountsBaseUrl: process.env.ZOHO_ACCOUNTS_BASE_URL ?? 'https://accounts.zoho.com',

  vuuptBaseUrl: process.env.VUUPT_BASE_URL ?? 'https://api.vuupt.com/api/v1/',
};

export const isZohoConfigured = Boolean(
  env.zohoClientId && env.zohoClientSecret && env.zohoRedirectUri,
);
