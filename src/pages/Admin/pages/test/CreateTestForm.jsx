import { useId, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import {
  Button,
  EntityCombobox,
  Field,
  FormActions,
  FormError,
  Input,
  Modal,
  Select,
  Textarea,
  fieldIssues,
} from "../../../../components/admin";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue.js";
import { TEST_KIND, useCreateTestMutation } from "../../../../app/apis/tests.api.js";
import coursesApi, { useGetCourseQuery, useGetCoursesQuery } from "../../../../app/apis/courses.api.js";
import { testErrorMessage } from "./questionDraft.js";

/**
 * Draft a test or a unit quiz — `api-contracts/09-test.md` §1.
 *
 * The contract requires `kind`, `title`, `passingMarks` AND `maxAttempts`
 * (the key must be present: `null` means unlimited, otherwise an integer
 * ≥ 1). Unknown fields are rejected by the strict schema, so the payload is
 * assembled key by key rather than spreading form state.
 *
 * `kind: "quiz"` needs a `unitId` (and a test must not have one). The unit is
 * picked in two steps — a course from the course list, then one of its units
 * from the course tree (08 §3), which also says which units already have a
 * quiz (one per unit, else 409 UNIT_QUIZ_EXISTS).
 *
 * The modal is driven by `?new=1` from the list page. The mutation lives here,
 * outside the modal body, so `busy` can stop the modal closing mid-save; the
 * fields live in the body, so every opening starts from a blank form.
 */

const UNLIMITED = "unlimited";
const ATTEMPT_OPTIONS = ["1", "2", "3", "5", "10"];

const KIND_HINT = {
  [TEST_KIND.TEST]: "Exam-style. After publishing, add it to a batch to make it live.",
  [TEST_KIND.QUIZ]: "Practice for one course unit. Learners see it under that unit.",
};

export default function CreateTestForm({ open, onClose, onCreated }) {
  const formId = useId();
  const [createTest, { isLoading, error, reset }] = useCreateTestMutation();

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
      size="md"
      title="Draft a test"
      description="It starts as a draft. You'll add questions next."
      footer={
        <FormActions>
          <Button variant="ghost" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="primary" icon="plus" loading={isLoading}>
            Create draft
          </Button>
        </FormActions>
      }
    >
      <DraftForm formId={formId} createTest={createTest} error={error} resetError={reset} onCreated={onCreated} />
    </Modal>
  );
}

function DraftForm({ formId, createTest, error, resetError, onCreated }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    kind: TEST_KIND.TEST,
    title: "",
    description: "",
    durationMinutes: "",
    passingMarks: "0",
    maxAttempts: "1",
    unitId: "",
  });
  const [course, setCourse] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const isQuiz = form.kind === TEST_KIND.QUIZ;
  const courseQ = useDebouncedValue(courseSearch.trim(), 250);
  const courses = useGetCoursesQuery(
    { limit: 20, ...(courseQ.length >= 2 && { q: courseQ }) },
    { skip: !isQuiz },
  );
  const courseTree = useGetCourseQuery(course?.id, { skip: !isQuiz || !course });
  const units = courseTree.data?.units ?? [];

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) resetError();
  };

  // ── validation: the obvious on the client, the rest from the server ──────
  const title = form.title.trim();
  const local = {};
  if (title.length < 3 || title.length > 160) local.title = "Between 3 and 160 characters";
  const passing = Number(form.passingMarks);
  if (form.passingMarks === "" || !Number.isInteger(passing) || passing < 0) {
    local.passingMarks = "A whole number, 0 or more";
  }
  if (form.durationMinutes !== "") {
    const minutes = Number(form.durationMinutes);
    if (!Number.isInteger(minutes) || minutes < 1) local.durationMinutes = "Whole minutes, at least 1";
  }
  if (isQuiz && !course) local.course = "Choose a course";
  if (isQuiz && course && !form.unitId) local.unitId = "Choose a unit";

  const server = fieldIssues(error);
  const issues = { ...server, ...(submitted ? local : {}) };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(local).length > 0) {
      // once the errors have rendered, move to the first one
      requestAnimationFrame(() => formRef.current?.querySelector("[aria-invalid='true']")?.focus());
      return;
    }

    // exactly the documented shape — no extra keys
    const payload = {
      kind: form.kind,
      title,
      passingMarks: passing,
      maxAttempts: form.maxAttempts === UNLIMITED ? null : Number(form.maxAttempts),
    };
    if (isQuiz) payload.unitId = form.unitId;
    const description = form.description.trim();
    if (description) payload.description = description;
    if (form.durationMinutes !== "") payload.durationMinutes = Number(form.durationMinutes);

    try {
      const test = await createTest(payload).unwrap();
      // the course tree shows each unit's quiz; it lives in another API slice
      if (isQuiz) dispatch(coursesApi.util.invalidateTags([{ type: "Course", id: course.id }]));
      onCreated(test);
    } catch {
      // rendered below from the mutation's `error`
    }
  };

  // a 400 explains itself on the fields; anything else needs words up top
  const formError = error && !(error.code === "VALIDATION_ERROR" && Object.keys(server).length > 0)
    ? testErrorMessage(error, "Couldn't create the draft. Please try again.")
    : null;

  return (
    <form ref={formRef} id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Kind" hint={KIND_HINT[form.kind]} error={issues.kind}>
        <Select
          value={form.kind}
          onChange={(event) => {
            update("kind", event.target.value);
            update("unitId", "");
            setCourse(null);
          }}
        >
          <option value={TEST_KIND.TEST}>Full-length test</option>
          <option value={TEST_KIND.QUIZ}>Unit quiz</option>
        </Select>
      </Field>

      {isQuiz && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Course" required error={issues.course}>
            <EntityCombobox
              items={courses.data?.items}
              isFetching={courses.isFetching}
              search={courseSearch}
              onSearchChange={setCourseSearch}
              value={course}
              onChange={(next) => {
                setCourse(next);
                update("unitId", "");
              }}
              getLabel={(item) => item.title}
              getDescription={(item) => `${item.examTarget ?? "Course"} · ${item.unitCount ?? 0} units`}
              placeholder="Search courses…"
              emptyText={courses.isError ? "Couldn't load courses" : "No courses match"}
            />
          </Field>
          <Field
            label="Unit"
            required
            error={issues.unitId}
            hint={course && courseTree.isSuccess && units.length === 0 ? "This course has no units yet." : undefined}
          >
            <Select
              value={form.unitId}
              disabled={!course || courseTree.isFetching || units.length === 0}
              onChange={(event) => update("unitId", event.target.value)}
            >
              <option value="">{course ? (courseTree.isFetching ? "Loading units…" : "Choose a unit") : "Pick a course first"}</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id} disabled={Boolean(unit.quiz)}>
                  {unit.sequence}. {unit.title}
                  {unit.quiz ? " (has a quiz)" : ""}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}

      <Field label="Title" required error={issues.title}>
        <Input
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder={isQuiz ? "Unit 1 — Quick check" : "IC-38 Full Length — Set 1"}
          maxLength={160}
          autoComplete="off"
        />
      </Field>

      <Field label="Description" optional error={issues.description}>
        <Textarea
          rows={3}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="What it covers, and who it's for"
          maxLength={2000}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Duration" optional hint="Minutes; blank is untimed" error={issues.durationMinutes}>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={form.durationMinutes}
            onChange={(event) => update("durationMinutes", event.target.value)}
            placeholder="Untimed"
            className="tabular-nums"
          />
        </Field>
        <Field label="Passing marks" required hint="Checked at publish" error={issues.passingMarks}>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={form.passingMarks}
            onChange={(event) => update("passingMarks", event.target.value)}
            className="tabular-nums"
          />
        </Field>
        <Field label="Attempts" required hint="Per learner" error={issues.maxAttempts}>
          <Select value={form.maxAttempts} onChange={(event) => update("maxAttempts", event.target.value)}>
            {ATTEMPT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count === "1" ? "1 attempt" : `${count} attempts`}
              </option>
            ))}
            <option value={UNLIMITED}>Unlimited</option>
          </Select>
        </Field>
      </div>

      <FormError>{formError}</FormError>
    </form>
  );
}
