import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchAuthProviders, ZOHO_LOGIN_URL } from '../api/auth';
import { fetchPublicSettings, type PublicSettings } from '../api/settings';
import { ApiError } from '../api/http';
import { Button } from '../components/Button';
import { StatusMessage } from '../components/StatusMessage';
import formStyles from '../styles/form.module.css';
import styles from './LoginPage.module.css';

const ZOHO_ERROR_MESSAGES: Record<string, string> = {
  zoho: 'Não foi possível concluir o login com Zoho. Tente novamente.',
  not_registered:
    'Sua conta Zoho ainda não está cadastrada neste sistema. Peça a um administrador para criar seu acesso.',
  inactive: 'Seu usuário está desativado. Fale com um administrador.',
};

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zohoEnabled, setZohoEnabled] = useState(false);
  const [branding, setBranding] = useState<PublicSettings>({ companyName: 'Minha Empresa', logoUrl: null });

  useEffect(() => {
    fetchAuthProviders()
      .then((providers) => setZohoEnabled(providers.zoho))
      .catch(() => setZohoEnabled(false));

    fetchPublicSettings()
      .then(setBranding)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const zohoError = searchParams.get('error');
    if (zohoError) {
      setError(ZOHO_ERROR_MESSAGES[zohoError] ?? 'Não foi possível fazer login. Tente novamente.');
    }
  }, [searchParams]);

  if (status === 'authenticated') {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from;
    return <Navigate to={from?.pathname ?? '/'} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.companyName} className={styles.logoImg} />
          ) : (
            <span className={styles.logoFallback} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 32 32">
                <path
                  d="M8 9l8 14 8-14"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
          <span className={styles.companyName}>{branding.companyName}</span>
        </div>

        <h1 className={styles.title}>Entrar</h1>

        {error && <StatusMessage tone="error">{error}</StatusMessage>}

        <form onSubmit={handleSubmit} className={styles.form} style={{ marginTop: error ? 16 : 0 }}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              className={formStyles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className={formStyles.input}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" disabled={submitting} className={styles.submitButton}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {zohoEnabled && (
          <>
            <div className={styles.divider}>ou</div>
            <Button
              type="button"
              variant="secondary"
              className={styles.zohoButton}
              onClick={() => {
                window.location.href = ZOHO_LOGIN_URL;
              }}
            >
              Entrar com Zoho
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
