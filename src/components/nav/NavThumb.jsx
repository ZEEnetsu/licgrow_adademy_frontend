import Icon from '../ui/Icon.jsx';

/*
 * Small illustrated tiles for the Solutions menu — each a miniature of the
 * page's own hero visual (see pages/site/heroVisuals.jsx), so the menu
 * previews what the page opens with. They react to the parent item's hover
 * through Tailwind's `group/item` variant.
 */

function Tile({ tone, className = '', children }) {
  return (
    <span
      aria-hidden
      className={`relative grid h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-inset ring-ink/[0.06] transition-transform duration-500 ease-out-expo group-hover/item:scale-[1.04] ${tone} ${className}`}
    >
      {children}
    </span>
  );
}

/** Bima Sakhi — the three-year stipend, as three shrinking bars. */
function Stipend() {
  return (
    <Tile tone="bg-peach-soft" className="content-center gap-1 px-3">
      <span className="mb-0.5 font-display text-[11px] font-extrabold leading-none text-ember-deep">₹</span>
      {[100, 86, 71].map((w) => (
        <span key={w} className="h-1.5 rounded-full bg-white">
          <span
            className="block h-full origin-left scale-x-[0.8] rounded-full bg-ember transition-transform duration-700 ease-out-expo group-hover/item:scale-x-100"
            style={{ width: `${w}%` }}
          />
        </span>
      ))}
    </Tile>
  );
}

/** Benefits — the year-one commission rate. */
function Commission() {
  return (
    <Tile tone="bg-ink" className="place-items-center">
      <span className="text-center">
        <span className="block font-display text-[17px] font-extrabold leading-none tracking-tight text-peach">28%</span>
        <span className="mx-auto mt-1.5 block h-[2px] w-5 origin-left rounded-full bg-ember transition-transform duration-500 ease-out-expo group-hover/item:scale-x-150" />
      </span>
    </Tile>
  );
}

/** Procedure — three joined steps, the last one done. */
function Steps() {
  return (
    <Tile tone="bg-mint-soft" className="place-items-center">
      <span className="relative flex items-center gap-2">
        <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-ink/20" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-ink" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-ink transition-colors duration-300 group-hover/item:bg-ember" />
        <span className="relative grid h-4 w-4 place-items-center rounded-full bg-sage text-white">
          <Icon name="check" className="h-2.5 w-2.5" strokeWidth={3.5} />
        </span>
      </span>
    </Tile>
  );
}

/** Career — three rising tracks. */
function Tracks() {
  const bars = [
    { h: 'h-5', tone: 'bg-ink' },
    { h: 'h-8', tone: 'bg-sage' },
    { h: 'h-10', tone: 'bg-ember' },
  ];
  return (
    <Tile tone="bg-sand" className="place-items-end justify-center px-3 pb-3">
      <span className="flex items-end gap-1.5">
        {bars.map((b, i) => (
          <span
            key={i}
            className={`w-2.5 origin-bottom rounded-t-[3px] ${b.h} ${b.tone} transition-transform duration-500 ease-out-expo group-hover/item:scale-y-110`}
            style={{ transitionDelay: `${i * 60}ms` }}
          />
        ))}
      </span>
    </Tile>
  );
}

const THUMBS = {
  '/bima-sakhi': Stipend,
  '/benefits': Commission,
  '/procedure': Steps,
  '/career': Tracks,
};

export default function NavThumb({ path }) {
  const Thumb = THUMBS[path];
  return Thumb ? <Thumb /> : <Tile tone="bg-sand" />;
}
