import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useLang } from '../../i18n/index.js';
import { COMMON } from '../../pages/home/content.js';
import { SOLUTIONS } from '../../pages/site/sections.js';
import { EXPO } from '../motion/primitives.js';
import Icon from '../ui/Icon.jsx';
import NavThumb from './NavThumb.jsx';

const LABEL = { hi: 'समाधान', en: 'Solutions' };
const HERE = { hi: 'आप यहाँ हैं', en: 'You’re here' };
const WAYS_IN = { hi: 'आपके लिए रास्ते', en: 'Ways in' };
const NOT_SURE = { hi: 'समझ नहीं आ रहा कहाँ से शुरू करें?', en: 'Not sure where to start?' };

/** One solution: thumbnail, title, one-line description, CTA arrow. */
function SolutionItem({ page, current, onNavigate }) {
  const { t } = useLang();
  return (
    <Link
      to={page.path}
      data-solution
      onClick={onNavigate}
      aria-current={current ? 'page' : undefined}
      className="group/item flex items-start gap-4 rounded-2xl p-3 outline-none transition-colors duration-200 hover:bg-cream focus-visible:bg-cream focus-visible:ring-2 focus-visible:ring-ember"
    >
      <NavThumb path={page.path} />
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="flex flex-wrap items-center gap-2 font-display text-[15px] font-bold text-ink">
          {t(page.nav)}
          {current ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2 py-0.5 font-sans text-[10px] font-bold text-sage-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              {t(HERE)}
            </span>
          ) : null}
        </span>
        <span className="mt-1 line-clamp-2 text-[13px] leading-snug text-plum/80">{t(page.desc)}</span>
      </span>
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand text-ink transition-[background-color,color,rotate] duration-500 ease-out-expo group-hover/item:rotate-45 group-hover/item:bg-ember group-hover/item:text-white group-focus-visible/item:rotate-45 group-focus-visible/item:bg-ember group-focus-visible/item:text-white">
        <Icon name="arrowUpRight" className="h-4 w-4" strokeWidth={2.2} />
      </span>
    </Link>
  );
}

/** Move focus between the panel's items with the arrow keys. */
function moveFocus(container, dir) {
  const items = [...container.querySelectorAll('[data-solution]')];
  if (!items.length) return;
  const i = items.indexOf(document.activeElement);
  const next = i === -1 ? (dir > 0 ? 0 : items.length - 1) : (i + dir + items.length) % items.length;
  items[next].focus();
}

/**
 * Desktop "Solutions" dropdown.
 *
 * Opens on hover (with a short close delay so the pointer can cross the gap),
 * on click, and from the keyboard (Enter / Space / ArrowDown). Escape, an
 * outside click, tabbing away or choosing an item closes it. The items stay
 * plain links — no `role="menu"` — so they keep native link semantics.
 *
 * `open` is owned by the header, which keeps the bar visible while it is open.
 */
export function SolutionsDropdown({ open, onOpenChange }) {
  const { t } = useLang();
  const { pathname } = useLocation();
  const panelId = useId();
  const wrap = useRef(null);
  const trigger = useRef(null);
  const timer = useRef(0);
  const active = SOLUTIONS.some((p) => p.path === pathname);

  const show = () => {
    window.clearTimeout(timer.current);
    onOpenChange(true);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onOpenChange(false), 150);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrap.current?.contains(e.target)) onOpenChange(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  const onTriggerKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onOpenChange(true);
      // the panel mounts on the next frame
      window.requestAnimationFrame(() => wrap.current && moveFocus(wrap.current, 1));
    }
  };

  const onPanelKey = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      moveFocus(e.currentTarget, e.key === 'ArrowDown' ? 1 : -1);
    }
  };

  return (
    <div
      ref={wrap}
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
      onBlur={(e) => {
        if (open && !wrap.current?.contains(e.relatedTarget)) onOpenChange(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        onKeyDown={onTriggerKey}
        className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ember ${
          open || active ? 'text-ink' : 'text-plum hover:text-ink'
        }`}
      >
        {t(LABEL)}
        <Icon
          name="chevron"
          className={`h-4 w-4 transition-transform duration-300 ease-out-expo ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
        {active ? (
          <span aria-hidden className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ember" />
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            id={panelId}
            onKeyDown={onPanelKey}
            className="absolute left-1/2 top-full z-50 w-[40rem] origin-top -translate-x-1/2 pt-3"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease: EXPO }}
          >
            <span aria-hidden className="absolute left-1/2 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-white ring-1 ring-ink/8" />
            <div className="relative rounded-[22px] bg-white p-3 shadow-lift ring-1 ring-ink/8">
              <p className="caps px-3 pb-1.5 pt-1 text-[10px] font-bold text-plum/55">{t(WAYS_IN)}</p>
              <ul className="grid grid-cols-2 gap-1">
                {SOLUTIONS.map((p, i) => (
                  <motion.li
                    key={p.path}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 + i * 0.04, duration: 0.35, ease: EXPO }}
                  >
                    <SolutionItem page={p} current={pathname === p.path} onNavigate={() => onOpenChange(false)} />
                  </motion.li>
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between gap-4 rounded-2xl bg-sand px-4 py-3">
                <p className="text-sm text-plum">{t(NOT_SURE)}</p>
                <Link
                  to="/apply"
                  data-solution
                  onClick={() => onOpenChange(false)}
                  className="group/cta inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-ember-deep outline-none focus-visible:ring-2 focus-visible:ring-ember"
                >
                  {t(COMMON.bookOrientation)}
                  <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" strokeWidth={2.2} />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** The same items as a disclosure, for the mobile menu. */
export function SolutionsList({ onNavigate }) {
  const { t } = useLang();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);
  const listId = useId();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-3 font-display text-lg font-bold text-ink"
      >
        {t(LABEL)}
        <Icon name="chevron" className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            id={listId}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EXPO }}
          >
            {SOLUTIONS.map((p) => (
              <li key={p.path}>
                <SolutionItem page={p} current={pathname === p.path} onNavigate={onNavigate} />
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
