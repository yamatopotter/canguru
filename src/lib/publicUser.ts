import 'server-only';
import type { User } from '@prisma/client';
import type { AppUser, Role } from '@/types';

export function toPublicUser(user: User): AppUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role as Role,
    oauthEnabled: user.oauthEnabled,
    hasPassword: Boolean(user.passwordHash),
    active: user.active,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
  };
}
