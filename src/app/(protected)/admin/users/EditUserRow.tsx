'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateUserAction, type UserFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { ROLE_LABELS, type AppUser, type Role } from '@/types';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: UserFormState = {};
const TABLE_COLUMN_COUNT = 7;

interface EditUserRowProps {
  user: AppUser;
  onCancel: () => void;
}

export function EditUserRow({ user, onCancel }: EditUserRowProps) {
  const [state, formAction, pending] = useActionState(updateUserAction, initialState);
  useActionToast(state);
  const [email, setEmail] = useState(user.email ?? '');
  const [oauthEnabled, setOauthEnabled] = useState(user.oauthEnabled);
  const [role, setRole] = useState<Role>(user.role);

  useEffect(() => {
    if (state.success) onCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <TableRow>
      <TableCell colSpan={TABLE_COLUMN_COUNT} className="whitespace-normal">
        <form action={formAction} className="flex flex-wrap items-end gap-4 py-2">
          <input type="hidden" name="id" value={user.id} />

          <div className="flex min-w-45 flex-1 flex-col gap-1.5">
            <Label htmlFor={`edit-name-${user.id}`}>Nome</Label>
            <Input id={`edit-name-${user.id}`} name="name" defaultValue={user.name} required />
          </div>

          <div className="flex min-w-45 flex-1 flex-col gap-1.5">
            <Label htmlFor={`edit-email-${user.id}`}>E-mail (opcional)</Label>
            <Input
              id={`edit-email-${user.id}`}
              name="email"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="flex min-w-45 flex-1 flex-col gap-1.5">
            <Label htmlFor={`edit-role-${user.id}`}>Papel</Label>
            <Select name="role" value={role} onValueChange={(value) => setRole((value as Role) ?? user.role)}>
              <SelectTrigger id={`edit-role-${user.id}`} className="w-full">
                <SelectValue>{(value: Role | null) => (value ? ROLE_LABELS[value] : null)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPERATOR">{ROLE_LABELS.OPERATOR}</SelectItem>
                <SelectItem value="ADMIN">{ROLE_LABELS.ADMIN}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-45 flex-1 flex-col gap-1.5">
            <Label htmlFor={`edit-password-${user.id}`}>Nova senha (opcional)</Label>
            <Input
              id={`edit-password-${user.id}`}
              name="password"
              type="password"
              minLength={8}
              placeholder="Deixe em branco para manter"
            />
          </div>

          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              name="oauthEnabled"
              value="on"
              checked={oauthEnabled}
              disabled={!email}
              onCheckedChange={(checked) => setOauthEnabled(checked === true)}
            />
            Login via Zoho
          </Label>

          <div className="flex gap-2.5">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </TableCell>
    </TableRow>
  );
}
