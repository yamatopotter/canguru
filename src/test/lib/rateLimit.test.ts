import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { ACTIVITY_ACTIONS, logActivity } from '@/lib/activity';
import { isRateLimited } from '@/lib/rateLimit';

async function logFailedAttempt(identifier: string) {
  await logActivity({
    actorId: null,
    actorName: identifier,
    action: ACTIVITY_ACTIONS.authLoginFailed,
    metadata: { identifier },
  });
}

describe('isRateLimited', () => {
  it('libera enquanto o identificador tem menos de 5 tentativas na janela', async () => {
    const identifier = `user-${randomUUID()}`;

    for (let i = 0; i < 4; i++) await logFailedAttempt(identifier);

    expect(await isRateLimited(ACTIVITY_ACTIONS.authLoginFailed, identifier)).toBe(false);
  });

  it('bloqueia a partir da 5ª tentativa na janela', async () => {
    const identifier = `user-${randomUUID()}`;

    for (let i = 0; i < 5; i++) await logFailedAttempt(identifier);

    expect(await isRateLimited(ACTIVITY_ACTIONS.authLoginFailed, identifier)).toBe(true);
  });

  it('cada identificador tem seu próprio contador', async () => {
    const blocked = `user-${randomUUID()}`;
    const clean = `user-${randomUUID()}`;

    for (let i = 0; i < 5; i++) await logFailedAttempt(blocked);

    expect(await isRateLimited(ACTIVITY_ACTIONS.authLoginFailed, blocked)).toBe(true);
    expect(await isRateLimited(ACTIVITY_ACTIONS.authLoginFailed, clean)).toBe(false);
  });
});
