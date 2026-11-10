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

// ---- Aparência do texto da etiqueta (configurável pelo admin) ----
// Impressora térmica com fonte fraca: peso e tamanho da fonte impactam a carga
// de impressão, então ficam ajustáveis.
export type LabelFontWeight = 'normal' | 'semibold' | 'bold';

export const LABEL_FONT_WEIGHT_OPTIONS: Record<LabelFontWeight, string> = {
  normal: 'Normal',
  semibold: 'Semibold (recomendado)',
  bold: 'Negrito',
};

export const LABEL_FONT_WEIGHT_VALUE: Record<LabelFontWeight, number> = {
  normal: 400,
  semibold: 600,
  bold: 700,
};

export interface LabelFontSizes {
  title: number;
  name: number;
  phone: number;
  address: number;
  date: number;
  payment: number;
  fields: number;
}

export const LABEL_FONT_SECTIONS: { key: keyof LabelFontSizes; label: string }[] = [
  { key: 'title', label: 'Pedido (título)' },
  { key: 'name', label: 'Nome do cliente' },
  { key: 'phone', label: 'Telefone' },
  { key: 'address', label: 'Endereço' },
  { key: 'date', label: 'Data' },
  { key: 'payment', label: 'Pago / A Pagar' },
  { key: 'fields', label: 'Documento / Assinatura' },
];

export interface LabelStyle {
  weight: LabelFontWeight;
  // Multiplicador dos tamanhos de fonte; só vale pra etiqueta 10x15.
  scale: number;
  sizes: LabelFontSizes;
}

export const DEFAULT_LABEL_STYLE: LabelStyle = {
  weight: 'semibold',
  scale: 1.25,
  sizes: { title: 13, name: 16, phone: 11, address: 11, date: 11, payment: 11, fields: 11 },
};

export const LABEL_FONT_SIZE_RANGE = { min: 6, max: 40 };
export const LABEL_SCALE_RANGE = { min: 0.8, max: 2 };

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
