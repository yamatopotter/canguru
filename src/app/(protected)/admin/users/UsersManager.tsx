'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROLE_LABELS, type AppUser } from '@/types';
import { CreateUserForm } from './CreateUserForm';
import { EditUserRow } from './EditUserRow';
import { DeleteUserButton } from './DeleteUserButton';
import { ToggleActiveButton } from './ToggleActiveButton';
import { RevokeSessionsButton } from './RevokeSessionsButton';
import { PlusIcon, XIcon } from 'lucide-react';

interface UsersManagerProps {
  users: AppUser[];
  currentUserId: string;
  activeAdminCount: number;
}

export function UsersManager({ users, currentUserId, activeAdminCount }: UsersManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6 pb-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-foreground">Usuários</h1>
        <Button
          onClick={() => {
            setShowCreateForm((value) => !value);
            setEditingId(null);
          }}
        >
          {showCreateForm ? <XIcon /> : <PlusIcon />}
          {showCreateForm ? 'Cancelar' : 'Novo usuário'}
        </Button>
      </div>

      {showCreateForm && <CreateUserForm onCancel={() => setShowCreateForm(false)} />}

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead aria-label="Ações" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              if (editingId === user.id) {
                return <EditUserRow key={user.id} user={user} onCancel={() => setEditingId(null)} />;
              }

              const isLastActiveAdmin = user.role === 'ADMIN' && user.active && activeAdminCount <= 1;

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      {user.hasPassword && <Badge variant="outline">Senha</Badge>}
                      {user.oauthEnabled && <Badge variant="outline">Zoho</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.active ? 'success' : 'secondary'}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(user.id);
                          setShowCreateForm(false);
                        }}
                      >
                        Editar
                      </Button>

                      <ToggleActiveButton userId={user.id} active={user.active} disabled={isLastActiveAdmin} />

                      {user.id !== currentUserId && <RevokeSessionsButton userId={user.id} />}

                      {user.id !== currentUserId && (
                        <DeleteUserButton userId={user.id} userName={user.name} disabled={isLastActiveAdmin} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
