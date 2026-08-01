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

const initialState: SettingsFormState = {};

interface LabelSettingsFormProps {
  paymentOptionsEnabled: boolean;
  marginTopMm: number;
  marginBottomMm: number;
}

export function LabelSettingsForm({
  paymentOptionsEnabled,
  marginTopMm,
  marginBottomMm,
}: LabelSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateLabelSettingsAction, initialState);
  useActionToast(state);

  // Estado local (não o valor salvo) alimenta a pré-visualização em tempo
  // real, antes mesmo de salvar.
  const [paymentOptions, setPaymentOptions] = useState(paymentOptionsEnabled);
  const [marginTop, setMarginTop] = useState(String(marginTopMm));
  const [marginBottom, setMarginBottom] = useState(String(marginBottomMm));

  const previewMarginTop = Number(marginTop);
  const previewMarginBottom = Number(marginBottom);

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
          </div>
          <span className="text-xs text-muted-foreground">
            Espaço em branco acima e abaixo do conteúdo de cada etiqueta. A margem lateral fica
            fixa (segurança contra corte pela impressora térmica).
          </span>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>

        <LabelPreview
          paymentOptionsEnabled={paymentOptions}
          marginTopMm={Number.isFinite(previewMarginTop) ? previewMarginTop : 0}
          marginBottomMm={Number.isFinite(previewMarginBottom) ? previewMarginBottom : 0}
        />
      </CardContent>
    </Card>
  );
}
