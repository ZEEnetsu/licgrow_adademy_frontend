/**
 * Pure helpers behind the test authoring screens — `api-contracts/09-test.md`.
 *
 * Extracted from the components so the fiddly parts are testable: the create
 * and update endpoints disagree about how the correct answer is identified
 * (§8 takes a positional `correctIndex`, §11 takes a `correctOptionId`), and
 * removing an option has to keep that pointer aimed at the same answer.
 *
 * It also holds the test module's error copy, because `apiError.js` doesn't
 * list this module's codes as user-safe even though the contract does.
 */

import { getUserMessage } from "../../../../app/apis/apiError.js";

export const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;

const emptyText = () => ({ en: "", hi: "" });

export const blankDraft = () => ({
  marks: "1",
  statement: emptyText(),
  explanation: emptyText(),
  options: [{ key: "new-0", text: emptyText() }, { key: "new-1", text: emptyText() }],
  correctIndex: 0,
});

/** `AdminQuestion` (server shape) → editor draft. */
export function toDraft(question) {
  const options = question.options.map((option) => ({
    id: option.id,
    key: option.id,
    text: { en: option.text?.en ?? "", hi: option.text?.hi ?? "" },
  }));

  const correctIndex = options.findIndex((option) => option.id === question.correctOptionId);

  return {
    marks: String(question.marks ?? 1),
    statement: {
      en: question.statement?.en ?? "",
      hi: question.statement?.hi ?? "",
    },
    explanation: {
      en: question.explanation?.en ?? "",
      hi: question.explanation?.hi ?? "",
    },
    options,
    correctIndex: correctIndex === -1 ? 0 : correctIndex,
  };
}

/**
 * Mirrors the server's draft rules (§8) so obvious mistakes don't need a round
 * trip. Keyed like the server's `details[].field` with the `questions[0].`
 * prefix stripped, so client and server issues land on the same fields.
 */
export function draftIssues(draft) {
  const issues = {};
  const marks = Number(draft.marks);
  if (draft.marks === "" || !Number.isInteger(marks) || marks < 1) {
    issues.marks = "A whole number, at least 1";
  }
  if (!draft.statement.en.trim()) {
    issues["statement.en"] = "The English statement is required";
  }
  draft.options.forEach((option, index) => {
    if (!option.text.en.trim()) issues[`options[${index}].en`] = "English text is required";
  });
  return issues;
}

/** True when English is written but its Hindi isn't — publishing will refuse it (§6). */
export const hindiMissing = (text) => Boolean(text.en.trim()) && !text.hi.trim();

/** How many statement/option translations a draft still needs. */
export function missingHindiCount(draft) {
  return [draft.statement, ...draft.options.map((option) => option.text)].filter(hindiMissing).length;
}

/** Whether a saved `AdminQuestion` would fail the publish gate for want of Hindi. */
export function questionNeedsHindi(question) {
  if (!question.statement?.hi) return true;
  return (question.options ?? []).some((option) => !option.text?.hi);
}

/**
 * Remove an option, keeping `correctIndex` aimed at the same answer.
 * Refuses to go below the minimum.
 */
export function removeOptionAt(draft, index) {
  if (draft.options.length <= MIN_OPTIONS) return draft;

  const options = draft.options.filter((_, i) => i !== index);

  let { correctIndex } = draft;
  if (index === correctIndex) correctIndex = 0; // the answer itself went
  else if (index < correctIndex) correctIndex -= 1; // everything after shifted

  return { ...draft, options, correctIndex };
}

let optionSeed = 0;

export function addOption(draft) {
  if (draft.options.length >= MAX_OPTIONS) return draft;
  optionSeed += 1;
  return { ...draft, options: [...draft.options, { key: `added-${optionSeed}`, text: emptyText() }] };
}

/**
 * Trim, and omit `hi` entirely when blank.
 *
 * This matters: an empty string would read as a real translation to the
 * publish gate, letting a half-translated test through §6.
 */
function bilingual(value) {
  const out = { en: value.en.trim() };
  if (value.hi.trim()) out.hi = value.hi.trim();
  return out;
}

function explanationOf(draft) {
  const hasContent = draft.explanation.en.trim() || draft.explanation.hi.trim();
  return hasContent ? { explanation: bilingual(draft.explanation) } : {};
}

/** §8 — create. The server assigns option ids, so the answer is positional. */
export function toCreatePayload(draft) {
  return {
    marks: Number(draft.marks),
    statement: bilingual(draft.statement),
    ...explanationOf(draft),
    options: draft.options.map((option) => ({ text: bilingual(option.text) })),
    correctIndex: draft.correctIndex,
  };
}

/**
 * §11 — update. Options are identified by id, and sending `options` replaces
 * the whole set. `correctOptionId` is only sent when the chosen option
 * already has an id; when the author marked a NEW option correct, its id only
 * exists after this request, so the editor sends a second PATCH with the id
 * the server assigned (see `correctNeedsFollowUp`).
 */
export function toUpdatePayload(draft) {
  const options = draft.options.map((option) => ({
    ...(option.id ? { id: option.id } : {}),
    text: bilingual(option.text),
  }));

  const correctOptionId = draft.options[draft.correctIndex]?.id ?? null;

  return {
    marks: Number(draft.marks),
    statement: bilingual(draft.statement),
    ...explanationOf(draft),
    options,
    ...(correctOptionId ? { correctOptionId } : {}),
  };
}

/** The correct option is one added in this edit, so it has no id yet. */
export const correctNeedsFollowUp = (draft) => !draft.options[draft.correctIndex]?.id;

/* ── errors ─────────────────────────────────────────────────────────────── */

/**
 * The module's error codes, which the contract marks user-safe (09 "Module
 * error codes"). Branch on `code`, never on `message`.
 */
const TEST_ERROR_COPY = {
  INVALID_TEST_CONFIG: "That combination of settings isn't allowed for this kind of test.",
  UNIT_QUIZ_EXISTS: "This unit already has a quiz.",
  TEST_NOT_PUBLISHABLE: "This test isn't ready to publish yet.",
  TEST_HAS_ATTEMPTS: "Learners have already attempted this test, so its questions and scoring are locked. Clone it to make changes.",
  PASSING_EXCEEDS_TOTAL: "Passing marks can't be more than the total marks.",
  TEST_NOT_DELETABLE: "Only drafts nobody has attempted can be deleted. Archive it instead.",
  REORDER_SET_MISMATCH: "The questions changed somewhere else. Reload the page and try again.",
};

/** User-facing text for a test-module error. */
export const testErrorMessage = (error, fallback) =>
  TEST_ERROR_COPY[error?.code] ?? getUserMessage(error, fallback);

/**
 * Re-shape an error so `useConfirm`'s dialog (which runs `getUserMessage`)
 * shows the module copy instead of the generic fallback.
 */
export const asUserError = (error, fallback) => ({
  userSafe: true,
  code: "TEST_MODULE_ERROR",
  message: testErrorMessage(error, fallback),
});

/**
 * A publish-gate `details[].field` in words:
 *   "questions[2].options[1]"  → "Question 2, option B"
 *   "questions[2].statement"   → "Question 2, statement"
 *   "passingMarks"             → "Passing marks"
 *
 * The mock numbers questions by `sequence` (1-based), which is what the
 * cards show, so the number is used as given.
 */
export function describeIssueField(field = "") {
  const match = /^questions\[(\d+)\](?:\.(\w+)(?:\[(\d+)\])?)?/.exec(field);
  if (match) {
    const [, number, part, optionIndex] = match;
    const where =
      part === "options" && optionIndex !== undefined
        ? `option ${OPTION_LABELS[Number(optionIndex)] ?? Number(optionIndex) + 1}`
        : part === "correctOptionId"
          ? "correct answer"
          : part ?? null;
    return where ? `Question ${number}, ${where}` : `Question ${number}`;
  }
  if (field === "questions") return "Questions";
  if (field === "passingMarks") return "Passing marks";
  const words = field.replace(/([A-Z])/g, " $1").trim().toLowerCase();
  return words ? words[0].toUpperCase() + words.slice(1) : "This test";
}
