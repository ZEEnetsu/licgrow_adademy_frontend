import { useEffect, useSyncExternalStore } from "react";

let locks = 0;
const saved = new Map();
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

/**
 * Stops the page (and the admin's own scrolling <main>) from scrolling behind
 * a modal. Counted, so a confirm dialog opened over a form modal doesn't
 * unlock the page when it closes.
 */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;

    if (locks === 0) {
      for (const el of [document.body, document.getElementById("admin-main")]) {
        if (!el) continue;
        saved.set(el, el.style.overflow);
        el.style.overflow = "hidden";
      }
    }
    locks += 1;
    notify();

    return () => {
      locks -= 1;
      if (locks === 0) {
        for (const [el, overflow] of saved) el.style.overflow = overflow;
        saved.clear();
      }
      notify();
    };
  }, [active]);
}

/** True while any modal holds the scroll lock — the toast stack moves up out of its footer. */
export function useAnyModalOpen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => locks > 0,
    () => false,
  );
}

export default useScrollLock;
