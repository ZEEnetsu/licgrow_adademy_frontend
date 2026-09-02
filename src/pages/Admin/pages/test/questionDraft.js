/**
 * Pure helpers behind the question editor — `api-contracts/09-test.md` §8/§11.
 *
 * Extracted from the component so the fiddly parts are testable: the create
 * and update endpoints disagree about how the correct answer is identified
 * (§8 takes a positional `correctIndex`, §11 takes a `correctOptionId`), and
 * removing an option has to keep that pointer aimed at the same answer.
 */

export const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;

const emptyText = () => ({ en: "", hi: "" });

export const blankDraft = () => ({
  marks: 1,
  statement: emptyText(),
  explanation: emptyText(),
  options: [{ text: emptyText() }, { text: emptyText() }],
  correctIndex: 0,
});

/** `AdminQuestion` (server shape) → editor draft. */
export function toDraft(question) {
  const options = question.options.map((option) => ({
    id: option.id,
    text: { en: option.text?.en ?? "", hi: option.text?.hi ?? "" },
  }));

  const correctIndex = options.findIndex(
    (option) => option.id === question.correctOptionId,
  );

  return {
    marks: question.marks ?? 1,
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

/** Mirrors the server rules so obvious mistakes don't need a round trip. */
export function validate(draft) {
  const problems = [];

  if (!Number.isInteger(Number(draft.marks)) || Number(draft.marks) < 1) {
    problems.push("Marks must be a whole number of at least 1.");
  }
  if (!draft.statement.en.trim()) {
    problems.push("The English statement is required.");
  }
  if (draft.options.length < MIN_OPTIONS) {
    problems.push(`At least ${MIN_OPTIONS} options are required.`);
  }
  if (draft.options.some((option) => !option.text.en.trim())) {
    problems.push("Every option needs English text.");
  }
  return problems;
}

/** What still blocks publishing (§6) — a warning, never an error. */
export function missingHindi(draft) {
  const gaps = [];
  if (!draft.statement.hi.trim()) gaps.push("statement");
  draft.options.forEach((option, index) => {
    if (!option.text.hi.trim()) gaps.push(`option ${OPTION_LABELS[index]}`);
  });
  return gaps;
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

export function addOption(draft) {
  if (draft.options.length >= MAX_OPTIONS) return draft;
  return { ...draft, options: [...draft.options, { text: emptyText() }] };
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
  const hasContent =
    draft.explanation.en.trim() || draft.explanation.hi.trim();
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
 * the whole set. Options added in the editor have no id yet; the server
 * assigns one, so `correctOptionId` can only be set when the chosen option
 * already exists. When it doesn't, fall back to the positional id from the
 * original question so the request stays valid.
 */
export function toUpdatePayload(draft, question) {
  const options = draft.options.map((option) => ({
    ...(option.id ? { id: option.id } : {}),
    text: bilingual(option.text),
  }));

  const chosen = options[draft.correctIndex];
  const correctOptionId =
    chosen?.id ?? question?.options?.[draft.correctIndex]?.id ?? null;

  return {
    marks: Number(draft.marks),
    statement: bilingual(draft.statement),
    ...explanationOf(draft),
    options,
    ...(correctOptionId ? { correctOptionId } : {}),
  };
}
