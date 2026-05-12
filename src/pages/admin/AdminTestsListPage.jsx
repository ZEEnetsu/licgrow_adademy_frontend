import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  formatMutationError,
  useArchiveAdminTestMutation,
  useGetAdminTestsQuery,
  usePublishAdminTestMutation,
} from '../../store/api/index.js';
import AdminDeskLayout from './AdminDeskLayout.jsx';
import { shadow, transitionHover } from '../dashboard/styles.js';

function formatStatus(raw) {
  const s = String(raw ?? '').toLowerCase();
  if (s === 'draft') return 'Draft';
  if (s === 'published') return 'Published';
  if (s === 'archived') return 'Archived';
  return raw ?? '—';
}

function toneForStatus(raw) {
  const s = String(raw ?? '').toLowerCase();
  if (s === 'published') return 'border-[#2EBF8A]/25 bg-[#2EBF8A]/10 text-[#2EBF8A]';
  if (s === 'archived') return 'border-[#475569]/30 bg-[#475569]/10 text-[#94A3B8]';
  return 'border-amber-500/25 bg-amber-950/30 text-amber-200';
}

export default function AdminTestsListPage() {
  const [banner, setBanner] = useState(null);
  const { data: rows = [], isLoading, error, refetch } = useGetAdminTestsQuery({
    limit: 100,
    page: 1,
  });
  const tests = Array.isArray(rows) ? rows : [];

  const [publishTest, publishState] = usePublishAdminTestMutation();
  const [archiveTest, archiveState] = useArchiveAdminTestMutation();

  const busy =
    publishState.isLoading || archiveState.isLoading;

  const errMsg = error ? formatMutationError(error) : null;

  const sorted = useMemo(
    () =>
      [...tests].sort(
        (a, b) =>
          String(b.updatedAt ?? b.createdAt ?? '').localeCompare(
            String(a.updatedAt ?? a.createdAt ?? ''),
          ) || String(a.title ?? '').localeCompare(String(b.title ?? '')),
      ),
    [tests],
  );

  const flash = useMemo(() => banner, [banner]);

  return (
    <AdminDeskLayout
      welcomeTitle="Mock tests"
      tagline="Draft tests, attach questions, publish to notify learners."
      primaryCta={{ href: '/dashboard/admin/tests/new', label: 'Create test' }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="flex w-full flex-wrap items-start justify-between gap-4 pb-8">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.26em] text-[#2EBF8A]">
            Admin — Test Hosting
          </p>
          <h1 className="mt-2 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-tight text-[#F1F5F9]">
            Tests
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#64748B]">
            Draft tests receive questions here. Publishing notifies enrolled learners and exposes each
            test in their mock panel.
          </p>
        </div>
        <Link
          to="/dashboard/admin/tests/new"
          className={`rounded-[12px] border border-[rgba(46,191,138,0.35)] bg-[#111827] px-5 py-2.5 text-sm font-semibold text-[#2EBF8A] ${transitionHover} hover:border-[rgba(46,191,138,0.55)]`}
        >
          Create test
        </Link>
      </header>

      {flash ? (
        <div className="mb-4 w-full rounded-lg border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm text-[#CBD5E1]">
          {flash.kind === 'ok' ? (
            <span className="text-[#2EBF8A]">{flash.message}</span>
          ) : (
            <span className="text-rose-300">{flash.message}</span>
          )}
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
        <div className="mb-4 w-full rounded-lg border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-100">
          {errMsg}{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className={`ml-2 font-semibold underline ${transitionHover}`}
          >
            Retry
          </button>
        </div>
      ) : null}

        <section
          className={`w-full overflow-hidden rounded-[16px] border border-white/[0.06] bg-[#111827] ${shadow.card}`}
        >
        <div className="border-b border-white/[0.06] px-4 py-4 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
            All tests
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#161F2E] text-[0.65rem] uppercase tracking-[0.12em] text-[#64748B]">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Questions</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Attempts</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-10 text-[#64748B]" colSpan={7}>
                    Loading tests…
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-[#64748B]" colSpan={7}>
                    No tests yet.{' '}
                    <Link to="/dashboard/admin/tests/new" className="font-semibold text-[#2EBF8A]">
                      Create the first draft
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                sorted.map((t) => (
                  <tr
                    key={t.testId}
                    className="border-b border-white/[0.04] hover:bg-[#161F2E]/70"
                  >
                    <td className="max-w-[200px] px-4 py-3 font-medium text-[#CBD5E1]">
                      {t.title ?? 'Untitled'}
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8]">{t.courseTitle ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${toneForStatus(t.status)}`}
                      >
                        {formatStatus(t.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[#94A3B8]">
                      {t.questionCount ?? 0}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[#94A3B8]">
                      {t.durationMinutes != null ? `${t.durationMinutes} min` : '—'}
                    </td>
                    <td className="hidden px-4 py-3 tabular-nums text-[#94A3B8] md:table-cell">
                      {t.totalAttempts != null ? t.totalAttempts : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/dashboard/admin/tests/${t.testId}/build`}
                          className={`rounded-[10px] border border-white/[0.08] bg-[#161F2E] px-2.5 py-1.5 text-xs font-medium text-[#CBD5E1] ${transitionHover}`}
                        >
                          Builder
                        </Link>
                        <button
                          type="button"
                          disabled={
                            busy ||
                            String(t.status).toLowerCase() !== 'draft' ||
                            !(t.questionCount > 0)
                          }
                          title={
                            !(t.questionCount > 0)
                              ? 'Add at least one question before publishing'
                              : String(t.status).toLowerCase() !== 'draft'
                                ? 'Only draft tests can be published'
                                : 'Notify learners and publish'
                          }
                          onClick={async () => {
                            try {
                              await publishTest(t.testId).unwrap();
                              setBanner({
                                kind: 'ok',
                                message: `"${t.title ?? 'Test'}" is now live — learners were notified.`,
                              });
                            } catch (e) {
                              setBanner({
                                kind: 'err',
                                message: formatMutationError(e),
                              });
                            }
                          }}
                          className={`rounded-[10px] border border-[rgba(46,191,138,0.35)] px-2.5 py-1.5 text-xs font-semibold text-[#2EBF8A] disabled:cursor-not-allowed disabled:opacity-40 ${transitionHover}`}
                        >
                          Publish
                        </button>
                        <button
                          type="button"
                          disabled={busy || String(t.status).toLowerCase() === 'archived'}
                          onClick={async () => {
                            try {
                              await archiveTest(t.testId).unwrap();
                              setBanner({
                                kind: 'ok',
                                message: `Archived "${t.title ?? 'Test'}".`,
                              });
                            } catch (e) {
                              setBanner({
                                kind: 'err',
                                message: formatMutationError(e),
                              });
                            }
                          }}
                          className={`rounded-[10px] border border-white/[0.08] px-2.5 py-1.5 text-xs font-medium text-[#64748B] disabled:opacity-40 ${transitionHover}`}
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </section>

        <p className="mt-6 text-center text-xs text-[#475569]">
          <Link to="/dashboard/admin" className={`text-[#2EBF8A] ${transitionHover}`}>
            ← Admin overview
          </Link>
        </p>
      </div>
    </AdminDeskLayout>
  );
}
