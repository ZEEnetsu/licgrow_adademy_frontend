import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import Icon from "../ui/Icon.jsx";
import { EXPO } from "../motion/primitives.js";
import { INPUT_CLASS } from "./Field.jsx";
import { Spinner } from "./Primitives.jsx";
import { portalTarget, useFloating } from "./floating.js";
import { cx } from "./cx.js";

/**
 * A searchable picker for server data (batches, courses, tests). It replaces
 * native <select>s that could only ever list the first 20 records.
 *
 * Controlled from outside, because the parent owns the query:
 *
 *   const [search, setSearch] = useState("");
 *   const q = useDebouncedValue(search.trim(), 250);
 *   const { data, isFetching } = useGetBatchesQuery({ status: "active", limit: 20, ...(q.length >= 2 && { q }) });
 *   <EntityCombobox items={data?.items} isFetching={isFetching}
 *     search={search} onSearchChange={setSearch}
 *     value={batch} onChange={setBatch} getLabel={(b) => b.name} />
 *
 * ARIA combobox (list autocomplete): focus stays in the input, the active
 * option is announced through `aria-activedescendant`. ↓/↑ move, Enter picks,
 * Escape closes (then clears). With something picked, a clear button empties
 * the choice (`onChange(null)`) unless `clearable={false}`.
 *
 * The ref goes to the <input>, for programmatic focus. Extra props (aria-*,
 * `onFocus`, `onBlur`) land on the input too, and compose with its own.
 */
const EntityCombobox = forwardRef(function EntityCombobox({
  id,
  items = [],
  isFetching = false,
  search,
  onSearchChange,
  value,
  onChange,
  getLabel,
  getDescription,
  getKey = (item) => item.id,
  exclude,
  placeholder = "Search…",
  emptyText = "No matches",
  footer = "Type to narrow the list",
  disabled,
  clearable = true,
  onFocus: onFocusProp,
  ...inputProps
}, forwardedRef) {
  const inputRef = useRef(null);
  const setInputRef = (node) => {
    inputRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  const listRef = useRef(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const options = exclude ? items.filter((item) => !exclude.has(getKey(item))) : items;
  const activeIndex = Math.min(active, Math.max(0, options.length - 1));

  useFloating(inputRef, listRef, open, { side: "bottom", align: "start", offset: 6, matchWidth: true });

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (inputRef.current?.contains(event.target) || listRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const pick = (item) => {
    onChange(item);
    onSearchChange("");
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      else setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && open && options[activeIndex]) {
      event.preventDefault();
      pick(options[activeIndex]);
    } else if (event.key === "Escape") {
      if (open) {
        event.stopPropagation();
        setOpen(false);
      } else if (search) {
        onSearchChange("");
      }
    }
  };

  // while closed and something is picked, the box shows the pick
  const shown = open || !value ? search : getLabel(value);
  const activeId = open && options[activeIndex] ? `${listId}-${activeIndex}` : undefined;

  return (
    <div className="relative">
      <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={2} />
      <input
        {...inputProps}
        ref={setInputRef}
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeId}
        autoComplete="off"
        disabled={disabled}
        value={shown}
        placeholder={value ? getLabel(value) : placeholder}
        onFocus={(event) => {
          setOpen(true);
          onFocusProp?.(event);
        }}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          onSearchChange(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={cx(INPUT_CLASS, "h-11 pr-10 pl-10")}
      />
      {value && clearable && !disabled && !open ? (
        <button
          type="button"
          aria-label="Clear selection"
          onClick={() => {
            onChange(null);
            onSearchChange("");
            inputRef.current?.focus();
          }}
          className="focus-ring absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-text-primary"
        >
          <Icon name="x" className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      ) : (
        <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-text-muted">
          {isFetching ? <Spinner className="h-4 w-4" /> : <Icon name="chevron" className="h-4 w-4" strokeWidth={2} />}
        </span>
      )}

      {createPortal(
        <AnimatePresence>
          {open && (
            // ref-less wrapper: see Tooltip.jsx
            <div key="listbox" className="contents">
            <motion.ul
              ref={listRef}
              id={listId}
              role="listbox"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.16, ease: EXPO } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="scroll-panel fixed z-[65] max-h-72 overflow-y-auto rounded-2xl bg-surface-elevated p-1.5 shadow-pop ring-1 ring-border"
            >
              {options.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-text-muted">{isFetching ? "Searching…" : emptyText}</li>
              ) : (
                options.map((item, i) => {
                  const selected = value && getKey(value) === getKey(item);
                  return (
                    <li
                      key={getKey(item)}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={Boolean(selected)}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => pick(item)}
                      onPointerMove={() => i !== activeIndex && setActive(i)}
                      className={cx(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-100",
                        i === activeIndex ? "bg-surface-hover" : "",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-text-primary">{getLabel(item)}</span>
                        {getDescription && (
                          <span className="block truncate text-xs text-text-muted">{getDescription(item)}</span>
                        )}
                      </span>
                      {selected && <Icon name="check" className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.25} />}
                    </li>
                  );
                })
              )}
              {footer && options.length > 0 && (
                <li role="presentation" className="px-3 pt-2 pb-1 text-[11px] text-text-muted">
                  {footer}
                </li>
              )}
            </motion.ul>
            </div>
          )}
        </AnimatePresence>,
        portalTarget(),
      )}
    </div>
  );
});

export default EntityCombobox;
