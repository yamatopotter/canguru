export const ROUTES_PER_PAGE = 10;

export type LabelSize = '72mm' | '10x15';

export const LABEL_SIZE_OPTIONS: Record<LabelSize, string> = {
  '72mm': 'Térmica 72mm (bobina)',
  '10x15': '10x15 cm',
};

// Etiqueta 10x15 sempre tem 0,5cm de margem nos quatro lados (não configurável).
export const LABEL_10X15_MARGIN_MM = 5;

// A impressora (Argox) imprime ~5mm acima do início da etiqueta; este
// deslocamento empurra o conteúdo pra baixo só na impressão pra compensar.
export const LABEL_10X15_PRINT_OFFSET_TOP_MM = 5;

export type Role = 'ADMIN' | 'OPERATOR';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
};

export interface AppUser {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: Role;
  oauthEnabled: boolean;
  hasPassword: boolean;
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface Route {
  id: number;
  name: string;
  created_at: string;
}

export interface RoutesPage {
  routes: Route[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export interface ServiceWithCustomer {
  id: number;
  route_id: number;
  customer_id: number;
  title: string;
  address: string;
  address_complement: string | null;
  phone_number: string;
  code: string;
  customerName: string | null;
}
