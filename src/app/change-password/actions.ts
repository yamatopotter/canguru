'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guards';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

export interface ChangePasswordState {
  error?: string;
  success?: string;
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const currentUser = await requireUser();

  const currentPassword = String(formData.get('currentPassword') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password.length < 8) {
    return { error: 'A nova senha deve ter pelo menos 8 caracteres.' };
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' };
  }

  const user = await prisma.user.findUnique({ where: { id: currentUser.id } });

  // Se o usuário já tem uma senha definida, exige a senha atual (evita que
  // uma sessão roubada troque a senha sem confirmar). Se ainda não tem
  // senha (ex.: conta só-Zoho ganhando senha agora), não há o que exigir.
  if (user?.passwordHash) {
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return { error: 'Senha atual incorreta.' };
    }
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { passwordHash: await hashPassword(password), mustChangePassword: false },
  });

  // A troca forçada (primeiro login) ainda navega pra "/" — o usuário está
  // numa página inteira dedicada a isso. A troca voluntária (modal, usuário
  // já logado) só precisa fechar o modal, sem sair de onde ele estava.
  if (currentUser.mustChangePassword) {
    redirect('/');
  }

  return { success: 'Senha alterada.' };
}
