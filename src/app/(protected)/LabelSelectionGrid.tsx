'use client';

import { useState } from 'react';
import { LabelCard, type PaymentStatus } from '@/components/LabelCard';
import { Button } from '@/components/ui/button';
import { logPrintAction } from './actions';
import type { ServiceWithCustomer } from '@/types';
import { PrinterIcon } from 'lucide-react';

interface LabelSelectionGridProps {
  services: ServiceWithCustomer[];
  routeId: string;
  routeName: string;
  logoUrl: string | null;
  paymentOptionsEnabled: boolean;
  marginTopMm: number;
  marginBottomMm: number;
}

interface PaymentInfo {
  status: PaymentStatus;
  amount: string;
}

const EMPTY_PAYMENT: PaymentInfo = { status: null, amount: '' };

export function LabelSelectionGrid({
  services,
  routeId,
  routeName,
  logoUrl,
  paymentOptionsEnabled,
  marginTopMm,
  marginBottomMm,
}: LabelSelectionGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set(services.map((service) => service.id)));
  const [payments, setPayments] = useState<Record<number, PaymentInfo>>({});

  function toggle(id: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((current) =>
      current.size === services.length ? new Set() : new Set(services.map((service) => service.id)),
    );
  }

  function setPaymentStatus(id: number, status: PaymentStatus) {
    setPayments((current) => ({
      ...current,
      // Trocar de status limpa o valor digitado — "Pago" não tem valor a
      // pagar, e desmarcar tudo também não deve deixar um valor órfão.
      [id]: { status, amount: status === 'a_pagar' ? (current[id]?.amount ?? '') : '' },
    }));
  }

  function setPaymentAmount(id: number, amount: string) {
    setPayments((current) => ({ ...current, [id]: { status: 'a_pagar', amount } }));
  }

  const selectedServices = services.filter((service) => selectedIds.has(service.id));
  const lastSelectedId = selectedServices.at(-1)?.id;

  async function handlePrint() {
    await logPrintAction(routeId, routeName, selectedServices.length);
    window.print();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={toggleAll}>
            {selectedIds.size === services.length ? 'Desmarcar todas' : 'Selecionar todas'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} de {services.length} selecionadas
          </span>
        </div>

        <Button type="button" onClick={handlePrint} disabled={selectedServices.length === 0}>
          <PrinterIcon />
          Imprimir Etiquetas ({selectedServices.length})
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 print:block">
        {services.map((service) => {
          const payment = payments[service.id] ?? EMPTY_PAYMENT;
          return (
            <LabelCard
              key={service.id}
              service={service}
              selected={selectedIds.has(service.id)}
              onToggleSelected={() => toggle(service.id)}
              isLastSelected={service.id === lastSelectedId}
              logoUrl={logoUrl}
              paymentOptionsEnabled={paymentOptionsEnabled}
              paymentStatus={payment.status}
              onPaymentStatusChange={(status) => setPaymentStatus(service.id, status)}
              amount={payment.amount}
              onAmountChange={(value) => setPaymentAmount(service.id, value)}
              marginTopMm={marginTopMm}
              marginBottomMm={marginBottomMm}
            />
          );
        })}
      </div>
    </div>
  );
}
