import 'server-only';
import { cookies } from 'next/headers';
import { prisma } from '../prisma';
import { SESSION_COOKIE_NAME, verifySessionToken } from './session';
import type { AppUser } from '@/types';

export type CurrentUser = Omit<AppUser, 'active' | 'createdAt'>;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.active) return null;

  // Se um admin "encerrou as sessões" desse usuário, sessionVersion no banco
  // já foi incrementado — qualquer token antigo (com a versão anterior)
  // deixa de valer, mesmo que ainda não tenha expirado.
  if (user.sessionVersion !== payload.sessionVersion) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role as CurrentUser['role'],
    oauthEnabled: user.oauthEnabled,
    hasPassword: Boolean(user.passwordHash),
    mustChangePassword: user.mustChangePassword,
  };
}
