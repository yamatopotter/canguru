'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import { hashPassword } from '@/lib/auth/password';
import { ACTIVITY_ACTIONS, logActivity } from '@/lib/activity';
import type { Role } from '@/types';

async function countActiveAdmins(excludeUserId?: string): Promise<number> {
  return prisma.user.count({
    where: {
      role: 'ADMIN',
      active: true,
      id: excludeUserId ? { not: excludeUserId } : undefined,
    },
  });
}

export interface UserFormState {
  error?: string;
  success?: string;
}

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireAdmin();

  const name = String(formData.get('name') ?? '').trim();
  const username = String(formData.get('username') ?? '')
    .trim()
    .toLowerCase();
  const email =
    String(formData.get('email') ?? '')
      .trim()
      .toLowerCase() || null;
  const role: Role = formData.get('role') === 'ADMIN' ? 'ADMIN' : 'OPERATOR';
  const oauthEnabled = formData.get('oauthEnabled') === 'on';
  const password = String(formData.get('password') ?? '');

  if (!name || !username) {
    return { error: 'Nome e usuário são obrigatórios.' };
  }

  if (oauthEnabled && !email) {
    return { error: 'Para permitir login via Zoho, informe um e-mail para este usuário.' };
  }

  if (password && password.length < 8) {
    return { error: 'A senha deve ter pelo menos 8 caracteres.' };
  }

  if (!password && !oauthEnabled) {
    return { error: 'Defina uma senha ou habilite o login via Zoho para este usuário.' };
  }

  let created;
  try {
    created = await prisma.user.create({
      data: {
        name,
        username,
        email,
        role,
        oauthEnabled,
        passwordHash: password ? await hashPassword(password) : null,
        // Senha provisória definida por outra pessoa: força a troca no
        // primeiro login pra garantir que só o próprio usuário saiba a senha.
        mustChangePassword: Boolean(password),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[] | undefined) ?? [];
      if (target.includes('email')) return { error: 'Já existe um usuário com este e-mail.' };
      return { error: 'Já existe um usuário com este nome de usuário.' };
    }
    throw error;
  }

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.userCreate,
    targetType: 'user',
    targetId: created.id,
    metadata: { username: created.username, role: created.role },
  });

  revalidatePath('/admin/users');
  return { success: 'Usuário criado com sucesso.' };
}

export async function updateUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireAdmin();

  const id = String(formData.get('id') ?? '');
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return { error: 'Usuário não encontrado.' };

  const name = String(formData.get('name') ?? '').trim();
  const email =
    String(formData.get('email') ?? '')
      .trim()
      .toLowerCase() || null;
  const role: Role = formData.get('role') === 'ADMIN' ? 'ADMIN' : 'OPERATOR';
  const oauthEnabled = formData.get('oauthEnabled') === 'on';
  const password = String(formData.get('password') ?? '');

  const demotingFromAdmin = role === 'OPERATOR' && existing.role === 'ADMIN';
  if (demotingFromAdmin && (await countActiveAdmins(existing.id)) === 0) {
    return { error: 'Não é possível remover o último administrador ativo do sistema.' };
  }

  if (password && password.length < 8) {
    return { error: 'A senha deve ter pelo menos 8 caracteres.' };
  }

  if (oauthEnabled && !email) {
    return { error: 'Para permitir login via Zoho, informe um e-mail para este usuário.' };
  }

  const willHavePassword = password ? true : Boolean(existing.passwordHash);
  if (!willHavePassword && !oauthEnabled) {
    return { error: 'O usuário precisa de uma senha definida ou de login via Zoho habilitado.' };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: name || existing.name,
        email,
        role,
        oauthEnabled,
        // Se o e-mail mudou, o vínculo antigo com a conta Zoho não é mais confiável.
        zohoUserId: email === existing.email ? undefined : null,
        ...(password
          ? { passwordHash: await hashPassword(password), mustChangePassword: true }
          : {}),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: 'Já existe outro usuário com este e-mail.' };
    }
    throw error;
  }

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.userUpdate,
    targetType: 'user',
    targetId: id,
    metadata: { username: existing.username, passwordReset: Boolean(password) },
  });

  revalidatePath('/admin/users');
  return { success: 'Usuário atualizado.' };
}

export async function toggleActiveAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireAdmin();

  const userId = String(formData.get('userId') ?? '');
  const nextActive = formData.get('active') === 'true';

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return { error: 'Usuário não encontrado.' };

  if (!nextActive && existing.role === 'ADMIN' && (await countActiveAdmins(existing.id)) === 0) {
    return { error: 'Não é possível desativar o último administrador ativo.' };
  }

  await prisma.user.update({ where: { id: userId }, data: { active: nextActive } });

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.userToggleActive,
    targetType: 'user',
    targetId: userId,
    metadata: { username: existing.username, active: nextActive },
  });

  revalidatePath('/admin/users');
  return { success: nextActive ? 'Usuário ativado.' : 'Usuário desativado.' };
}

export async function deleteUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireAdmin();

  const userId = String(formData.get('userId') ?? '');

  // Checagem no servidor, não só escondendo o botão na interface — uma
  // chamada direta à action não pode contornar essa regra.
  if (userId === admin.id) {
    return { error: 'Você não pode remover a sua própria conta.' };
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return { error: 'Usuário não encontrado.' };

  if (existing.role === 'ADMIN' && existing.active && (await countActiveAdmins(existing.id)) === 0) {
    return { error: 'Não é possível remover o último administrador ativo.' };
  }

  await prisma.user.delete({ where: { id: userId } });

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.userDelete,
    targetType: 'user',
    targetId: userId,
    metadata: { username: existing.username },
  });

  revalidatePath('/admin/users');
  return { success: 'Usuário removido.' };
}

/** Invalida instantaneamente todas as sessões ativas desse usuário. */
export async function revokeSessionsAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireAdmin();

  const userId = String(formData.get('userId') ?? '');
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return { error: 'Usuário não encontrado.' };

  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });

  await logActivity({
    actorId: admin.id,
    actorName: admin.name,
    action: ACTIVITY_ACTIONS.userSessionsRevoked,
    targetType: 'user',
    targetId: userId,
    metadata: { username: existing.username },
  });

  revalidatePath('/admin/users');
  return { success: 'Sessões encerradas.' };
}
