import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateCourseMutation } from "../../../../app/apis/courses.api.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";

/**
 * Create a course — `api-contracts/08-course.md` §1.
 *
 * Only `title` is required; `description` and `examTarget` are optional. The
 * schema is strict, so the payload is assembled explicitly rather than spread
 * from form state.
 */
const CreateCourseForm = ({ onClose }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    examTarget: "IC-38",
  });

  const [createCourse, { isLoading, error }] = useCreateCourseMutation();

  const handleChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.id]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = { title: form.title.trim() };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.examTarget.trim()) payload.examTarget = form.examTarget.trim();

    try {
      const course = await createCourse(payload).unwrap();
      onClose?.();
      // straight into the tree — an empty course is useless until it has units
      navigate(`/admin/manage-course/${course.id}`);
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
          id="title"
          label="Title"
          placeholder="Life Insurance Basics"
          value={form.title}
          onChange={handleChange}
          issue={issues.title}
          required
          minLength={3}
          maxLength={160}
        />
        <Field
          id="examTarget"
          label="Exam target"
          placeholder="IC-38"
          value={form.examTarget}
          onChange={handleChange}
          issue={issues.examTarget}
          maxLength={40}
          hint="optional"
        />
        <div className="flex items-baseline gap-3">
          <label className="text-sm text-text-primary w-28 shrink-0" htmlFor="description">
            Description
          </label>
          <div className="flex-1">
            <textarea
              id="description"
              rows={3}
              maxLength={4000}
              placeholder="Optional"
              value={form.description}
              onChange={handleChange}
              className="w-full text-sm py-2 px-3 bg-surface-elevated text-text-primary placeholder:text-text-muted rounded-md outline-none"
            />
            {issues.description && (
              <p className="text-danger text-xs mt-1">{issues.description}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-danger text-xs font-semibold">
          {getUserMessage(error, "Couldn't create the course.")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full px-4 py-2 bg-accent text-accent-contrast rounded-md font-semibold cursor-pointer disabled:opacity-50"
      >
        {isLoading ? "Creating…" : "Create course"}
      </button>
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
        className="w-full text-sm py-1.5 px-3 bg-surface-elevated text-text-primary placeholder:text-text-muted rounded-md outline-none"
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

export default CreateCourseForm;
