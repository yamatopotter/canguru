'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordResetAction, type ForgotPasswordState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusMessage } from '@/components/StatusMessage';

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  if (state.message) {
    return (
      <>
        <StatusMessage tone="success">{state.message}</StatusMessage>
        <Link href="/login" className="self-center text-sm font-medium text-primary hover:underline">
          Voltar para o login
        </Link>
      </>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}

      <p className="text-sm text-muted-foreground">
        Informe seu usuário. Se houver um e-mail cadastrado, enviaremos um link para redefinir a
        senha. Caso contrário, nossa equipe de tecnologia será avisada para te ajudar.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Usuário</Label>
        <Input id="username" name="username" type="text" required />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Enviando...' : 'Enviar instruções'}
      </Button>

      <Link href="/login" className="self-center text-sm font-medium text-primary hover:underline">
        Voltar para o login
      </Link>
    </form>
  );
}
