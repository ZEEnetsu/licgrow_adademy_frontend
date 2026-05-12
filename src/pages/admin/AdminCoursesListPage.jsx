import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
  formatMutationError,
  useArchiveAdminCourseMutation,
  useGetAdminCoursesQuery,
  usePublishAdminCourseMutation,
} from '../../store/api/index.js';
import AdminDeskLayout from './AdminDeskLayout.jsx';
import { shadow, transitionHover } from '../dashboard/styles.js';

export default function AdminCoursesListPage() {
  const {
    data: rows = [],
    isLoading,
    error,
    refetch,
  } = useGetAdminCoursesQuery({
    limit: 100,
    page: 1,
  });

  const courses = Array.isArray(rows) ? rows : [];
  const errMsg = error ? formatMutationError(error) : null;

  const [publishCourse, publishState] = usePublishAdminCourseMutation();
  const [archiveCourse, archiveState] = useArchiveAdminCourseMutation();
  const busy = publishState.isLoading || archiveState.isLoading;

  const sorted = useMemo(
    () =>
      [...courses].sort(
        (a, b) =>
          String(b.updatedAt ?? b.createdAt ?? '').localeCompare(
            String(a.updatedAt ?? a.createdAt ?? ''),
          ) || String(a.title ?? '').localeCompare(String(b.title ?? '')),
      ),
    [courses],
  );

  return (
    <AdminDeskLayout
      welcomeTitle="Courses"
      tagline="Draft → publish → learners can enroll via your gateway."
      primaryCta={{ href: '/dashboard/admin/courses/new', label: 'Create course' }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-4 pb-8">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.26em] text-[#2EBF8A]">
              Admin — Courses
            </p>
            <h1 className="mt-2 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-tight text-[#F1F5F9]">
              Your batches
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#64748B]">
              Listed from GET /admin/courses. Publish activates a cohort; archive retires it.
            </p>
          </div>
          <Link
            to="/dashboard/admin/courses/new"
            className={`rounded-[12px] border border-[rgba(46,191,138,0.35)] bg-[#111827] px-5 py-2.5 text-sm font-semibold text-[#2EBF8A] ${transitionHover} hover:border-[rgba(46,191,138,0.55)]`}
          >
            Create course
          </Link>
        </header>

        {errMsg ? (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-100">
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
          className={`overflow-hidden rounded-[16px] border border-white/[0.06] bg-[#111827] ${shadow.card}`}
        >
          <div className="border-b border-white/[0.06] px-4 py-4 sm:px-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
              All courses
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#161F2E] text-[0.65rem] uppercase tracking-[0.12em] text-[#64748B]">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Exam</th>
                  <th className="px-4 py-3 font-semibold">Window</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-10 text-[#64748B]" colSpan={5}>
                      Loading courses…
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-[#64748B]" colSpan={5}>
                      No courses yet.{' '}
                      <Link to="/dashboard/admin/courses/new" className="font-semibold text-[#2EBF8A]">
                        Create the first cohort
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  sorted.map((c) => {
                    const courseId = c.courseId ?? c.course_id;
                    const status = String(c.status ?? '—');
                    const st = status.toLowerCase();
                    return (
                      <tr
                        key={courseId}
                        className="border-b border-white/[0.04] hover:bg-[#161F2E]/70"
                      >
                        <td className="max-w-[220px] px-4 py-3 font-medium text-[#CBD5E1]">
                          {c.title ?? 'Untitled'}
                        </td>
                        <td className="px-4 py-3 text-[#94A3B8]">{c.examTarget ?? '—'}</td>
                        <td className="px-4 py-3 text-[#94A3B8]">
                          {c.startDate && c.endDate
                            ? `${c.startDate} → ${c.endDate}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-[#94A3B8]">{status}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to="/dashboard/admin/tests/new"
                              className={`rounded-[10px] border border-white/[0.08] bg-[#161F2E] px-2.5 py-1.5 text-xs font-medium text-[#CBD5E1] ${transitionHover}`}
                              title="Create a mock for this cohort from the wizard (pick course)."
                            >
                              Add mock
                            </Link>
                            <button
                              type="button"
                              disabled={busy || st !== 'draft'}
                              onClick={async () => {
                                try {
                                  await publishCourse(courseId).unwrap();
                                  refetch();
                                } catch {
                                  /* surfaced via mutation */
                                }
                              }}
                              className={`rounded-[10px] border border-[rgba(46,191,138,0.35)] px-2.5 py-1.5 text-xs font-semibold text-[#2EBF8A] disabled:cursor-not-allowed disabled:opacity-40 ${transitionHover}`}
                            >
                              Publish
                            </button>
                            <button
                              type="button"
                              disabled={busy || st === 'archived'}
                              onClick={async () => {
                                try {
                                  await archiveCourse(courseId).unwrap();
                                  refetch();
                                } catch {
                                  /* noop */
                                }
                              }}
                              className={`rounded-[10px] border border-white/[0.08] px-2.5 py-1.5 text-xs font-medium text-[#64748B] disabled:opacity-40 ${transitionHover}`}
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-[#475569]">
          <Link to="/dashboard/admin" className={`font-medium text-[#2EBF8A] ${transitionHover}`}>
            ← Admin overview
          </Link>
        </p>
      </div>
    </AdminDeskLayout>
  );
}
