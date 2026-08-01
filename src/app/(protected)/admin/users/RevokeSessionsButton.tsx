'use client';

import { useActionState } from 'react';
import { revokeSessionsAction, type UserFormState } from './actions';
import { Button } from '@/components/ui/button';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: UserFormState = {};

interface RevokeSessionsButtonProps {
  userId: string;
}

export function RevokeSessionsButton({ userId }: RevokeSessionsButtonProps) {
  const [state, formAction, pending] = useActionState(revokeSessionsAction, initialState);
  useActionToast(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending} title="Encerra qualquer sessão ativa deste usuário">
        Encerrar sessões
      </Button>
    </form>
  );
}
