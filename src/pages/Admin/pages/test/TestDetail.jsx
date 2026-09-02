import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout";
import Btn from "../../components/Btn";
import Can from "../../../../components/auth/Can";
import QuestionEditor from "./QuestionEditor";
import { PERMISSIONS } from "../../../../app/features/auth/permissions";
import { getUserMessage } from "../../../../app/apis/apiError";
import {
  useArchiveTestMutation,
  useDeleteQuestionMutation,
  useDeleteTestMutation,
  useGetTestDetailQuery,
  useGetTestQuestionsQuery,
  usePublishTestMutation,
  useReorderQuestionsMutation,
  TEST_STATUS,
} from "../../../../app/apis/tests.api";

/**
 * Test detail + question authoring — `api-contracts/09-test.md` §3, §6–13.
 *
 * Two requests by design: §3 returns metadata and `questionCount` only; the
 * questions come from §9 in `AdminQuestion` shape.
 */

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

const text = (field) => field?.en ?? field?.hi ?? "";
const hasHindi = (field) => Boolean(field?.hi);

// ─── question display ────────────────────────────────────────

const OptionItem = ({ label, option, isCorrect }) => (
  <div
    className={`flex items-start gap-3 rounded-md px-4 py-2 ${
      isCorrect
        ? "bg-success-muted border border-success/40"
        : "bg-surface-elevated border border-transparent"
    }`}
  >
    <span className="text-text-muted font-mono">{label}.</span>
    <div className="flex-1">
      <p>{text(option.text)}</p>
      {hasHindi(option.text) && (
        <p className="text-text-muted text-xs mt-0.5" lang="hi">
          {option.text.hi}
        </p>
      )}
    </div>
    {isCorrect && (
      <span className="text-success text-[10px] font-semibold uppercase tracking-wide">
        correct
      </span>
    )}
  </div>
);

const QuestionCard = ({
  question,
  index,
  total,
  onEdit,
  onDelete,
  onMove,
  busy,
}) => {
  const { statement, explanation, options = [], correctOptionId, marks } =
    question;

  const needsHindi =
    !hasHindi(statement) || options.some((option) => !hasHindi(option.text));

  return (
    <div className="p-4 text-sm bg-surface-elevated rounded-md">
      <div className="flex items-start justify-between gap-4">
        <p className="flex gap-3 items-baseline">
          <span className="text-text-muted">{index + 1}.</span>
          <span>
            {text(statement)}
            {hasHindi(statement) && (
              <span className="block text-text-muted text-xs mt-1" lang="hi">
                {statement.hi}
              </span>
            )}
          </span>
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {needsHindi && (
            <span
              className="text-warning text-[10px] font-semibold uppercase tracking-wide"
              title="Hindi is required before this test can be published"
            >
              needs hi
            </span>
          )}
          <span className="text-text-muted text-xs">
            {marks} mark{marks === 1 ? "" : "s"}
          </span>

          <Can perm={PERMISSIONS.TEST_AUTHOR}>
            <div className="flex items-center gap-1 ml-2">
              <IconButton
                label="Move up"
                disabled={index === 0 || busy}
                onClick={() => onMove(index, -1)}
              >
                ↑
              </IconButton>
              <IconButton
                label="Move down"
                disabled={index === total - 1 || busy}
                onClick={() => onMove(index, 1)}
              >
                ↓
              </IconButton>
              <IconButton label="Edit question" onClick={onEdit} disabled={busy}>
                ✎
              </IconButton>
              <IconButton
                label="Delete question"
                onClick={onDelete}
                disabled={busy}
                danger
              >
                ✕
              </IconButton>
            </div>
          </Can>
        </div>
      </div>

      <div className="grid md:grid-cols-2 mt-4 gap-3">
        {options.map((option, i) => (
          <OptionItem
            key={option.id}
            label={OPTION_LABELS[i] ?? i + 1}
            option={option}
            isCorrect={option.id === correctOptionId}
          />
        ))}
      </div>

      {explanation && text(explanation) && (
        <p className="mt-3 text-xs text-text-muted border-l-2 border-border pl-3">
          {text(explanation)}
        </p>
      )}
    </div>
  );
};

const IconButton = ({ label, children, danger, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`h-6 w-6 rounded text-xs text-text-muted hover:bg-surface-elevated-hover disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer ${
      danger ? "hover:text-danger" : "hover:text-text-primary"
    }`}
    {...props}
  >
    {children}
  </button>
);

// ─── header ──────────────────────────────────────────────────

const StatusPill = ({ status }) => {
  const tone =
    {
      [TEST_STATUS.PUBLISHED]: "bg-success-muted text-success",
      [TEST_STATUS.ARCHIVED]: "bg-danger-muted text-danger",
      [TEST_STATUS.DRAFT]: "bg-surface-elevated-hover text-text-primary",
    }[status] ?? "bg-surface-elevated-hover text-text-primary";

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${tone}`}
    >
      {status}
    </span>
  );
};

// ─── page ────────────────────────────────────────────────────

const TestDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [publishIssues, setPublishIssues] = useState(null);

  const {
    data: test,
    isLoading: testLoading,
    isError: testFailed,
    error: testError,
  } = useGetTestDetailQuery(testId, { skip: !testId });

  const {
    data: questions = [],
    isLoading: questionsLoading,
    error: questionsError,
  } = useGetTestQuestionsQuery(testId, { skip: !testId });

  const [publishTest, publishState] = usePublishTestMutation();
  const [archiveTest, archiveState] = useArchiveTestMutation();
  const [deleteTest] = useDeleteTestMutation();
  const [deleteQuestion, deleteQuestionState] = useDeleteQuestionMutation();
  const [reorderQuestions, reorderState] = useReorderQuestionsMutation();

  const busy = deleteQuestionState.isLoading || reorderState.isLoading;

  const handlePublish = async () => {
    setPublishIssues(null);
    try {
      await publishTest(testId).unwrap();
    } catch (error) {
      // 422 TEST_NOT_PUBLISHABLE carries per-field `details` (§6) — that list
      // is the whole value of this action failing, so surface it verbatim.
      setPublishIssues(error?.details?.length ? error.details : null);
    }
  };

  const handleMove = async (index, direction) => {
    const next = [...questions];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];

    await reorderQuestions({
      testId,
      orderedQuestionIds: next.map((question) => question.id),
    });
  };

  const handleDeleteQuestion = async (questionId) => {
    await deleteQuestion({ testId, questionId });
  };

  const handleDeleteTest = async () => {
    try {
      await deleteTest(testId).unwrap();
      navigate("/admin/manage-test", { replace: true });
    } catch {
      // draft-only; the button is hidden otherwise
    }
  };

  if (testLoading) {
    return (
      <DashboardCompLayout>
        <p className="text-text-muted p-6">Loading test…</p>
      </DashboardCompLayout>
    );
  }

  if (testFailed || !test) {
    return (
      <DashboardCompLayout>
        <p className="text-danger p-6">
          Failed to load test — {getUserMessage(testError)}
        </p>
      </DashboardCompLayout>
    );
  }

  const isDraft = test.status === TEST_STATUS.DRAFT;

  return (
    <>
      <DashboardCompLayout>
        <div className="flex items-start justify-between px-5 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-2xl">{test.title}</p>
              <StatusPill status={test.status} />
            </div>
            <p className="text-xs text-text-muted mt-1 font-mono">
              {test.id?.slice(0, 8)} · {test.kind}
            </p>
            {test.description && (
              <p className="text-sm text-text-muted mt-2 max-w-prose">
                {test.description}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 text-sm shrink-0">
            <span>
              Duration:{" "}
              <strong>
                {test.durationMinutes ? `${test.durationMinutes}m` : "untimed"}
              </strong>
            </span>
            <span>
              Marks: <strong>{test.totalMarks}</strong>
              <span className="text-text-muted"> · pass {test.passingMarks}</span>
            </span>
            <span className="text-text-muted text-xs">
              {questions.length} question{questions.length === 1 ? "" : "s"} ·{" "}
              {test.maxAttempts === null
                ? "unlimited attempts"
                : `${test.maxAttempts} attempt${test.maxAttempts === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>

        <Can perm={PERMISSIONS.TEST_AUTHOR}>
          <div className="flex gap-3 px-5 mt-4 max-w-xl">
            {isDraft && (
              <Btn
                title={publishState.isLoading ? "Publishing…" : "Publish"}
                variant="primary"
                size="sm"
                onClick={handlePublish}
                disabled={publishState.isLoading}
              />
            )}
            {test.status !== TEST_STATUS.ARCHIVED && (
              <Btn
                title={archiveState.isLoading ? "Archiving…" : "Archive"}
                variant="secondary"
                size="sm"
                onClick={() => archiveTest(testId)}
                disabled={archiveState.isLoading}
              />
            )}
            {isDraft && (
              <Btn
                title="Delete"
                variant="danger"
                size="sm"
                onClick={handleDeleteTest}
              />
            )}
          </div>
        </Can>

        {publishIssues && (
          <div className="mx-5 mt-4 rounded-md bg-warning-muted border border-warning/40 px-4 py-3">
            <p className="text-warning text-xs font-semibold">
              This test can&apos;t be published yet:
            </p>
            <ul className="mt-2 text-[11px] text-warning list-disc pl-4">
              {publishIssues.map((issue) => (
                <li key={`${issue.field}-${issue.issue}`}>
                  <span className="font-mono">{issue.field}</span> — {issue.issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </DashboardCompLayout>

      <DashboardCompLayout>
        {questionsLoading ? (
          <p className="text-text-muted text-sm">Loading questions…</p>
        ) : questionsError ? (
          <p className="text-danger text-sm">
            Couldn&apos;t load questions — {getUserMessage(questionsError)}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {questions.length === 0 && !adding && (
              <div>
                <p className="font-semibold text-lg text-text-muted">
                  No questions added yet.
                </p>
                <p className="text-text-muted text-xs mt-1">
                  A test needs at least one question before it can be published.
                </p>
              </div>
            )}

            {questions.map((question, index) =>
              editingId === question.id ? (
                <QuestionEditor
                  key={question.id}
                  testId={testId}
                  question={question}
                  onDone={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  total={questions.length}
                  busy={busy}
                  onEdit={() => setEditingId(question.id)}
                  onDelete={() => handleDeleteQuestion(question.id)}
                  onMove={handleMove}
                />
              ),
            )}

            {adding ? (
              <QuestionEditor
                testId={testId}
                onDone={() => setAdding(false)}
                onCancel={() => setAdding(false)}
              />
            ) : (
              <Can perm={PERMISSIONS.TEST_AUTHOR}>
                <div className="max-w-xs">
                  <Btn
                    title="+ Add question"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdding(true)}
                  />
                </div>
              </Can>
            )}
          </div>
        )}
      </DashboardCompLayout>
    </>
  );
};

export default TestDetail;
