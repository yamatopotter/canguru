'use client';

// Mock estático da etiqueta (dados de exemplo) — não usa o LabelCard real
// porque este é sempre visível na tela (pra refletir a margem ao digitar),
// enquanto o LabelCard usa @media print pra boa parte do próprio estilo.

import { LABEL_10X15_MARGIN_MM, type LabelSize, type LabelStyle } from '@/types';
import { FieldLine } from '@/components/LabelCard';
import { labelTextStyles } from '@/lib/labelStyle';

// Reduz a etiqueta 10x15 só na tela, pra caber na coluna de pré-visualização.
const PREVIEW_SCALE_10X15 = 0.65;

interface LabelPreviewProps {
  paymentOptionsEnabled: boolean;
  documentEnabled: boolean;
  signatureEnabled: boolean;
  labelSize: LabelSize;
  labelStyle: LabelStyle;
  dateEnabled: boolean;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
}

export function LabelPreview({
  paymentOptionsEnabled,
  documentEnabled,
  signatureEnabled,
  labelSize,
  labelStyle,
  dateEnabled,
  marginTopMm,
  marginBottomMm,
  marginLeftMm,
  marginRightMm,
}: LabelPreviewProps) {
  const is10x15 = labelSize === '10x15';
  const fixedMargin = LABEL_10X15_MARGIN_MM;
  const { factor, font } = labelTextStyles(labelStyle, is10x15);
  const boxSize = `${labelStyle.sizes.payment * factor * 0.4}mm`;
  const amountWidth = `${labelStyle.sizes.payment * factor * 2}mm`;

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
          <p className="m-0 tracking-wide uppercase" style={font('title')}>
            PEDIDO 1234
          </p>
        </div>

        <p className="m-0 leading-tight" style={font('name')}>
          Cliente Exemplo
        </p>

        {paymentOptionsEnabled && (
          <>
            <div className="flex items-center gap-[2mm]" style={font('payment')}>
              <span
                className="shrink-0 rounded-sm border-[1.5pt] border-[#18181b]"
                style={{ width: boxSize, height: boxSize }}
              />
              <span>Pago</span>
            </div>
            <div className="flex items-center gap-[2mm]" style={font('payment')}>
              <span
                className="shrink-0 rounded-sm border-[1.5pt] border-[#18181b]"
                style={{ width: boxSize, height: boxSize }}
              />
              <span>A Pagar R$</span>
              <span className="border-b border-[#18181b]" style={{ width: amountWidth }}>
                &nbsp;
              </span>
            </div>
          </>
        )}

        <p className="m-0" style={font('phone')}>
          +55 21 99999-9999
        </p>
        <p className="m-0 leading-snug text-[#52525b]" style={font('address')}>
          Rua Exemplo, 123 - Bairro, Cidade - UF, 00000-000
        </p>

        {dateEnabled && (
          <p suppressHydrationWarning className="m-0" style={font('date')}>
            Data: {new Date().toLocaleDateString('pt-BR')}
          </p>
        )}

        {documentEnabled && (
          <FieldLine label="Documento:" style={font('fields')} lineClassName="border-[#18181b]" />
        )}

        {signatureEnabled && (
          <FieldLine label="Assinatura:" style={font('fields')} lineClassName="border-[#18181b]" />
        )}
      </div>
    </div>
  );
}
