'use client';

import { useActionState } from 'react';
import { toggleActiveAction, type UserFormState } from './actions';
import { Button } from '@/components/ui/button';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: UserFormState = {};

interface ToggleActiveButtonProps {
  userId: string;
  active: boolean;
  disabled?: boolean;
}

export function ToggleActiveButton({ userId, active, disabled }: ToggleActiveButtonProps) {
  const [state, formAction, pending] = useActionState(toggleActiveAction, initialState);
  useActionToast(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="active" value={String(!active)} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={disabled || pending}
        title={disabled ? 'Não é possível desativar o último administrador ativo.' : undefined}
      >
        {active ? 'Desativar' : 'Ativar'}
      </Button>
    </form>
  );
}
