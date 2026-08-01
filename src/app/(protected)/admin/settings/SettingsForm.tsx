'use client';

import { useActionState } from 'react';
import { updateSettingsAction, type SettingsFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: SettingsFormState = {};

interface SettingsFormProps {
  companyName: string;
  vuuptTokenConfigured: boolean;
  vuuptTokenMasked: string;
}

export function SettingsForm({ companyName, vuuptTokenConfigured, vuuptTokenMasked }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);
  useActionToast(state);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresa e integração</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company-name">Nome da empresa</Label>
            <Input id="company-name" name="companyName" defaultValue={companyName} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vuupt-token">Token da API da Vuupt</Label>
            <Input
              id="vuupt-token"
              name="vuuptApiToken"
              type="password"
              placeholder={vuuptTokenConfigured ? vuuptTokenMasked : 'Nenhum token configurado'}
              autoComplete="off"
            />
            <span className="text-xs text-muted-foreground">
              Cole o JWT gerado pela Vuupt (com ou sem o prefixo &quot;Bearer&quot; — funciona dos dois
              jeitos). Deixe em branco para manter o token atual. O valor fica salvo apenas no
              servidor, nunca no navegador.
            </span>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
