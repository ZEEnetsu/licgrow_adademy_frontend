import { useEffect, useRef } from "react";

const isEditable = (el) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/**
 * A document-level keyboard shortcut.
 *
 * `combo` is a key name with optional modifiers: "/", "escape", "mod+k".
 * `mod` is ⌘ on macOS and Ctrl elsewhere. Shortcuts are ignored while the user
 * is typing in a field unless `allowInInputs` is set (Escape and ⌘K want it;
 * "/" must not steal the slash from a text box).
 */
export function useHotkey(combo, handler, { enabled = true, allowInInputs = false } = {}) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const parts = combo.toLowerCase().split("+");
    const key = parts.pop();
    const wantsMod = parts.includes("mod");
    const wantsShift = parts.includes("shift");

    const onKeyDown = (event) => {
      if (event.defaultPrevented && key !== "escape") return;
      if (event.key?.toLowerCase() !== key) return;
      const mod = event.metaKey || event.ctrlKey;
      if (wantsMod !== mod || wantsShift !== event.shiftKey) return;
      if (!allowInInputs && isEditable(event.target)) return;

      handlerRef.current?.(event);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [combo, enabled, allowInInputs]);
}

/** "⌘" on Apple platforms, "Ctrl" elsewhere — for rendering shortcut hints. */
export const modKeyLabel = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent)
    ? "⌘"
    : "Ctrl";

export default useHotkey;
