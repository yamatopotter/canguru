import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, signSessionToken } from '@/lib/auth/session';
import { exchangeZohoCode, fetchZohoUserInfo } from '@/lib/zoho';
import { ACTIVITY_ACTIONS, logActivity } from '@/lib/activity';
import type { Role } from '@/types';
import { ZOHO_STATE_COOKIE, ZOHO_STATE_PATH } from '../start/route';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const cookieState = cookieStore.get(ZOHO_STATE_COOKIE)?.value;
  // Expira o cookie de estado imediatamente após o uso (é de uso único).
  cookieStore.set(ZOHO_STATE_COOKIE, '', { maxAge: 0, path: ZOHO_STATE_PATH });

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');
  // Não usa request.nextUrl.origin: atrás de proxy/port-mapping ele reflete
  // o host que o Next enxerga na requisição (pode virar algo como
  // 0.0.0.0:3000), não o domínio público. Mesma fonte usada no e-mail de
  // redefinição de senha (src/app/forgot-password/actions.ts).
  const baseUrl = process.env.APP_BASE_URL ?? request.nextUrl.origin;

  if (error || !code || !state || state !== cookieState) {
    return NextResponse.redirect(`${baseUrl}/login?error=zoho`);
  }

  try {
    const tokenData = await exchangeZohoCode(code);
    const zohoUser = await fetchZohoUserInfo(tokenData.access_token);

    let user = await prisma.user.findUnique({ where: { zohoUserId: zohoUser.zuid } });

    if (!user) {
      // Só vincula automaticamente se já existir um usuário cadastrado com
      // este e-mail E um administrador tiver explicitamente liberado o
      // login via Zoho para ele (oauthEnabled). Sem isso, qualquer pessoa
      // da organização Zoho conseguiria entrar no sistema.
      const byEmail = await prisma.user.findUnique({
        where: { email: zohoUser.email.toLowerCase() },
      });

      if (byEmail && byEmail.oauthEnabled) {
        user = await prisma.user.update({
          where: { id: byEmail.id },
          data: { zohoUserId: zohoUser.zuid },
        });
      }
    }

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/login?error=not_registered`);
    }

    if (!user.oauthEnabled) {
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_disabled`);
    }

    if (!user.active) {
      return NextResponse.redirect(`${baseUrl}/login?error=inactive`);
    }

    await logActivity({
      actorId: user.id,
      actorName: user.name,
      action: ACTIVITY_ACTIONS.authLoginSucceeded,
      metadata: { identifier: user.username, via: 'zoho' },
    });

    const token = await signSessionToken({
      sub: user.id,
      role: user.role as Role,
      sessionVersion: user.sessionVersion,
    });
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return NextResponse.redirect(baseUrl);
  } catch (err) {
    console.error('[zoho-oauth]', err);
    return NextResponse.redirect(`${baseUrl}/login?error=zoho`);
  }
}
