import { useParams } from "react-router-dom";
import DashboardCompLayout from "../../../../layouts/DashboardCompLayout";
import { useGetTestDetailQuery } from "../../../../app/apis/tests.api";
import Btn from "../../components/Btn";
// constants — defined once at module scope
const OPTION_LABELS = ["A", "B", "C", "D"];

// ─── sub-components ──────────────────────────────────────────

const OptionItem = ({ label, statement }) => (
  <div className="flex items-center gap-3 rounded-md bg-zinc-800 px-4 py-2">
    <span className="text-zinc-400 font-mono">{label}.</span>
    <span>{statement}</span>
  </div>
);

const QuestionCard = ({ question, index }) => {
  const { questionId, questionStatement, options } = question;
  return (
    <div className="p-4 text-sm bg-zinc-800/50 m-4 rounded-md">
      <p className="flex gap-3 items-center">
        <span className="text-zinc-400">{index + 1}.</span>
        <span>{questionStatement}</span>
      </p>
      <div className="grid grid-cols-2 mt-4 gap-5">
        {options.map((opt, i) => (
          <OptionItem
            key={opt.optionId}
            label={OPTION_LABELS[i]}
            statement={opt.optionStatement}
          />
        ))}
      </div>
    </div>
  );
};
const AddQuestionBtn = ({ ...props }) => {
  return <Btn title={"+ Add question"} variant="outline"/> ;
};
const QuestionList = ({ questions }) => {
  if (!questions.length) {
    return (
      <p className="font-semibold text-xl text-zinc-400">
        No questions added yet.
      </p>
    );
  }
  return questions.map((q, i) => (
    <div className="w-1/2 px-3">
      <QuestionCard key={q.questionId} question={q} index={i} />
      <AddQuestionBtn />
    </div>
  ));
};

const TestHeader = ({ title, testId, durationMinutes, totalMarks }) => (
  <div className="flex items-center justify-between px-5">
    <div className="flex items-baseline gap-4">
      <p className="text-2xl">{title}</p>
      <p className="text-xs text-zinc-500">{testId?.slice(0, 8)}</p>
    </div>
    <div className="flex gap-4 items-center text-sm">
      <span>
        Duration: <strong>{durationMinutes}m</strong>
      </span>
      <span>
        Total Marks: <strong>{totalMarks}</strong>
      </span>
    </div>
  </div>
);

// ─── custom hook ─────────────────────────────────────────────

const useTestDetail = (testId) => {
  const { data, isLoading, isError, error } = useGetTestDetailQuery(testId);

  const errorMessage =
    error?.data?.message ?? error?.error ?? "Something went wrong";

  return {
    test: data?.data ?? null,
    isLoading,
    isError,
    errorMessage,
  };
};

// ─── page component ──────────────────────────────────────────

const TestDetail = () => {
  const { testId } = useParams();
  const { test, isLoading, isError, errorMessage } = useTestDetail(testId);

  if (isLoading) {
    return (
      <DashboardCompLayout>
        <p className="text-zinc-400 p-6">Loading test...</p>
      </DashboardCompLayout>
    );
  }

  if (isError || !test) {
    return (
      <DashboardCompLayout>
        <p className="text-red-400 p-6">Failed to load test — {errorMessage}</p>
      </DashboardCompLayout>
    );
  }

  return (
    <DashboardCompLayout>
      <TestHeader
        title={test.title}
        testId={test.testId}
        durationMinutes={test.durationMinutes}
        totalMarks={test.totalMarks}
      />
      <QuestionList questions={test.questions ?? []} />
    </DashboardCompLayout>
  );
};

export default TestDetail;
