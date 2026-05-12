import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import ExamHeader from './ExamHeader.jsx';
import QuestionNavigator from './QuestionNavigator.jsx';
import QuestionPanel from './QuestionPanel.jsx';
import SubmitConfirmModal from './SubmitConfirmModal.jsx';
import TimeUpModal from './TimeUpModal.jsx';
import WarningToast from './WarningToast.jsx';
import FinalWarningModal from './FinalWarningModal.jsx';

import {
  useLazyGetAttemptResultQuery,
  useSaveAttemptAnswerMutation,
  useSubmitAttemptMutation,
} from '../../store/api/index.js';
import { buildResultPayload, shuffleArray } from './mockTestUtils.js';
import { clearExamSession, saveExamSession } from './mockTestSession.js';

/** Starts from Navigate state seeded by POST /attempts flows. */
export default function ExamScreen() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [submitAttempt] = useSubmitAttemptMutation();
  const [saveAnswer] = useSaveAttemptAnswerMutation();
  const [fetchResult] = useLazyGetAttemptResultQuery();

  const attemptFromApi = location.state?.attemptFromApi === true;
  const test = location.state?.test ?? null;
  const attemptBootstrap = location.state?.attempt ?? null;

  const debounceTimers = useRef({});

  const examQuestions = useMemo(() => {
    if (!test || !attemptBootstrap) return [];
    let qs = [...(attemptBootstrap.questions ?? [])];
    const serverPrepared = Boolean(attemptFromApi);
    if (test.shuffleQuestions && !serverPrepared) qs = shuffleArray(qs);
    return qs;
  }, [attemptBootstrap, attemptFromApi, test]);

  const durationSeconds = useMemo(
    () => Math.max(60, (attemptBootstrap?.durationMinutes ?? 30) * 60),
    [attemptBootstrap?.durationMinutes],
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(() => new Set());
  const [visitedQuestions, setVisitedQuestions] = useState(() => new Set([0]));
  const [timeRemaining, setTimeRemaining] = useState(() =>
    Math.max(60, (attemptBootstrap?.durationMinutes ?? 30) * 60),
  );
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [lastSavedVisible, setLastSavedVisible] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [finalWarnOpen, setFinalWarnOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const answersRef = useRef(answers);
  const examFinishedRef = useRef(false);
  const startedAtMsRef = useRef(Date.now());
  const timePerQuestionSecondsRef = useRef({});
  const navIndexTrackerRef = useRef(0);
  const dwellStartMsRef = useRef(Date.now());
  const finalizedRef = useRef(false);
  const timeUpScheduledRef = useRef(false);

  useEffect(() => {
    setTimeRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    examFinishedRef.current = examFinished;
  }, [examFinished]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(
    () => () => {
      Object.values(debounceTimers.current).forEach((tid) =>
        window.clearTimeout(tid),
      );
    },
    [],
  );

  const dismissToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  const creditDwellThenJump = useCallback(
    (nextIndex) => {
      const clamped = Math.max(
        0,
        Math.min(examQuestions.length - 1, nextIndex),
      );

      const prevIndex = navIndexTrackerRef.current;
      const prevQ = examQuestions[prevIndex]?.questionId;
      if (prevQ) {
        const inc = Math.max(
          0,
          Math.round((Date.now() - dwellStartMsRef.current) / 1000),
        );
        const map = timePerQuestionSecondsRef.current;
        map[prevQ] = (map[prevQ] ?? 0) + inc;
      }

      dwellStartMsRef.current = Date.now();
      navIndexTrackerRef.current = clamped;
      setCurrentQuestionIndex(clamped);
      setVisitedQuestions((prev) => new Set(prev).add(clamped));
    },
    [examQuestions],
  );

  useEffect(() => {
    startedAtMsRef.current = Date.now();
    navIndexTrackerRef.current = currentQuestionIndex;
    dwellStartMsRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examQuestions.length]);

  /** Credit final dwell time when finishing the exam journey. */

  /** @typedef {{ result:ReturnType<typeof buildResultPayload>, test:typeof test }} ResultNavState */

  const navigateWithResult = useCallback(async () => {
    if (!test || !attemptBootstrap) return;
    if (finalizedRef.current) return;

    finalizedRef.current = true;
    examFinishedRef.current = true;
    setExamFinished(true);

    const activeIndex = navIndexTrackerRef.current;
    const activeQId = examQuestions[activeIndex]?.questionId;
    if (activeQId) {
      const inc = Math.max(
        0,
        Math.round((Date.now() - dwellStartMsRef.current) / 1000),
      );
      const map = timePerQuestionSecondsRef.current;
      map[activeQId] = (map[activeQId] ?? 0) + inc;
      dwellStartMsRef.current = Date.now();
    }

    if (attemptFromApi && attemptBootstrap.attemptId) {
      try {
        await submitAttempt(attemptBootstrap.attemptId).unwrap();
      } catch {
        setToast({
          visible: true,
          message: 'Could not submit this attempt. Try again.',
        });
        finalizedRef.current = false;
        examFinishedRef.current = false;
        setExamFinished(false);
        return;
      }

      try {
        const resultPayload = await fetchResult(attemptBootstrap.attemptId).unwrap();
        clearExamSession();
        navigate(`/mock-tests/${test.testId}/result`, {
          replace: true,
          state: { result: resultPayload, test, attemptFromApi: true },
        });
      } catch {
        setToast({
          visible: true,
          message: 'Submitted — open results from Recent attempts shortly.',
        });
      }
      return;
    }

    const timeTakenSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAtMsRef.current) / 1000),
    );

    const resultPayload = buildResultPayload(
      answersRef.current,
      test,
      {
        attemptId: attemptBootstrap.attemptId,
        attemptNumber: attemptBootstrap.attemptNumber,
      },
      examQuestions,
      timeTakenSeconds,
    );

    clearExamSession();

    navigate(`/mock-tests/${test.testId}/result`, {
      replace: true,
      state: { result: resultPayload, test },
    });
  }, [
    attemptBootstrap,
    attemptFromApi,
    examQuestions,
    fetchResult,
    navigate,
    submitAttempt,
    test,
  ]);

  useEffect(() => {
    if (examFinishedRef.current || timeRemaining > 0) return undefined;
    if (timeUpScheduledRef.current) return undefined;
    timeUpScheduledRef.current = true;
    setShowTimeUpModal(true);
    return undefined;
  }, [timeRemaining]);

  useEffect(() => {
    if (examFinished) return undefined;

    const id = window.setInterval(() => {
      setTimeRemaining((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [examFinished]);

  useEffect(() => {
    if (examFinished) return undefined;
    const id = window.setTimeout(() => {
      saveExamSession({
        answers: answersRef.current,
        testId: test?.testId,
        attemptId: attemptBootstrap?.attemptId,
      });
    }, 1000);

    return () => window.clearTimeout(id);
  }, [answers, attemptBootstrap?.attemptId, examFinished, test?.testId]);

  useEffect(() => {
    if (!Object.keys(answers).length || examFinished) return undefined;

    const tShow = window.setTimeout(() => setLastSavedVisible(true), 1000);
    const tHide = window.setTimeout(() => setLastSavedVisible(false), 1000 + 2300);

    return () => {
      window.clearTimeout(tShow);
      window.clearTimeout(tHide);
    };
  }, [answers, examFinished]);

  /** Visibility + cheat prevention listeners mount/unmount cleanly. */
  useEffect(() => {
    if (examFinished) return undefined;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchCount((c) => c + 1);
        setToast({
          visible: true,
          message: 'Warning: Leaving the exam tab has been recorded.',
        });
      }
    };

    const stopDefault = (e) => {
      e.preventDefault();
    };

    const onKey = (e) => {
      const blocked =
        (e.ctrlKey &&
          ['c', 'v', 'a', 'p', 'u'].includes(String(e.key).toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && String(e.key).toLowerCase() === 'i');

      if (blocked) e.preventDefault();
    };

    const onBeforeUnload = (e) => {
      if (examFinishedRef.current) return undefined;
      e.preventDefault();
      e.returnValue = 'Your exam is in progress. Leaving will auto-submit your answers.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('contextmenu', stopDefault);
    document.addEventListener('copy', stopDefault);
    document.addEventListener('paste', stopDefault);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('contextmenu', stopDefault);
      document.removeEventListener('copy', stopDefault);
      document.removeEventListener('paste', stopDefault);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [examFinished]);

  useEffect(() => {
    if (examFinished) return undefined;
    if (tabSwitchCount >= 3) setFinalWarnOpen(true);
    return undefined;
  }, [examFinished, tabSwitchCount]);

  if (!test || !attemptBootstrap) {
    const dest = testId ? `/mock-tests/${testId}` : '/mock-tests';
    return <Navigate to={dest} replace />;
  }

  const currentQuestion = examQuestions[currentQuestionIndex];
  const typedSelectedLetter = currentQuestion?.questionId
    ? answers[currentQuestion.questionId]
    : undefined;

  const answeredCount = useMemo(() => {
    let n = 0;
    examQuestions.forEach((q) => {
      if (answers[q.questionId]) n += 1;
    });
    return n;
  }, [answers, examQuestions]);

  const markedCount = markedForReview.size;

  const handleSelectLetter = useCallback(
    (letter) => {
      const qId = examQuestions[currentQuestionIndex]?.questionId;
      if (!qId) return;
      setAnswers((prev) => ({ ...prev, [qId]: letter }));

      if (!attemptFromApi || !attemptBootstrap?.attemptId) return;
      const timers = debounceTimers.current;
      window.clearTimeout(timers[qId]);
      timers[qId] = window.setTimeout(() => {
        saveAnswer({
          attemptId: attemptBootstrap.attemptId,
          questionId: qId,
          selectedOption: letter,
        });
      }, 950);
    },
    [
      attemptBootstrap?.attemptId,
      attemptFromApi,
      currentQuestionIndex,
      examQuestions,
      saveAnswer,
    ],
  );

  const toggleMarkForReview = useCallback(() => {
    const q = examQuestions[currentQuestionIndex];
    if (!q) return;
    const id = q.questionId;
    setMarkedForReview((prev) => {
      const ns = new Set(prev);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  }, [currentQuestionIndex, examQuestions]);

  const goPrev = useCallback(() => {
    creditDwellThenJump(currentQuestionIndex - 1);
  }, [creditDwellThenJump, currentQuestionIndex]);

  const goNext = useCallback(() => {
    creditDwellThenJump(currentQuestionIndex + 1);
  }, [creditDwellThenJump, currentQuestionIndex]);

  const jumpTo = useCallback(
    (index) => {
      creditDwellThenJump(index);
    },
    [creditDwellThenJump],
  );

  const questionPanelJsx = (
    <QuestionPanel
      question={currentQuestion}
      questionIndex={currentQuestionIndex}
      totalQuestions={examQuestions.length}
      selectedLetter={typedSelectedLetter}
      onSelect={handleSelectLetter}
      marked={
        currentQuestion ? markedForReview.has(currentQuestion.questionId) : false
      }
      onToggleMark={toggleMarkForReview}
      onPrev={goPrev}
      onNext={goNext}
      showSaved={lastSavedVisible}
    />
  );

  return (
    <div className="min-h-[100dvh] select-none bg-[#05070d] pb-24 lg:pb-6">
      <ExamHeader
        testTitle={test.title}
        answeredCount={answeredCount}
        totalQuestions={examQuestions.length}
        timeRemainingSeconds={timeRemaining}
        onSubmitClick={() => setShowSubmitModal(true)}
        tabSwitchCount={tabSwitchCount}
      />

      <div className="flex flex-col pt-[clamp(124px,16vw,140px)] lg:flex-row">
        <section className="hidden min-h-[calc(100dvh-148px)] w-full lg:flex lg:w-[70%] lg:flex-col lg:border-r lg:border-white/[0.06]">
          {questionPanelJsx}
        </section>

        <section className="flex min-h-[calc(100dvh-148px)] w-full lg:hidden">
          {questionPanelJsx}
        </section>

        <div className="hidden min-h-[calc(100dvh-148px)] w-[30%] min-w-[280px] shrink-0 flex-col lg:flex">
          <QuestionNavigator
            examQuestions={examQuestions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            markedForReview={markedForReview}
            visitedQuestions={visitedQuestions}
            onJump={jumpTo}
            onSubmitClick={() => setShowSubmitModal(true)}
          />
        </div>
      </div>

      {navigatorOpen && (
        <>
          <button
            type="button"
            aria-label="Dismiss navigator backdrop"
            onClick={() => setNavigatorOpen(false)}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden"
          />

          <QuestionNavigator
            examQuestions={examQuestions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            markedForReview={markedForReview}
            visitedQuestions={visitedQuestions}
            onJump={jumpTo}
            onSubmitClick={() => setShowSubmitModal(true)}
            mobileSheet
            onCloseSheet={() => setNavigatorOpen(false)}
          />
        </>
      )}

      <button
        type="button"
        onClick={() => setNavigatorOpen(true)}
        className="fixed bottom-5 right-5 z-[45] flex min-h-[48px] items-center justify-center rounded-full border border-white/[0.08] bg-[#111827] px-5 py-3 text-[0.8125rem] font-semibold text-[#CBD5E1] shadow-[0_12px_32px_rgba(0,0,0,0.55)] lg:hidden"
      >
        Navigator
      </button>

      <SubmitConfirmModal
        open={showSubmitModal}
        answeredCount={answeredCount}
        totalQuestions={examQuestions.length}
        markedCount={markedCount}
        onClose={() => setShowSubmitModal(false)}
        onConfirmSubmit={() => {
          setShowSubmitModal(false);
          void navigateWithResult();
        }}
      />

      <TimeUpModal
        open={showTimeUpModal}
        onViewResult={() => {
          setShowTimeUpModal(false);
          void navigateWithResult();
        }}
      />

      <WarningToast
        message={toast.message}
        visible={toast.visible}
        onDismiss={dismissToast}
      />

      <FinalWarningModal
        open={finalWarnOpen}
        tabSwitchCount={tabSwitchCount}
        onAcknowledge={() => setFinalWarnOpen(false)}
      />
    </div>
  );
}
