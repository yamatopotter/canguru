'use client';

import { useActionState, useRef } from 'react';
import { uploadLogoAction, type SettingsFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpIcon } from 'lucide-react';
import { useActionToast } from '@/hooks/useActionToast';

const initialState: SettingsFormState = {};

interface LogoUploadFormProps {
  logoUrl: string | null;
}

export function LogoUploadForm({ logoUrl }: LogoUploadFormProps) {
  const [state, formAction, pending] = useActionState(uploadLogoAction, initialState);
  useActionToast(state);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo da empresa</CardTitle>
        <CardDescription>
          Aparece no cabeçalho do sistema e na tela de login. PNG, JPEG, WEBP ou SVG, até 2MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex items-center gap-5">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo atual da empresa" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="px-2 text-center text-xs text-muted-foreground">Sem logo</span>
            )}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              disabled={pending}
              onChange={(event) => {
                if (event.target.files?.length) {
                  event.target.form?.requestSubmit();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageUpIcon />
              {pending ? 'Enviando...' : logoUrl ? 'Trocar logo' : 'Enviar logo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
