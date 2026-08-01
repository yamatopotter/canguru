import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { env } from '../env';
import type { Role } from '../types';

export const SESSION_COOKIE_NAME = 'session';
const SESSION_TTL = '7d';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
  sub: string;
  role: Role;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: SESSION_TTL });
}

export function verifySessionToken(token: string): SessionPayload {
  return jwt.verify(token, env.jwtSecret) as SessionPayload;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
}
