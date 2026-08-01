import crypto from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../db';
import { env, isZohoConfigured } from '../env';
import { verifyPassword } from '../services/password';
import { clearSessionCookie, setSessionCookie, signSessionToken } from '../services/jwt';
import { buildZohoAuthUrl, exchangeZohoCode, fetchZohoUserInfo } from '../services/zoho';
import { asyncHandler } from '../utils/asyncHandler';
import { toPublicUser } from '../utils/publicUser';
import { requireAuth } from '../middleware/auth';
import type { Role } from '../types';

const ZOHO_STATE_COOKIE = 'zoho_oauth_state';
const ZOHO_STATE_PATH = '/api/auth/zoho';

export const authRouter = Router();

authRouter.get('/providers', (_req, res) => {
  res.json({ zoho: isZohoConfigured });
});

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Informe e-mail e senha.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.active || !user.passwordHash) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    const token = signSessionToken({ sub: user.id, role: user.role as Role });
    setSessionCookie(res, token);
    res.json({ user: toPublicUser(user) });
  }),
);

authRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRouter.get('/zoho/start', (_req, res) => {
  if (!isZohoConfigured) {
    return res.status(501).json({ message: 'Login com Zoho não está configurado neste servidor.' });
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie(ZOHO_STATE_COOKIE, state, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000,
    path: ZOHO_STATE_PATH,
  });

  res.redirect(buildZohoAuthUrl(state));
});

authRouter.get(
  '/zoho/callback',
  asyncHandler(async (req, res) => {
    const cookieState = req.cookies?.[ZOHO_STATE_COOKIE];
    res.clearCookie(ZOHO_STATE_COOKIE, { path: ZOHO_STATE_PATH });

    const { code, state, error } = req.query;

    if (error || !code || !state || state !== cookieState) {
      return res.redirect(`${env.frontendUrl}/login?error=zoho`);
    }

    try {
      const tokenData = await exchangeZohoCode(String(code));
      const zohoUser = await fetchZohoUserInfo(tokenData.access_token);

      let user = await prisma.user.findUnique({ where: { zohoUserId: zohoUser.zuid } });

      if (!user) {
        const byEmail = await prisma.user.findUnique({
          where: { email: zohoUser.email.toLowerCase() },
        });

        if (byEmail) {
          user = await prisma.user.update({
            where: { id: byEmail.id },
            data: { zohoUserId: zohoUser.zuid, provider: 'ZOHO' },
          });
        }
      }

      if (!user) {
        return res.redirect(`${env.frontendUrl}/login?error=not_registered`);
      }

      if (!user.active) {
        return res.redirect(`${env.frontendUrl}/login?error=inactive`);
      }

      const token = signSessionToken({ sub: user.id, role: user.role as Role });
      setSessionCookie(res, token);
      res.redirect(env.frontendUrl);
    } catch (err) {
      console.error('[zoho-oauth]', err);
      res.redirect(`${env.frontendUrl}/login?error=zoho`);
    }
  }),
);
