import { useRef } from "react";

import Icon from "../ui/Icon.jsx";
import { useHotkey } from "../../hooks/useHotkey.js";
import { Kbd, Spinner } from "./Primitives.jsx";
import { cx } from "./cx.js";

/**
 * The list search box. Controlled — the debounce and the ≥2-character rule
 * live in `useListParams`, which owns the query; this only renders it.
 *
 *   /        focuses it from anywhere on the page (not while typing elsewhere)
 *   Escape   clears it, or blurs it when already empty
 *
 * The right-hand slot says what's happening: a spinner while a search is in
 * flight, "2+ letters" while the query is too short to send, a clear button
 * once there's a query, and the "/" hint when idle.
 */
export default function SearchInput({ value, onChange, label, placeholder = "Search…", isSearching = false, minLength = 2, shortcut = "/", className }) {
  const inputRef = useRef(null);
  const trimmed = value.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < minLength;

  useHotkey(
    shortcut ?? "/",
    (event) => {
      event.preventDefault();
      inputRef.current?.focus();
    },
    { enabled: Boolean(shortcut) },
  );

  return (
    <div className={cx("relative w-full sm:w-72", className)}>
      <Icon
        name="search"
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-muted"
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          if (value) onChange("");
          else event.currentTarget.blur();
        }}
        aria-label={label}
        placeholder={placeholder}
        className="h-10 w-full rounded-full bg-surface-elevated pr-20 pl-10 text-sm text-text-primary shadow-[0_1px_2px_rgb(21_13_61/0.05)] ring-1 ring-inset ring-border transition-[box-shadow] duration-200 placeholder:text-text-muted hover:ring-border-strong/60 focus:ring-2 focus:ring-ring focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1.5">
        {isSearching ? (
          <Spinner className="mr-1.5 h-4 w-4 text-text-muted" />
        ) : tooShort ? (
          <span className="mr-2 text-[11px] font-medium text-text-muted">{minLength}+ letters</span>
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="focus-ring grid h-7 w-7 cursor-pointer place-items-center rounded-full text-text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-text-primary"
          >
            <Icon name="x" className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        ) : shortcut ? (
          <Kbd className="mr-1.5 max-sm:hidden">{shortcut}</Kbd>
        ) : null}
      </span>
    </div>
  );
}
