import { env } from '../env';
import { getSetting, SETTING_KEYS } from './settings';

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

async function vuuptFetch<T>(path: string, query?: Record<string, string>): Promise<T> {
  const token = await getSetting(SETTING_KEYS.vuuptApiToken);

  if (!token) {
    throw new VuuptError(
      412,
      'Token da API da Vuupt não configurado. Peça a um administrador para configurá-lo na tela de Configurações.',
    );
  }

  const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
  const response = await fetch(`${env.vuuptBaseUrl}${path}${queryString}`, {
    method: 'GET',
    headers: {
      authorization: token,
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });

  if (!response.ok) {
    throw new VuuptError(response.status, `Erro na API da Vuupt (status ${response.status})`);
  }

  return response.json() as Promise<T>;
}

export interface VuuptRoute {
  id: number;
  name: string;
  created_at: string;
}

export interface VuuptService {
  id: number;
  route_id: number;
  customer_id: number;
  title: string;
  address: string;
  address_complement: string | null;
  phone_number: string;
  code: string;
}

export async function fetchRecentRoutes(sinceDate: Date): Promise<VuuptRoute[]> {
  const response = await vuuptFetch<{ data: VuuptRoute[] }>('routes', {
    fields: FIELDS_ROUTES,
    'filter[0][field]': 'created_at',
    'filter[0][operator]': 'gt',
    'filter[0][value]': formatDateForApi(sinceDate),
  });

  return response.data;
}

export async function fetchServicesByRoute(routeId: string): Promise<VuuptService[]> {
  const response = await vuuptFetch<{ data: VuuptService[] }>('services', {
    fields: FIELDS_ADDRESS,
    'filter[0][field]': 'route_id',
    'filter[0][operator]': 'eq',
    'filter[0][value]': routeId,
  });

  return response.data;
}

export async function fetchCustomerName(customerId: number): Promise<string> {
  const response = await vuuptFetch<{ customer: { name: string } }>(`customers/${customerId}`);
  return response.customer.name;
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day} 00:00:00`;
}
