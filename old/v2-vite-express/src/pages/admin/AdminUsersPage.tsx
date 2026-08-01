import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { StatusMessage } from '../../components/StatusMessage';
import { ApiError } from '../../api/http';
import { createUser, deleteUser, fetchUsers, updateUser, type CreateUserInput, type UpdateUserInput } from '../../api/admin';
import type { AppUser } from '../../types';
import { useAuth } from '../../auth/AuthContext';
import { CreateUserForm } from './CreateUserForm';
import { EditUserRow } from './EditUserRow';
import styles from './AdminUsersPage.module.css';

type LoadStatus = 'loading' | 'ready' | 'error';
type Feedback = { tone: 'success' | 'error'; message: string };

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function load() {
    setStatus('loading');
    fetchUsers()
      .then((response) => {
        setUsers(response.users);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(load, []);

  async function handleCreate(input: CreateUserInput) {
    try {
      await createUser(input);
      setFeedback({ tone: 'success', message: 'Usuário criado com sucesso.' });
      setShowCreateForm(false);
      load();
    } catch (err) {
      setFeedback({ tone: 'error', message: errorMessage(err, 'Não foi possível criar o usuário.') });
    }
  }

  async function handleUpdate(id: string, input: UpdateUserInput) {
    try {
      await updateUser(id, input);
      setFeedback({ tone: 'success', message: 'Usuário atualizado.' });
      setEditingId(null);
      load();
    } catch (err) {
      setFeedback({ tone: 'error', message: errorMessage(err, 'Não foi possível atualizar o usuário.') });
    }
  }

  async function handleToggleActive(user: AppUser) {
    try {
      await updateUser(user.id, { active: !user.active });
      load();
    } catch (err) {
      setFeedback({ tone: 'error', message: errorMessage(err, 'Não foi possível atualizar o usuário.') });
    }
  }

  async function handleDelete(user: AppUser) {
    if (!window.confirm(`Remover o usuário "${user.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await deleteUser(user.id);
      setFeedback({ tone: 'success', message: 'Usuário removido.' });
      load();
    } catch (err) {
      setFeedback({ tone: 'error', message: errorMessage(err, 'Não foi possível remover o usuário.') });
    }
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Usuários</h1>
          <Button
            onClick={() => {
              setShowCreateForm((value) => !value);
              setEditingId(null);
            }}
          >
            {showCreateForm ? 'Cancelar' : 'Novo usuário'}
          </Button>
        </div>

        {feedback && <StatusMessage tone={feedback.tone}>{feedback.message}</StatusMessage>}

        {showCreateForm && <CreateUserForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />}

        {status === 'loading' && <StatusMessage tone="info">Carregando usuários...</StatusMessage>}
        {status === 'error' && (
          <StatusMessage tone="error">Não foi possível carregar os usuários. Atualize a página.</StatusMessage>
        )}

        {status === 'ready' && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Papel</th>
                  <th>Login</th>
                  <th>Status</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) =>
                  editingId === user.id ? (
                    <EditUserRow
                      key={user.id}
                      user={user}
                      onCancel={() => setEditingId(null)}
                      onSubmit={(input) => handleUpdate(user.id, input)}
                    />
                  ) : (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role === 'ADMIN' ? 'Administrador' : 'Operador'}</td>
                      <td>{user.provider === 'ZOHO' ? 'Zoho' : 'E-mail/senha'}</td>
                      <td>
                        <span className={user.active ? styles.badgeActive : styles.badgeInactive}>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => {
                            setEditingId(user.id);
                            setShowCreateForm(false);
                          }}
                        >
                          Editar
                        </button>
                        <button type="button" className={styles.linkButton} onClick={() => handleToggleActive(user)}>
                          {user.active ? 'Desativar' : 'Ativar'}
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            type="button"
                            className={styles.linkButtonDanger}
                            onClick={() => handleDelete(user)}
                          >
                            Remover
                          </button>
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
