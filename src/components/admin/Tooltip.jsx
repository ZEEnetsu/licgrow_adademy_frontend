import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { EXPO } from "../motion/primitives.js";
import { portalTarget, useFloating } from "./floating.js";

/**
 * A short label that appears on hover or keyboard focus.
 *
 * Visual only: it is `aria-hidden`, so it must never carry information the
 * trigger's accessible name doesn't already have. Its job is to spell out an
 * icon-only button ("Delete chapter") or a collapsed nav item for sighted
 * pointer users — screen readers get the same text from `aria-label`.
 *
 * `className` replaces the wrapper's default `inline-flex` (pass "flex w-full"
 * to wrap a full-width row).
 *
 * Pointer: opens after `delay` ms, closes on leave. Keyboard: opens on
 * :focus-visible (not on a click's focus), closes on blur or Escape.
 */
export default function Tooltip({ content, side = "top", align = "center", delay = 300, disabled = false, children, className }) {
  const anchorRef = useRef(null);
  const tipRef = useRef(null);
  const timer = useRef(null);
  const [open, setOpen] = useState(false);
  const visible = open && !disabled && Boolean(content);

  useFloating(anchorRef, tipRef, visible, { side, align, offset: 8 });

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      ref={anchorRef}
      className={className ?? "inline-flex"}
      onPointerEnter={(event) => event.pointerType === "mouse" && show()}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={(event) => {
        if (event.target.matches?.(":focus-visible")) {
          clearTimeout(timer.current);
          setOpen(true);
        }
      }}
      onBlur={hide}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {visible && (
            // AnimatePresence's direct child must not carry a ref: framer-motion
            // 12 reads `props.ref`, which React 18 warns about. The ref goes on
            // the animated element one level down.
            <span key="tip" className="contents">
              <motion.span
                ref={tipRef}
                aria-hidden
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.16, ease: EXPO } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                className="pointer-events-none fixed z-[80] max-w-xs rounded-full bg-brand px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-brand-contrast shadow-pop"
              >
                {content}
              </motion.span>
            </span>
          )}
        </AnimatePresence>,
        portalTarget(),
      )}
    </span>
  );
}
