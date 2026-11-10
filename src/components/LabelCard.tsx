'use client';

import { LABEL_10X15_MARGIN_MM, LABEL_10X15_PRINT_OFFSET_TOP_MM, type LabelSize, type ServiceWithCustomer } from '../types';
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
  documentEnabled: boolean;
  signatureEnabled: boolean;
  labelSize: LabelSize;
  // Data de impressão já formatada (preenchida automaticamente); null = não exibir.
  dateLabel: string | null;
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

// Estilos de texto por tamanho de etiqueta. A 10x15 NÃO usa zoom: a Argox OS214
// roda com fonte fraca (0,8A em vez de 2,4A), então o que pesa é a quantidade de
// pontos pretos queimados por linha. Em vez de ampliar tudo (que engrossa todos os
// traços em 50%), usa tamanhos reais com peso semibold e sem negrito pesado.
export const LABEL_TEXT = {
  '72mm': {
    title: 'text-[13pt] font-bold',
    name: 'text-[16pt] font-bold',
    body: 'text-[11pt]',
    bodyStrong: 'text-[11pt] font-semibold',
    checkbox: 'size-[4.5mm]',
    amountWidth: 'w-[22mm]',
  },
  '10x15': {
    title: 'text-[13pt] font-semibold',
    name: 'text-[20pt] font-semibold',
    body: 'text-[13pt]',
    bodyStrong: 'text-[13pt] font-semibold',
    checkbox: 'size-[5.5mm]',
    amountWidth: 'w-[30mm]',
  },
} as const;

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
  textClass,
  checkboxClass,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
  onDeselect: () => void;
  textClass: string;
  checkboxClass: string;
}) {
  return (
    <label htmlFor={id} className={cn('flex items-center gap-[2mm] print:cursor-default', textClass)}>
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
        className={cn('shrink-0 accent-foreground', checkboxClass)}
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
  documentEnabled,
  signatureEnabled,
  labelSize,
  dateLabel,
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
  const is10x15 = labelSize === '10x15';
  const text = LABEL_TEXT[labelSize];
  // Em 10x15 a margem é fixa (0,5cm) nos quatro lados, ignorando as configuráveis.
  const marginTop = is10x15 ? LABEL_10X15_MARGIN_MM + LABEL_10X15_PRINT_OFFSET_TOP_MM : marginTopMm;
  const marginBottom = is10x15 ? LABEL_10X15_MARGIN_MM : marginBottomMm;
  const marginLeft = is10x15 ? LABEL_10X15_MARGIN_MM : marginLeftMm;
  const marginRight = is10x15 ? LABEL_10X15_MARGIN_MM : marginRightMm;

  return (
    <div
      className={cn(
        'label-card relative flex flex-col gap-[2mm] rounded-md border bg-card p-[4mm] shadow-sm transition-opacity',
        is10x15 ? 'label-card-10x15' : 'w-[70mm] min-h-[60mm]',
        'print:mx-auto print:min-h-0 print:rounded-none print:border-none print:shadow-none',
        selected ? (isLastSelected ? 'print:break-after-auto' : 'print:break-after-page') : 'print:hidden',
        !selected && 'opacity-40',
      )}
      style={
        {
          '--label-margin-top': `${marginTop}mm`,
          '--label-margin-bottom': `${marginBottom}mm`,
          '--label-margin-left': `${marginLeft}mm`,
          '--label-margin-right': `${marginRight}mm`,
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
        <p className={cn('m-0 tracking-wide text-primary uppercase print:text-foreground', text.title)}>
          {title}
        </p>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-[7mm] max-w-[26mm] shrink-0 object-contain" />
        )}
      </div>

      <p className={cn('m-0 leading-tight text-foreground', text.name)}>{service.customerName ?? '—'}</p>

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
              textClass={text.body}
              checkboxClass={text.checkbox}
            />
          </div>

          <div
            className={cn(
              '-mx-[2mm] flex items-center gap-[2mm] rounded-sm px-[2mm] py-[0.5mm] print:mx-0 print:rounded-none print:bg-transparent print:px-0 print:py-0',
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
              textClass={text.body}
              checkboxClass={text.checkbox}
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
                text.amountWidth,
                text.bodyStrong,
                'rounded-sm border bg-background px-[1.5mm] outline-none transition-colors disabled:text-muted-foreground',
                'print:rounded-none print:border-x-0 print:border-t-0 print:border-b print:border-foreground print:bg-transparent print:px-0 print:text-foreground',
                paymentStatus === 'a_pagar' ? 'border-primary' : 'border-border',
              )}
            />
          </div>
        </div>
      )}

      <p className={cn('m-0', text.bodyStrong)}>{service.phone_number}</p>
      <p className={cn('m-0 leading-snug text-muted-foreground print:text-foreground', text.body)}>{address}</p>

      {dateLabel && <p className={cn('m-0', text.bodyStrong)}>Data: {dateLabel}</p>}

      {documentEnabled && (
        <div className={cn('mt-[2mm] flex items-end gap-[2mm]', text.body)}>
          <span className="shrink-0">Documento:</span>
          <span className="h-[7mm] flex-1 border-b-[0.5mm] border-foreground" />
        </div>
      )}

      {signatureEnabled && (
        <div className={cn('mt-[3mm] flex items-end gap-[2mm]', text.body)}>
          <span className="shrink-0">Assinatura:</span>
          {/* Tracejada: linha contínua queima uma fileira inteira de pontos de uma vez,
              o pior caso pra fonte fraca da impressora. */}
          <span className="h-[8mm] flex-1 border-b-[0.5mm] border-dashed border-foreground" />
        </div>
      )}
    </div>
  );
}
