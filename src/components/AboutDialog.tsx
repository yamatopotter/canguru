'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Mascot } from '@/components/Mascot';
import { APP_VERSION } from '@/lib/version';
import { InfoIcon, ExternalLinkIcon } from 'lucide-react';

const REPO_URL = 'https://github.com/matheuspbarreto/canguru';
const REPO_LABEL = 'matheuspbarreto/canguru';
const DOCKER_IMAGE = 'matheuspbarreto/canguru';

function AboutRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t py-2.5 text-sm first:border-t-0 first:pt-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="ghost" size="icon" aria-label="Sobre o sistema" />}>
        <InfoIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <Mascot size={28} />
            <DialogTitle>Canguru</DialogTitle>
          </div>
          <DialogDescription>
            Gerador de etiquetas de endereço (72mm) a partir das rotas de entrega cadastradas na
            Vuupt — uma etiqueta por pacote, prontas pro motoboy imprimir e sair entregando.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col">
          <AboutRow label="Versão">v{APP_VERSION}</AboutRow>
          <AboutRow label="Desenvolvido por">Matheus Barreto</AboutRow>
          <AboutRow label="Repositório">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              {REPO_LABEL}
              <ExternalLinkIcon className="size-3.5" />
            </a>
          </AboutRow>
          <AboutRow label="Imagem Docker">
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{DOCKER_IMAGE}</code>
          </AboutRow>
        </div>
      </DialogContent>
    </Dialog>
  );
}
