import { useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import type { UpdateUserInput } from '../../api/admin';
import type { AppUser, Role } from '../../types';
import formStyles from '../../styles/form.module.css';
import styles from './AdminUsersPage.module.css';

interface EditUserRowProps {
  user: AppUser;
  onCancel: () => void;
  onSubmit: (input: UpdateUserInput) => Promise<void>;
}

export function EditUserRow({ user, onCancel, onSubmit }: EditUserRowProps) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<Role>(user.role);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const input: UpdateUserInput = { name, role };
      if (password) input.password = password;
      await onSubmit(input);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <tr>
      <td colSpan={6}>
        <form onSubmit={handleSubmit} className={styles.editRowForm}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor={`edit-name-${user.id}`}>
              Nome
            </label>
            <input
              id={`edit-name-${user.id}`}
              className={formStyles.input}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor={`edit-role-${user.id}`}>
              Papel
            </label>
            <select
              id={`edit-role-${user.id}`}
              className={formStyles.input}
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option value="OPERATOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          {user.provider === 'LOCAL' && (
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor={`edit-password-${user.id}`}>
                Nova senha (opcional)
              </label>
              <input
                id={`edit-password-${user.id}`}
                type="password"
                className={formStyles.input}
                minLength={8}
                placeholder="Deixe em branco para manter"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          )}

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </td>
    </tr>
  );
}
