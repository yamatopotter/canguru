'use client';

import { useActionState, useState } from 'react';
import { updateSmtpSettingsAction, testSmtpAction, type SettingsFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: SettingsFormState = {};

interface SmtpSettingsFormProps {
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpFrom: string;
  smtpConfigured: boolean;
}

export function SmtpSettingsForm({
  smtpHost,
  smtpPort,
  smtpSecure,
  smtpUser,
  smtpFrom,
  smtpConfigured,
}: SmtpSettingsFormProps) {
  const [saveState, saveAction, saving] = useActionState(updateSmtpSettingsAction, initialState);
  const [testState, testAction, testing] = useActionState(testSmtpAction, initialState);
  useActionToast(saveState);
  useActionToast(testState);
  const [secure, setSecure] = useState(smtpSecure);
  const [secureTouched, setSecureTouched] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servidor de e-mail (SMTP)</CardTitle>
        <CardDescription>
          Usado para enviar o e-mail de recuperação de senha. Salve as configurações antes de testar a
          conexão.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <form action={saveAction} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="smtp-host">Host</Label>
              <Input id="smtp-host" name="smtpHost" defaultValue={smtpHost} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="smtp-port">Porta</Label>
              <Input
                id="smtp-port"
                name="smtpPort"
                defaultValue={smtpPort}
                onChange={(event) => {
                  // Ajuda a evitar o erro mais comum de SMTP: TLS implícito
                  // (secure=true) só é usado na porta 465. Em qualquer outra
                  // porta (587, 25...) a conexão começa sem criptografia e é
                  // promovida via STARTTLS — marcar "conexão segura" nesses
                  // casos quebra a conexão.
                  if (secureTouched) return;
                  setSecure(event.target.value.trim() === '465');
                }}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="smtp-user">Usuário</Label>
              <Input id="smtp-user" name="smtpUser" defaultValue={smtpUser} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="smtp-password">Senha</Label>
              <Input
                id="smtp-password"
                name="smtpPassword"
                type="password"
                autoComplete="off"
                placeholder={smtpConfigured ? '•••• (deixe em branco para manter)' : ''}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="smtp-from">E-mail remetente</Label>
            <Input id="smtp-from" name="smtpFrom" type="text" defaultValue={smtpFrom} placeholder="no-reply@empresa.com" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-2 font-normal">
              <Checkbox
                name="smtpSecure"
                value="on"
                checked={secure}
                onCheckedChange={(checked) => {
                  setSecureTouched(true);
                  setSecure(checked === true);
                }}
              />
              Conexão com TLS implícito
            </Label>
            <span className="text-xs text-muted-foreground">
              Marque só para a porta 465. Nas demais portas (587, 25...) deixe desmarcado — a conexão
              usa STARTTLS automaticamente, e marcar aqui causa erro de handshake TLS.
            </span>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end">
        <form action={testAction}>
          <Button type="submit" variant="outline" disabled={testing}>
            {testing ? 'Testando...' : 'Testar conexão SMTP'}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
