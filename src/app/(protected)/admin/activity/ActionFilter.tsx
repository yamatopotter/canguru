'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ActionFilterProps {
  options: { value: string; label: string }[];
}

export function ActionFilter({ options }: ActionFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentAction = searchParams.get('action') ?? 'all';

  function handleChange(value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      params.delete('action');
    } else {
      params.set('action', value);
    }
    params.delete('page');
    const query = params.toString();
    router.push(query ? `?${query}` : '?');
  }

  const labelByValue: Record<string, string> = Object.fromEntries(options.map((o) => [o.value, o.label]));

  return (
    <Select value={currentAction} onValueChange={handleChange}>
      <SelectTrigger className="w-56" aria-label="Filtrar por ação">
        <SelectValue>{(value: string | null) => (value && value !== 'all' ? labelByValue[value] : 'Todas as ações')}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as ações</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
