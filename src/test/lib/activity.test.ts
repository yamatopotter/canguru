import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { ACTIVITY_ACTIONS, countRecentActivity, logActivity } from '@/lib/activity';

describe('logActivity / countRecentActivity', () => {
  it('grava e conta ocorrências recentes pelo identificador em metadata', async () => {
    const identifier = `user-${randomUUID()}`;

    await logActivity({
      actorId: null,
      actorName: identifier,
      action: ACTIVITY_ACTIONS.authLoginFailed,
      metadata: { identifier },
    });
    await logActivity({
      actorId: null,
      actorName: identifier,
      action: ACTIVITY_ACTIONS.authLoginFailed,
      metadata: { identifier },
    });

    const count = await countRecentActivity(ACTIVITY_ACTIONS.authLoginFailed, identifier, 60_000);
    expect(count).toBe(2);
  });

  it('não conta ocorrências de outro identificador', async () => {
    const identifier = `user-${randomUUID()}`;
    const other = `user-${randomUUID()}`;

    await logActivity({
      actorId: null,
      actorName: identifier,
      action: ACTIVITY_ACTIONS.authLoginFailed,
      metadata: { identifier },
    });

    expect(await countRecentActivity(ACTIVITY_ACTIONS.authLoginFailed, other, 60_000)).toBe(0);
  });

  it('não conta ocorrências fora da janela de tempo', async () => {
    const identifier = `user-${randomUUID()}`;

    const old = await prisma.activityLog.create({
      data: {
        actorName: identifier,
        action: ACTIVITY_ACTIONS.authLoginFailed,
        metadata: JSON.stringify({ identifier }),
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1h atrás
      },
    });

    expect(await countRecentActivity(ACTIVITY_ACTIONS.authLoginFailed, identifier, 15 * 60 * 1000)).toBe(0);

    await prisma.activityLog.delete({ where: { id: old.id } });
  });
});
