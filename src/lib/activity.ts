import 'server-only';
import { prisma } from './prisma';

// Ações usadas em ActivityLog.action — mantidas como constantes pra evitar
// strings soltas espalhadas pelo código (e pra alimentar o filtro da tela
// de auditoria).
export const ACTIVITY_ACTIONS = {
  userCreate: 'user.create',
  userUpdate: 'user.update',
  userDelete: 'user.delete',
  userToggleActive: 'user.toggle_active',
  userSessionsRevoked: 'user.sessions_revoked',
  settingsUpdate: 'settings.update',
  logoUpdate: 'settings.logo_update',
  smtpUpdate: 'settings.smtp_update',
  routePrint: 'route.print',
  authLoginFailed: 'auth.login_failed',
  authLoginSucceeded: 'auth.login_succeeded',
  passwordResetRequested: 'auth.password_reset_requested',
} as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];

interface LogActivityInput {
  actorId?: string | null;
  actorName: string;
  action: ActivityAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  await prisma.activityLog.create({
    data: {
      actorId: input.actorId ?? null,
      actorName: input.actorName,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}

/** Conta quantas vezes uma ação aconteceu pra um identificador nos últimos `windowMs` ms. */
export async function countRecentActivity(
  action: ActivityAction,
  identifier: string,
  windowMs: number,
): Promise<number> {
  const since = new Date(Date.now() - windowMs);

  const rows = await prisma.activityLog.findMany({
    where: { action, createdAt: { gte: since } },
    select: { metadata: true },
  });

  return rows.filter((row) => {
    if (!row.metadata) return false;
    try {
      return JSON.parse(row.metadata).identifier === identifier;
    } catch {
      return false;
    }
  }).length;
}
