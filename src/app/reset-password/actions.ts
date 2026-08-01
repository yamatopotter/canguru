'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { peekPasswordResetToken } from '@/lib/auth/passwordReset';

export interface ResetPasswordState {
  error?: string;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get('token') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password.length < 8) {
    return { error: 'A senha deve ter pelo menos 8 caracteres.' };
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' };
  }

  const record = await peekPasswordResetToken(token);
  if (!record) {
    return { error: 'Link inválido ou expirado. Solicite uma nova redefinição de senha.' };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    // Invalida este e qualquer outro link de redefinição pendente para o usuário.
    prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect('/login?reset=success');
}
