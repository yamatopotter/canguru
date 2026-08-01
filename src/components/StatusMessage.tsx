import type { PropsWithChildren } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StatusMessageProps {
  tone?: 'info' | 'error' | 'success';
}

const TONE_VARIANT = {
  info: 'info',
  error: 'destructive',
  success: 'success',
} as const;

export function StatusMessage({ tone = 'info', children }: PropsWithChildren<StatusMessageProps>) {
  return (
    <Alert variant={TONE_VARIANT[tone]} role={tone === 'error' ? 'alert' : 'status'}>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
