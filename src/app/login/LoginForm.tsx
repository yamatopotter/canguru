'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, type LoginState } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusMessage } from '@/components/StatusMessage';

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Usuário</Label>
        <Input id="username" name="username" type="text" autoComplete="username" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      <Link href="/forgot-password" className="self-end text-sm font-medium text-primary hover:underline">
        Esqueci minha senha
      </Link>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
