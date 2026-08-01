import { env } from '../env';

const OAUTH_SCOPE = 'AaaServer.profile.Read';

export function buildZohoAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.zohoClientId,
    response_type: 'code',
    redirect_uri: env.zohoRedirectUri,
    scope: OAUTH_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `${env.zohoAccountsBaseUrl}/oauth/v2/auth?${params.toString()}`;
}

interface ZohoTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  error?: string;
}

export async function exchangeZohoCode(code: string): Promise<ZohoTokenResponse> {
  const response = await fetch(`${env.zohoAccountsBaseUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.zohoClientId,
      client_secret: env.zohoClientSecret,
      redirect_uri: env.zohoRedirectUri,
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
  const response = await fetch(`${env.zohoAccountsBaseUrl}/oauth/user/info`, {
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
