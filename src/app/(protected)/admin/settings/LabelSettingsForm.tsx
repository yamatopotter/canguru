'use client';

import { useActionState, useState } from 'react';
import { updateLabelSettingsAction, type SettingsFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActionToast } from '@/hooks/useActionToast';
import { LabelPreview } from './LabelPreview';
import {
  DEFAULT_LABEL_STYLE,
  LABEL_10X15_MARGIN_MM,
  LABEL_FONT_SECTIONS,
  LABEL_FONT_SIZE_RANGE,
  LABEL_FONT_WEIGHT_OPTIONS,
  LABEL_SCALE_RANGE,
  LABEL_SIZE_OPTIONS,
  type LabelFontSizes,
  type LabelFontWeight,
  type LabelSize,
  type LabelStyle,
} from '@/types';

const initialState: SettingsFormState = {};

interface LabelSettingsFormProps {
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

export function LabelSettingsForm({
  paymentOptionsEnabled,
  documentEnabled,
  signatureEnabled,
  labelSize: initialLabelSize,
  labelStyle: initialLabelStyle,
  dateEnabled,
  marginTopMm,
  marginBottomMm,
  marginLeftMm,
  marginRightMm,
}: LabelSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateLabelSettingsAction, initialState);
  useActionToast(state);

  // Estado local (não o valor salvo) alimenta a pré-visualização em tempo
  // real, antes mesmo de salvar.
  const [paymentOptions, setPaymentOptions] = useState(paymentOptionsEnabled);
  const [documentField, setDocumentField] = useState(documentEnabled);
  const [signature, setSignature] = useState(signatureEnabled);
  const [labelSize, setLabelSize] = useState<LabelSize>(initialLabelSize);
  const [showDate, setShowDate] = useState(dateEnabled);
  const [fontWeight, setFontWeight] = useState<LabelFontWeight>(initialLabelStyle.weight);
  const [scale, setScale] = useState(String(initialLabelStyle.scale));
  const [fontSizes, setFontSizes] = useState<Record<keyof LabelFontSizes, string>>(
    () =>
      Object.fromEntries(
        LABEL_FONT_SECTIONS.map(({ key }) => [key, String(initialLabelStyle.sizes[key])]),
      ) as Record<keyof LabelFontSizes, string>,
  );

  // Valor inválido/vazio na digitação cai no padrão só na pré-visualização;
  // o servidor valida de verdade ao salvar.
  const previewScale = Number(scale);
  const previewStyle: LabelStyle = {
    weight: fontWeight,
    scale: Number.isFinite(previewScale) && previewScale > 0 ? previewScale : DEFAULT_LABEL_STYLE.scale,
    sizes: Object.fromEntries(
      LABEL_FONT_SECTIONS.map(({ key }) => {
        const size = Number(fontSizes[key]);
        return [key, Number.isFinite(size) && size > 0 ? size : DEFAULT_LABEL_STYLE.sizes[key]];
      }),
    ) as unknown as LabelFontSizes,
  };
  const [marginTop, setMarginTop] = useState(String(marginTopMm));
  const [marginBottom, setMarginBottom] = useState(String(marginBottomMm));

  const [marginLeft, setMarginLeft] = useState(String(marginLeftMm));
  const [marginRight, setMarginRight] = useState(String(marginRightMm));

  const previewMarginTop = Number(marginTop);
  const previewMarginBottom = Number(marginBottom);
  const previewMarginLeft = Number(marginLeft);
  const previewMarginRight = Number(marginRight);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etiqueta impressa</CardTitle>
        <CardDescription>
          Controla o que aparece em cada etiqueta gerada a partir de uma rota da Vuupt.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <form action={formAction} className="flex flex-col gap-4">
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              name="paymentOptionsEnabled"
              value="on"
              checked={paymentOptions}
              onCheckedChange={(checked) => setPaymentOptions(checked === true)}
            />
            Mostrar campos de &quot;Pago&quot; / &quot;A Pagar&quot;
          </Label>
          <span className="-mt-2.5 text-xs text-muted-foreground">
            Desmarque pra remover essas opções das etiquetas, caso a rota não trabalhe com
            cobrança na entrega.
          </span>

          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              name="dateEnabled"
              value="on"
              checked={showDate}
              onCheckedChange={(checked) => setShowDate(checked === true)}
            />
            Mostrar data de impressão
          </Label>
          <span className="-mt-2.5 text-xs text-muted-foreground">
            A data de hoje é preenchida automaticamente na etiqueta e não pode ser editada.
          </span>

          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              name="documentEnabled"
              value="on"
              checked={documentField}
              onCheckedChange={(checked) => setDocumentField(checked === true)}
            />
            Mostrar campo de documento de quem recebe
          </Label>
          <span className="-mt-2.5 text-xs text-muted-foreground">
            Adiciona uma linha &quot;Documento&quot; (RG/CPF) acima da assinatura, pra quem recebe
            preencher à mão.
          </span>

          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              name="signatureEnabled"
              value="on"
              checked={signature}
              onCheckedChange={(checked) => setSignature(checked === true)}
            />
            Mostrar campo de assinatura do cliente
          </Label>
          <span className="-mt-2.5 text-xs text-muted-foreground">
            Adiciona uma linha &quot;Assinatura&quot; no fim de cada etiqueta, pra o cliente assinar
            o recebimento.
          </span>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Tamanho da etiqueta</legend>
            {(Object.keys(LABEL_SIZE_OPTIONS) as LabelSize[]).map((size) => (
              <Label key={size} className="flex items-center gap-2 font-normal">
                <input
                  type="radio"
                  name="labelSize"
                  value={size}
                  checked={labelSize === size}
                  onChange={() => setLabelSize(size)}
                  className="size-4 accent-primary"
                />
                {LABEL_SIZE_OPTIONS[size]}
              </Label>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-medium">Aparência do texto</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {(Object.keys(LABEL_FONT_WEIGHT_OPTIONS) as LabelFontWeight[]).map((weight) => (
                <Label key={weight} className="flex items-center gap-2 font-normal">
                  <input
                    type="radio"
                    name="fontWeight"
                    value={weight}
                    checked={fontWeight === weight}
                    onChange={() => setFontWeight(weight)}
                    className="size-4 accent-primary"
                  />
                  {LABEL_FONT_WEIGHT_OPTIONS[weight]}
                </Label>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Fonte mais leve reduz a carga na impressora, mas traço muito fino pode falhar em
              impressora fraca.
            </span>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="label-scale">Escala do conteúdo (só etiqueta 10x15)</Label>
              <Input
                id="label-scale"
                name="scale"
                type="number"
                min={LABEL_SCALE_RANGE.min}
                max={LABEL_SCALE_RANGE.max}
                step={0.05}
                value={scale}
                onChange={(event) => setScale(event.target.value)}
                required
              />
              <span className="text-xs text-muted-foreground">
                Multiplica os tamanhos de fonte abaixo (1 = tamanho original).
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {LABEL_FONT_SECTIONS.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <Label htmlFor={`font-${key}`}>{label} (pt)</Label>
                  <Input
                    id={`font-${key}`}
                    name={`font_${key}`}
                    type="number"
                    min={LABEL_FONT_SIZE_RANGE.min}
                    max={LABEL_FONT_SIZE_RANGE.max}
                    step={0.5}
                    value={fontSizes[key]}
                    onChange={(event) => setFontSizes((current) => ({ ...current, [key]: event.target.value }))}
                    required
                  />
                </div>
              ))}
            </div>
          </fieldset>

          {labelSize === '10x15' ? (
            <>
              {/* Valores atuais seguem sendo enviados pra não zerar as margens da térmica ao salvar. */}
              <input type="hidden" name="marginTop" value={marginTop} />
              <input type="hidden" name="marginBottom" value={marginBottom} />
              <input type="hidden" name="marginLeft" value={marginLeft} />
              <input type="hidden" name="marginRight" value={marginRight} />
              <span className="text-xs text-muted-foreground">
                A etiqueta 10x15 usa margem fixa de {LABEL_10X15_MARGIN_MM / 10}cm nos quatro lados.
              </span>
            </>
          ) : (
          <>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="margin-top">Margem superior (mm)</Label>
              <Input
                id="margin-top"
                name="marginTop"
                type="number"
                min={0}
                max={15}
                step={0.5}
                value={marginTop}
                onChange={(event) => setMarginTop(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="margin-bottom">Margem inferior (mm)</Label>
              <Input
                id="margin-bottom"
                name="marginBottom"
                type="number"
                min={0}
                max={15}
                step={0.5}
                value={marginBottom}
                onChange={(event) => setMarginBottom(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="margin-left">Margem esquerda (mm)</Label>
              <Input
                id="margin-left"
                name="marginLeft"
                type="number"
                min={0}
                max={15}
                step={0.5}
                value={marginLeft}
                onChange={(event) => setMarginLeft(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="margin-right">Margem direita (mm)</Label>
              <Input
                id="margin-right"
                name="marginRight"
                type="number"
                min={0}
                max={15}
                step={0.5}
                value={marginRight}
                onChange={(event) => setMarginRight(event.target.value)}
                required
              />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            Espaço em branco ao redor do conteúdo de cada etiqueta. Evite margens laterais muito
            pequenas pra impressora térmica não cortar o texto.
          </span>
          </>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>

        <LabelPreview
          paymentOptionsEnabled={paymentOptions}
          documentEnabled={documentField}
          signatureEnabled={signature}
          labelSize={labelSize}
          labelStyle={previewStyle}
          dateEnabled={showDate}
          marginTopMm={Number.isFinite(previewMarginTop) ? previewMarginTop : 0}
          marginBottomMm={Number.isFinite(previewMarginBottom) ? previewMarginBottom : 0}
          marginLeftMm={Number.isFinite(previewMarginLeft) ? previewMarginLeft : 0}
          marginRightMm={Number.isFinite(previewMarginRight) ? previewMarginRight : 0}
        />
      </CardContent>
    </Card>
  );
}
