import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../env';
import type { Role } from '@/types';

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

const encodedSecret = new TextEncoder().encode(env.jwtSecret);

export interface SessionPayload {
  sub: string;
  role: Role;
  sessionVersion: number;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, sessionVersion: payload.sessionVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(encodedSecret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    if (typeof payload.sub !== 'string') return null;
    if (payload.role !== 'ADMIN' && payload.role !== 'OPERATOR') return null;
    if (typeof payload.sessionVersion !== 'number') return null;

    return { sub: payload.sub, role: payload.role, sessionVersion: payload.sessionVersion };
  } catch {
    return null;
  }
}
