import type { ServiceWithCustomer } from '../types';
import styles from './LabelCard.module.css';

interface LabelCardProps {
  service: ServiceWithCustomer;
}

const DEFAULT_PRODUCT_TITLE = 'Entrega de Produtos';

export function LabelCard({ service }: LabelCardProps) {
  const title = service.title === DEFAULT_PRODUCT_TITLE ? service.code : service.title;
  const address = [service.address, service.address_complement].filter(Boolean).join(' ');

  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <p className={styles.customerName}>{service.customerName ?? '—'}</p>

      <div className={styles.paymentRow}>
        <span className={styles.checkbox} aria-hidden="true" />
        <span>Pago</span>
      </div>
      <div className={styles.paymentRow}>
        <span className={styles.checkbox} aria-hidden="true" />
        <span>A Pagar R$ _____________</span>
      </div>

      <p className={styles.phone}>{service.phone_number}</p>
      <p className={styles.address}>{address}</p>
    </div>
  );
}
