import { useRef } from "react";
import { LayoutGroup, motion } from "framer-motion";

import Icon from "../ui/Icon.jsx";
import { cx } from "./cx.js";

const PILL_SPRING = { type: "spring", stiffness: 380, damping: 32 };

/**
 * The landing page's sliding-pill tabs (the FAQ switcher), for filters and
 * views: All / Active / Suspended.
 *
 * The selected pill is one `layoutId` element that springs between options,
 * which is why every instance needs its own `layoutId`. It is ink on cream in
 * light mode and cream on ink in dark — `bg-text-primary text-bg`.
 *
 * Keyboard: arrow keys move and select (automatic activation, like a native
 * radio group), Home/End jump to the ends. Only the selected tab is in the
 * tab order.
 *
 * @param {{ value: string, label: string, count?: number, icon?: string }[]} items
 */
export default function SegmentedTabs({ items, value, onChange, layoutId, ariaLabel, size = "md", className }) {
  const refs = useRef([]);
  const index = Math.max(0, items.findIndex((item) => item.value === value));

  const move = (next) => {
    const target = (next + items.length) % items.length;
    onChange(items[target].value);
    refs.current[target]?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") move(index + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") move(index - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(items.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <LayoutGroup id={layoutId}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className={cx(
          "inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface-elevated p-1 ring-1 ring-inset ring-border shadow-[0_1px_2px_rgb(21_13_61/0.05)] [scrollbar-width:none]",
          className,
        )}
      >
        {items.map((item, i) => {
          const selected = i === index;
          return (
            <button
              key={item.value ?? "all"}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.value)}
              className={cx(
                "focus-ring relative shrink-0 cursor-pointer rounded-full font-semibold whitespace-nowrap transition-colors duration-200",
                size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-[13px]",
                selected ? "text-bg" : "text-text-muted hover:text-text-primary",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="pill"
                  transition={PILL_SPRING}
                  className="absolute inset-0 rounded-full bg-text-primary"
                  aria-hidden
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {item.icon && <Icon name={item.icon} className="h-4 w-4" />}
                {item.label}
                {item.count != null && (
                  <span
                    className={cx(
                      "min-w-5 rounded-full px-1.5 py-px text-center text-[11px] font-bold tabular-nums transition-colors duration-200",
                      selected ? "bg-bg/15 text-bg" : "bg-surface-muted text-text-muted",
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
