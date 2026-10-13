import { useEffect } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const focusables = (root) =>
  Array.from(root.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.closest("[inert]") && el.getClientRects().length > 0,
  );

/**
 * Keeps Tab inside `containerRef` while `active`, and puts focus back where it
 * was when it deactivates — the modal-dialog contract.
 *
 * Initial focus goes to `initialFocusRef`, else the first `[data-autofocus]`,
 * else the first form control, else the container itself (which therefore
 * needs `tabIndex={-1}`).
 */
export function useFocusTrap(containerRef, active, { initialFocusRef } = {}) {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return undefined;

    const previouslyFocused = document.activeElement;

    const initial =
      initialFocusRef?.current ??
      container.querySelector("[data-autofocus]") ??
      container.querySelector("input:not([type='hidden']), select, textarea") ??
      container;
    // after the enter animation has a frame to start, so the scroll position
    // of a sheet doesn't jump to the focused field
    const frame = requestAnimationFrame(() => initial.focus({ preventScroll: true }));

    const onKeyDown = (event) => {
      if (event.key !== "Tab") return;
      const items = focusables(container);
      if (items.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [containerRef, active, initialFocusRef]);
}

export default useFocusTrap;
