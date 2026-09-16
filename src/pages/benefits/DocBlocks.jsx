/**
 * Renderers for the block vocabulary in content.js.
 *
 * Everything here is typographic rather than decorative: the page has to hold
 * ~150 rules, nine-row tables and two formulas without turning into a wall, so
 * the work is in rhythm and hierarchy, not ornament.
 */

const TONES = {
  info: {
    ring: 'border-lic-navy/20 bg-lic-ice/60',
    dot: 'bg-lic-navy',
    label: 'text-lic-navy',
  },
  tip: {
    ring: 'border-lic-royal/25 bg-lic-royal/[0.06]',
    dot: 'bg-lic-royal',
    label: 'text-lic-royal',
  },
  warn: {
    ring: 'border-amber-500/30 bg-amber-50',
    dot: 'bg-amber-500',
    label: 'text-amber-700',
  },
};

function Note({ tone = 'info', title, t }) {
  const s = TONES[tone] ?? TONES.info;
  return (
    <aside className={`my-7 rounded-card border-l-[3px] ${s.ring} p-5 sm:p-6`}>
      <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${s.label}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
        {title}
      </p>
      <p className="mt-2.5 text-sm leading-relaxed text-lic-charcoal/90">{t}</p>
    </aside>
  );
}

function DocTable({ head, rows, foot }) {
  return (
    <figure className="my-7">
      {/*
        The scroll container is the <div>, not the table, so a nine-row table
        can go sideways on a phone without the whole page doing the same.
      */}
      <div className="scroll-panel overflow-x-auto rounded-card border border-black/[0.07] shadow-soft">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-lic-charcoal">
              {head.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-white/90 sm:px-5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr
                key={ri}
                className={`border-t border-black/[0.06] transition-colors duration-150 hover:bg-lic-ice/50 ${
                  ri % 2 ? 'bg-lic-offwhite/50' : 'bg-white'
                }`}
              >
                {r.map((c, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-3.5 align-top leading-relaxed sm:px-5 ${
                      ci === 0
                        ? 'font-semibold text-lic-charcoal'
                        : 'text-lic-body'
                    }`}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {foot && (
        <figcaption className="mt-3 text-xs leading-relaxed text-lic-body/80">{foot}</figcaption>
      )}
    </figure>
  );
}

function Formula({ lines, caption }) {
  return (
    <figure className="my-7">
      <div className="scroll-panel overflow-x-auto rounded-card border border-lic-navy/25 bg-lic-charcoal p-5 shadow-card sm:p-6">
        <pre className="font-mono text-[12.5px] leading-[1.9] text-lic-frost sm:text-[13px]">
          {lines.join('\n')}
        </pre>
      </div>
      {caption && (
        <figcaption className="mt-3 text-xs leading-relaxed text-lic-body/80">{caption}</figcaption>
      )}
    </figure>
  );
}

function DefList({ items }) {
  const isDef = typeof items[0] === 'object';

  if (!isDef) {
    return (
      <ul className="my-5 space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-lic-body">
            <span
              className="mt-[0.6em] h-1 w-1 flex-shrink-0 rounded-full bg-lic-azure"
              aria-hidden
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className="my-6 space-y-4">
      {items.map((it, i) => (
        <div
          key={i}
          className="border-l-2 border-lic-ice pl-4 transition-colors duration-200 ease-material hover:border-lic-azure sm:pl-5"
        >
          <dt className="text-sm font-semibold text-lic-charcoal">{it.term}</dt>
          <dd className="mt-1 text-[15px] leading-relaxed text-lic-body">{it.t}</dd>
        </div>
      ))}
    </dl>
  );
}

/** One block from content.js → one element. */
export default function DocBlock({ block }) {
  switch (block.k) {
    case 'p':
      return <p className="my-5 text-[15px] leading-[1.75] text-lic-body sm:text-base">{block.t}</p>;
    case 'h4':
      return (
        <h4 className="mt-10 mb-1 text-base font-semibold tracking-tight text-lic-charcoal">
          {block.t}
        </h4>
      );
    case 'ul':
      return <DefList items={block.items} />;
    case 'table':
      return <DocTable head={block.head} rows={block.rows} foot={block.foot} />;
    case 'note':
      return <Note tone={block.tone} title={block.title} t={block.t} />;
    case 'formula':
      return <Formula lines={block.lines} caption={block.caption} />;
    default:
      return null;
  }
}
