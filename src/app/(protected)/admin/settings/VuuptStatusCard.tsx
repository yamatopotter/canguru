'use client';

import { useActionState } from 'react';
import { testVuuptConnectionAction, type SettingsFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: SettingsFormState = {};

interface VuuptStatusCardProps {
  configured: boolean;
  expiresAtLabel: string | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

export function VuuptStatusCard({ configured, expiresAtLabel, isExpired, isExpiringSoon }: VuuptStatusCardProps) {
  const [state, testAction, testing] = useActionState(testVuuptConnectionAction, initialState);
  useActionToast(state);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status da integração com a Vuupt</CardTitle>
        <CardDescription>Token configurado na seção acima.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!configured && <Badge variant="secondary">Nenhum token configurado</Badge>}
          {configured && isExpired && <Badge variant="destructive">Token expirado</Badge>}
          {configured && !isExpired && isExpiringSoon && (
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">Expira em breve</Badge>
          )}
          {configured && !isExpired && !isExpiringSoon && expiresAtLabel && (
            <Badge variant="success">Válido</Badge>
          )}
          {expiresAtLabel && <span className="text-sm text-muted-foreground">Expira em {expiresAtLabel}</span>}
          {configured && !expiresAtLabel && (
            <span className="text-sm text-muted-foreground">Não foi possível ler a validade do token.</span>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <form action={testAction}>
          <Button type="submit" variant="outline" disabled={testing || !configured}>
            {testing ? 'Testando...' : 'Testar conexão com a Vuupt'}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
