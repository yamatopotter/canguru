import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('hashPassword / verifyPassword', () => {
  it('confirma a senha correta contra o hash', async () => {
    const hash = await hashPassword('minhaSenha123');
    expect(await verifyPassword('minhaSenha123', hash)).toBe(true);
  });

  it('rejeita senha incorreta', async () => {
    const hash = await hashPassword('minhaSenha123');
    expect(await verifyPassword('senhaErrada', hash)).toBe(false);
  });

  it('nunca guarda a senha em texto puro no hash', async () => {
    const hash = await hashPassword('minhaSenha123');
    expect(hash).not.toContain('minhaSenha123');
  });
});
