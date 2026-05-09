import { dummyResult } from './mockTestDummyData.js';

/** @param {string} iso */
export function formatAvailabilityRange(isoFrom, isoTo) {
  try {
    const from = new Date(isoFrom);
    const to = new Date(isoTo);
    const dtf = new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return `${dtf.format(from)} → ${dtf.format(to)}`;
  } catch {
    return `${isoFrom} → ${isoTo}`;
  }
}

export function formatDurationSeconds(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${r}s`;
}

export function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Builds API-shaped GET /attempts/:id/result from live answers + attempt questions.
 * @param {Record<string, string>} answers questionId → 'A'|'B'|'C'|'D'
 * @param {import('./mockTestDummyData.js').dummyTests[0]} test
 * @param {{ attemptId: string, attemptNumber: number }} attemptMeta
 * @param {{ questionId: string, questionText: string, optionA: string, optionB: string, optionC: string, optionD: string }[]} examQuestions order shown in exam
 * @param {number} timeTakenSeconds
 */
export function buildResultPayload(answers, test, attemptMeta, examQuestions, timeTakenSeconds) {
  const keyById = new Map(
    dummyResult.questions.map((q) => [q.questionId, q]),
  );

  const questions = examQuestions.map((eq) => {
    const template = keyById.get(eq.questionId);
    if (!template) {
      return {
        questionId: eq.questionId,
        questionText: eq.questionText,
        optionA: eq.optionA,
        optionB: eq.optionB,
        optionC: eq.optionC,
        optionD: eq.optionD,
        correctOption: 'A',
        selectedOption: answers[eq.questionId] ?? null,
        isCorrect: false,
        marksAwarded: 0,
        explanation: 'Explanation will be provided by LICPro Academy instructional content.',
      };
    }
    const selected = answers[eq.questionId] ?? null;
    const correctOption = template.correctOption;
    const isCorrect = selected !== null && selected === correctOption;
    return {
      questionId: eq.questionId,
      questionText: eq.questionText,
      optionA: eq.optionA,
      optionB: eq.optionB,
      optionC: eq.optionC,
      optionD: eq.optionD,
      correctOption,
      selectedOption: selected,
      isCorrect,
      marksAwarded: isCorrect ? 1 : 0,
      explanation: template.explanation,
    };
  });

  const score = questions.reduce((acc, q) => acc + q.marksAwarded, 0);
  const totalMarks = questions.length;
  const ratio = test.totalMarks > 0 ? test.passingMarks / test.totalMarks : 0.6;
  const passingMarks = Math.max(1, Math.ceil(totalMarks * ratio));
  const percentage = totalMarks ? Math.round((score / totalMarks) * 1000) / 10 : 0;
  const passed = score >= passingMarks;

  return {
    attemptId: attemptMeta.attemptId,
    testTitle: test.title,
    attemptNumber: attemptMeta.attemptNumber,
    score,
    totalMarks,
    percentage,
    passed,
    passingMarks,
    timeTakenSeconds,
    submittedAt: new Date().toISOString(),
    questions,
  };
}
