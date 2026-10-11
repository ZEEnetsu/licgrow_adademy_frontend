import { createContext, useContext } from 'react';

/**
 * Light or dark surface for the content renderer.
 *
 * Generated content is rendered on cream chapters and inside ink panels
 * (goal bands, CTA panels). Rather than every node guessing its background,
 * the nearest panel provides the tone and each renderer picks its colours
 * from TONES below.
 */
export const ToneContext = createContext('light');
export const useTone = () => TONES[useContext(ToneContext)];

export const TONES = {
  light: {
    dark: false,
    h: 'text-ink',
    p: 'text-plum',
    muted: 'text-plum/65',
    card: 'bg-white ring-1 ring-ink/[0.07] shadow-soft',
    chip: 'bg-white text-ink ring-1 ring-ink/10',
    step: 'bg-ink text-cream',
    line: 'bg-ink/10',
    rule: 'border-ink/8',
    accent: 'text-ember-deep',
  },
  dark: {
    dark: true,
    h: 'text-cream',
    p: 'text-cream/75',
    muted: 'text-cream/50',
    card: 'bg-white/[0.06] ring-1 ring-white/10',
    chip: 'bg-white/[0.08] text-cream ring-1 ring-white/15',
    step: 'bg-ember text-white',
    line: 'bg-white/15',
    rule: 'border-white/10',
    accent: 'text-peach',
  },
};
