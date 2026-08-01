'use client';

import { useActionState, useId } from 'react';
import { deleteUserAction, type UserFormState } from './actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: UserFormState = {};

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  disabled?: boolean;
}

export function DeleteUserButton({ userId, userName, disabled }: DeleteUserButtonProps) {
  const formId = useId();
  const [state, formAction] = useActionState(deleteUserAction, initialState);
  useActionToast(state);

  return (
    <>
      {/* Formulário fora do diálogo (que é renderizado em um portal) — o
          botão de confirmar se associa a ele via o atributo `form`. */}
      <form id={formId} action={formAction}>
        <input type="hidden" name="userId" value={userId} />
      </form>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={disabled}
              title={disabled ? 'Não é possível remover o último administrador ativo.' : undefined}
            />
          }
        >
          Remover
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Remover o usuário &quot;{userName}&quot;? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" form={formId} variant="destructive">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
