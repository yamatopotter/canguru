'use client';

// Mock estático da etiqueta (dados de exemplo) — não usa o LabelCard real
// porque este é sempre visível na tela (pra refletir a margem ao digitar),
// enquanto o LabelCard usa @media print pra boa parte do próprio estilo.

import { LABEL_10X15_MARGIN_MM, type LabelSize } from '@/types';

// Mesmo fator de ampliação do LabelCard (ver LABEL_10X15_ZOOM), reduzido pra
// a etiqueta 10x15 caber na coluna de pré-visualização.
const ZOOM_10X15 = 1.5;
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
  const fixedMargin = LABEL_10X15_MARGIN_MM / ZOOM_10X15;

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/40 p-4">
      <span className="text-xs font-medium text-muted-foreground">Pré-visualização da etiqueta impressa</span>
      <div
        className="flex flex-col gap-[2mm] bg-white text-[#18181b] shadow-md"
        style={{
          width: is10x15 ? `${100 / ZOOM_10X15}mm` : '70mm',
          minHeight: is10x15 ? `${150 / ZOOM_10X15}mm` : undefined,
          paddingTop: `${is10x15 ? fixedMargin : marginTopMm}mm`,
          paddingBottom: `${is10x15 ? fixedMargin : marginBottomMm}mm`,
          paddingLeft: `${is10x15 ? fixedMargin : marginLeftMm}mm`,
          paddingRight: `${is10x15 ? fixedMargin : marginRightMm}mm`,
          zoom: is10x15 ? ZOOM_10X15 * PREVIEW_SCALE_10X15 : undefined,
        }}
      >
        <div className="flex items-start justify-between gap-[2mm]">
          <p className="m-0 text-[13pt] font-bold tracking-wide uppercase">PEDIDO 1234</p>
        </div>

        <p className="m-0 text-[16pt] leading-tight font-bold">Cliente Exemplo</p>

        {paymentOptionsEnabled && (
          <>
            <div className="flex items-center gap-[2mm] text-[11pt]">
              <span className="size-[4.5mm] shrink-0 rounded-sm border-[1.5pt] border-[#18181b]" />
              <span>Pago</span>
            </div>
            <div className="flex items-center gap-[2mm] text-[11pt]">
              <span className="size-[4.5mm] shrink-0 rounded-sm border-[1.5pt] border-[#18181b]" />
              <span>A Pagar R$</span>
              <span className="w-[22mm] border-b border-[#18181b] font-bold">&nbsp;</span>
            </div>
          </>
        )}

        <p className="m-0 text-[11pt] font-semibold">+55 21 99999-9999</p>
        <p className="m-0 text-[11pt] leading-snug text-[#52525b]">
          Rua Exemplo, 123 - Bairro, Cidade - UF, 00000-000
        </p>

        {dateEnabled && (
          <p suppressHydrationWarning className="m-0 text-[11pt] font-semibold">Data: {new Date().toLocaleDateString('pt-BR')}</p>
        )}

        {signatureEnabled && (
          <div className="mt-[3mm] flex items-end gap-[2mm] text-[11pt]">
            <span className="shrink-0">Assinatura:</span>
            <span className="h-[8mm] flex-1 border-b border-[#18181b]" />
          </div>
        )}
      </div>
    </div>
  );
}
