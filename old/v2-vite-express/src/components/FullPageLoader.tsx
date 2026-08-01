import styles from './FullPageLoader.module.css';

export function FullPageLoader() {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>Carregando...</span>
    </div>
  );
}
