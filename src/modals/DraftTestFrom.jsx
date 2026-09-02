import { useState } from "react";

import {
  useCreateTestMutation,
  TEST_KIND,
} from "../app/apis/tests.api.js";
import { getUserMessage } from "../app/apis/apiError.js";

/**
 * Create a draft test — `api-contracts/09-test.md` §1.
 *
 * The contract requires `kind`, `title`, `passingMarks` AND `maxAttempts`
 * (the last must be present; `null` means unlimited). Unknown fields are
 * rejected by the strict schema, so the payload is assembled explicitly rather
 * than spreading form state.
 *
 * `kind: "quiz"` additionally requires a `unitId`, which needs the course tree
 * from 08-course.md — not built yet, so quiz creation is disabled here.
 */

const UNLIMITED = "unlimited";

const initialForm = {
  title: "",
  description: "",
  durationMinutes: "",
  passingMarks: "0",
  maxAttempts: "1",
};

const DraftTestFrom = ({ onClose }) => {
  const [form, setForm] = useState(initialForm);
  const [createTest, { isLoading, error, isSuccess, reset }] =
    useCreateTestMutation();

  const handleChange = (event) => {
    const { id, value } = event.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    if (error || isSuccess) reset();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Build exactly the documented shape — no extra keys.
    const payload = {
      kind: TEST_KIND.TEST,
      title: form.title.trim(),
      passingMarks: Number(form.passingMarks),
      maxAttempts:
        form.maxAttempts === UNLIMITED ? null : Number(form.maxAttempts),
    };

    const description = form.description.trim();
    if (description) payload.description = description;

    if (form.durationMinutes !== "") {
      payload.durationMinutes = Number(form.durationMinutes);
    }

    try {
      await createTest(payload).unwrap();
      setForm(initialForm);
      onClose?.();
    } catch {
      // surfaced below via `error`
    }
  };

  /** 400 VALIDATION_ERROR carries per-field issues (conventions §4). */
  const fieldIssues = Object.fromEntries(
    (error?.details ?? []).map((detail) => [detail.field, detail.issue]),
  );

  return (
    <form onSubmit={handleSubmit} className="min-w-104">
      <div className="grid grid-cols-1 gap-3">
        <Field
          id="title"
          label="Test name"
          placeholder="IC-38 Full Length — Set 1"
          value={form.title}
          onChange={handleChange}
          issue={fieldIssues.title}
          required
          minLength={3}
          maxLength={160}
        />

        <Field
          id="description"
          label="Description"
          placeholder="Optional"
          value={form.description}
          onChange={handleChange}
          issue={fieldIssues.description}
          maxLength={2000}
        />

        <Field
          id="durationMinutes"
          label="Duration"
          type="number"
          min={1}
          placeholder="Leave blank for untimed"
          value={form.durationMinutes}
          onChange={handleChange}
          issue={fieldIssues.durationMinutes}
          hint="minutes"
        />

        <Field
          id="passingMarks"
          label="Passing marks"
          type="number"
          min={0}
          value={form.passingMarks}
          onChange={handleChange}
          issue={fieldIssues.passingMarks}
          required
          hint="validated against total marks at publish"
        />

        <div className="flex items-baseline gap-3">
          <label
            className="text-sm text-text-primary w-28 shrink-0"
            htmlFor="maxAttempts"
          >
            Max attempts
          </label>
          <div className="flex-1">
            <select
              id="maxAttempts"
              value={form.maxAttempts}
              onChange={handleChange}
              className="w-full text-sm py-1 px-3 bg-surface-elevated text-text-primary rounded-md outline-none"
            >
              {[1, 2, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value={UNLIMITED}>Unlimited</option>
            </select>
            {fieldIssues.maxAttempts && (
              <p className="text-danger text-xs mt-1">
                {fieldIssues.maxAttempts}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-danger-muted border border-danger/40 px-3 py-2">
          <p className="text-danger text-xs font-semibold">
            {getUserMessage(error, "Couldn't create the test.")}
          </p>
          {error.requestId && (
            <p className="text-danger text-[10px] mt-1">
              Request {error.requestId}
            </p>
          )}
        </div>
      )}

      {isSuccess && (
        <p className="text-success text-xs mt-3 font-semibold">
          Draft created.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full px-4 py-2 bg-accent text-accent-contrast rounded-md font-semibold cursor-pointer disabled:opacity-50"
      >
        {isLoading ? "Creating…" : "Create draft test"}
      </button>

      <p className="text-text-muted text-[11px] mt-3">
        Creates a full-length test. Quizzes attach to a course unit and need the
        course tree, which isn&apos;t built yet.
      </p>
    </form>
  );
};

const Field = ({ id, label, issue, hint, ...inputProps }) => (
  <div className="flex items-baseline gap-3">
    <label className="text-sm text-text-primary w-28 shrink-0" htmlFor={id}>
      {label}
    </label>
    <div className="flex-1">
      <input
        id={id}
        className="w-full text-sm py-1 px-3 bg-surface-elevated text-text-primary placeholder:text-text-muted rounded-md outline-none"
        {...inputProps}
      />
      {issue ? (
        <p className="text-danger text-xs mt-1">{issue}</p>
      ) : (
        hint && <p className="text-text-muted text-[11px] mt-1">{hint}</p>
      )}
    </div>
  </div>
);

export default DraftTestFrom;
