import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
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
import { useCreateCourseMutation } from "../../../../app/apis/courses.api.js";

/**
 * Create a course — `api-contracts/08-course.md` §1 — in the "New course"
 * modal (`?new=1`).
 *
 * Only `title` is required (3–160); `description` (≤ 4000) and `examTarget`
 * (≤ 40) are optional. The schema is strict, so the payload is assembled
 * explicitly rather than spread from form state.
 *
 * On success: toast, close, and straight into the new course's tree — an
 * empty course is useless until it has units. The navigation REPLACES the
 * `?new=1` entry, so Back returns to the list rather than reopening the form.
 */
const CreateCourseForm = ({ open, onClose }) => {
  const [createCourse, state] = useCreateCourseMutation();

  const close = () => {
    state.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      busy={state.isLoading}
      title="New course"
      description="Start with a title. You'll add units and chapters next, then publish."
    >
      <CourseForm createCourse={createCourse} state={state} onClose={close} />
    </Modal>
  );
};

export default CreateCourseForm;

/** The form body: mounted fresh each time the modal opens, so it starts empty. */
function CourseForm({ createCourse, state, onClose }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: "", examTarget: "IC-38", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const titleRef = useRef(null);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const title = form.title.trim();
  const titleError = submitted && title.length < 3 ? "Give the course a title of at least 3 characters." : null;
  const issues = fieldIssues(state.error);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (title.length < 3) {
      titleRef.current?.focus();
      return;
    }

    const payload = { title };
    if (form.examTarget.trim()) payload.examTarget = form.examTarget.trim();
    if (form.description.trim()) payload.description = form.description.trim();

    try {
      const course = await createCourse(payload).unwrap();
      toast.success(`“${course.title}” is created`, { description: "It's a draft. Add units and chapters, then publish it." });
      onClose();
      navigate(`/admin/manage-course/${course.id}`, { replace: true });
    } catch {
      // shown inline below: per-field issues and the form-level message
    }
  };

  const formError = state.error && !Object.keys(issues).length ? getUserMessage(state.error, "Couldn't create the course. Please try again.") : null;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Title" required error={titleError ?? issues.title}>
        <Input
          ref={titleRef}
          value={form.title}
          onChange={set("title")}
          placeholder="Life Insurance Basics"
          maxLength={160}
          autoComplete="off"
          data-autofocus
        />
      </Field>

      <Field label="Exam target" optional hint="The exam this course prepares for, e.g. IC-38." error={issues.examTarget}>
        <Input value={form.examTarget} onChange={set("examTarget")} placeholder="IC-38" maxLength={40} autoComplete="off" />
      </Field>

      <Field label="Description" optional error={issues.description}>
        <Textarea
          value={form.description}
          onChange={set("description")}
          rows={3}
          maxLength={4000}
          placeholder="What learners will get out of it"
        />
      </Field>

      <FormError>{formError}</FormError>

      <FormActions className="pt-1">
        <Button variant="ghost" onClick={onClose} disabled={state.isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon="plus" loading={state.isLoading}>
          Create course
        </Button>
      </FormActions>
    </form>
  );
}
