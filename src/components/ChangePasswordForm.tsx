'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { changePasswordAction, type ChangePasswordState } from '@/app/change-password/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusMessage } from '@/components/StatusMessage';

const initialState: ChangePasswordState = {};

interface ChangePasswordFormProps {
  hasExistingPassword: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordForm({ hasExistingPassword, onSuccess }: ChangePasswordFormProps) {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <StatusMessage tone="error">{state.error}</StatusMessage>}

      {hasExistingPassword && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currentPassword">Senha atual</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nova senha</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <span className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Salvando...' : 'Salvar nova senha'}
      </Button>
    </form>
  );
}
