'use client';

import { useActionState } from 'react';
import { updateZohoSettingsAction, type SettingsFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: SettingsFormState = {};

interface ZohoSettingsFormProps {
  clientId: string;
  clientSecretConfigured: boolean;
  redirectUri: string;
  accountsBaseUrl: string;
  configured: boolean;
}

export function ZohoSettingsForm({
  clientId,
  clientSecretConfigured,
  redirectUri,
  accountsBaseUrl,
  configured,
}: ZohoSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateZohoSettingsAction, initialState);
  useActionToast(state);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login via Zoho (OAuth)</CardTitle>
        <CardDescription>
          App registrado em{' '}
          <a
            href="https://api-console.zoho.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary hover:underline"
          >
            api-console.zoho.com
          </a>
          . O Redirect URI abaixo precisa estar cadastrado exatamente assim no console do Zoho. Mesmo
          configurado aqui, cada usuário só consegue entrar via Zoho se um administrador marcar
          &quot;Login via Zoho&quot; no cadastro dele.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div>{configured ? <Badge variant="success">Configurado</Badge> : <Badge variant="secondary">Não configurado</Badge>}</div>

        <form id="zoho-settings-form" action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zoho-client-id">Client ID</Label>
              <Input id="zoho-client-id" name="zohoClientId" defaultValue={clientId} autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zoho-client-secret">Client Secret</Label>
              <Input
                id="zoho-client-secret"
                name="zohoClientSecret"
                type="password"
                autoComplete="off"
                placeholder={clientSecretConfigured ? '•••• (deixe em branco para manter)' : ''}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zoho-redirect-uri">Redirect URI</Label>
            <Input
              id="zoho-redirect-uri"
              name="zohoRedirectUri"
              defaultValue={redirectUri}
              placeholder="https://seu-dominio.com.br/api/auth/zoho/callback"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="zoho-accounts-base-url">Accounts Base URL</Label>
            <Input
              id="zoho-accounts-base-url"
              name="zohoAccountsBaseUrl"
              defaultValue={accountsBaseUrl}
              placeholder="https://accounts.zoho.com"
            />
            <span className="text-xs text-muted-foreground">
              Ajuste conforme o datacenter da conta Zoho (.com, .eu, .in, .com.cn, .jp, .au). Deixe em
              branco para usar o padrão (.com).
            </span>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button type="submit" form="zoho-settings-form" disabled={pending}>
          {pending ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardFooter>
    </Card>
  );
}
