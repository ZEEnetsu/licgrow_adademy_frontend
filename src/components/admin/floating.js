import { useLayoutEffect } from "react";

/**
 * Pins a floating element (menu, tooltip, listbox) to an anchor with
 * `position: fixed`, and keeps it there through scrolling and resizing.
 *
 * It writes `top`/`left` straight onto the element instead of going through
 * state: the position changes on every scroll frame, and a re-render per frame
 * would be wasted work. It runs in a layout effect, so the element is placed
 * before the first paint and never flashes at 0,0.
 *
 * `side` is where the element sits relative to the anchor; `align` lines up
 * its start/end edge with the anchor's. If it would leave the viewport on
 * `side`, it flips to the opposite side.
 */
export function useFloating(anchorRef, floatingRef, open, { side = "bottom", align = "start", offset = 8, matchWidth = false } = {}) {
  useLayoutEffect(() => {
    if (!open) return undefined;
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return undefined;

    const place = () => {
      const a = anchor.getBoundingClientRect();
      if (matchWidth) floating.style.minWidth = `${a.width}px`;
      const f = floating.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 8;

      let top;
      let left;
      if (side === "bottom" || side === "top") {
        const below = a.bottom + offset;
        const above = a.top - offset - f.height;
        top = side === "bottom"
          ? (below + f.height > vh - margin && above > margin ? above : below)
          : (above < margin ? below : above);
        left = align === "end" ? a.right - f.width : align === "center" ? a.left + a.width / 2 - f.width / 2 : a.left;
      } else {
        const right = a.right + offset;
        const leftSide = a.left - offset - f.width;
        left = side === "right"
          ? (right + f.width > vw - margin ? leftSide : right)
          : (leftSide < margin ? right : leftSide);
        top = a.top + a.height / 2 - f.height / 2;
      }

      floating.style.top = `${Math.round(Math.min(Math.max(top, margin), vh - f.height - margin))}px`;
      floating.style.left = `${Math.round(Math.min(Math.max(left, margin), vw - f.width - margin))}px`;
    };

    place();
    window.addEventListener("resize", place);
    // capture: any scrolling ancestor, including the admin's own <main>
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef, floatingRef, open, side, align, offset, matchWidth]);
}

/** Where portalled overlays mount (see index.html). */
export const portalTarget = () =>
  document.getElementById("portal-root") ?? document.body;
