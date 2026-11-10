import { describe, expect, it } from 'vitest';
import { labelTextStyles } from '@/lib/labelStyle';
import { DEFAULT_LABEL_STYLE } from '@/types';

describe('labelTextStyles', () => {
  it('aplica a escala só na etiqueta 10x15', () => {
    const style = { ...DEFAULT_LABEL_STYLE, scale: 1.25 };

    expect(labelTextStyles(style, true).font('name').fontSize).toBe('20pt');
    expect(labelTextStyles(style, false).font('name').fontSize).toBe('16pt');
  });

  it('traduz o peso da fonte', () => {
    const base = DEFAULT_LABEL_STYLE;

    expect(labelTextStyles({ ...base, weight: 'normal' }, false).font('title').fontWeight).toBe(400);
    expect(labelTextStyles({ ...base, weight: 'semibold' }, false).font('title').fontWeight).toBe(600);
    expect(labelTextStyles({ ...base, weight: 'bold' }, false).font('title').fontWeight).toBe(700);
  });
});
