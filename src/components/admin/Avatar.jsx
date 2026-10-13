import { cx } from "./cx.js";

const TONES = [
  "bg-tint-lavender text-accent",
  "bg-tint-mint text-success",
  "bg-tint-slate text-text-primary",
  "bg-accent-muted text-accent",
  "bg-brand text-brand-contrast",
];

const SIZE = {
  xs: "h-7 w-7 rounded-full text-[10px]",
  sm: "h-8 w-8 rounded-full text-[11px]",
  md: "h-10 w-10 rounded-full text-[13px]",
  lg: "h-14 w-14 rounded-2xl text-lg",
  xl: "h-16 w-16 rounded-2xl text-xl",
};

/** Same name, same tone, on every page and every visit. */
const toneFor = (name = "") => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return TONES[hash % TONES.length];
};

/**
 * First letters of the first and last word. `Array.from` splits by code
 * point, so a Devanagari or emoji-leading name doesn't get half a character.
 */
const initialsOf = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] ?? "" : "";
  return (first + last).toUpperCase();
};

/**
 * Initials in a tinted disc — the landing page's "RL" contact avatar. Every
 * admin used to share one stock photo; initials at least tell people apart.
 */
export default function Avatar({ name, src, size = "md", className }) {
  const classes = cx("grid shrink-0 place-items-center overflow-hidden font-display font-bold select-none", SIZE[size], className);

  if (src) return <img src={src} alt="" className={cx(classes, "object-cover")} />;

  return (
    <span aria-hidden className={cx(classes, toneFor(name))}>
      {initialsOf(name)}
    </span>
  );
}
