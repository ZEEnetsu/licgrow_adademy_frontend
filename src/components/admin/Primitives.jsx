import { motion } from "framer-motion";

import { cx } from "./cx.js";

/** A keyboard key, for shortcut hints: <Kbd>/</Kbd>, <Kbd>⌘K</Kbd>. */
export function Kbd({ children, className }) {
  return (
    <kbd
      className={cx(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-surface-muted px-1.5 font-sans text-[11px] font-semibold text-text-muted ring-1 ring-inset ring-border",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/**
 * A busy indicator. Decorative by default (the button or region it sits in
 * carries `aria-busy`); pass `label` when it is the only sign of loading.
 */
export function Spinner({ className = "h-4 w-4", label }) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cx("inline-block shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  );
}

/**
 * On/off switch (`role="switch"`). For a setting that takes effect at once —
 * "enrollment open" — not for a form field that waits for Save.
 *
 * While `busy` it stays focusable (`aria-disabled`, clicks ignored), so a
 * keyboard user doesn't lose their place mid-toggle. Extra props
 * (`aria-describedby` for a "why it's off" hint) go to the button.
 */
export function Switch({ checked, onChange, label, disabled, busy, className, id, ...rest }) {
  return (
    <button
      {...rest}
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      disabled={disabled}
      onClick={() => !busy && onChange?.(!checked)}
      className={cx(
        "focus-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 ease-out-expo disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress",
        checked ? "justify-end bg-accent-solid" : "justify-start bg-border-strong/70",
        className,
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        className={cx(
          "grid h-5 w-5 place-items-center rounded-full shadow-[0_1px_3px_rgb(21_13_61/0.3)]",
          // on the dark theme's lavender track a white thumb would vanish
          checked ? "bg-accent-solid-contrast" : "bg-white",
        )}
      >
        {busy && <Spinner className="h-3 w-3 text-accent-solid" />}
      </motion.span>
    </button>
  );
}
