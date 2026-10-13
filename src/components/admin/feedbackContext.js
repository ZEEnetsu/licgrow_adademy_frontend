import { createContext, useContext } from "react";

/*
 * Contexts for the two app-wide feedback channels. They live in a plain module
 * so the provider files export only components (Fast Refresh).
 */

export const ConfirmContext = createContext(null);
export const ToastContext = createContext(null);

/**
 * `const confirm = useConfirm();`
 *
 * `await confirm({ title, description, confirmLabel, tone, icon, input, onConfirm })`
 * resolves `true` when the user confirms and `false` when they cancel.
 *
 * Pass `onConfirm` (async, receives the input's value) to run the action
 * inside the dialog: it stays open with a spinner, shows the error inline if
 * the action throws, and only resolves `true` once the action succeeds.
 *
 * Pass `input: { label, placeholder, maxLength, required }` to ask for a
 * reason (rejecting an enrollment), and `errorMessage: (error) => string` to
 * word a failure yourself (otherwise `getUserMessage` picks the copy).
 */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm() needs a <ConfirmProvider> above it.");
  return confirm;
}

/**
 * `const toast = useToast();`
 *
 * `toast.success(title, { description, action: { label, onClick }, duration })`,
 * `toast.error(...)`, `toast.info(...)`, and
 * `toast.promise(promise, { loading, success, error })`.
 */
export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast() needs a <ToastProvider> above it.");
  return toast;
}
