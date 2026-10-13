import { Children, cloneElement, forwardRef, isValidElement, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Icon from "../ui/Icon.jsx";
import { cx } from "./cx.js";

/*
 * Form controls, from the landing page's sign-in form: a cream well that turns
 * white and gains an ember ring on focus. The edge is `border-strong` because
 * an input's boundary is a UI component and has to clear 3:1 against the
 * page (see theme.css).
 */
export const INPUT_CLASS =
  "block w-full rounded-2xl bg-field text-[15px] text-text-primary ring-1 ring-inset ring-border-strong placeholder:text-text-muted/80 transition-[box-shadow,background-color] duration-200 focus:bg-field-focus focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:ring-danger";

/**
 * Label + control + hint/error, wired for assistive tech: the control gets
 * the `id`, `aria-invalid` and `aria-describedby` pointing at the hint and the
 * error. Labels always sit above the control.
 */
export function Field({ label, hint, error, required, optional, className, children, id: idProp }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = Children.only(children);
  const wired = isValidElement(control)
    ? cloneElement(control, {
        id,
        required: required || control.props.required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })
    : control;

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-semibold text-text-primary">
        <span>
          {label}
          {required && (
            <span className="text-accent" aria-hidden>
              {" "}*
            </span>
          )}
        </span>
        {optional && <span className="text-xs font-medium text-text-muted">Optional</span>}
      </label>
      {wired}
      {hint && (
        <p id={hintId} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key="error"
            id={errorId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-danger"
          >
            <Icon name="info" className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cx(INPUT_CLASS, "h-11 px-4", className)} {...props} />;
});

export const DateInput = forwardRef(function DateInput({ className, ...props }, ref) {
  // `color-scheme` comes from the root (theme.css), so the native picker
  // follows the theme without a per-input override
  return <input ref={ref} type="date" className={cx(INPUT_CLASS, "h-11 px-4 tabular-nums", className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cx(INPUT_CLASS, "resize-y px-4 py-3 leading-relaxed", className)} {...props} />;
});

/**
 * Native select, styled. For short, static option lists; use EntityCombobox
 * for server data. `size="sm"` is the compact one for inline use in a table
 * row (a role picker).
 */
export const Select = forwardRef(function Select({ className, size = "md", children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cx(
          INPUT_CLASS,
          "cursor-pointer appearance-none",
          size === "sm" ? "h-9 rounded-xl pr-8 pl-3 text-[13px]" : "h-11 pr-10 pl-4",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="chevron"
        className={cx(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-muted",
          size === "sm" ? "right-2.5 h-3.5 w-3.5" : "right-3.5 h-4 w-4",
        )}
        strokeWidth={2}
      />
    </div>
  );
});

/** A checkbox with its label, for boolean form fields. */
export function Checkbox({ label, description, className, ...props }) {
  return (
    <label className={cx("flex cursor-pointer items-start gap-3", className)}>
      <input
        type="checkbox"
        className="focus-ring mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded-md accent-[var(--accent-solid)]"
        {...props}
      />
      <span>
        <span className="block text-sm font-semibold text-text-primary">{label}</span>
        {description && <span className="block text-xs text-text-muted">{description}</span>}
      </span>
    </label>
  );
}

/** Form-level error (the API's message), announced when it appears. */
export function FormError({ children, className }) {
  if (!children) return null;
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cx(
        "flex items-start gap-2.5 rounded-2xl bg-danger-muted px-4 py-3 text-[13px] font-semibold text-danger ring-1 ring-inset ring-danger/20",
        className,
      )}
    >
      <Icon name="alertTriangle" className="mt-px h-4 w-4 shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </motion.div>
  );
}

/** The button row at the foot of a form: stacked on phones, right-aligned above. */
export function FormActions({ children, className }) {
  return (
    <div className={cx("flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end", className)}>
      {children}
    </div>
  );
}
