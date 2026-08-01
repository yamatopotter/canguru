import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchRouteServices } from '../api/vuupt';
import { ApiError } from '../api/http';
import type { ServiceWithCustomer } from '../types';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { LabelCard } from '../components/LabelCard';
import { StatusMessage } from '../components/StatusMessage';
import styles from './PrintLabelsPage.module.css';

type Status = 'loading' | 'ready' | 'error' | 'missing-route';

export function PrintLabelsPage() {
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get('routeId');
  const [services, setServices] = useState<ServiceWithCustomer[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!routeId) {
      setStatus('missing-route');
      return;
    }

    setStatus('loading');

    fetchRouteServices(routeId)
      .then((response) => {
        setServices(response.services);
        setStatus('ready');
      })
      .catch((err) => {
        setErrorMessage(
          err instanceof ApiError ? err.message : 'Não foi possível carregar os endereços desta rota.',
        );
        setStatus('error');
      });
  }, [routeId]);

  const hasLabels = services.length > 0;

  return (
    <Layout
      actions={
        status === 'ready' && hasLabels ? (
          <Button onClick={() => window.print()}>Imprimir Etiquetas</Button>
        ) : undefined
      }
    >
      <div className={styles.main}>
        {status === 'missing-route' && (
          <div className={styles.statusWrapper}>
            <StatusMessage tone="error">Nenhuma rota foi informada. Volte e selecione uma rota.</StatusMessage>
          </div>
        )}

        {status === 'loading' && (
          <div className={styles.statusWrapper}>
            <StatusMessage tone="info">Carregando endereços...</StatusMessage>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.statusWrapper}>
            <StatusMessage tone="error">{errorMessage}</StatusMessage>
          </div>
        )}

        {status === 'ready' && !hasLabels && (
          <div className={styles.statusWrapper}>
            <StatusMessage tone="info">Nenhum endereço encontrado para esta rota.</StatusMessage>
          </div>
        )}

        {hasLabels && (
          <div className={styles.labelList}>
            {services.map((service) => (
              <LabelCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
