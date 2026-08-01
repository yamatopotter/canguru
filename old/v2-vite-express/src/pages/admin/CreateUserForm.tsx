import { useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import type { CreateUserInput } from '../../api/admin';
import type { AuthProviderName, Role } from '../../types';
import formStyles from '../../styles/form.module.css';
import styles from './AdminUsersPage.module.css';

interface CreateUserFormProps {
  onSubmit: (input: CreateUserInput) => Promise<void>;
  onCancel: () => void;
}

export function CreateUserForm({ onSubmit, onCancel }: CreateUserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('OPERATOR');
  const [provider, setProvider] = useState<AuthProviderName>('LOCAL');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        email,
        role,
        provider,
        password: provider === 'LOCAL' ? password : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formPanel}>
      <div className={formStyles.row}>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="new-name">
            Nome
          </label>
          <input
            id="new-name"
            className={formStyles.input}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="new-email">
            E-mail
          </label>
          <input
            id="new-email"
            type="email"
            className={formStyles.input}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </div>

      <div className={formStyles.row}>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="new-role">
            Papel
          </label>
          <select
            id="new-role"
            className={formStyles.input}
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
          >
            <option value="OPERATOR">Operador</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="new-provider">
            Forma de login
          </label>
          <select
            id="new-provider"
            className={formStyles.input}
            value={provider}
            onChange={(event) => setProvider(event.target.value as AuthProviderName)}
          >
            <option value="LOCAL">E-mail e senha</option>
            <option value="ZOHO">Zoho (OAuth)</option>
          </select>
        </div>
      </div>

      {provider === 'LOCAL' ? (
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="new-password">
            Senha provisória
          </label>
          <input
            id="new-password"
            type="password"
            className={formStyles.input}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span className={formStyles.hint}>Mínimo de 8 caracteres. O usuário pode trocar depois.</span>
        </div>
      ) : (
        <p className={formStyles.hint}>
          O acesso é liberado automaticamente no primeiro login pelo Zoho feito com este e-mail.
        </p>
      )}

      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Criar usuário'}
        </Button>
      </div>
    </form>
  );
}
