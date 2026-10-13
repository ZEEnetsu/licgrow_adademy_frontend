import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { EXPO, useMedia } from "../motion/primitives.js";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";
import { useHotkey } from "../../hooks/useHotkey.js";
import { useScrollLock } from "../../hooks/useScrollLock.js";
import { IconButton } from "./Button.jsx";
import { portalTarget } from "./floating.js";
import { cx } from "./cx.js";

const SIZE = {
  sm: "sm:max-w-[26rem]",
  md: "sm:max-w-[34rem]",
  lg: "sm:max-w-[44rem]",
  xl: "sm:max-w-[60rem]",
};

/**
 * The dialog.
 *
 * What it guarantees, so no page re-implements it:
 *   · role="dialog" + aria-modal, labelled by its title and described by its
 *     description
 *   · focus moves in on open, Tab stays inside, focus returns on close
 *   · Escape and a backdrop click close it — unless `busy` (a save is in
 *     flight; closing would orphan it)
 *   · the page behind doesn't scroll
 *   · on phones (< 640px) it is a bottom sheet with a grab handle, because a
 *     centred box on a 360px screen leaves no room for the keyboard
 *
 * Motion: backdrop fades 200ms; the panel rises and scales in over 350ms on
 * the landing page's expo curve; the sheet slides on a spring.
 */
export default function Modal({ open, onClose, ...rest }) {
  return createPortal(
    <AnimatePresence>{open && <ModalFrame key="modal" onClose={onClose} {...rest} />}</AnimatePresence>,
    portalTarget(),
  );
}

function ModalFrame({ onClose, title, ariaLabel, description, size = "md", footer, busy = false, initialFocusRef, placement = "center", hideClose = false, children, bodyClassName }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const isSheet = useMedia("(max-width: 639px)");

  useFocusTrap(panelRef, true, { initialFocusRef });
  useScrollLock(true);
  useHotkey("escape", () => !busy && onClose?.(), { allowInInputs: true });

  const panelMotion = isSheet
    ? {
        initial: { y: "100%" },
        animate: { y: 0, transition: { type: "spring", stiffness: 400, damping: 40 } },
        exit: { y: "100%", transition: { duration: 0.22, ease: EXPO } },
      }
    : {
        initial: { opacity: 0, scale: 0.96, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: EXPO } },
        exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.18 } },
      };

  return (
    <div
      className={cx(
        "fixed inset-0 z-[60] flex justify-center sm:p-6",
        placement === "top" ? "items-end sm:items-start sm:pt-[12vh]" : "items-end sm:items-center",
      )}
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        onClick={() => !busy && onClose?.()}
        className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        {...panelMotion}
        className={cx(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-surface-elevated text-text-primary shadow-pop ring-1 ring-border outline-none sm:max-h-[min(86dvh,56rem)] sm:rounded-[28px]",
          SIZE[size],
        )}
      >
        {isSheet && <span className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-border-strong/40" aria-hidden />}

        {(title || !hideClose) && (
          <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-5 pb-4 sm:px-7 sm:pt-7">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-[1.375rem]">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-text-muted">
                  {description}
                </p>
              )}
            </div>
            {!hideClose && (
              <IconButton icon="x" label="Close" onClick={onClose} disabled={busy} tooltip={false} className="-mt-1 -mr-2" />
            )}
          </div>
        )}

        <div className={cx("scroll-panel min-h-0 flex-1 overflow-y-auto", bodyClassName ?? "px-6 pb-6 sm:px-7 sm:pb-7")}>
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-border bg-surface-muted/70 px-6 py-4 sm:px-7">{footer}</div>
        )}
      </motion.div>
    </div>
  );
}
