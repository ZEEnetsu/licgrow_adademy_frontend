import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  formatMutationError,
  useGetAdminTestBuilderQuery,
  usePostAdminTestQuestionsMutation,
} from '../../store/api/index.js';
import AdminDeskLayout from './AdminDeskLayout.jsx';
import { transitionHover } from '../dashboard/styles.js';

const emptyQuestion = () => ({
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  explanation: '',
  marks: 1,
});

export default function AdminTestBuilderPage() {
  const { testId } = useParams();

  const { data, isLoading, error, refetch } = useGetAdminTestBuilderQuery(testId, {
    skip: !testId,
  });

  const [postQuestions, postState] = usePostAdminTestQuestionsMutation();

  const [rows, setRows] = useState(() => [emptyQuestion()]);
  const [banner, setBanner] = useState(null);

  const status = String(data?.status ?? '').toLowerCase();
  const isDraft = status === 'draft' || status === '';

  const apiQuestions = useMemo(() => (Array.isArray(data?.questions) ? data.questions : []), [data]);

  const errMsg = error ? formatMutationError(error) : null;

  const patchRow = useCallback((i, key, val) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)),
    );
  }, []);

  const addRow = () => setRows((prev) => [...prev, emptyQuestion()]);

  const submitBulk = async (e) => {
    e.preventDefault();
    if (!testId || !isDraft) return;

    const questions = rows
      .map((r) => ({
        questionText: r.questionText.trim(),
        optionA: r.optionA.trim(),
        optionB: r.optionB.trim(),
        optionC: r.optionC.trim(),
        optionD: r.optionD.trim(),
        correctOption: String(r.correctOption || 'A')
          .toUpperCase()
          .slice(0, 1),
        explanation: r.explanation.trim(),
        marks: Math.max(1, Number(r.marks) || 1),
      }))
      .filter(
        (q) =>
          q.questionText &&
          q.optionA &&
          q.optionB &&
          q.optionC &&
          q.optionD &&
          ['A', 'B', 'C', 'D'].includes(q.correctOption),
      );

    if (!questions.length) {
      setBanner({
        kind: 'err',
        message: 'Add at least one complete question row (stem + four options).',
      });
      return;
    }

    try {
      await postQuestions({ testId, questions }).unwrap();
      setBanner({ kind: 'ok', message: `Uploaded ${questions.length} question(s).` });
      setRows([emptyQuestion()]);
      refetch();
    } catch (err) {
      setBanner({ kind: 'err', message: formatMutationError(err) });
    }
  };

  if (!testId) {
    return (
      <AdminDeskLayout
        welcomeTitle="Mock tests"
        tagline="Return to the tests list and open a draft to edit."
        primaryCta={{ href: '/dashboard/admin/tests', label: 'All tests' }}
      >
        <NavigateMissing />
      </AdminDeskLayout>
    );
  }

  return (
    <AdminDeskLayout
      welcomeTitle="Test builder"
      tagline="Add MCQs as a bulk upload. Only draft tests accept new questions."
      primaryCta={{ href: '/dashboard/admin/tests', label: 'Tests list' }}
    >
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/dashboard/admin/tests"
            className={`inline-flex text-sm text-[#64748B] ${transitionHover} hover:text-[#CBD5E1]`}
          >
            ← Tests
          </Link>
          <h1 className="mt-4 text-[clamp(1.5rem,4vw,1.875rem)] font-bold tracking-tight text-[#F1F5F9]">
            Question builder
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Bulk upload MCQs (`POST /admin/tests/:testId/questions`). Only draft tests accept new
            questions.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
            Draft status
          </p>
          <p className="mt-1 font-mono text-sm text-[#2EBF8A]">{data?.status ?? (isLoading ? '…' : '—')}</p>
          <Link
            to="/dashboard/admin/tests"
            className={`mt-2 inline-block text-sm text-[#94A3B8] underline-offset-4 ${transitionHover}`}
          >
            Open list & publish →
          </Link>
        </div>
      </div>

      {banner ? (
        <div className="mt-6 rounded-lg border border-white/[0.06] bg-[#111827] px-4 py-3 text-sm">
          <span className={banner.kind === 'ok' ? 'text-[#2EBF8A]' : 'text-rose-300'}>
            {banner.message}
          </span>
          <button
            type="button"
            className={`ml-3 text-[0.75rem] text-[#64748B] ${transitionHover}`}
            onClick={() => setBanner(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {errMsg ? (
        <p className="mt-6 rounded-lg border border-rose-500/35 bg-rose-950/20 px-4 py-3 text-sm text-rose-100">
          {errMsg}{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-semibold text-[#2EBF8A] underline-offset-4"
          >
            Retry
          </button>
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-10 text-[#64748B]">Loading builder…</p>
      ) : (
        <>
          {!isDraft ? (
            <p className="mt-10 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
              This test is no longer draft — editing questions via bulk upload is blocked by the API.
            </p>
          ) : (
            <>
              <h2 className="mt-10 text-xs font-bold uppercase tracking-[0.14em] text-[#64748B]">
                Existing ({apiQuestions.length})
              </h2>
              <ul className="mt-3 space-y-2 rounded-[14px] border border-white/[0.06] bg-[#111827]/80 p-4 text-sm text-[#94A3B8]">
                {apiQuestions.length === 0 ? (
                  <li>No questions yet — add rows below.</li>
                ) : (
                  apiQuestions.map((q) => (
                    <li key={q.questionId ?? q.questionText} className="border-b border-white/[0.04] pb-2 last:border-0">
                      <span className="font-medium text-[#CBD5E1]">
                        {(q.questionText ?? '').slice(0, 120)}
                        {(q.questionText ?? '').length > 120 ? '…' : ''}
                      </span>{' '}
                      <span className="tabular-nums">· Correct {q.correctOption ?? '—'}</span>
                    </li>
                  ))
                )}
              </ul>

              <form className="mt-8 space-y-6" onSubmit={submitBulk}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748B]">
                    Add questions
                  </h2>
                  <button
                    type="button"
                    onClick={addRow}
                    className={`rounded-[10px] border border-white/[0.1] px-3 py-1.5 text-xs font-semibold text-[#CBD5E1] ${transitionHover}`}
                  >
                    + Row
                  </button>
                </div>

                {rows.map((r, idx) => (
                  <fieldset
                    key={idx}
                    className="space-y-3 rounded-[14px] border border-white/[0.06] bg-[#0D1117] p-4"
                  >
                    <legend className="px-2 text-[0.7rem] font-semibold uppercase tracking-wide text-[#475569]">
                      Question {idx + 1}
                    </legend>
                    <label className="block text-xs font-medium text-[#94A3B8]">
                      Stem
                      <textarea
                        value={r.questionText}
                        rows={2}
                        onChange={(e) => patchRow(idx, 'questionText', e.target.value)}
                        className="mt-1 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2 text-[#F1F5F9]"
                      />
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(['optionA', 'optionB', 'optionC', 'optionD']).map((k) => (
                        <label key={k} className="block text-xs font-medium text-[#94A3B8]">
                          {k.slice(-1)}
                          <input
                            value={r[k]}
                            onChange={(e) => patchRow(idx, k, e.target.value)}
                            className="mt-1 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2 text-[#F1F5F9]"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="text-xs font-medium text-[#94A3B8]">
                        Correct
                        <select
                          value={r.correctOption}
                          onChange={(e) => patchRow(idx, 'correctOption', e.target.value)}
                          className="ml-2 rounded-[10px] border border-white/[0.08] bg-[#080C14] px-2 py-1 text-[#F1F5F9]"
                        >
                          {(['A', 'B', 'C', 'D']).map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-medium text-[#94A3B8]">
                        Marks
                        <input
                          type="number"
                          min={1}
                          value={r.marks}
                          onChange={(e) => patchRow(idx, 'marks', e.target.value)}
                          className="ml-2 w-16 rounded-[10px] border border-white/[0.08] bg-[#080C14] px-2 py-1 tabular-nums text-[#F1F5F9]"
                        />
                      </label>
                    </div>
                    <label className="block text-xs font-medium text-[#94A3B8]">
                      Explanation
                      <textarea
                        value={r.explanation}
                        rows={2}
                        onChange={(e) => patchRow(idx, 'explanation', e.target.value)}
                        className="mt-1 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2 text-[#F1F5F9]"
                      />
                    </label>
                  </fieldset>
                ))}

                <button
                  type="submit"
                  disabled={postState.isLoading || !isDraft}
                  className={`w-full rounded-[12px] border border-[rgba(46,191,138,0.4)] bg-[#161F2E] py-3 text-sm font-semibold text-[#2EBF8A] disabled:opacity-50 ${transitionHover}`}
                >
                  {postState.isLoading ? 'Saving questions…' : 'Save bulk to draft'}
                </button>
              </form>
            </>
          )}
        </>
      )}
    </div>
    </AdminDeskLayout>
  );
}

function NavigateMissing() {
  return (
    <div className="p-10 text-center text-[#64748B]">
      Missing test id —{' '}
      <Link to="/dashboard/admin/tests" className="text-[#2EBF8A]">
        back to tests
      </Link>
    </div>
  );
}
