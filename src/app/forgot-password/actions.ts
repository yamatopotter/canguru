'use server';

import { prisma } from '@/lib/prisma';
import { createPasswordResetToken } from '@/lib/auth/passwordReset';
import { sendMail } from '@/lib/mailer';
import { ACTIVITY_ACTIONS, logActivity } from '@/lib/activity';
import { isRateLimited, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit';

const SUPPORT_EMAIL = 'tecnologia@evorafarma.com.br';

// Mensagem sempre igual, exista ou não o usuário, tenha ou não e-mail
// cadastrado — evita que alguém descubra quais contas existem no sistema
// só testando nomes de usuário nesta tela.
const GENERIC_MESSAGE =
  'Se o usuário informado existir, você receberá um e-mail com instruções em alguns minutos.';

export interface ForgotPasswordState {
  message?: string;
  error?: string;
}

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const username = String(formData.get('username') ?? '')
    .trim()
    .toLowerCase();

  if (!username) {
    return { error: 'Informe seu usuário.' };
  }

  if (await isRateLimited(ACTIVITY_ACTIONS.passwordResetRequested, username)) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  await logActivity({
    actorId: null,
    actorName: username,
    action: ACTIVITY_ACTIONS.passwordResetRequested,
    metadata: { identifier: username },
  });

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (user && user.active) {
      const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';

      if (user.email) {
        const token = await createPasswordResetToken(user.id);
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        await sendMail(
          user.email,
          'Redefinição de senha',
          `<p>Olá, ${user.name}.</p>
           <p>Recebemos uma solicitação para redefinir a senha da conta <strong>${user.username}</strong>.</p>
           <p><a href="${resetUrl}">Clique aqui para definir uma nova senha</a></p>
           <p>Este link é válido por 1 hora e só pode ser usado uma vez. Se você não fez essa solicitação, ignore este e-mail.</p>`,
        );
      } else {
        await sendMail(
          SUPPORT_EMAIL,
          `Solicitação de redefinição de senha: ${user.username}`,
          `<p>O usuário <strong>${user.username}</strong> (${user.name}) solicitou a redefinição de senha, mas não tem e-mail cadastrado no sistema.</p>
           <p>Entre em contato com essa pessoa ou redefina a senha manualmente pela tela administrativa de Usuários.</p>`,
        );
      }
    }
  } catch (err) {
    // Não expõe o motivo (SMTP não configurado etc.) nem se o usuário existe.
    console.error('[forgot-password]', err);
  }

  return { message: GENERIC_MESSAGE };
}
