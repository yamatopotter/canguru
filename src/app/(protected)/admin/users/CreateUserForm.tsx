'use client';

import { useActionState, useEffect, useState } from 'react';
import { createUserAction, type UserFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ROLE_LABELS, type Role } from '@/types';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: UserFormState = {};

interface CreateUserFormProps {
  onCancel: () => void;
}

export function CreateUserForm({ onCancel }: CreateUserFormProps) {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);
  useActionToast(state);
  const [email, setEmail] = useState('');
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const [role, setRole] = useState<Role>('OPERATOR');

  useEffect(() => {
    if (state.success) onCancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-name">Nome</Label>
              <Input id="new-name" name="name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-username">Usuário (login)</Label>
              <Input id="new-username" name="username" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-role">Papel</Label>
              <Select name="role" value={role} onValueChange={(value) => setRole((value as Role) ?? 'OPERATOR')}>
                <SelectTrigger id="new-role" className="w-full">
                  <SelectValue>{(value: Role | null) => (value ? ROLE_LABELS[value] : null)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATOR">{ROLE_LABELS.OPERATOR}</SelectItem>
                  <SelectItem value="ADMIN">{ROLE_LABELS.ADMIN}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-email">E-mail (opcional)</Label>
              <Input
                id="new-email"
                name="email"
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <span className="text-xs text-muted-foreground">
                Necessário para recuperação de senha e login via Zoho.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">Senha (opcional)</Label>
            <Input id="new-password" name="password" type="password" minLength={8} />
            <span className="text-xs text-muted-foreground">
              Mínimo de 8 caracteres. Deixe em branco se o acesso será só via Zoho.
            </span>
          </div>

          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              name="oauthEnabled"
              value="on"
              checked={oauthEnabled}
              disabled={!email}
              onCheckedChange={(checked) => setOauthEnabled(checked === true)}
            />
            Permitir login via Zoho (OAuth)
          </Label>
          {!email && <span className="text-xs text-muted-foreground">Informe um e-mail para poder habilitar o Zoho.</span>}

          <div className="flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
