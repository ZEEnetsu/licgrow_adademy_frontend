import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useLang } from '../../i18n/index.js';
import { resolveHref } from '../../pages/site/sections.js';
import RefChart from '../charts/RefChart.jsx';
import { EXPO } from '../motion/primitives.js';
import { IllustrationBadge } from '../ui/atoms.jsx';
import Icon from '../ui/Icon.jsx';
import { Calc, DocCheck } from './Calc.jsx';
import RichText from './RichText.jsx';
import { ToneContext, useTone } from './tone.js';

/**
 * Renders the generated content tree (src/content/generated/*.json).
 *
 * The reference build carries its own small design system — .card, .steps,
 * .flow, .ladder, .goal-band, .recap, .illustrative and friends. This module
 * is the single place those class names are translated into the site's
 * cream / ink / ember language, so every page reads as one product while
 * keeping the structure and emphasis the client authored.
 *
 * Colours come from the nearest ToneContext (light chapters, dark panels).
 *
 * Two things are deliberately preserved rather than styled away:
 *   `data-src`      the citation ref, kept on the rendered element so a claim
 *                   can still be traced back to its source document
 *   .illustrative   a compliance marker; it renders a visible bilingual
 *                   "Illustration only" badge, exactly as the reference does
 */

const has = (node, c) => (node.cls || []).includes(c);
const srcAttr = (node) => (node.src ? { 'data-src': node.src } : {});
const view = { once: true, amount: 0.25 };

/* ── text ──────────────────────────────────────────────────────────────── */

function Heading({ node }) {
  const tone = useTone();
  const Tag = node.t;
  const style = {
    h2: 'mt-14 h-display text-[clamp(1.9rem,3.4vw,2.75rem)] font-extrabold',
    h3: 'mt-14 h-display text-[clamp(1.6rem,2.6vw,2.25rem)] font-extrabold',
    h4: 'mt-12 font-display text-xl font-bold tracking-tight sm:text-[1.4rem]',
    h5: 'mt-1 font-display text-lg font-bold tracking-tight',
  }[Tag];
  return (
    <Tag className={`${style} ${tone.h} first:mt-0`} id={node.id} {...srcAttr(node)}>
      {Tag === 'h4' ? <span className="mr-2.5 inline-block h-[3px] w-5 rounded-full bg-ember align-middle" aria-hidden /> : null}
      <RichText value={node.text} />
    </Tag>
  );
}

function Paragraph({ node }) {
  const tone = useTone();
  const rich = <RichText value={node.text} />;
  const a = srcAttr(node);

  if (has(node, 'eyebrow')) {
    return (
      <p className={`caps text-[11px] font-bold ${tone.accent}`} {...a}>
        {rich}
      </p>
    );
  }
  if (has(node, 'src')) {
    return (
      <p className={`mt-3 flex gap-1.5 text-xs leading-relaxed ${tone.muted}`} {...a}>
        <Icon name="info" className="mt-[0.15em] h-3.5 w-3.5 shrink-0 opacity-70" />
        <span>{rich}</span>
      </p>
    );
  }
  if (has(node, 'conditions')) {
    return (
      <p className={`mt-3 text-xs font-semibold ${tone.muted}`} {...a}>
        {rich}
      </p>
    );
  }
  if (has(node, 'band')) {
    return (
      <p
        className={`h-display my-10 text-center text-[clamp(1.5rem,2.8vw,2.4rem)] font-extrabold [&_em]:mt-2 [&_em]:block [&_em]:font-sans [&_em]:text-base [&_em]:font-semibold [&_em]:not-italic [&_em]:tracking-normal [&_em]:opacity-70 ${
          tone.dark ? 'text-peach' : 'text-ember-deep'
        }`}
        {...a}
      >
        {rich}
      </p>
    );
  }
  if (has(node, 'banner-line') || has(node, 'hl')) {
    return (
      <p
        className={`my-6 rounded-2xl px-5 py-4 text-[17px] font-semibold leading-relaxed ${
          tone.dark ? 'bg-white/[0.06] text-cream' : 'bg-peach-soft text-ink'
        }`}
        {...a}
      >
        {rich}
      </p>
    );
  }
  if (has(node, 'quote-card')) {
    return <QuoteCard {...a}>{rich}</QuoteCard>;
  }
  if (has(node, 'card')) {
    return (
      <p className={`rounded-[20px] p-5 text-[15px] font-semibold ${tone.card} ${tone.h}`} {...a}>
        {rich}
      </p>
    );
  }
  if (has(node, 'num')) {
    return (
      <p className={`h-display text-4xl font-extrabold sm:text-5xl ${tone.dark ? 'text-peach' : 'text-ember-deep'}`} {...a}>
        {rich}
      </p>
    );
  }
  if (has(node, 'cell') || has(node, 'ax')) {
    return (
      <p className={`rounded-2xl p-4 text-sm leading-snug ${tone.card} ${tone.p} [&_span]:block [&_span]:font-display [&_span]:text-2xl [&_span]:font-extrabold [&_span]:text-ember-deep`} {...a}>
        {rich}
      </p>
    );
  }
  if (has(node, 'effort')) {
    return (
      <p className={`mt-5 flex items-start gap-2.5 text-[15px] font-semibold leading-relaxed sm:text-base ${tone.h}`} {...a}>
        <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${tone.dark ? 'bg-white/10 text-peach' : 'bg-peach-soft text-ember-deep'}`}>
          <Icon name="info" className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <span>{rich}</span>
      </p>
    );
  }
  const size = has(node, 'lede')
    ? `mt-5 text-lg leading-relaxed sm:text-xl ${tone.h}`
    : `mt-4 text-[16px] leading-[1.75] sm:text-[17px] ${tone.p}`;
  return (
    <p className={size} {...a}>
      {rich}
    </p>
  );
}

function QuoteCard({ children, ...rest }) {
  const tone = useTone();
  return (
    <div
      className={`relative my-7 overflow-hidden rounded-[22px] p-6 pl-8 sm:p-8 sm:pl-10 ${
        tone.dark ? 'bg-white/[0.06] ring-1 ring-white/10' : 'bg-white ring-1 ring-ink/[0.07] shadow-soft'
      } [&_p]:mt-3 [&_p:first-child]:mt-0 [&_em]:opacity-75`}
      {...rest}
    >
      <span aria-hidden className="absolute inset-y-6 left-0 w-1 rounded-r-full bg-ember" />
      <div className={`text-[17px] font-medium leading-relaxed ${tone.h}`}>{children}</div>
    </div>
  );
}

function Anchor({ node }) {
  const tone = useTone();
  const href = resolveHref(node.href);
  const cta = has(node, 'cta');
  const secondary = has(node, 'secondary');
  const base =
    'group/btn inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-[background-color,box-shadow,transform] duration-300 ease-out-expo active:scale-[0.98]';
  const cls = cta
    ? secondary
      ? `${base} ${tone.dark ? 'bg-white/[0.06] text-cream ring-1 ring-inset ring-white/20 hover:bg-white/[0.12]' : 'bg-white text-ink ring-1 ring-inset ring-ink/12 shadow-soft hover:ring-ink/30'}`
      : `${base} bg-ember-deep text-white shadow-ember hover:bg-ember`
    : `rounded-[20px] p-6 ${tone.card} block transition-transform hover:-translate-y-0.5`;
  const inner = (
    <>
      <RichText value={node.text} />
      {cta && !secondary ? (
        <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={2} />
      ) : null}
    </>
  );
  if (href?.startsWith('/')) {
    return (
      <Link to={href} className={cls} {...srcAttr(node)}>
        {inner}
      </Link>
    );
  }
  const external = /^https?:/i.test(href || '');
  return (
    <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})} {...srcAttr(node)}>
      {inner}
    </a>
  );
}

function Img({ node }) {
  const { t } = useLang();
  return (
    <img
      src={node.file}
      alt={t(node.alt)}
      loading="lazy"
      decoding="async"
      className="my-6 block max-h-[28rem] w-full rounded-[22px] object-cover shadow-soft first:mt-0"
    />
  );
}

/* ── tables ────────────────────────────────────────────────────────────── */

function Table({ node }) {
  const tone = useTone();
  const renderCell = (c, i, inBody) => {
    const Tag = c.th ? 'th' : 'td';
    return (
      <Tag
        key={i}
        colSpan={c.colspan}
        scope={c.th ? (inBody ? 'row' : 'col') : undefined}
        className={[
          'px-4 py-3.5 align-top leading-relaxed sm:px-5',
          c.num ? 'text-right tabular-nums whitespace-nowrap' : 'text-left',
          c.th && !inBody ? 'text-[12.5px] font-bold' : '',
          c.th && inBody ? 'font-semibold text-ink' : '',
        ].join(' ')}
      >
        <RichText value={c.text} />
      </Tag>
    );
  };

  return (
    <figure className="my-8" {...srcAttr(node)}>
      <div className="overflow-x-auto rounded-[20px] bg-white shadow-soft ring-1 ring-ink/[0.08] [scrollbar-width:thin]">
        <table className="w-full min-w-[34rem] border-collapse text-[14px]">
          {node.head?.length > 0 && (
            <thead>
              {node.head.map((row, i) => (
                <tr key={i} className="bg-ink text-cream">
                  {row.map((c, j) => renderCell(c, j, false))}
                </tr>
              ))}
            </thead>
          )}
          <tbody>
            {node.rows.map((row, i) => (
              <tr
                key={i}
                className={`border-t border-ink/[0.06] text-plum transition-colors duration-150 hover:bg-peach-soft/50 ${
                  i % 2 ? 'bg-cream/70' : 'bg-white'
                }`}
              >
                {row.map((c, j) => renderCell(c, j, true))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {node.caption && (
        <figcaption className={`mt-3 text-xs leading-relaxed ${tone.muted}`}>
          <RichText value={node.caption} />
        </figcaption>
      )}
    </figure>
  );
}

/* ── lists ─────────────────────────────────────────────────────────────── */

const itemBody = (it) => (it.children ? <Nodes nodes={it.children} /> : <RichText value={it.text} />);

function Steps({ node }) {
  const tone = useTone();
  const items = node.items || [];
  return (
    <ol className="relative my-8 list-none" {...srcAttr(node)}>
      <span aria-hidden className={`absolute bottom-5 left-[19px] top-5 w-[2px] rounded-full ${tone.line}`}>
        <motion.span
          className="block h-full w-full origin-top rounded-full bg-ember"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={view}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
        />
      </span>
      {items.map((it, i) => (
        <motion.li
          key={i}
          className="relative flex gap-5 pb-6 last:pb-0"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={view}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.7, ease: EXPO }}
          {...srcAttr(it)}
        >
          <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold ring-4 ${tone.dark ? 'ring-ink' : 'ring-cream'} ${tone.step}`}>
            {i + 1}
          </span>
          <div className={`min-w-0 flex-1 pt-2 text-[16px] font-medium leading-relaxed ${tone.h}`}>{itemBody(it)}</div>
        </motion.li>
      ))}
    </ol>
  );
}

function Flow({ node }) {
  const tone = useTone();
  const items = node.items || [];
  return (
    <ol className="my-7 flex list-none flex-wrap items-center gap-x-2 gap-y-3" {...srcAttr(node)}>
      {items.map((it, i) => (
        <motion.li
          key={i}
          className="inline-flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={view}
          transition={{ delay: i * 0.07, duration: 0.6, ease: EXPO }}
        >
          <span className={`inline-flex items-center gap-2 rounded-full py-2 pl-2 pr-4 text-[14px] font-semibold ${tone.chip}`}>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ember text-[11px] font-bold text-white">{i + 1}</span>
            {itemBody(it)}
          </span>
          {i < items.length - 1 ? <Icon name="arrowRight" className={`h-4 w-4 ${tone.muted}`} /> : null}
        </motion.li>
      ))}
    </ol>
  );
}

function Ladder({ node }) {
  const tone = useTone();
  const items = node.items || [];
  // Rendered bottom-up (column-reverse) so the highest rung sits on top.
  return (
    <ol className="my-5 flex list-none flex-col-reverse gap-1.5" {...srcAttr(node)}>
      {items.map((it, i) => {
        const top = i === items.length - 1;
        return (
          <motion.li
            key={i}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
              top ? 'bg-ember text-white' : tone.dark ? 'bg-white/[0.07] text-cream' : 'bg-sand text-ink'
            }`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={view}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.55, ease: EXPO }}
            {...srcAttr(it)}
          >
            <span className={`w-5 text-xs tabular-nums ${top ? 'text-white/80' : 'opacity-50'}`}>{i + 1}</span>
            <span>{itemBody(it)}</span>
          </motion.li>
        );
      })}
    </ol>
  );
}

function Checklist({ node, cols = 'sm:grid-cols-2' }) {
  const tone = useTone();
  const items = node.items || [];
  return (
    <ul className={`my-6 grid list-none gap-x-6 gap-y-3 ${cols}`} {...srcAttr(node)}>
      {items.map((it, i) => (
        <motion.li
          key={i}
          className={`flex gap-3 text-[16px] leading-relaxed ${tone.h}`}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={view}
          transition={{ delay: i * 0.05, duration: 0.5, ease: EXPO }}
        >
          <span className="mt-[0.2em] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint text-ink">
            <Icon name="check" className="h-3 w-3" strokeWidth={3} />
          </span>
          <span>{itemBody(it)}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function CardList({ node }) {
  const tone = useTone();
  const Tag = node.t;
  const items = node.items || [];
  const numbered = Tag === 'ol';
  return (
    <Tag className="my-7 grid list-none gap-3 sm:grid-cols-2" {...srcAttr(node)}>
      {items.map((it, i) => (
        <motion.li
          key={i}
          className={`flex gap-4 rounded-[20px] p-5 text-[15px] leading-relaxed ${tone.card} ${tone.p} ${tone.dark ? '[&_strong]:text-cream' : '[&_strong]:text-ink'}`}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={view}
          transition={{ delay: (i % 2) * 0.08, duration: 0.7, ease: EXPO }}
          {...srcAttr(it)}
        >
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-sm font-bold ${numbered ? tone.step : 'bg-peach text-ink'}`}>
            {numbered ? i + 1 : <Icon name="sparkle" className="h-4 w-4" />}
          </span>
          <div className="min-w-0 pt-1">{itemBody(it)}</div>
        </motion.li>
      ))}
    </Tag>
  );
}

function Chips({ node }) {
  const tone = useTone();
  return (
    <ul className="my-6 flex list-none flex-wrap gap-2" {...srcAttr(node)}>
      {(node.items || []).map((it, i) => (
        <li key={i} className={`rounded-full px-4 py-2 text-sm font-semibold ${tone.chip}`}>
          {itemBody(it)}
        </li>
      ))}
    </ul>
  );
}

function List({ node }) {
  const tone = useTone();
  if (has(node, 'steps')) return <Steps node={node} />;
  if (has(node, 'flow')) return <Flow node={node} />;
  if (has(node, 'ladder')) return <Ladder node={node} />;
  if (has(node, 'doc-check')) return <DocCheck node={node} />;
  if (has(node, 'checklist')) return <Checklist node={node} />;
  if (has(node, 'checklist-cols')) return <Checklist node={node} cols="sm:grid-cols-2 lg:grid-cols-3" />;
  if (has(node, 'grid')) return <CardList node={node} />;
  if (has(node, 'chips')) return <Chips node={node} />;

  const Tag = node.t;
  const items = node.items || [];
  return (
    <Tag className="my-6 list-none space-y-3" {...srcAttr(node)}>
      {items.map((it, i) => (
        <li key={i} className={`flex gap-3.5 text-[16px] leading-relaxed ${tone.p}`} {...srcAttr(it)}>
          {Tag === 'ol' ? (
            <span className={`mt-[0.15em] grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${tone.step}`}>
              {i + 1}
            </span>
          ) : (
            <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-hidden />
          )}
          <div className="min-w-0 [&_strong]:font-semibold">{itemBody(it)}</div>
        </li>
      ))}
    </Tag>
  );
}

/* ── containers ────────────────────────────────────────────────────────── */

function Grid({ node }) {
  const n = node.children?.length ?? 0;
  const cols = n === 2 ? 'sm:grid-cols-2' : n === 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  const stories = has(node, 'stories');
  return (
    <div className={`my-8 grid gap-4 ${stories ? 'md:grid-cols-2' : cols}`} {...srcAttr(node)}>
      {(node.children || []).map((c, i) => (
        <motion.div
          key={i}
          className="flex [&>*]:w-full"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={view}
          transition={{ delay: (i % 3) * 0.08, duration: 0.75, ease: EXPO }}
        >
          <ContentNode node={c} />
        </motion.div>
      ))}
    </div>
  );
}

function Card({ node }) {
  const tone = useTone();
  return (
    <div
      className={`h-full rounded-[22px] p-6 sm:p-7 ${tone.card} [&>:first-child]:mt-0 [&_h4]:mt-0 [&_h5]:mt-0 [&_img]:-mx-1 [&_img]:mb-4 [&_img]:mt-0 [&_img]:max-h-56 [&_p]:text-[15px] [&_ul]:my-3`}
      {...srcAttr(node)}
      id={node.id}
    >
      <Nodes nodes={node.children} />
    </div>
  );
}

function Story({ node }) {
  const tone = useTone();
  const [name, headline, ...rest] = node.children || [];
  return (
    <article className={`flex h-full flex-col rounded-[22px] p-6 sm:p-7 ${tone.card}`} {...srcAttr(node)}>
      <p className={`flex items-center gap-2 text-xs font-bold ${tone.accent}`}>
        <Icon name="pin" className="h-3.5 w-3.5" />
        <RichText value={name?.text} />
      </p>
      {headline ? (
        <h4 className={`h-display mt-3 text-xl font-bold ${tone.h}`}>
          <RichText value={headline.text} />
        </h4>
      ) : null}
      <div className="[&>p]:text-[15px]">
        <Nodes nodes={rest} />
      </div>
    </article>
  );
}

function Panel({ node, kind }) {
  const styles = {
    goal: 'mesh-navy-deep text-cream rounded-[26px] p-7 sm:p-9',
    recap: 'rounded-[26px] bg-mint-soft p-7 ring-1 ring-mint sm:p-9',
    illustrative: 'rounded-[26px] bg-peach-soft/60 p-6 ring-1 ring-peach sm:p-8',
    calc: 'rounded-[26px] bg-white p-6 ring-1 ring-ink/8 shadow-card sm:p-8',
  }[kind];
  const panel = (
    <div className={`relative my-10 overflow-hidden [&>:first-child]:mt-0 ${styles} ${kind === 'goal' ? 'tone-dark' : ''}`} {...srcAttr(node)} id={node.id}>
      {kind === 'illustrative' ? <IllustrationBadgeBlock /> : null}
      <Nodes nodes={node.children} />
    </div>
  );
  if (kind === 'goal') return <ToneContext.Provider value="dark">{panel}</ToneContext.Provider>;
  if (kind === 'recap' || kind === 'illustrative' || kind === 'calc') {
    return <ToneContext.Provider value="light">{panel}</ToneContext.Provider>;
  }
  return panel;
}

function IllustrationBadgeBlock() {
  const { t } = useLang();
  return (
    <div className="mb-4">
      <IllustrationBadge>{t({ hi: 'केवल उदाहरण', en: 'Illustration only' })}</IllustrationBadge>
    </div>
  );
}

function Box({ node }) {
  const attrs = { ...srcAttr(node), id: node.id };
  const inner = <Nodes nodes={node.children} />;

  if (has(node, 'goal-band')) return <Panel node={node} kind="goal" />;
  if (has(node, 'recap')) return <Panel node={node} kind="recap" />;
  if (has(node, 'illustrative')) return <Panel node={node} kind="illustrative" />;
  if (has(node, 'calc')) return <Panel node={node} kind="calc" />;
  if (has(node, 'quote-card')) return <QuoteCard {...attrs}>{inner}</QuoteCard>;
  if (has(node, 'card') || has(node, 'stat')) return <Card node={node} />;
  if (has(node, 'grid') || has(node, 'tracks') || has(node, 'stories')) return <Grid node={node} />;
  if (has(node, 'photo-grid')) {
    return (
      <div className="my-8 grid gap-4 sm:grid-cols-2 [&_figure]:m-0 [&_img]:my-0" {...attrs}>
        {inner}
      </div>
    );
  }
  if (has(node, 'quote-wall')) {
    return (
      <div className="my-8 gap-4 sm:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid [&>*]:mt-0" {...attrs}>
        {inner}
      </div>
    );
  }
  if (has(node, 'matrix')) {
    return (
      <div className="my-6 grid max-w-2xl gap-3 sm:grid-cols-3" {...attrs}>
        {inner}
      </div>
    );
  }
  if (has(node, 'chips')) {
    return (
      <div className="my-6 flex flex-wrap gap-2 [&_button]:rounded-full [&_button]:bg-white [&_button]:px-4 [&_button]:py-2 [&_button]:text-sm [&_button]:font-semibold [&_button]:ring-1 [&_button]:ring-ink/10" {...attrs}>
        {inner}
      </div>
    );
  }
  if (has(node, 'btn-row')) {
    return (
      <div className="mt-8 flex flex-wrap gap-3" {...attrs}>
        {inner}
      </div>
    );
  }
  return <div {...attrs}>{inner}</div>;
}

function Quote({ node }) {
  const tone = useTone();
  if (has(node, 'quote-card')) {
    return (
      <QuoteCard {...srcAttr(node)}>
        <Nodes nodes={node.children} />
      </QuoteCard>
    );
  }
  return (
    <blockquote
      className={`relative my-8 ${tone.dark ? '' : 'rounded-[24px] bg-ink p-7 text-cream sm:p-9'}`}
      {...srcAttr(node)}
    >
      <span aria-hidden className="font-display text-7xl font-extrabold leading-[0.6] text-ember">
        “
      </span>
      <div className="mt-2 space-y-3">
        {(node.children || []).map((c, i) =>
          // The attribution line ("— Rohit Lal") reads as a signature.
          has(c, 'src') ? (
            <p key={i} className="pt-2 font-hand text-[1.75rem] leading-none text-peach">
              <RichText value={c.text} />
            </p>
          ) : (
            <p key={i} className="text-lg font-medium leading-relaxed text-cream sm:text-xl">
              <RichText value={c.text} />
            </p>
          ),
        )}
      </div>
    </blockquote>
  );
}

function Figure({ node }) {
  const { t } = useLang();
  return (
    <figure className="my-8" {...srcAttr(node)}>
      {has(node, 'illustrative') ? <IllustrationBadgeBlock /> : null}
      {node.chart ? (
        <div className="rounded-[22px] bg-white p-4 shadow-soft ring-1 ring-ink/[0.07] sm:p-6">
          <RefChart id={node.chart.id} ariaLabel={t(node.chart.aria)} fallbackId={node.chart.fallback} />
        </div>
      ) : null}
      <Nodes nodes={node.children} />
    </figure>
  );
}

function Caption({ node }) {
  const tone = useTone();
  return (
    <figcaption className={`mt-3 text-xs leading-relaxed ${tone.muted}`} {...srcAttr(node)}>
      <RichText value={node.text} />
    </figcaption>
  );
}

function Cite({ node }) {
  const tone = useTone();
  return (
    <cite className={`mt-3 block text-sm font-semibold not-italic ${tone.p}`} {...srcAttr(node)}>
      <RichText value={node.text} />
    </cite>
  );
}

/** Native <details>, so charts inside can listen for `toggle` (see RefChart). */
function Accordion({ node }) {
  const tone = useTone();
  const legacy = has(node, 'legacy');
  return (
    <details
      className={`ease-details group/d my-5 overflow-hidden rounded-[20px] ${
        legacy ? (tone.dark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-sand/70 ring-1 ring-ink/[0.06]') : tone.card
      }`}
      {...srcAttr(node)}
      id={node.id}
    >
      <summary className={`flex cursor-pointer list-none items-center gap-4 px-5 py-4 text-[15px] font-semibold sm:px-6 ${tone.h}`}>
        <span className="min-w-0 flex-1">
          <RichText value={node.summary} />
        </span>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-500 ease-out-expo group-open/d:rotate-45 group-open/d:bg-ember group-open/d:text-white ${
            tone.dark ? 'bg-white/10 text-cream' : 'bg-sand text-ink'
          }`}
        >
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </summary>
      <div className="px-5 pb-6 sm:px-6 [&>:first-child]:mt-0">
        <Nodes nodes={node.children} />
      </div>
    </details>
  );
}

function Header({ node }) {
  return (
    <header className="mb-4" {...srcAttr(node)}>
      <Nodes nodes={node.children} />
    </header>
  );
}

function Aside({ node }) {
  return (
    <ToneContext.Provider value="dark">
      <aside className="mesh-navy-deep tone-dark relative my-12 overflow-hidden rounded-[26px] p-7 sm:p-10" {...srcAttr(node)}>
        <Nodes nodes={node.children} />
      </aside>
    </ToneContext.Provider>
  );
}

/* ── dispatch ──────────────────────────────────────────────────────────── */

const RENDERERS = {
  h2: Heading,
  h3: Heading,
  h4: Heading,
  h5: Heading,
  p: Paragraph,
  a: Anchor,
  img: Img,
  table: Table,
  ul: List,
  ol: List,
  details: Accordion,
  figure: Figure,
  figcaption: Caption,
  caption: Caption,
  cite: Cite,
  blockquote: Quote,
  box: Box,
  header: Header,
  aside: Aside,
};

export default function ContentNode({ node }) {
  const { lang } = useLang();
  if (!node) return null;

  // A subtree the client wrote in one language only — a pair of
  // `<div lang="hi">` / `<div lang="en">` blocks too structured to merge into
  // a single bilingual node. Showing both would print the same passage twice.
  if (node.lang && node.lang !== lang) return null;

  if (node.t === 'section') return <Nodes nodes={node.children} />;
  if (node.t === 'form') return <Calc node={node} />;
  if (node.t === 'article' && has(node, 'quote-card')) return <Story node={node} />;
  if (node.t === 'li' && has(node, 'card')) return <Card node={node} />;

  const Renderer = RENDERERS[node.t];
  if (Renderer) return <Renderer node={node} />;

  // Unknown node: render its children rather than dropping the subtree, so a
  // revised source never silently loses content.
  if (node.children) return <Nodes nodes={node.children} />;
  if (node.text) return <RichText value={node.text} />;
  return null;
}

export function Nodes({ nodes }) {
  if (!nodes?.length) return null;
  return nodes.map((n, i) => (
    <Fragment key={i}>
      <ContentNode node={n} />
    </Fragment>
  ));
}
