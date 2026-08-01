import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionFilter } from './ActionFilter';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const ACTIVITY_LABELS: Record<string, string> = {
  'user.create': 'Usuário criado',
  'user.update': 'Usuário atualizado',
  'user.delete': 'Usuário removido',
  'user.toggle_active': 'Status do usuário alterado',
  'user.sessions_revoked': 'Sessões encerradas',
  'settings.update': 'Configurações atualizadas',
  'settings.logo_update': 'Logo atualizada',
  'settings.smtp_update': 'SMTP atualizado',
  'route.print': 'Etiquetas impressas',
  'auth.login_failed': 'Tentativa de login falhou',
  'auth.login_succeeded': 'Login realizado',
  'auth.password_reset_requested': 'Recuperação de senha solicitada',
};

const ACTIVITY_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'user.delete': 'destructive',
  'auth.login_failed': 'destructive',
  'user.sessions_revoked': 'destructive',
};

const PAGE_SIZE = 20;

function describeMetadata(action: string, metadataRaw: string | null): string | null {
  if (!metadataRaw) return null;

  let metadata: Record<string, unknown>;
  try {
    metadata = JSON.parse(metadataRaw);
  } catch {
    return null;
  }

  switch (action) {
    case 'route.print':
      return `${metadata.routeName ?? metadata.vuuptRouteId} (${metadata.serviceCount ?? '?'} etiquetas)`;
    case 'user.create':
    case 'user.update':
      return typeof metadata.username === 'string' ? `usuário: ${metadata.username}` : null;
    case 'user.toggle_active':
      return typeof metadata.username === 'string'
        ? `${metadata.username} → ${metadata.active ? 'ativo' : 'inativo'}`
        : null;
    case 'user.sessions_revoked':
      return typeof metadata.username === 'string' ? `usuário: ${metadata.username}` : null;
    case 'auth.login_failed':
    case 'auth.password_reset_requested':
      return typeof metadata.identifier === 'string' ? `usuário: ${metadata.identifier}` : null;
    case 'settings.smtp_update':
      return typeof metadata.host === 'string' ? `host: ${metadata.host}` : null;
    default:
      return null;
  }
}

interface AdminActivityPageProps {
  searchParams: Promise<{ page?: string; action?: string }>;
}

export default async function AdminActivityPage({ searchParams }: AdminActivityPageProps) {
  const { page: pageParam, action } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const where = action && action in ACTIVITY_LABELS ? { action } : undefined;

  const [entries, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.activityLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (targetPage > 1) params.set('page', String(targetPage));
    const query = params.toString();
    return query ? `?${query}` : '?';
  };

  const filterOptions = Object.entries(ACTIVITY_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Atividade</h1>
          <p className="text-sm text-muted-foreground">
            Ações administrativas, impressões e tentativas de login.
          </p>
        </div>
        <ActionFilter options={filterOptions} />
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quando</TableHead>
              <TableHead>Quem</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                  {entry.createdAt.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="font-medium">{entry.actorName}</TableCell>
                <TableCell>
                  <Badge variant={ACTIVITY_VARIANT[entry.action] ?? 'outline'}>
                    {ACTIVITY_LABELS[entry.action] ?? entry.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {describeMetadata(entry.action, entry.metadata) ?? '—'}
                </TableCell>
              </TableRow>
            ))}

            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Nenhuma atividade registrada ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {total > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>
              Mostrando {rangeStart}–{rangeEnd} de {total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                nativeButton={false}
                disabled={page <= 1}
                render={<Link href={pageHref(page - 1)} />}
              >
                <ChevronLeftIcon />
                <span className="sr-only">Página anterior</span>
              </Button>
              <span className="tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                nativeButton={false}
                disabled={page >= totalPages}
                render={<Link href={pageHref(page + 1)} />}
              >
                <ChevronRightIcon />
                <span className="sr-only">Próxima página</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
