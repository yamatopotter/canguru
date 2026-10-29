'use client';

import type { ServiceWithCustomer } from '../types';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';

export type PaymentStatus = 'pago' | 'a_pagar' | null;

interface LabelCardProps {
  service: ServiceWithCustomer;
  selected: boolean;
  onToggleSelected: () => void;
  isLastSelected: boolean;
  logoUrl?: string | null;
  paymentOptionsEnabled: boolean;
  signatureEnabled: boolean;
  paymentStatus: PaymentStatus;
  onPaymentStatusChange: (status: PaymentStatus) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
}

const DEFAULT_PRODUCT_TITLE = 'Entrega de Produtos';

// Input nativo em vez de um botão fingindo ser radio: a marcação (o
// "pontinho" do radio) é desenhada pelo próprio motor de renderização do
// navegador, não por CSS — então ela sai na impressão de qualquer jeito,
// sem depender de "gráficos de segundo plano" estar ligado (que é como a
// grande maioria imprime, já que a etiqueta nem usa cor de fundo mesmo).
function PaymentOption({
  id,
  name,
  label,
  checked,
  onSelect,
  onDeselect,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-[2mm] text-[11pt] print:cursor-default">
      <input
        type="radio"
        id={id}
        name={name}
        checked={checked}
        onChange={onSelect}
        // "onChange" só dispara ao trocar de valor — clicar de novo na opção
        // já marcada não gera onChange, mas gera onClick, e é assim que
        // desmarcar tudo (voltar pro estado "nenhuma opção") funciona.
        onClick={() => {
          if (checked) onDeselect();
        }}
        className="size-[4.5mm] shrink-0 accent-foreground"
      />
      {label}
    </label>
  );
}

// Dimensões pensadas para bobina de impressora térmica de 72mm. A largura
// impressa fica em 70mm (não os 72mm cheios) de propósito: impressoras
// térmicas de "72mm" raramente imprimem de ponta a ponta — sobra uma
// margem de segurança pros dois lados pra evitar corte de conteúdo, o que
// a margem configurada no driver/diálogo de impressão sozinha não resolve
// (ela reduz a área útil de uma página que já está no limite, não aumenta
// a área realmente imprimível do cabeçote térmico).
export function LabelCard({
  service,
  selected,
  onToggleSelected,
  isLastSelected,
  logoUrl,
  paymentOptionsEnabled,
  signatureEnabled,
  paymentStatus,
  onPaymentStatusChange,
  amount,
  onAmountChange,
  marginTopMm,
  marginBottomMm,
  marginLeftMm,
  marginRightMm,
}: LabelCardProps) {
  const title = service.title === DEFAULT_PRODUCT_TITLE ? service.code : service.title;
  const address = [service.address, service.address_complement].filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        'label-card relative flex w-[70mm] min-h-[60mm] flex-col gap-[2mm] rounded-md border bg-card p-[4mm] shadow-sm transition-opacity',
        'print:mx-auto print:min-h-0 print:rounded-none print:border-none print:shadow-none',
        selected ? (isLastSelected ? 'print:break-after-auto' : 'print:break-after-page') : 'print:hidden',
        !selected && 'opacity-40',
      )}
      style={
        {
          '--label-margin-top': `${marginTopMm}mm`,
          '--label-margin-bottom': `${marginBottomMm}mm`,
          '--label-margin-left': `${marginLeftMm}mm`,
          '--label-margin-right': `${marginRightMm}mm`,
        } as React.CSSProperties
      }
    >
      <Checkbox
        checked={selected}
        onCheckedChange={onToggleSelected}
        aria-label={selected ? 'Remover esta etiqueta da impressão' : 'Incluir esta etiqueta na impressão'}
        className="absolute top-[3mm] right-[3mm] print:hidden"
      />

      {/* Logo no canto superior direito, na mesma linha do pedido — evita
          gastar uma linha inteira só com a logo e deixa mais papel pro
          conteúdo que o motoboy precisa ler. */}
      <div className="flex items-start justify-between gap-[2mm] pr-7 print:pr-0">
        <p className="m-0 text-[13pt] font-bold tracking-wide text-primary uppercase print:text-foreground">
          {title}
        </p>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-[7mm] max-w-[26mm] shrink-0 object-contain" />
        )}
      </div>

      <p className="m-0 text-[16pt] leading-tight font-bold text-foreground">{service.customerName ?? '—'}</p>

      {paymentOptionsEnabled && (
        <div className="flex flex-col gap-[1mm]">
          <div
            className={cn(
              '-mx-[2mm] rounded-sm px-[2mm] py-[0.5mm] print:mx-0 print:rounded-none print:bg-transparent print:px-0 print:py-0',
              paymentStatus === 'pago' && 'bg-muted',
            )}
          >
            <PaymentOption
              id={`payment-${service.id}-pago`}
              name={`payment-${service.id}`}
              label="Pago"
              checked={paymentStatus === 'pago'}
              onSelect={() => onPaymentStatusChange('pago')}
              onDeselect={() => onPaymentStatusChange(null)}
            />
          </div>

          <div
            className={cn(
              '-mx-[2mm] flex items-center gap-[2mm] rounded-sm px-[2mm] py-[0.5mm] text-[11pt] print:mx-0 print:rounded-none print:bg-transparent print:px-0 print:py-0',
              paymentStatus === 'a_pagar' && 'bg-muted',
            )}
          >
            <PaymentOption
              id={`payment-${service.id}-a-pagar`}
              name={`payment-${service.id}`}
              label="A Pagar R$"
              checked={paymentStatus === 'a_pagar'}
              onSelect={() => onPaymentStatusChange('a_pagar')}
              onDeselect={() => onPaymentStatusChange(null)}
            />
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              disabled={paymentStatus !== 'a_pagar'}
              aria-label="Valor a pagar"
              placeholder="0,00"
              className={cn(
                'w-[22mm] rounded-sm border bg-background px-[1.5mm] text-[11pt] font-bold outline-none transition-colors disabled:text-muted-foreground',
                'print:rounded-none print:border-x-0 print:border-t-0 print:border-b print:border-foreground print:bg-transparent print:px-0 print:text-foreground',
                paymentStatus === 'a_pagar' ? 'border-primary' : 'border-border',
              )}
            />
          </div>
        </div>
      )}

      <p className="m-0 text-[11pt] font-semibold">{service.phone_number}</p>
      <p className="m-0 text-[11pt] leading-snug text-muted-foreground print:text-foreground">{address}</p>

      {signatureEnabled && (
        <div className="mt-[3mm] flex items-end gap-[2mm] text-[11pt]">
          <span className="shrink-0">Assinatura:</span>
          <span className="h-[8mm] flex-1 border-b border-foreground" />
        </div>
      )}
    </div>
  );
}
