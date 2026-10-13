import { memo, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import Icon from "../../../../components/ui/Icon.jsx";
import { EXPO } from "../../../../components/motion/primitives.js";
import {
  Button,
  Callout,
  Card,
  EmptyState,
  IconButton,
  LoadError,
  PageHeader,
  RowActions,
  Skeleton,
  SkeletonCard,
  StatusBadge,
  cx,
  useConfirm,
  usePendingIds,
  useToast,
} from "../../../../components/admin";
import { formatRange, plural } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import {
  TEST_KIND,
  TEST_STATUS,
  useArchiveTestMutation,
  useDeleteQuestionMutation,
  useDeleteTestMutation,
  useGetTestDetailQuery,
  useGetTestQuestionsQuery,
  usePublishTestMutation,
  useReorderQuestionsMutation,
} from "../../../../app/apis/tests.api.js";
import QuestionEditor from "./QuestionEditor.jsx";
import {
  OPTION_LABELS,
  asUserError,
  describeIssueField,
  questionNeedsHindi,
  testErrorMessage,
} from "./questionDraft.js";

/**
 * One test or quiz, and its questions — `api-contracts/09-test.md` §3, §6–13.
 *
 *   PageHeader (back, kind, title, status, facts, Publish + ⋯)
 *   "Not ready to publish" callout — the 422 TEST_NOT_PUBLISHABLE details
 *   key figures
 *   questions: memoised cards, reordered optimistically with a layout glide
 *
 * Two requests by design: §3 returns metadata and `questionCount` only; the
 * questions come from §9 in the admin shape (both languages, answer key).
 */

const KIND_EYEBROW = { [TEST_KIND.TEST]: "Full-length test", [TEST_KIND.QUIZ]: "Unit quiz" };
const LIST_PATH = "/admin/manage-test";
const GLIDE = { layout: { duration: 0.45, ease: EXPO } };
const NO_QUESTIONS = [];

const kindWord = (test) => (test.kind === TEST_KIND.QUIZ ? "quiz" : "test");
const attemptsText = (maxAttempts) => (maxAttempts == null ? "unlimited attempts" : plural(maxAttempts, "attempt"));

/**
 * Keyed by the id, so moving straight from one test to another (the command
 * palette, a notification) starts clean: no editor, callout or announcement
 * carried over from the last test.
 */
const TestDetail = () => {
  const { testId } = useParams();
  return <TestDetailPage key={testId} testId={testId} />;
};

export default TestDetail;

function TestDetailPage({ testId }) {
  const navigate = useNavigate();
  const can = useSelector(selectCan);
  const canAuthor = can(PERMISSIONS.TEST_AUTHOR);
  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();

  const testQuery = useGetTestDetailQuery(testId, { skip: !testId });
  const questionsQuery = useGetTestQuestionsQuery(testId, { skip: !testId });
  // `currentData`, not `data`: never show the previous test while this one loads
  const test = testQuery.currentData;
  const questions = questionsQuery.currentData ?? NO_QUESTIONS;
  const questionsLoading = !questionsQuery.currentData && questionsQuery.isFetching;

  const [publishTest, { isLoading: publishing }] = usePublishTestMutation();
  const [archiveTest] = useArchiveTestMutation();
  const [deleteTest] = useDeleteTestMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [reorderQuestions] = useReorderQuestionsMutation();

  // the 422 TEST_NOT_PUBLISHABLE details, until dismissed or published
  const [publishIssues, setPublishIssues] = useState(null);
  // null | { id: null } (adding) | { id } (editing)
  const [editor, setEditor] = useState(null);
  // spoken after a reorder, for anyone not watching the cards move
  const [announcement, setAnnouncement] = useState("");

  const canEdit = canAuthor && test?.status !== TEST_STATUS.ARCHIVED;

  /* ── test actions ─────────────────────────────────────────────────────── */

  const onPublish = async () => {
    const outcome = { issues: null };
    const done = await confirm({
      title: `Publish “${test.title}”?`,
      description:
        test.kind === TEST_KIND.QUIZ
          ? "Learners in every batch that includes this course will see it under its unit."
          : "It becomes available to add to batches. Questions stay editable until a learner attempts it.",
      confirmLabel: `Publish ${kindWord(test)}`,
      icon: "send",
      onConfirm: async () => {
        try {
          await publishTest(testId).unwrap();
        } catch (err) {
          // not an error to show in the dialog: the details are the to-do list
          if (err?.code === "TEST_NOT_PUBLISHABLE") {
            outcome.issues = err.details?.length ? err.details : [{ field: "", issue: testErrorMessage(err) }];
            return;
          }
          throw asUserError(err, "Couldn't publish it. Please try again.");
        }
      },
    });
    if (outcome.issues) {
      setPublishIssues(outcome.issues);
      toast.error("Not ready to publish", { description: `${plural(outcome.issues.length, "thing")} to fix first.` });
    } else if (done) {
      setPublishIssues(null);
      toast.success(`“${test.title}” is published`, {
        description: test.kind === TEST_KIND.QUIZ ? "It's live under its unit." : "Add it to a batch to make it live.",
      });
    }
  };

  const onArchive = async () => {
    const done = await confirm({
      title: `Archive “${test.title}”?`,
      description:
        "Learners can't start new attempts, and it's taken out of every batch it was in. Past attempts and scores are kept.",
      confirmLabel: `Archive ${kindWord(test)}`,
      tone: "danger",
      icon: "archive",
      onConfirm: async () => {
        try {
          await archiveTest(testId).unwrap();
        } catch (err) {
          throw asUserError(err, "Couldn't archive it. Please try again.");
        }
      },
    });
    if (done) {
      setPublishIssues(null);
      toast.success(`“${test.title}” is archived`);
    }
  };

  const onDeleteTest = async () => {
    const title = test.title;
    const done = await confirm({
      title: `Delete “${title}”?`,
      description: `The draft and its ${plural(questions.length, "question")} are removed for good. This can't be undone.`,
      confirmLabel: `Delete ${kindWord(test)}`,
      tone: "danger",
      icon: "trash",
      onConfirm: async () => {
        try {
          await deleteTest(testId).unwrap();
        } catch (err) {
          throw asUserError(err, "Couldn't delete it. Please try again.");
        }
        // leave before this page refetches a test that no longer exists
        navigate(LIST_PATH, { replace: true });
      },
    });
    if (done) toast.success(`“${title}” is deleted`);
  };

  /* ── question actions (stable, so unchanged cards don't re-render) ────── */

  const onMove = useCallback(
    async (index, delta) => {
      const target = index + delta;
      if (target < 0 || target >= questions.length) return;
      const order = questions.map((question) => question.id);
      [order[index], order[target]] = [order[target], order[index]];
      setAnnouncement(`Question ${index + 1} moved to position ${target + 1} of ${order.length}.`);
      try {
        await reorderQuestions({ testId, orderedQuestionIds: order }).unwrap();
      } catch (err) {
        toast.error("Couldn't move the question", {
          description: testErrorMessage(err, "It's back in its old place. Please try again."),
        });
      }
    },
    [questions, reorderQuestions, testId, toast],
  );

  const onEdit = useCallback((id) => setEditor({ id }), []);

  const onDeleteQuestion = useCallback(
    async (question, number) => {
      const done = await confirm({
        title: `Delete question ${number}?`,
        description: `It's removed from this test and the total drops by ${plural(question.marks ?? 0, "mark")}. This can't be undone.`,
        confirmLabel: "Delete question",
        tone: "danger",
        icon: "trash",
        onConfirm: () =>
          run(question.id, async () => {
            try {
              await deleteQuestion({ testId, questionId: question.id }).unwrap();
            } catch (err) {
              throw asUserError(err, "Couldn't delete the question. Please try again.");
            }
          }),
      });
      if (done) toast.success(`Question ${number} is deleted`);
    },
    [confirm, deleteQuestion, run, testId, toast],
  );

  const openAdd = () => setEditor({ id: null });
  const editing = editor?.id ? questions.find((question) => question.id === editor.id) : undefined;
  const editingNumber = editing ? questions.indexOf(editing) + 1 : questions.length + 1;

  const onSaved = (wasEdit) => {
    setEditor(null);
    toast.success(wasEdit ? `Question ${editingNumber} is saved` : `Question ${editingNumber} is added`);
  };

  /* ── render ───────────────────────────────────────────────────────────── */

  if (!test && testQuery.isFetching) return <DetailSkeleton />;

  if (testQuery.isError || !test) {
    const missing = testQuery.error?.status === 404 || testQuery.error?.code === "NOT_FOUND";
    return (
      <>
        <PageHeader
          back={{ to: LIST_PATH, label: "All tests" }}
          eyebrow="Tests"
          title={missing ? "Test not found" : "Test"}
         
        />
        {missing ? (
          <EmptyState
            icon="fileText"
            title="This test doesn't exist"
            description="It may have been deleted, or the link is wrong."
            action={
              <Button to={LIST_PATH} variant="secondary" icon="arrowLeft">
                All tests
              </Button>
            }
          />
        ) : (
          <LoadError what="this test" error={testQuery.error} onRetry={testQuery.refetch} />
        )}
      </>
    );
  }

  const isDraft = test.status === TEST_STATUS.DRAFT;
  const isArchived = test.status === TEST_STATUS.ARCHIVED;
  const facts = [
    plural(test.totalMarks ?? 0, "mark"),
    test.durationMinutes ? `${test.durationMinutes} minutes` : "untimed",
    attemptsText(test.maxAttempts),
  ].join(" · ");

  return (
    <>
      <PageHeader
       
        back={{ to: LIST_PATH, label: "All tests" }}
        eyebrow={KIND_EYEBROW[test.kind] ?? "Test"}
        eyebrowTone={test.kind === TEST_KIND.QUIZ ? "lavender" : "mint"}
        title={test.title}
        meta={<StatusBadge status={test.status} />}
        description={
          <>
            {test.description && <span className="block">{test.description}</span>}
            <span className={cx("block tabular-nums", test.description && "mt-1 text-[13px]")}>
              {facts[0].toUpperCase() + facts.slice(1)}
            </span>
          </>
        }
        actions={
          canAuthor && (
            <>
              {isDraft && (
                <Button variant="primary" icon="send" loading={publishing} onClick={onPublish}>
                  Publish
                </Button>
              )}
              <RowActions
                label={`More actions for ${test.title}`}
                size="lg"
                items={[
                  {
                    id: "archive",
                    label: `Archive ${kindWord(test)}`,
                    description: "No new attempts; scores are kept",
                    icon: "archive",
                    tone: "danger",
                    hidden: isArchived,
                    onSelect: onArchive,
                  },
                  {
                    id: "delete",
                    label: `Delete ${kindWord(test)}`,
                    description: "Only drafts nobody has attempted",
                    icon: "trash",
                    tone: "danger",
                    hidden: !isDraft,
                    onSelect: onDeleteTest,
                  },
                ]}
              />
            </>
          )
        }
      />

      {publishIssues && (
        <Callout
          tone="warning"
          title="Not ready to publish"
          action={
            <Button variant="ghost" size="sm" onClick={() => setPublishIssues(null)}>
              Dismiss
            </Button>
          }
        >
          <p>Fix {publishIssues.length === 1 ? "this" : `these ${publishIssues.length}`}, then publish again.</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {publishIssues.map((detail, i) => (
              <li key={`${detail.field}-${i}`} className="flex gap-2">
                <Icon name="alertTriangle" className="mt-0.75 h-3.5 w-3.5 shrink-0 text-warning" strokeWidth={2} />
                <span>
                  {detail.field && <span className="font-semibold text-text-primary">{describeIssueField(detail.field)}: </span>}
                  {detail.issue}
                </span>
              </li>
            ))}
          </ul>
        </Callout>
      )}

      {isArchived && (
        <Callout tone="info" title="Archived" icon="archive">
          Learners can&apos;t start new attempts. Past attempts and scores are kept.
        </Callout>
      )}

      <KeyFigures test={test} questions={questionsQuery.currentData} />

      <section aria-labelledby="questions-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="questions-heading" className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-text-primary">
            Questions
            {questionsQuery.currentData && (
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-bold text-text-muted tabular-nums ring-1 ring-inset ring-border">
                {questions.length}
              </span>
            )}
          </h2>
          {canEdit && questions.length > 0 && (
            <Button variant="secondary" size="sm" icon="plus" onClick={openAdd}>
              Add question
            </Button>
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>

        {questionsLoading ? (
          <div className="flex flex-col gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : questionsQuery.isError ? (
          <LoadError what="questions" error={questionsQuery.error} onRetry={questionsQuery.refetch} />
        ) : questions.length === 0 ? (
          <EmptyState
            icon="listOrdered"
            title="No questions yet"
            description={
              canEdit
                ? `Write each question in English and Hindi. A ${kindWord(test)} needs at least one before it can be published.`
                : `Nobody has added questions to this ${kindWord(test)} yet.`
            }
            action={
              canEdit && (
                <Button variant="secondary" icon="plus" onClick={openAdd}>
                  Add the first question
                </Button>
              )
            }
          />
        ) : (
          <>
            <ol className="flex flex-col gap-4">
              {questions.map((question, index) => (
                <motion.li key={question.id} layout="position" transition={GLIDE}>
                  <QuestionCard
                    question={question}
                    number={index + 1}
                    isLast={index === questions.length - 1}
                    canEdit={canEdit}
                    pending={pendingIds.has(question.id)}
                    onMove={onMove}
                    onEdit={onEdit}
                    onDelete={onDeleteQuestion}
                  />
                </motion.li>
              ))}
            </ol>
            {canEdit && (
              <div className="flex justify-center">
                <Button variant="ghost" icon="plus" onClick={openAdd}>
                  Add another question
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <QuestionEditor
        open={editor !== null && canEdit}
        testId={testId}
        question={editing}
        number={editingNumber}
        onClose={() => setEditor(null)}
        onSaved={onSaved}
      />
    </>
  );
}

/* ── key figures ────────────────────────────────────────────────────────── */

function KeyFigures({ test, questions }) {
  const count = questions?.length ?? test.questionCount ?? 0;
  const untranslated = questions ? questions.filter(questionNeedsHindi).length : 0;
  const passAboveTotal = (test.passingMarks ?? 0) > (test.totalMarks ?? 0);
  const window =
    test.availableFrom && test.availableUntil ? `Open ${formatRange(test.availableFrom, test.availableUntil)}` : null;

  return (
    <Card as="dl" padding="none" className="grid grid-cols-2 overflow-hidden lg:grid-cols-4">
      <Figure
        icon="listOrdered"
        label="Questions"
        value={count}
        caption={
          count === 0
            ? "Add at least one to publish"
            : untranslated > 0
              ? `${untranslated} still need${untranslated === 1 ? "s" : ""} Hindi`
              : "All in English and Hindi"
        }
        warn={untranslated > 0}
      />
      <Figure
        icon="target"
        label="Total marks"
        value={test.totalMarks ?? 0}
        caption={passAboveTotal ? `Pass mark ${test.passingMarks} is above the total` : `Pass mark ${test.passingMarks ?? 0}`}
        warn={passAboveTotal}
      />
      <Figure
        icon="timer"
        label="Duration"
        value={test.durationMinutes ? `${test.durationMinutes} min` : "Untimed"}
        caption={window ?? (test.kind === TEST_KIND.QUIZ ? "Practice at any pace" : "No exam window set")}
      />
      <Figure
        icon="repeat"
        label="Attempts"
        value={test.maxAttempts ?? "Unlimited"}
        caption={test.cooldownMinutes ? `${test.cooldownMinutes} min between attempts` : "Per learner"}
      />
    </Card>
  );
}

function Figure({ icon, label, value, caption, warn = false }) {
  return (
    <div className="-mt-px -ml-px flex min-w-0 flex-col gap-1 border-t border-l border-border-muted p-4 sm:p-5">
      <dt className="caps flex items-center gap-1.5 text-[10.5px] font-bold text-text-muted">
        <Icon name={icon} className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        {label}
      </dt>
      <dd className="font-display text-2xl font-extrabold tracking-tight text-text-primary tabular-nums sm:text-[1.75rem]">
        {value}
      </dd>
      <dd className={cx("flex items-start gap-1.5 text-[13px] leading-snug", warn ? "font-medium text-warning" : "text-text-muted")}>
        {warn && <Icon name="alertTriangle" className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
        {caption}
      </dd>
    </div>
  );
}

/* ── question card ──────────────────────────────────────────────────────── */

/**
 * One question, read-only, with its authoring controls. Memoised: RTK Query
 * keeps unchanged questions' identity across refetches (and the optimistic
 * reorder only moves them), so editing one question re-renders one card.
 * `cv-auto` lets the browser skip laying out cards that are off screen.
 */
const QuestionCard = memo(function QuestionCard({ question, number, isLast, canEdit, pending, onMove, onEdit, onDelete }) {
  const { statement, explanation, options = [], correctOptionId, marks } = question;
  const needsHindi = questionNeedsHindi(question);
  const index = number - 1;

  return (
    <article
      aria-label={`Question ${number}`}
      aria-busy={pending || undefined}
      className={cx(
        "cv-auto rounded-[24px] bg-surface-elevated p-5 shadow-elevate ring-1 ring-inset ring-border/70 transition-opacity duration-200 sm:p-6",
        pending && "pointer-events-none opacity-55",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tint-slate font-display text-sm font-extrabold text-text-primary tabular-nums"
            aria-hidden
          >
            {number}
          </span>
          <StatusBadge size="sm" tone="neutral" icon="target" label={plural(marks ?? 0, "mark")} />
          {needsHindi && <StatusBadge size="sm" tone="warning" icon="alertTriangle" label="Needs Hindi" />}
        </div>

        {canEdit && (
          <div className="-mt-0.5 -mr-1.5 flex shrink-0 items-center">
            <IconButton
              icon="arrowUp"
              size="sm"
              label={`Move question ${number} up`}
              disabled={index === 0}
              onClick={() => onMove(index, -1)}
            />
            <IconButton
              icon="arrowDown"
              size="sm"
              label={`Move question ${number} down`}
              disabled={isLast}
              onClick={() => onMove(index, 1)}
            />
            <IconButton icon="pencil" size="sm" label={`Edit question ${number}`} onClick={() => onEdit(question.id)} />
            <IconButton
              icon="trash"
              size="sm"
              tone="danger"
              label={`Delete question ${number}`}
              loading={pending}
              onClick={() => onDelete(question, number)}
            />
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[15px] leading-relaxed font-semibold text-text-primary">{statement?.en}</p>
        {statement?.hi ? (
          <p lang="hi" className="mt-1 text-[15px] leading-relaxed text-text-muted">
            {statement.hi}
          </p>
        ) : (
          <MissingHindi />
        )}
      </div>

      <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Options">
        {options.map((option, i) => {
          const correct = option.id === correctOptionId;
          return (
            <li
              key={option.id}
              className={cx(
                "flex min-w-0 items-start gap-3 rounded-2xl px-3.5 py-3 ring-1 ring-inset",
                correct ? "bg-success-muted ring-success/30" : "bg-surface-muted ring-border/60",
              )}
            >
              <span
                className={cx(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-bold",
                  correct ? "bg-success text-bg" : "bg-surface-elevated text-text-muted ring-1 ring-inset ring-border/70",
                )}
                aria-hidden
              >
                {OPTION_LABELS[i] ?? i + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="sr-only">Option {OPTION_LABELS[i] ?? i + 1}: </span>
                <span className="block wrap-break-word text-text-primary">{option.text?.en}</span>
                {option.text?.hi ? (
                  <span lang="hi" className="mt-0.5 block wrap-break-word text-text-muted">
                    {option.text.hi}
                  </span>
                ) : (
                  <MissingHindi small />
                )}
              </span>
              {correct && (
                <span className="caps inline-flex shrink-0 items-center gap-1 pt-0.5 text-[10.5px] font-bold text-success">
                  <Icon name="checkCircle" className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Correct
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {(explanation?.en || explanation?.hi) && (
        <div className="mt-4 rounded-2xl bg-surface-muted px-4 py-3 text-[13.5px] leading-relaxed">
          <p className="caps text-[10.5px] font-bold text-text-muted">Explanation</p>
          {explanation.en && <p className="mt-1 text-text-primary">{explanation.en}</p>}
          {explanation.hi && (
            <p lang="hi" className="mt-0.5 text-text-muted">
              {explanation.hi}
            </p>
          )}
        </div>
      )}
    </article>
  );
});

function MissingHindi({ small = false }) {
  return (
    <span className={cx("mt-1 flex items-center gap-1.5 font-medium text-warning", small ? "text-xs" : "text-[13px]")}>
      <Icon name="alertTriangle" className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      Hindi missing
    </span>
  );
}

function DetailSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-3 pt-1" aria-busy="true" aria-label="Loading test">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-7 w-32 rounded-full" />
        <Skeleton className="h-10 w-2/3 max-w-lg" />
        <Skeleton className="h-4 w-1/2 max-w-sm" />
      </div>
      <Skeleton className="h-28 w-full rounded-[24px]" />
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </>
  );
}
