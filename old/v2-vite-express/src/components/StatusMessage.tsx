import type { PropsWithChildren } from 'react';
import styles from './StatusMessage.module.css';

interface StatusMessageProps {
  tone?: 'info' | 'error' | 'success';
}

const TONE_CLASS = {
  info: styles.info,
  error: styles.error,
  success: styles.success,
};

export function StatusMessage({ tone = 'info', children }: PropsWithChildren<StatusMessageProps>) {
  return (
    <p className={`${styles.message} ${TONE_CLASS[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
