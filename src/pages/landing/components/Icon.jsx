/**
 * The landing page's icon set.
 *
 * Every mark here is a single-weight outline drawn on a 24×24 grid in
 * `currentColor` — no emoji, no fills, no second hue. Emoji rendered as
 * whatever multi-colour glyph the viewer's OS happened to ship, which meant
 * the same page looked different on Windows, iOS and Android and none of those
 * palettes had anything to do with lic-navy. An outline in currentColor
 * inherits the surface it sits on, so a mark works on white, on ice, and
 * reversed out on navy without a second asset.
 *
 * Strokes are 1.5 at 24px and `vector-effect: non-scaling-stroke` keeps that
 * weight honest when a mark is scaled up in a stat tile.
 */

const PATHS = {
  /* — preparation / study — */
  documents: (
    <>
      <path d="M15 3H8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6l-3-3Z" />
      <path d="M15 3v3a1 1 0 0 0 1 1h3" />
      <path d="M4 8v11a2 2 0 0 0 2 2h9" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H14a3.5 3.5 0 0 1 0 7h-4a3.5 3.5 0 0 0 0 7h5.5" />
    </>
  ),
  /* — people / guidance — */
  mentor: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  conversation: (
    <>
      <path d="M20 14a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  partnership: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0" />
      <path d="M16.2 5.3a3.2 3.2 0 0 1 0 5.9" />
      <path d="M17.8 13.4a6.5 6.5 0 0 1 3.7 6.1" />
    </>
  ),
  /* — time — */
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  hourglass: (
    <>
      <path d="M7 3h10M7 21h10" />
      <path d="M8 3v3.5a4 4 0 0 0 1.6 3.2L12 12l-2.4 2.3A4 4 0 0 0 8 17.5V21" />
      <path d="M16 3v3.5a4 4 0 0 1-1.6 3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2V21" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M10 2.5h4M12 9.5V13l2.5 1.5M18.5 6.5 20 5" />
    </>
  ),
  /* — money / growth — */
  growth: (
    <>
      <path d="M3 20h18" />
      <path d="M7 20v-6M12 20V9M17 20v-9" />
      <path d="m14.5 5 3-1 .8 3" />
      <path d="M8 10.5 12 6l2.5 2" />
    </>
  ),
  /* — trust / assurance — */
  shieldCheck: (
    <>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.9 8.3 7 9.5 4.1-1.2 7-5.2 7-9.5V5.8L12 3Z" />
      <path d="m9.2 11.8 2 2 3.6-3.8" />
    </>
  ),
  badgeCheck: (
    <>
      <path d="M12 3.2 14 5l2.6-.2.5 2.6 2.2 1.4-1.1 2.4 1.1 2.4-2.2 1.4-.5 2.6L14 19l-2 1.8L10 19l-2.6.2-.5-2.6-2.2-1.4L5.8 12 4.7 9.6l2.2-1.4.5-2.6L10 5l2-1.8Z" />
      <path d="m9.5 12 1.8 1.8 3.4-3.6" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="m8.8 13.6-1.3 7 4.5-2.4 4.5 2.4-1.3-7" />
    </>
  ),
  /* — media / data — */
  video: (
    <>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="m15 10.5 5-2.8v8.6l-5-2.8Z" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7.5 16v-4M12 16V8M16.5 16v-6" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2" />
      <path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.9" />
    </>
  ),
  /* — misc — */
  heart: <path d="M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.6 12 20 12 20Z" />,
  star: (
    <path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6Z" />
  ),
  arrowRight: <path d="M4 12h15m-5.5-5.5L19 12l-5.5 5.5" />,
};

/**
 * @param {string} name  key of PATHS
 * @param {boolean} filled  solid rather than outline (only used by `star`)
 */
export default function Icon({ name, className = 'h-5 w-5', filled = false, label }) {
  const d = PATHS[name];
  if (!d) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {d}
    </svg>
  );
}
