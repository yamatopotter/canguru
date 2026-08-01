import type { User } from '@prisma/client';
import type { AuthProviderName, Role } from '../types';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: AuthProviderName;
  active: boolean;
  createdAt: string;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    provider: user.provider as AuthProviderName,
    active: user.active,
    createdAt: user.createdAt.toISOString(),
  };
}
