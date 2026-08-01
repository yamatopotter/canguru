'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { Route } from '@/types';
import { ChevronsUpDownIcon, RefreshCwIcon } from 'lucide-react';

interface RouteSelectProps {
  routes: Route[];
  value: string;
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('pt-BR');
}

function routeLabel(route: Route) {
  return `${route.name} — ${formatDate(route.created_at)}`;
}

export function RouteSelect({ routes, value }: RouteSelectProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedRoute = routes.find((route) => String(route.id) === value);

  function handleSelect(routeId: string) {
    setOpen(false);
    if (routeId === value) return;
    startTransition(() => {
      router.push(`/?routeId=${routeId}`);
    });
  }

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="routeId">Selecione a rota a ser impressa</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                id="routeId"
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={isPending}
                className="flex-1 justify-between font-normal"
              />
            }
          >
            <span className="truncate">
              {isPending ? 'Carregando...' : (selectedRoute ? routeLabel(selectedRoute) : 'Selecione uma rota')}
            </span>
            <ChevronsUpDownIcon className="opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-(--anchor-width) p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar rota por nome ou data..." />
              <CommandList>
                <CommandEmpty>Nenhuma rota encontrada.</CommandEmpty>
                <CommandGroup>
                  {routes.map((route) => (
                    <CommandItem
                      key={route.id}
                      value={routeLabel(route)}
                      data-checked={String(route.id) === value}
                      onSelect={() => handleSelect(String(route.id))}
                    >
                      {routeLabel(route)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isPending}
          title="Atualizar lista de rotas"
        >
          <RefreshCwIcon className={cn(isPending && 'animate-spin')} />
        </Button>
      </div>
    </div>
  );
}
