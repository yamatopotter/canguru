'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '../prisma';
import { env } from '../env';
import { verifyPassword } from './password';
import { signSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from './session';
import { ACTIVITY_ACTIONS, logActivity } from '../activity';
import { isRateLimited, RATE_LIMIT_MESSAGE } from '../rateLimit';
import type { Role } from '@/types';

export interface LoginState {
  error?: string;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!username || !password) {
    return { error: 'Informe usuário e senha.' };
  }

  if (await isRateLimited(ACTIVITY_ACTIONS.authLoginFailed, username)) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  const valid = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !user.active || !user.passwordHash || !valid) {
    await logActivity({
      actorId: null,
      actorName: username,
      action: ACTIVITY_ACTIONS.authLoginFailed,
      metadata: { identifier: username },
    });
    return { error: 'Usuário ou senha inválidos.' };
  }

  await logActivity({
    actorId: user.id,
    actorName: user.name,
    action: ACTIVITY_ACTIONS.authLoginSucceeded,
    metadata: { identifier: username },
  });

  const token = await signSessionToken({
    sub: user.id,
    role: user.role as Role,
    sessionVersion: user.sessionVersion,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });

  redirect(user.mustChangePassword ? '/change-password' : '/');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
