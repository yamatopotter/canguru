import type { CSSProperties } from 'react';
import { LABEL_FONT_WEIGHT_VALUE, type LabelFontSizes, type LabelStyle } from '@/types';

// Converte o LabelStyle em estilos inline. A escala só vale pra etiqueta 10x15.
export function labelTextStyles(style: LabelStyle, is10x15: boolean) {
  const factor = is10x15 ? style.scale : 1;
  const fontWeight = LABEL_FONT_WEIGHT_VALUE[style.weight];
  return {
    factor,
    font: (section: keyof LabelFontSizes): CSSProperties => ({
      fontSize: `${style.sizes[section] * factor}pt`,
      fontWeight,
    }),
  };
}
