export interface Route {
  id: number;
  name: string;
  created_at: string;
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

export type Role = 'ADMIN' | 'OPERATOR';
export type AuthProviderName = 'LOCAL' | 'ZOHO';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: AuthProviderName;
  active: boolean;
  createdAt: string;
}
