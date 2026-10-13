import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  DateInput,
  Field,
  FormActions,
  FormError,
  Input,
  Modal,
  Textarea,
  fieldIssues,
  useToast,
} from "../../../../components/admin";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import { useCreateBatchMutation } from "../../../../app/apis/batches.api.js";

/**
 * The "New batch" dialog — `api-contracts/06-batch.md` §1.
 *
 * A batch always starts `draft` with enrollment closed: §4 forbids opening
 * enrollment on anything but an active batch, and activation needs published
 * content. So the form asks only for a name, dates and a description; the
 * rest happens on the batch's own page, where the next steps are spelled out.
 *
 * The dialog owns the mutation (so it can refuse to close mid-save); the
 * fields live in a child that unmounts on close, so every opening starts
 * clean. On success: toast, then go to the new batch — replacing the `?new=1`
 * entry, so Back returns to the list rather than reopening the dialog.
 */
export default function CreateBatchForm({ open, onClose }) {
  const [createBatch, { isLoading, error, reset }] = useCreateBatchMutation();

  const close = () => {
    if (isLoading) return;
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      busy={isLoading}
      title="New batch"
      description="Batches start as drafts only admins can see. You'll add content and open enrollment from its page."
    >
      <BatchFields createBatch={createBatch} isLoading={isLoading} error={error} clearError={reset} onCancel={close} />
    </Modal>
  );
}

const EMPTY = { name: "", description: "", startDate: "", endDate: "" };

/** What the client can check before asking the server (§1's rules). */
function validate(form) {
  const issues = {};
  const name = form.name.trim();
  if (!name) issues.name = "Give the batch a name.";
  else if (name.length < 3) issues.name = "Use at least 3 characters.";
  if (!form.startDate) issues.startDate = "Pick a start date.";
  if (!form.endDate) issues.endDate = "Pick an end date.";
  else if (form.startDate && form.endDate < form.startDate) issues.endDate = "The end date can't be before the start date.";
  return issues;
}

function BatchFields({ createBatch, isLoading, error, clearError, onCancel }) {
  const navigate = useNavigate();
  const toast = useToast();
  const formRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [attempted, setAttempted] = useState(false);

  const clientIssues = validate(form);
  const serverIssues = fieldIssues(error);
  const datesInverted = Boolean(form.startDate && form.endDate && form.endDate < form.startDate);
  // "required" messages wait for a submit; a backwards date range shows at once
  const issueFor = (field) =>
    (attempted || (field === "endDate" && datesInverted) ? clientIssues[field] : undefined) ?? serverIssues[field];

  const update = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    // the server's verdict was about the old values
    if (error) clearError();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(clientIssues).length > 0) {
      requestAnimationFrame(() => formRef.current?.querySelector("[aria-invalid='true']")?.focus());
      return;
    }

    const payload = { name: form.name.trim(), startDate: form.startDate, endDate: form.endDate };
    if (form.description.trim()) payload.description = form.description.trim();

    try {
      const batch = await createBatch(payload).unwrap();
      toast.success(`${batch.name} is created`, {
        description: "It's a draft. Add published courses or tests, then activate it.",
      });
      navigate(`/admin/manage-batch/${batch.id}`, { replace: true });
    } catch {
      // shown in the form: FormError plus per-field details
    }
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Name" required error={issueFor("name")}>
        <Input
          value={form.name}
          onChange={update("name")}
          placeholder="e.g. IC-38 Aug 2026 cohort"
          maxLength={120}
          autoComplete="off"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
        <Field label="Starts" required error={issueFor("startDate")}>
          <DateInput value={form.startDate} onChange={update("startDate")} />
        </Field>
        <Field label="Ends" required error={issueFor("endDate")}>
          <DateInput value={form.endDate} onChange={update("endDate")} min={form.startDate || undefined} />
        </Field>
      </div>

      <Field
        label="Description"
        optional
        hint="Learners see this when they browse batches that are open for enrollment."
        error={serverIssues.description}
      >
        <Textarea
          rows={3}
          value={form.description}
          onChange={update("description")}
          maxLength={2000}
          placeholder="Who it's for, the exam it prepares for, the weekly rhythm…"
        />
      </Field>

      <FormError>{error ? getUserMessage(error, "Couldn't create the batch. Please try again.") : null}</FormError>

      <FormActions className="pt-1">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon="plus" loading={isLoading}>
          Create batch
        </Button>
      </FormActions>
    </form>
  );
}
