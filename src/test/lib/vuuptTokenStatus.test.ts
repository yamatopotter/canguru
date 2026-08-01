import { afterEach, describe, expect, it } from 'vitest';
import { setSetting, SETTING_KEYS } from '@/lib/settings';
import { getVuuptTokenStatus } from '@/lib/vuupt';

function base64url(input: string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** JWT "cru" com claim exp, sem assinatura válida (só a claim importa pro decode). */
function fakeJwt(exp: number): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ exp }));
  return `${header}.${payload}.assinatura-fake`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

afterEach(async () => {
  await setSetting(SETTING_KEYS.vuuptApiToken, '');
});

describe('getVuuptTokenStatus', () => {
  it('sinaliza não configurado quando não há token salvo', async () => {
    const status = await getVuuptTokenStatus();
    expect(status).toEqual({ configured: false, expiresAt: null, isExpired: false, isExpiringSoon: false });
  });

  it('reconhece um token válido (expira em mais de 14 dias)', async () => {
    const exp = Math.floor((Date.now() + 30 * DAY_MS) / 1000);
    await setSetting(SETTING_KEYS.vuuptApiToken, fakeJwt(exp));

    const status = await getVuuptTokenStatus();
    expect(status.configured).toBe(true);
    expect(status.isExpired).toBe(false);
    expect(status.isExpiringSoon).toBe(false);
  });

  it('sinaliza "expira em breve" dentro da janela de 14 dias', async () => {
    const exp = Math.floor((Date.now() + 5 * DAY_MS) / 1000);
    await setSetting(SETTING_KEYS.vuuptApiToken, fakeJwt(exp));

    const status = await getVuuptTokenStatus();
    expect(status.isExpired).toBe(false);
    expect(status.isExpiringSoon).toBe(true);
  });

  it('sinaliza expirado quando exp já passou', async () => {
    const exp = Math.floor((Date.now() - DAY_MS) / 1000);
    await setSetting(SETTING_KEYS.vuuptApiToken, fakeJwt(exp));

    const status = await getVuuptTokenStatus();
    expect(status.isExpired).toBe(true);
  });

  it('normaliza o prefixo "Bearer " antes de decodificar', async () => {
    const exp = Math.floor((Date.now() + 30 * DAY_MS) / 1000);
    await setSetting(SETTING_KEYS.vuuptApiToken, `Bearer ${fakeJwt(exp)}`);

    const status = await getVuuptTokenStatus();
    expect(status.configured).toBe(true);
    expect(status.isExpired).toBe(false);
  });

  it('não quebra com um token malformado, apenas não informa validade', async () => {
    await setSetting(SETTING_KEYS.vuuptApiToken, 'nao-e-um-jwt');

    const status = await getVuuptTokenStatus();
    expect(status.configured).toBe(true);
    expect(status.expiresAt).toBeNull();
  });
});
