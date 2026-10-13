import { useId, useRef, useState } from "react";

import {
  Button,
  Field,
  FormActions,
  FormError,
  IconButton,
  Input,
  Modal,
  Textarea,
  cx,
  fieldIssues,
} from "../../../../components/admin";
import Icon from "../../../../components/ui/Icon.jsx";
import { plural } from "../../../../components/admin/format.js";
import { useAddQuestionsMutation, useUpdateQuestionMutation } from "../../../../app/apis/tests.api.js";
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  OPTION_LABELS,
  addOption,
  blankDraft,
  correctNeedsFollowUp,
  draftIssues,
  hindiMissing,
  missingHindiCount,
  removeOptionAt,
  testErrorMessage,
  toCreatePayload,
  toDraft,
  toUpdatePayload,
} from "./questionDraft.js";

/**
 * Add or edit one question — `api-contracts/09-test.md` §8 / §11.
 *
 * Every statement and option is written twice, English and Hindi. English is
 * required even in a draft; Hindi can wait, but publishing refuses a test
 * with any gap (§6), so a missing translation is flagged in warning tone
 * (never as an error — the question still saves).
 *
 * Rows are three columns on wide screens (label · English · Hindi) and stack
 * on phones. Payload building lives in questionDraft.js.
 *
 * The save runs here, outside the modal body, so `busy` can keep the modal
 * open mid-save; the draft lives in the body, so each opening starts fresh.
 */
export default function QuestionEditor({ open, testId, question, number, onClose, onSaved }) {
  const formId = useId();
  const [addQuestions] = useAddQuestionsMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = Boolean(question);

  const close = () => {
    if (saving) return;
    setError(null);
    onClose();
  };

  const save = async (draft) => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const updated = await updateQuestion({ testId, questionId: question.id, ...toUpdatePayload(draft) }).unwrap();
        // a NEW option marked correct only has an id once the first PATCH lands
        if (correctNeedsFollowUp(draft)) {
          const correctOptionId = updated?.options?.[draft.correctIndex]?.id;
          if (correctOptionId) {
            await updateQuestion({ testId, questionId: question.id, correctOptionId }).unwrap();
          }
        }
      } else {
        await addQuestions({ testId, questions: [toCreatePayload(draft)] }).unwrap();
      }
      setSaving(false);
      onSaved?.(isEdit);
    } catch (err) {
      setSaving(false);
      setError(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      busy={saving}
      size="xl"
      title={isEdit ? `Edit question ${number}` : "Add a question"}
      description="English is required. Hindi can follow, but the test can't be published until every statement and option has it."
      footer={
        <FormActions>
          <Button variant="ghost" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="primary" icon={isEdit ? "check" : "plus"} loading={saving}>
            {isEdit ? "Save changes" : "Add question"}
          </Button>
        </FormActions>
      }
    >
      <QuestionForm
        key={question?.id ?? "new"}
        formId={formId}
        question={question}
        error={error}
        onChange={() => error && setError(null)}
        onSubmit={save}
      />
    </Modal>
  );
}

function QuestionForm({ formId, question, error, onChange, onSubmit }) {
  const [draft, setDraft] = useState(() => (question ? toDraft(question) : blankDraft()));
  const [submitted, setSubmitted] = useState(false);
  const radioName = useId();
  const formRef = useRef(null);

  const edit = (next) => {
    setDraft(next);
    onChange();
  };
  const patch = (changes) => edit({ ...draft, ...changes });
  const setOptionText = (index, text) =>
    patch({ options: draft.options.map((option, i) => (i === index ? { ...option, text } : option)) });

  const local = draftIssues(draft);
  // server issues arrive as `questions[0].statement.en` (§8) or bare (§11)
  const server = Object.fromEntries(
    Object.entries(fieldIssues(error)).map(([field, issue]) => [field.replace(/^questions\[\d+\]\./, ""), issue]),
  );
  const issues = { ...server, ...(submitted ? local : {}) };
  const gaps = missingHindiCount(draft);
  const complete = [draft.statement, ...draft.options.map((option) => option.text)].every(
    (text) => text.en.trim() && text.hi.trim(),
  );

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(local).length > 0) {
      // once the errors have rendered, take the author to the first one
      requestAnimationFrame(() => formRef.current?.querySelector("[aria-invalid='true']")?.focus());
      return;
    }
    onSubmit(draft);
  };

  const formError =
    error && !(error.code === "VALIDATION_ERROR" && Object.keys(server).length > 0)
      ? testErrorMessage(error, "Couldn't save the question. Please try again.")
      : null;

  return (
    <form ref={formRef} id={formId} onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <Field label="Marks" required error={issues.marks} className="w-32">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={draft.marks}
            onChange={(event) => patch({ marks: event.target.value })}
            className="tabular-nums"
          />
        </Field>
        {(gaps > 0 || complete) && (
          <p
            className={cx(
              "flex items-center gap-2 pb-3 text-[13px] font-medium",
              gaps > 0 ? "text-warning" : "text-success",
            )}
          >
            <Icon name={gaps > 0 ? "alertTriangle" : "checkCircle"} className="h-4 w-4 shrink-0" strokeWidth={2} />
            {gaps > 0
              ? `${plural(gaps, "Hindi translation")} missing. You can save; publishing needs ${gaps === 1 ? "it" : "them"}.`
              : "Ready to publish: English and Hindi throughout"}
          </p>
        )}
      </div>

      <BilingualRow
        label="Statement"
        required
        multiline
        flagHindi
        value={draft.statement}
        onChange={(statement) => patch({ statement })}
        enError={issues["statement.en"] ?? issues.statement}
        hiError={issues["statement.hi"]}
      />

      <BilingualRow
        label="Explanation"
        hint="Optional. Shown after the answer is revealed."
        multiline
        value={draft.explanation}
        onChange={(explanation) => patch({ explanation })}
        enError={issues["explanation.en"]}
        hiError={issues["explanation.hi"]}
      />

      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="mb-3 flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-sm font-bold text-text-primary">Options</span>
          <span className="text-xs text-text-muted">
            Mark the correct answer · {MIN_OPTIONS}–{MAX_OPTIONS} options
          </span>
        </legend>

        {(issues.options || issues.correctIndex || issues.correctOptionId) && (
          <p role="alert" className="flex items-center gap-1.5 text-xs font-semibold text-danger">
            <Icon name="info" className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {issues.options ?? issues.correctIndex ?? issues.correctOptionId}
          </p>
        )}

        {draft.options.map((option, index) => (
          <OptionRow
            key={option.key}
            index={index}
            option={option}
            radioName={radioName}
            correct={draft.correctIndex === index}
            canRemove={draft.options.length > MIN_OPTIONS}
            enError={issues[`options[${index}].en`] ?? issues[`options[${index}]`]}
            onCorrect={() => patch({ correctIndex: index })}
            onText={(text) => setOptionText(index, text)}
            onRemove={() => edit(removeOptionAt(draft, index))}
          />
        ))}

        {draft.options.length < MAX_OPTIONS && (
          <div>
            <Button variant="secondary" size="sm" icon="plus" onClick={() => edit(addOption(draft))}>
              Add option {OPTION_LABELS[draft.options.length]}
            </Button>
          </div>
        )}
      </fieldset>

      <FormError>{formError}</FormError>
    </form>
  );
}

/** "Needed before publishing", in warning tone, under an empty Hindi box. */
const HINDI_HINT = <span className="font-medium text-warning">Needed before publishing</span>;

/** Label · English · Hindi — three columns from `md`, stacked below. */
function BilingualRow({ label, hint, required, multiline, flagHindi, value, onChange, enError, hiError }) {
  const labelId = useId();
  const Control = multiline ? Textarea : Input;
  const extra = multiline ? { rows: 2 } : {};
  const missing = flagHindi && hindiMissing(value);

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="grid grid-cols-1 gap-3 md:grid-cols-[7rem_1fr_1fr] md:items-start md:px-3"
    >
      <div className="md:pt-9">
        <p id={labelId} className="text-sm font-bold text-text-primary">
          {label}
        </p>
        {hint && <p className="mt-0.5 text-xs text-text-muted">{hint}</p>}
      </div>
      <Field label="English" required={required} error={enError}>
        <Control
          value={value.en}
          onChange={(event) => onChange({ ...value, en: event.target.value })}
          aria-label={`${label} in English`}
          {...extra}
        />
      </Field>
      <Field label="Hindi" hint={missing ? HINDI_HINT : undefined} error={hiError}>
        <Control
          lang="hi"
          value={value.hi}
          onChange={(event) => onChange({ ...value, hi: event.target.value })}
          aria-label={`${label} in Hindi`}
          className={missing ? "ring-warning" : undefined}
          {...extra}
        />
      </Field>
    </div>
  );
}

/** One answer option: letter, "Correct" radio, remove, then English and Hindi. */
function OptionRow({ index, option, radioName, correct, canRemove, enError, onCorrect, onText, onRemove }) {
  const letter = OPTION_LABELS[index];
  const labelId = useId();
  const missing = hindiMissing(option.text);

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={cx(
        "grid grid-cols-1 gap-3 rounded-2xl p-3 ring-1 ring-inset transition-colors duration-200 md:grid-cols-[7rem_1fr_1fr] md:items-start",
        correct ? "bg-success-muted ring-success/30" : "bg-surface-muted ring-border/60",
      )}
    >
      <div className="flex items-center justify-between gap-3 md:flex-col md:items-start md:gap-2 md:pt-7">
        <div className="flex items-center gap-2">
          <span
            id={labelId}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-surface-elevated font-display text-sm font-extrabold text-text-primary ring-1 ring-inset ring-border/70"
          >
            <span className="sr-only">Option </span>
            {letter}
          </span>
          <IconButton
            icon="trash"
            size="sm"
            tone="danger"
            label={`Remove option ${letter}`}
            disabled={!canRemove}
            onClick={onRemove}
          />
        </div>
        <label
          className={cx(
            "flex cursor-pointer items-center gap-2 rounded-full py-1 pr-1 text-[13px] font-semibold",
            correct ? "text-success" : "text-text-muted hover:text-text-primary",
          )}
        >
          <input
            type="radio"
            name={radioName}
            checked={correct}
            onChange={onCorrect}
            className="focus-ring h-4 w-4 shrink-0 cursor-pointer accent-accent-solid"
          />
          Correct
          <span className="sr-only"> answer: option {letter}</span>
        </label>
      </div>
      <Field label="English" required error={enError}>
        <Input
          value={option.text.en}
          onChange={(event) => onText({ ...option.text, en: event.target.value })}
          aria-label={`Option ${letter} in English`}
        />
      </Field>
      <Field label="Hindi" hint={missing ? HINDI_HINT : undefined}>
        <Input
          lang="hi"
          value={option.text.hi}
          onChange={(event) => onText({ ...option.text, hi: event.target.value })}
          aria-label={`Option ${letter} in Hindi`}
          className={missing ? "ring-warning" : undefined}
        />
      </Field>
    </div>
  );
}
