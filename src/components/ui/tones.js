/* ── tinted surfaces shared by several chapters ────────────────────────── */

export const TONE_BG = {
  peach: 'bg-peach-soft',
  mint: 'bg-mint-soft',
  sand: 'bg-sand',
  sage: 'bg-sage/15',
  plum: 'bg-plum/10',
  ember: 'bg-ember/10',
  white: 'bg-white',
  ink: 'bg-ink',
};

export const TONE_ICON = {
  peach: 'bg-peach text-ink',
  mint: 'bg-mint text-ink',
  sand: 'bg-white text-ink',
  sage: 'bg-sage text-white',
  plum: 'bg-plum text-cream',
  ember: 'bg-ember text-white',
  white: 'bg-ink text-cream',
  ink: 'bg-ember text-white',
};

/* fills for the line-art illustrations: a soft wash plus one stronger accent */
export const TONE_ART = {
  peach: { soft: 'fill-peach/45', accent: 'fill-ember/70' },
  mint: { soft: 'fill-mint/60', accent: 'fill-sage' },
  sand: { soft: 'fill-white/80', accent: 'fill-peach' },
  sage: { soft: 'fill-sage/25', accent: 'fill-sage' },
  plum: { soft: 'fill-plum/12', accent: 'fill-plum/70' },
  ember: { soft: 'fill-ember/12', accent: 'fill-ember/80' },
};
