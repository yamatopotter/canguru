import 'server-only';
import crypto from 'node:crypto';
import { prisma } from '../prisma';
import type { PasswordResetToken } from '@prisma/client';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/** Gera um token de uso único (256 bits de aleatoriedade) e salva só o hash no banco. */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

/** Verifica se o token é válido (existe, não expirou, não foi usado) sem consumi-lo. */
export async function peekPasswordResetToken(rawToken: string): Promise<PasswordResetToken | null> {
  if (!rawToken) return null;

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  return record;
}
