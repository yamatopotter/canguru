'use client';

// Mock estático da etiqueta (dados de exemplo) — não usa o LabelCard real
// porque este é sempre visível na tela (pra refletir a margem ao digitar),
// enquanto o LabelCard usa @media print pra boa parte do próprio estilo.

interface LabelPreviewProps {
  paymentOptionsEnabled: boolean;
  signatureEnabled: boolean;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
}

export function LabelPreview({
  paymentOptionsEnabled,
  signatureEnabled,
  marginTopMm,
  marginBottomMm,
  marginLeftMm,
  marginRightMm,
}: LabelPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/40 p-4">
      <span className="text-xs font-medium text-muted-foreground">Pré-visualização da etiqueta impressa</span>
      <div
        className="flex w-[70mm] flex-col gap-[2mm] bg-white text-[#18181b] shadow-md"
        style={{
          paddingTop: `${marginTopMm}mm`,
          paddingBottom: `${marginBottomMm}mm`,
          paddingLeft: `${marginLeftMm}mm`,
          paddingRight: `${marginRightMm}mm`,
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
