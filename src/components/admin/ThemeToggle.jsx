import { flushSync } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import Icon from "../ui/Icon.jsx";
import { selectTheme, setTheme } from "../../app/features/theme.slice.js";
import Tooltip from "./Tooltip.jsx";
import { cx } from "./cx.js";

const MODES = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];

/**
 * Switches the theme with a circular reveal that grows from the pointer.
 *
 * The View Transitions API snapshots the page, the theme changes underneath,
 * and the new snapshot is clipped open as an expanding circle (550ms, expo).
 * Without the API, or with reduced motion, the theme simply changes.
 *
 * It dispatches the same `setTheme` the rest of the app uses, so
 * `useThemeSync` still owns the <html> class and localStorage.
 */
function useApplyTheme() {
  const mode = useSelector(selectTheme);
  const dispatch = useDispatch();

  const apply = (next, event) => {
    if (next === mode) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduced) {
      dispatch(setTheme(next));
      return;
    }

    // keyboard activation reports 0,0 — grow from the control's centre instead
    let x = event?.clientX;
    let y = event?.clientY;
    if (!x && !y && event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    x ??= window.innerWidth / 2;
    y ??= window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(async () => {
      flushSync(() => dispatch(setTheme(next)));
      root.classList.toggle("dark", next === "dark");
      // let canvas charts (useThemeTokens) repaint before the new snapshot
      await new Promise((resolve) => setTimeout(resolve, 40));
    });

    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 550, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
  };

  return [mode, apply];
}

/**
 * `segmented` — sun/moon pill with a sliding thumb (the sidebar footer).
 * `icon` — one round button that swaps its icon (the header, on phones; the
 *          collapsed rail).
 * `onBrand` — styled for the ink rail.
 */
export default function ThemeToggle({ variant = "segmented", onBrand = false, className }) {
  const [mode, apply] = useApplyTheme();

  if (variant === "icon") {
    const next = mode === "dark" ? "light" : "dark";
    const label = `Switch to ${next} theme`;
    return (
      <Tooltip content={label} side={onBrand ? "right" : "bottom"}>
        <button
          type="button"
          onClick={(event) => apply(next, event)}
          aria-label={label}
          className={cx(
            "focus-ring relative grid h-9 w-9 cursor-pointer place-items-center overflow-hidden rounded-full transition-colors duration-200",
            onBrand ? "text-brand-contrast/75 hover:bg-white/[0.08] hover:text-brand-contrast" : "text-text-muted hover:bg-surface-hover hover:text-text-primary",
            className,
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={mode}
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid place-items-center"
            >
              <Icon name={mode === "dark" ? "moon" : "sun"} className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </motion.span>
          </AnimatePresence>
        </button>
      </Tooltip>
    );
  }

  return (
    <LayoutGroup id={onBrand ? "theme-toggle-brand" : "theme-toggle"}>
      <div
        role="radiogroup"
        aria-label="Theme"
        className={cx(
          "inline-flex gap-0.5 rounded-full p-1",
          onBrand ? "bg-white/[0.06] ring-1 ring-inset ring-white/10" : "bg-surface-muted ring-1 ring-inset ring-border",
          className,
        )}
      >
        {MODES.map((option) => {
          const selected = option.value === mode;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.label} theme`}
              onClick={(event) => apply(option.value, event)}
              className={cx(
                "focus-ring relative grid h-7 w-9 cursor-pointer place-items-center rounded-full transition-colors duration-200",
                selected
                  ? onBrand
                    ? "text-ink"
                    : "text-text-primary"
                  : onBrand
                    ? "text-brand-contrast/60 hover:text-brand-contrast"
                    : "text-text-muted hover:text-text-primary",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="thumb"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className={cx("absolute inset-0 rounded-full", onBrand ? "bg-cream" : "bg-surface-elevated shadow-elevate")}
                  aria-hidden
                />
              )}
              <Icon name={option.icon} className="relative z-10 h-4 w-4" strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
