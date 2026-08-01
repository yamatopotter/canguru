import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { buildZohoAuthUrl, isZohoConfigured } from '@/lib/zoho';

export const ZOHO_STATE_COOKIE = 'zoho_oauth_state';
export const ZOHO_STATE_PATH = '/api/auth/zoho';

export async function GET() {
  if (!(await isZohoConfigured())) {
    return NextResponse.json(
      { message: 'Login com Zoho não está configurado neste servidor.' },
      { status: 501 },
    );
  }

  const state = crypto.randomBytes(16).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set(ZOHO_STATE_COOKIE, state, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    maxAge: 5 * 60,
    path: ZOHO_STATE_PATH,
  });

  return NextResponse.redirect(await buildZohoAuthUrl(state));
}
