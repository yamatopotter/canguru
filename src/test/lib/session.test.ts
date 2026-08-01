import { describe, expect, it } from 'vitest';
import { signSessionToken, verifySessionToken } from '@/lib/auth/session';

describe('signSessionToken / verifySessionToken', () => {
  it('assina e verifica um token válido', async () => {
    const token = await signSessionToken({ sub: 'user-1', role: 'OPERATOR', sessionVersion: 0 });
    const payload = await verifySessionToken(token);

    expect(payload).toEqual({ sub: 'user-1', role: 'OPERATOR', sessionVersion: 0 });
  });

  it('rejeita token adulterado', async () => {
    const token = await signSessionToken({ sub: 'user-1', role: 'ADMIN', sessionVersion: 0 });
    const tampered = `${token.slice(0, -2)}xx`;

    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it('rejeita string que não é um JWT', async () => {
    expect(await verifySessionToken('nao-e-um-token')).toBeNull();
  });

  it('preserva o sessionVersion no round-trip, usado para revogar sessões antigas', async () => {
    const token = await signSessionToken({ sub: 'user-2', role: 'OPERATOR', sessionVersion: 3 });
    const payload = await verifySessionToken(token);

    expect(payload?.sessionVersion).toBe(3);
  });
});
