import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import Icon from "../ui/Icon.jsx";
import { getUserMessage } from "../../app/apis/apiError.js";
import { useAnyModalOpen } from "../../hooks/useScrollLock.js";
import { Spinner } from "./Primitives.jsx";
import { portalTarget } from "./floating.js";
import { ToastContext } from "./feedbackContext.js";
import { cx } from "./cx.js";

const MAX_VISIBLE = 3;

/*
 * Toasts sit on the theme-invariant ink (`bg-brand`) in both themes — the
 * landing page's dark-band look — so their status chips use the static
 * marketing palette, which is only allowed on brand surfaces.
 */
const TONE = {
  success: { icon: "checkCircle", chip: "bg-sage/25 text-mint" },
  error: { icon: "alertTriangle", chip: "bg-rose/20 text-rose" },
  info: { icon: "info", chip: "bg-white/10 text-cream" },
  loading: { icon: null, chip: "bg-white/10 text-cream" },
};

let nextId = 0;

/**
 * Success and failure feedback for actions, behind `useToast()`.
 *
 * Bottom-right on desktop, bottom-centre on phones; at most three, newest
 * first, stacked with a spring. Each one dismisses itself after `duration`
 * (paused while hovered or focused), and errors are announced assertively.
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // over an open modal the stack moves to the top, so it never covers the
  // modal's own buttons (Save, Add question)
  const modalOpen = useAnyModalOpen();

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((tone, title, options = {}) => {
    const id = options.id ?? `toast-${(nextId += 1)}`;
    setToasts((list) => {
      const rest = list.filter((toast) => toast.id !== id);
      return [{ id, tone, title, ...options }, ...rest].slice(0, MAX_VISIBLE);
    });
    return id;
  }, []);

  const api = useMemo(() => {
    const toast = {
      success: (title, options) => push("success", title, options),
      error: (title, options) => push("error", title, { duration: 6000, ...options }),
      info: (title, options) => push("info", title, options),
      dismiss,
      /** Shows `loading`, then swaps the same toast to success or error. */
      promise: async (promise, { loading, success, error } = {}) => {
        const id = push("loading", loading ?? "Working…", { duration: Infinity });
        try {
          const result = await promise;
          push("success", typeof success === "function" ? success(result) : success ?? "Done", { id });
          return result;
        } catch (err) {
          push("error", typeof error === "function" ? error(err) : error ?? getUserMessage(err), { id, duration: 6000 });
          throw err;
        }
      },
    };
    return toast;
  }, [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <ol
          aria-label="Notifications"
          className={cx(
            "pointer-events-none fixed inset-x-3 z-[70] flex items-center gap-2 sm:inset-x-auto sm:right-5 sm:items-end",
            modalOpen ? "top-3 flex-col sm:top-5" : "bottom-3 flex-col-reverse sm:bottom-5",
          )}
        >
          <AnimatePresence initial={false}>
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </ol>,
        portalTarget(),
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { id, tone, title, description, action, duration = 4000 } = toast;
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);
  const look = TONE[tone] ?? TONE.info;

  useEffect(() => {
    remaining.current = duration;
  }, [duration, title]);

  useEffect(() => {
    if (paused || !Number.isFinite(remaining.current)) return undefined;
    const started = Date.now();
    const timer = setTimeout(() => onDismiss(id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused, id, onDismiss, title]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 500, damping: 35 } }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl bg-brand py-3 pr-2.5 pl-3 text-brand-contrast shadow-navy-glow ring-1 ring-white/10"
    >
      <span className={cx("mt-px grid h-8 w-8 shrink-0 place-items-center rounded-xl", look.chip)}>
        {tone === "loading" ? <Spinner className="h-4 w-4" /> : <Icon name={look.icon} className="h-[18px] w-[18px]" strokeWidth={2} />}
      </span>
      <div className="min-w-0 flex-1 py-1">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {description && <p className="mt-0.5 text-[13px] leading-snug text-cream/70">{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick?.();
            onDismiss(id);
          }}
          className="mt-1 shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-bold text-mint transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-mint"
        >
          {action.label}
        </button>
      )}
      {tone !== "loading" && (
        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label="Dismiss"
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-cream/60 transition-colors duration-200 hover:bg-white/10 hover:text-cream focus-visible:outline-2 focus-visible:outline-mint"
        >
          <Icon name="x" className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </motion.li>
  );
}
