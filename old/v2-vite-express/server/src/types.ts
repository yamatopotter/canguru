// SQLite não tem enum nativo no Prisma, então "role" e "provider" do
// usuário são colunas String no schema. Estes tipos definem os valores
// válidos na camada da aplicação.
export type Role = 'ADMIN' | 'OPERATOR';
export type AuthProviderName = 'LOCAL' | 'ZOHO';

export function isRole(value: unknown): value is Role {
  return value === 'ADMIN' || value === 'OPERATOR';
}

export function isAuthProviderName(value: unknown): value is AuthProviderName {
  return value === 'LOCAL' || value === 'ZOHO';
}
