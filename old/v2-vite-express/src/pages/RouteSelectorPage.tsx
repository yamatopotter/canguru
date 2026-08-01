import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRoutes } from '../api/vuupt';
import { ApiError } from '../api/http';
import type { Route } from '../types';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { StatusMessage } from '../components/StatusMessage';
import formStyles from '../styles/form.module.css';
import styles from './RouteSelectorPage.module.css';

type Status = 'loading' | 'ready' | 'error';

export function RouteSelectorPage() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchRoutes()
      .then((response) => {
        setRoutes(response.routes);
        setSelectedRouteId(response.routes[0] ? String(response.routes[0].id) : '');
        setStatus('ready');
      })
      .catch((err) => {
        setErrorMessage(
          err instanceof ApiError ? err.message : 'Não foi possível carregar as rotas. Tente novamente.',
        );
        setStatus('error');
      });
  }, []);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedRouteId) return;
    navigate(`/print?routeId=${selectedRouteId}`);
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Gerador de Impressos de Endereços</h1>

          {status === 'loading' && <StatusMessage tone="info">Carregando rotas...</StatusMessage>}

          {status === 'error' && <StatusMessage tone="error">{errorMessage}</StatusMessage>}

          {status === 'ready' && routes.length === 0 && (
            <StatusMessage tone="info">Nenhuma rota encontrada nos últimos dias.</StatusMessage>
          )}

          {status === 'ready' && routes.length > 0 && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="routeId">
                  Selecione a rota a ser impressa
                </label>
                <select
                  id="routeId"
                  name="routeId"
                  className={formStyles.input}
                  value={selectedRouteId}
                  onChange={(event) => setSelectedRouteId(event.target.value)}
                >
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name} — {formatDate(route.created_at)}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className={styles.submitButton}>
                Gerar impressos da rota
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('pt-BR');
}
