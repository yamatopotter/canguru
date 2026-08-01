import 'server-only';
import { getSetting, SETTING_KEYS } from './settings';

const OAUTH_SCOPE = 'AaaServer.profile.Read';
const DEFAULT_ACCOUNTS_BASE_URL = 'https://accounts.zoho.com';

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accountsBaseUrl: string;
}

async function getZohoConfig(): Promise<ZohoConfig> {
  const [clientId, clientSecret, redirectUri, accountsBaseUrl] = await Promise.all([
    getSetting(SETTING_KEYS.zohoClientId),
    getSetting(SETTING_KEYS.zohoClientSecret),
    getSetting(SETTING_KEYS.zohoRedirectUri),
    getSetting(SETTING_KEYS.zohoAccountsBaseUrl),
  ]);

  return {
    clientId,
    clientSecret,
    redirectUri,
    accountsBaseUrl: accountsBaseUrl || DEFAULT_ACCOUNTS_BASE_URL,
  };
}

export async function isZohoConfigured(): Promise<boolean> {
  const config = await getZohoConfig();
  return Boolean(config.clientId && config.clientSecret && config.redirectUri);
}

export async function buildZohoAuthUrl(state: string): Promise<string> {
  const config = await getZohoConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: OAUTH_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `${config.accountsBaseUrl}/oauth/v2/auth?${params.toString()}`;
}

interface ZohoTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  error?: string;
}

export async function exchangeZohoCode(code: string): Promise<ZohoTokenResponse> {
  const config = await getZohoConfig();
  const response = await fetch(`${config.accountsBaseUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code,
    }),
  });

  const data = (await response.json()) as ZohoTokenResponse;

  if (!response.ok || data.error) {
    throw new Error(`Falha ao trocar o código do Zoho por um token: ${data.error ?? response.status}`);
  }

  return data;
}

export interface ZohoUserInfo {
  email: string;
  displayName: string;
  zuid: string;
}

export async function fetchZohoUserInfo(accessToken: string): Promise<ZohoUserInfo> {
  const config = await getZohoConfig();
  const response = await fetch(`${config.accountsBaseUrl}/oauth/user/info`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar informações do usuário no Zoho (status ${response.status})`);
  }

  const data = (await response.json()) as {
    Email: string;
    Display_Name: string;
    ZUID: string | number;
  };

  return {
    email: data.Email,
    displayName: data.Display_Name,
    zuid: String(data.ZUID),
  };
}
