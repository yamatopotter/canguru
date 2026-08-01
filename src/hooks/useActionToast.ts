'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

interface ActionToastState {
  error?: string;
  success?: string;
}

/** Dispara um toast sempre que uma useActionState retornar error/success. */
export function useActionToast(state: ActionToastState) {
  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state.error, state.success]);
}
