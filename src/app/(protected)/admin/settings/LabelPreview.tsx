'use client';

// Mock estático da etiqueta (dados de exemplo) — não usa o LabelCard real
// porque este é sempre visível na tela (pra refletir a margem ao digitar),
// enquanto o LabelCard usa @media print pra boa parte do próprio estilo.

import { LABEL_10X15_MARGIN_MM, type LabelSize } from '@/types';
import { LABEL_TEXT } from '@/components/LabelCard';
import { cn } from '@/lib/utils';

// Reduz a etiqueta 10x15 só na tela, pra caber na coluna de pré-visualização.
const PREVIEW_SCALE_10X15 = 0.65;

interface LabelPreviewProps {
  paymentOptionsEnabled: boolean;
  signatureEnabled: boolean;
  labelSize: LabelSize;
  dateEnabled: boolean;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
}

export function LabelPreview({
  paymentOptionsEnabled,
  signatureEnabled,
  labelSize,
  dateEnabled,
  marginTopMm,
  marginBottomMm,
  marginLeftMm,
  marginRightMm,
}: LabelPreviewProps) {
  const is10x15 = labelSize === '10x15';
  const fixedMargin = LABEL_10X15_MARGIN_MM;
  const text = LABEL_TEXT[labelSize];

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/40 p-4">
      <span className="text-xs font-medium text-muted-foreground">Pré-visualização da etiqueta impressa</span>
      <div
        className="flex flex-col gap-[2mm] bg-white text-[#18181b] shadow-md"
        style={{
          width: is10x15 ? '100mm' : '70mm',
          minHeight: is10x15 ? '148mm' : undefined,
          paddingTop: `${is10x15 ? fixedMargin : marginTopMm}mm`,
          paddingBottom: `${is10x15 ? fixedMargin : marginBottomMm}mm`,
          paddingLeft: `${is10x15 ? fixedMargin : marginLeftMm}mm`,
          paddingRight: `${is10x15 ? fixedMargin : marginRightMm}mm`,
          zoom: is10x15 ? PREVIEW_SCALE_10X15 : undefined,
        }}
      >
        <div className="flex items-start justify-between gap-[2mm]">
          <p className={cn('m-0 tracking-wide uppercase', text.title)}>PEDIDO 1234</p>
        </div>

        <p className={cn('m-0 leading-tight', text.name)}>Cliente Exemplo</p>

        {paymentOptionsEnabled && (
          <>
            <div className={cn('flex items-center gap-[2mm]', text.body)}>
              <span className={cn('shrink-0 rounded-sm border-[1.5pt] border-[#18181b]', text.checkbox)} />
              <span>Pago</span>
            </div>
            <div className={cn('flex items-center gap-[2mm]', text.body)}>
              <span className={cn('shrink-0 rounded-sm border-[1.5pt] border-[#18181b]', text.checkbox)} />
              <span>A Pagar R$</span>
              <span className={cn('border-b border-[#18181b]', text.amountWidth, text.bodyStrong)}>&nbsp;</span>
            </div>
          </>
        )}

        <p className={cn('m-0', text.bodyStrong)}>+55 21 99999-9999</p>
        <p className={cn('m-0 leading-snug text-[#52525b]', text.body)}>
          Rua Exemplo, 123 - Bairro, Cidade - UF, 00000-000
        </p>

        {dateEnabled && (
          <p suppressHydrationWarning className={cn('m-0', text.bodyStrong)}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
        )}

        {signatureEnabled && (
          <div className={cn('mt-[3mm] flex items-end gap-[2mm]', text.body)}>
            <span className="shrink-0">Assinatura:</span>
            <span className="h-[8mm] flex-1 border-b-[0.5mm] border-dashed border-[#18181b]" />
          </div>
        )}
      </div>
    </div>
  );
}
