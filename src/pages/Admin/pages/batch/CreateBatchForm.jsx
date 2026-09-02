import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateBatchMutation } from "../../../../app/apis/batches.api.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";

/**
 * Create a batch — `api-contracts/06-batch.md` §1.
 *
 * A batch always starts `draft` with enrollment closed: §4 forbids opening
 * enrollment on anything but an active batch, and activation itself requires
 * published content. The form doesn't offer either toggle for that reason.
 */
const CreateBatchForm = ({ onClose }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [createBatch, { isLoading, error }] = useCreateBatchMutation();

  const handleChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.id]: event.target.value }));

  const datesInverted =
    form.startDate && form.endDate && form.endDate < form.startDate;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (datesInverted) return;

    const payload = {
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
    };
    if (form.description.trim()) payload.description = form.description.trim();

    try {
      const batch = await createBatch(payload).unwrap();
      onClose?.();
      navigate(`/admin/manage-batch/${batch.id}`);
    } catch {
      // surfaced below
    }
  };

  const issues = Object.fromEntries(
    (error?.details ?? []).map((detail) => [detail.field, detail.issue]),
  );

  return (
    <form onSubmit={handleSubmit} className="min-w-104">
      <div className="flex flex-col gap-3">
        <Field
          id="name"
          label="Name"
          placeholder="IC-38 — Aug 2026 Cohort"
          value={form.name}
          onChange={handleChange}
          issue={issues.name}
          required
          minLength={3}
          maxLength={120}
        />
        <Field
          id="startDate"
          label="Starts"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          issue={issues.startDate}
          required
        />
        <Field
          id="endDate"
          label="Ends"
          type="date"
          value={form.endDate}
          onChange={handleChange}
          issue={issues.endDate ?? (datesInverted ? "Must be on or after the start date" : undefined)}
          required
        />
        <div className="flex items-baseline gap-3">
          <label className="text-sm text-text-primary w-28 shrink-0" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            maxLength={2000}
            placeholder="Optional"
            value={form.description}
            onChange={handleChange}
            className="flex-1 text-sm py-2 px-3 bg-surface-elevated text-text-primary placeholder:text-text-muted rounded-md outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-danger text-xs font-semibold">
          {getUserMessage(error, "Couldn't create the batch.")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || datesInverted}
        className="mt-4 w-full px-4 py-2 bg-accent text-accent-contrast rounded-md font-semibold cursor-pointer disabled:opacity-50"
      >
        {isLoading ? "Creating…" : "Create batch"}
      </button>

      <p className="text-text-muted text-[11px] mt-3">
        Starts as a draft. Publish courses or tests into it, then activate and
        open enrollment.
      </p>
    </form>
  );
};

const Field = ({ id, label, issue, ...inputProps }) => (
  <div className="flex items-baseline gap-3">
    <label className="text-sm text-text-primary w-28 shrink-0" htmlFor={id}>
      {label}
    </label>
    <div className="flex-1">
      <input
        id={id}
        className="w-full text-sm py-1.5 px-3 bg-surface-elevated text-text-primary placeholder:text-text-muted rounded-md outline-none [color-scheme:dark]"
        {...inputProps}
      />
      {issue && <p className="text-danger text-xs mt-1">{issue}</p>}
    </div>
  </div>
);

export default CreateBatchForm;
