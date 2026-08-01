import { describe, expect, it } from 'vitest';
import type { User } from '@prisma/client';
import { toPublicUser } from '@/lib/publicUser';

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Fulano',
    username: 'fulano',
    email: null,
    passwordHash: null,
    role: 'OPERATOR',
    oauthEnabled: false,
    zohoUserId: null,
    active: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    mustChangePassword: false,
    sessionVersion: 0,
    ...overrides,
  };
}

describe('toPublicUser', () => {
  it('nunca inclui o passwordHash, só um booleano hasPassword', () => {
    const user = buildUser({ passwordHash: '$2a$12$algumhashsecreto' });
    const publicUser = toPublicUser(user);

    expect(publicUser).not.toHaveProperty('passwordHash');
    expect(publicUser.hasPassword).toBe(true);
  });

  it('hasPassword é falso quando o usuário só tem acesso via Zoho', () => {
    const user = buildUser({ passwordHash: null, oauthEnabled: true });
    expect(toPublicUser(user).hasPassword).toBe(false);
  });

  it('serializa createdAt como ISO string', () => {
    const user = buildUser({ createdAt: new Date('2026-03-05T12:00:00.000Z') });
    expect(toPublicUser(user).createdAt).toBe('2026-03-05T12:00:00.000Z');
  });
});
