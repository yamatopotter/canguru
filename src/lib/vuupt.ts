import 'server-only';
import { getSetting, SETTING_KEYS } from './settings';
import { ROUTES_PER_PAGE, type Route, type RoutesPage, type ServiceWithCustomer } from '@/types';

// URL fixa da API da Vuupt — igual para todos os clientes, não é algo que
// um administrador precise reconfigurar (diferente do token, que é editável
// pela tela de Configurações).
const VUUPT_BASE_URL = 'https://api.vuupt.com/api/v1/';

export class VuuptError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'VuuptError';
  }
}

const FIELDS_ROUTES = 'id,created_at,name';
const FIELDS_ADDRESS = 'id,route_id,customer_id,title,address,address_complement,phone_number,code';
const DAYS_TO_LOOK_BACK = 2;

async function vuuptFetch<T>(path: string, query?: Record<string, string>): Promise<T> {
  const rawToken = await getSetting(SETTING_KEYS.vuuptApiToken);

  if (!rawToken) {
    throw new VuuptError(
      412,
      'Token da API da Vuupt não configurado. Peça a um administrador para configurá-lo na tela de Configurações.',
    );
  }

  // A Vuupt gera um JWT "cru" (ex: eyJ...). A API espera esse valor no
  // formato de Bearer token — normaliza aqui para funcionar independente
  // de o admin ter colado o token com ou sem o prefixo "Bearer ".
  const token = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;

  const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
  const response = await fetch(`${VUUPT_BASE_URL}${path}${queryString}`, {
    method: 'GET',
    headers: {
      authorization: token,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new VuuptError(response.status, `Erro na API da Vuupt (status ${response.status})`);
  }

  return response.json() as Promise<T>;
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day} 00:00:00`;
}

interface RoutesResponse {
  data: Route[];
  meta?: {
    pagination?: {
      total: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export async function fetchRecentRoutes(page = 1): Promise<RoutesPage> {
  const since = new Date();
  since.setDate(since.getDate() - DAYS_TO_LOOK_BACK);

  const response = await vuuptFetch<RoutesResponse>('routes', {
    fields: FIELDS_ROUTES,
    'filter[0][field]': 'created_at',
    'filter[0][operator]': 'gt',
    'filter[0][value]': formatDateForApi(since),
    // Mais nova primeiro.
    sort: '-created_at',
    page: String(page),
    per_page: String(ROUTES_PER_PAGE),
  });

  const pagination = response.meta?.pagination;

  return {
    routes: response.data,
    currentPage: pagination?.current_page ?? 1,
    totalPages: pagination?.total_pages ?? 1,
    total: pagination?.total ?? response.data.length,
  };
}

interface RawService {
  id: number;
  route_id: number;
  customer_id: number;
  title: string;
  address: string;
  address_complement: string | null;
  phone_number: string;
  code: string;
}

async function fetchCustomerName(customerId: number): Promise<string | null> {
  try {
    const response = await vuuptFetch<{ customer: { name: string } }>(`customers/${customerId}`);
    return response.customer.name;
  } catch {
    return null;
  }
}

export async function fetchRouteServices(routeId: string): Promise<ServiceWithCustomer[]> {
  const response = await vuuptFetch<{ data: RawService[] }>('services', {
    fields: FIELDS_ADDRESS,
    'filter[0][field]': 'route_id',
    'filter[0][operator]': 'eq',
    'filter[0][value]': routeId,
  });

  return Promise.all(
    response.data.map(async (service) => ({
      ...service,
      customerName: await fetchCustomerName(service.customer_id),
    })),
  );
}

const EXPIRING_SOON_DAYS = 14;

export interface VuuptTokenStatus {
  configured: boolean;
  expiresAt: Date | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

/**
 * Decodifica (sem validar assinatura) a claim "exp" do JWT salvo, só pra
 * dar um aviso amigável na tela de Configurações. A validação de verdade
 * do token acontece na própria API da Vuupt a cada chamada.
 */
export async function getVuuptTokenStatus(): Promise<VuuptTokenStatus> {
  const rawToken = await getSetting(SETTING_KEYS.vuuptApiToken);

  if (!rawToken) {
    return { configured: false, expiresAt: null, isExpired: false, isExpiringSoon: false };
  }

  const jwt = rawToken.startsWith('Bearer ') ? rawToken.slice('Bearer '.length) : rawToken;
  const [, payloadSegment] = jwt.split('.');

  if (!payloadSegment) {
    return { configured: true, expiresAt: null, isExpired: false, isExpiringSoon: false };
  }

  try {
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(json) as { exp?: number };

    if (typeof payload.exp !== 'number') {
      return { configured: true, expiresAt: null, isExpired: false, isExpiringSoon: false };
    }

    const expiresAt = new Date(payload.exp * 1000);
    const msUntilExpiry = expiresAt.getTime() - Date.now();

    return {
      configured: true,
      expiresAt,
      isExpired: msUntilExpiry <= 0,
      isExpiringSoon: msUntilExpiry > 0 && msUntilExpiry <= EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000,
    };
  } catch {
    return { configured: true, expiresAt: null, isExpired: false, isExpiringSoon: false };
  }
}

/** Faz uma chamada real e leve à API pra confirmar que o token funciona agora. */
export async function checkVuuptConnection(): Promise<void> {
  await vuuptFetch<RoutesResponse>('routes', {
    fields: 'id',
    per_page: '1',
    page: '1',
  });
}
