import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import Icon from "../ui/Icon.jsx";
import { EXPO } from "../motion/primitives.js";
import { IconButton } from "./Button.jsx";
import { portalTarget, useFloating } from "./floating.js";
import { cx } from "./cx.js";

/**
 * A menu of actions behind a trigger — the row "⋯" menu, the account menu.
 *
 * `trigger` is a render function receiving the props to spread on the
 * trigger element (ref, aria-*, handlers), so any button can open it.
 *
 * `items`: `{ id, label, icon, onSelect, tone: "danger", disabled, hidden,
 * description, separatorBefore }`. Hidden items are dropped, so permission
 * checks can sit inline: `hidden: !can(PERMISSIONS.X)`.
 *
 * Keyboard (WAI-ARIA menu button): Enter/Space/↓ open on the first item, ↑
 * on the last; arrows move; Home/End jump; typing a letter jumps to the next
 * item starting with it; Escape closes and returns focus to the trigger; Tab
 * closes.
 */
export default function DropdownMenu({ trigger, items, label, align = "end", side = "bottom", header, className }) {
  const visible = items.filter((item) => item && !item.hidden);
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);
  const menuId = useId();

  useFloating(triggerRef, menuRef, open, { side, align, offset: 6 });

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const openAt = (index) => {
    setFocusIndex(index);
    setOpen(true);
  };

  // move DOM focus to the active item whenever it changes while open
  useEffect(() => {
    if (!open) return undefined;
    const frame = requestAnimationFrame(() =>
      (itemRefs.current[focusIndex] && !itemRefs.current[focusIndex].disabled
        ? itemRefs.current[focusIndex]
        : menuRef.current
      )?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [open, focusIndex]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (menuRef.current?.contains(event.target) || triggerRef.current?.contains(event.target)) return;
      close(false);
    };
    // a backstop for when focus isn't inside the menu (every item disabled)
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !event.defaultPrevented) close(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const enabledIndexes = visible.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);

  const step = (from, delta) => {
    if (enabledIndexes.length === 0) return from;
    const at = enabledIndexes.indexOf(from);
    const next = at === -1 ? 0 : (at + delta + enabledIndexes.length) % enabledIndexes.length;
    return enabledIndexes[next];
  };

  const onMenuKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        setFocusIndex((i) => step(i, 1));
        break;
      case "ArrowUp":
        setFocusIndex((i) => step(i, -1));
        break;
      case "Home":
        setFocusIndex(enabledIndexes[0] ?? 0);
        break;
      case "End":
        setFocusIndex(enabledIndexes[enabledIndexes.length - 1] ?? 0);
        break;
      case "Escape":
        // don't let the same key also close a modal underneath
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation?.();
        close(true);
        break;
      case "Tab":
        close(false);
        return;
      default: {
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const letter = event.key.toLowerCase();
          const order = [...enabledIndexes.filter((i) => i > focusIndex), ...enabledIndexes.filter((i) => i <= focusIndex)];
          const match = order.find((i) => String(visible[i].label).toLowerCase().startsWith(letter));
          if (match !== undefined) setFocusIndex(match);
          break;
        }
        return;
      }
    }
    event.preventDefault();
  };

  const select = (item) => {
    if (item.disabled) return;
    close(true);
    item.onSelect?.();
  };

  if (visible.length === 0 && !header) return null;

  const triggerProps = {
    ref: triggerRef,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: () => (open ? close(false) : openAt(enabledIndexes[0] ?? 0)),
    onKeyDown: (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        openAt(enabledIndexes[0] ?? 0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        openAt(enabledIndexes[enabledIndexes.length - 1] ?? 0);
      }
    },
  };

  return (
    <>
      {trigger(triggerProps, open)}
      {createPortal(
        <AnimatePresence>
          {open && (
            // ref-less wrapper: see Tooltip.jsx
            <div key="menu" className="contents">
            <motion.div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={label}
              tabIndex={-1}
              onKeyDown={onMenuKeyDown}
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.16, ease: EXPO } }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
              style={{ transformOrigin: align === "end" ? "top right" : "top left" }}
              className={cx(
                "fixed z-50 min-w-[13rem] max-w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-2xl outline-none bg-surface-elevated p-1.5 text-text-primary shadow-pop ring-1 ring-border",
                className,
              )}
            >
              {header}
              {visible.map((item, i) => (
                <div key={item.id ?? item.label}>
                  {item.separatorBefore && i > 0 && <div className="mx-2 my-1.5 h-px bg-border" role="separator" />}
                  <button
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={i === focusIndex ? 0 : -1}
                    disabled={item.disabled}
                    onClick={() => select(item)}
                    onPointerMove={() => !item.disabled && i !== focusIndex && setFocusIndex(i)}
                    className={cx(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13.5px] font-medium outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
                      item.tone === "danger"
                        ? "text-danger hover:bg-danger-muted focus-visible:bg-danger-muted focus:bg-danger-muted"
                        : "text-text-primary hover:bg-surface-hover focus:bg-surface-hover",
                    )}
                  >
                    {item.icon && (
                      <Icon
                        name={item.icon}
                        className={cx("h-4 w-4 shrink-0", item.tone === "danger" ? "" : "text-text-muted")}
                        strokeWidth={1.9}
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{item.label}</span>
                      {item.description && (
                        <span className="block text-xs font-normal text-text-muted">{item.description}</span>
                      )}
                    </span>
                  </button>
                </div>
              ))}
            </motion.div>
            </div>
          )}
        </AnimatePresence>,
        portalTarget(),
      )}
    </>
  );
}

/** The "⋯" menu at the end of a table row or card. */
export function RowActions({ label = "More actions", items, size = "sm", tone = "default" }) {
  return (
    <DropdownMenu
      label={label}
      items={items}
      trigger={(props, open) => (
        <IconButton icon="moreHorizontal" label={label} size={size} tone={tone} active={open} tooltip={false} {...props} />
      )}
    />
  );
}
