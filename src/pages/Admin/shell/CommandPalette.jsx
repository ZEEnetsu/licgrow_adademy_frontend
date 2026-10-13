import { useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Icon from "../../../components/ui/Icon.jsx";
import { Kbd, Modal, cx } from "../../../components/admin";
import { selectCan, selectIsSuperAdmin } from "../../../app/features/auth/auth.selectors.js";
import { selectTheme, setTheme } from "../../../app/features/theme.slice.js";
import { useAuth } from "../../../app/features/auth/useAuth.js";
import { buildCommands, rankCommands } from "./commands.js";

/**
 * ⌘K / Ctrl K: jump to any admin page or start any "create" flow by typing.
 * It replaces the header's old search box, which looked like search and did
 * nothing.
 */
export default function CommandPalette({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" placement="top" hideClose ariaLabel="Command palette" bodyClassName="p-0">
      <PaletteBody onClose={onClose} />
    </Modal>
  );
}

function PaletteBody({ onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const can = useSelector(selectCan);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const mode = useSelector(selectTheme);
  const { logout } = useAuth();

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const listRef = useRef(null);

  const commands = useMemo(
    () => buildCommands({ can, isSuperAdmin, navigate, mode, setMode: (next) => dispatch(setTheme(next)), logout }),
    [can, isSuperAdmin, navigate, mode, dispatch, logout],
  );
  const results = rankCommands(commands, query);
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  const run = (command) => {
    onClose();
    command.run();
  };

  const scrollIntoView = (index) => {
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = (activeIndex + delta + results.length) % Math.max(results.length, 1);
      setActive(next);
      scrollIntoView(next);
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      run(results[activeIndex]);
    }
  };

  // group in result order, keeping each group's first appearance
  const groups = [];
  results.forEach((command, index) => {
    let group = groups.find((g) => g.name === command.group);
    if (!group) {
      group = { name: command.group, items: [] };
      groups.push(group);
    }
    group.items.push({ command, index });
  });

  return (
    <div className="flex max-h-[min(70dvh,34rem)] flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Icon name="search" className="h-5 w-5 shrink-0 text-text-muted" strokeWidth={2} />
        <input
          data-autofocus
          type="text"
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          aria-label="Search pages and actions"
          placeholder="Search pages and actions…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-[16px] text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <Kbd>esc</Kbd>
      </div>

      <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="scroll-panel min-h-0 flex-1 overflow-y-auto p-2">
        {results.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-text-muted">
            Nothing matches “{query.trim()}”.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.name} role="group" aria-label={group.name} className="mb-1 last:mb-0">
              <p className="caps px-3 pt-2.5 pb-1.5 text-[10px] font-bold text-text-muted">{group.name}</p>
              {group.items.map(({ command, index }) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={command.id}
                    id={`${listId}-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={isActive}
                    onPointerMove={() => !isActive && setActive(index)}
                    onClick={() => run(command)}
                    className={cx(
                      "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-100",
                      isActive ? "bg-surface-hover" : "",
                    )}
                  >
                    <span
                      className={cx(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-150",
                        isActive ? "bg-accent-solid text-accent-solid-contrast" : "bg-tint-slate text-text-primary",
                      )}
                    >
                      <Icon name={command.icon} className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{command.label}</span>
                    {command.hint && <span className="text-xs text-text-muted">{command.hint}</span>}
                    <Icon
                      name="arrowRight"
                      className={cx("h-4 w-4 shrink-0 text-text-muted transition-opacity duration-150", isActive ? "opacity-100" : "opacity-0")}
                      strokeWidth={2}
                    />
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-border bg-surface-muted/70 px-5 py-2.5 text-[11px] text-text-muted max-sm:hidden">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> to move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>↵</Kbd> to open
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>esc</Kbd> to close
        </span>
      </div>
    </div>
  );
}
