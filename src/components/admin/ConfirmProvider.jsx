import { useCallback, useId, useRef, useState } from "react";

import Icon from "../ui/Icon.jsx";
import { getUserMessage } from "../../app/apis/apiError.js";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";
import { FormActions, FormError, Textarea } from "./Field.jsx";
import { ConfirmContext } from "./feedbackContext.js";
import { cx } from "./cx.js";

const TONE_ICON = {
  danger: { icon: "alertTriangle", chip: "bg-danger-muted text-danger" },
  default: { icon: "info", chip: "bg-accent-muted text-accent" },
};

/**
 * Hosts the confirm dialog behind `useConfirm()`. Mounted once, by the admin
 * shell. Every destructive action goes through it, so they all look, read and
 * behave the same way.
 *
 * For `tone: "danger"` initial focus goes to Cancel, so Enter on a dialog
 * opened by accident does the safe thing.
 */
export default function ConfirmProvider({ children }) {
  // the request outlives `open`, so the dialog keeps its content while it
  // animates out
  const [request, setRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(null);
  const inputId = useId();

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setValue(options.input?.defaultValue ?? "");
        setError(null);
        setBusy(false);
        setRequest({ ...options, resolve });
        setOpen(true);
      }),
    [],
  );

  const settle = (result) => {
    if (!open) return;
    request?.resolve(result);
    setOpen(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!request) return;
    if (request.input?.required && !value.trim()) {
      setError(`${request.input.label ?? "A reason"} is required.`);
      return;
    }
    if (!request.onConfirm) {
      settle(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await request.onConfirm(value.trim());
      settle(true);
    } catch (err) {
      setError(request.errorMessage?.(err) ?? getUserMessage(err, "That didn't work. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const tone = request?.tone === "danger" ? "danger" : "default";
  const look = TONE_ICON[tone];

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={open}
        onClose={() => settle(false)}
        ariaLabel={request?.title}
        busy={busy}
        size="sm"
        hideClose
        initialFocusRef={tone === "danger" && !request?.input ? cancelRef : undefined}
      >
        {request && (
          <form onSubmit={onSubmit} className="pt-7">
            <span className={cx("grid h-12 w-12 place-items-center rounded-2xl", look.chip)}>
              <Icon name={request.icon ?? look.icon} className="h-6 w-6" strokeWidth={2} />
            </span>
            <h2 className="mt-5 font-display text-xl font-extrabold tracking-tight text-text-primary">
              {request.title}
            </h2>
            {request.description && (
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{request.description}</p>
            )}

            {request.input && (
              <div className="mt-5 flex flex-col gap-1.5">
                <label htmlFor={inputId} className="text-sm font-semibold text-text-primary">
                  {request.input.label}
                  {!request.input.required && (
                    <span className="ml-2 text-xs font-medium text-text-muted">Optional</span>
                  )}
                </label>
                <Textarea
                  id={inputId}
                  rows={3}
                  value={value}
                  maxLength={request.input.maxLength}
                  placeholder={request.input.placeholder}
                  onChange={(event) => setValue(event.target.value)}
                  data-autofocus
                />
                {request.input.maxLength && (
                  <p className="text-right text-[11px] text-text-muted tabular-nums">
                    {value.length}/{request.input.maxLength}
                  </p>
                )}
              </div>
            )}

            <FormError className="mt-4">{error}</FormError>

            <FormActions className="mt-6">
              <Button ref={cancelRef} variant="ghost" onClick={() => settle(false)} disabled={busy}>
                {request.cancelLabel ?? "Cancel"}
              </Button>
              <Button type="submit" variant={tone === "danger" ? "danger" : "primary"} loading={busy}>
                {request.confirmLabel ?? "Confirm"}
              </Button>
            </FormActions>
          </form>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}
