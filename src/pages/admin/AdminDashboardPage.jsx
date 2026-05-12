import { Link } from 'react-router-dom';

import { useGetAdminOverviewQuery } from '../../store/api/index.js';
import AdminDeskLayout from './AdminDeskLayout.jsx';
import { shadow, transitionHover } from '../dashboard/styles.js';

function StatTile({ label, value, hint }) {
  return (
    <div
      className={`rounded-[16px] border border-white/[0.06] bg-[#111827] p-5 ${shadow.card}`}
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#64748B]">
        {label}
      </p>
      <p className="mt-2 text-[1.65rem] font-bold tabular-nums tracking-tight text-[#F1F5F9]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[#64748B]">{hint}</p> : null}
    </div>
  );
}

function ActionCard({ eyebrow, title, body, href, ctaLabel }) {
  return (
    <Link
      to={href}
      className={`group flex flex-col rounded-[16px] border border-white/[0.06] bg-[#111827] p-6 ${shadow.card} ${transitionHover} hover:border-[rgba(46,191,138,0.28)]`}
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#2EBF8A]">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-[#F1F5F9]">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#94A3B8]">{body}</p>
      <span
        className={`mt-6 inline-flex text-sm font-semibold text-[#2EBF8A] ${transitionHover} group-hover:translate-x-0.5`}
      >
        {ctaLabel} →
      </span>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { data: overview, isLoading, isFetching, refetch } = useGetAdminOverviewQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const o = overview && typeof overview === 'object' ? overview : {};

  const num = (k, digits = null) => {
    const v = o[k];
    if (typeof v !== 'number' || Number.isNaN(v))
      return isLoading ? '—' : '0';
    if (digits !== null && typeof digits === 'number') return `${v.toFixed(digits)}%`;
    return String(v);
  };

  const statsBusy = isLoading || isFetching;

  return (
    <AdminDeskLayout
      welcomeTitle="Admin overview"
      tagline="Start with a cohort course, attach timed mocks for that batch, then publish when content is ready."
      primaryCta={{ href: '/dashboard/admin/courses/new', label: 'Create course' }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header>
          <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-tight text-[#F1F5F9]">
            Operations desk
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
            Use the workflows below—they call the documented admin endpoints (`POST /admin/courses`,
            `POST /admin/tests`, publish actions, etc.).
          </p>
          {statsBusy ? (
            <p className="mt-2 text-xs text-[#475569]">Loading platform snapshot…</p>
          ) : (
            <button
              type="button"
              onClick={() => refetch()}
              className={`mt-3 text-xs font-medium text-[#2EBF8A] ${transitionHover} hover:underline`}
            >
              Refresh stats
            </button>
          )}
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Active enrollments" value={num('activeEnrollments')} hint="Across batches" />
          <StatTile
            label="Pending enrollments"
            value={num('pendingEnrollments')}
            hint="Approve from enrollments tooling"
          />
          <StatTile label="Published tests" value={num('publishedTests')} hint="Live for learners" />
          <StatTile label="Attempts today" value={num('testsAttemptedToday')} hint="Across all mocks" />
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Total users" value={num('totalUsers')} hint="Registered accounts" />
          <StatTile label="Active courses" value={num('activeCourses')} hint="Operational batches" />
          <StatTile label="Avg score" value={num('averageScore', 1)} hint="Across attempts" />
          <StatTile label="Pass rate" value={num('overallPassRate', 1)} hint="Rolling platform" />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <ActionCard
            eyebrow="course:create → POST"
            title="Create a course"
            body="Opens a cohort (title, syllabus target, calendar window). Draft until you publish from the courses list."
            href="/dashboard/admin/courses/new"
            ctaLabel="New course draft"
          />
          <ActionCard
            eyebrow="test:create → POST"
            title="Host a mock test"
            body="Create a timed test linked to one of your courses, add MCQs in the builder, then publish to notify learners."
            href="/dashboard/admin/tests/new"
            ctaLabel="Create draft test"
          />
        </section>

        <section className="rounded-[16px] border border-white/[0.06] bg-[#111827] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9]">Manage existing assets</h2>
              <p className="mt-1 text-xs text-[#64748B]">
                Lists use `GET /admin/courses` and `GET /admin/tests`.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard/admin/courses"
                className={`rounded-[12px] border border-white/[0.1] px-5 py-2.5 text-sm font-medium text-[#CBD5E1] ${transitionHover} hover:border-[rgba(46,191,138,0.35)]`}
              >
                Courses
              </Link>
              <Link
                to="/dashboard/admin/tests"
                className={`rounded-[12px] border border-[rgba(46,191,138,0.35)] bg-[#161F2E] px-5 py-2.5 text-sm font-semibold text-[#2EBF8A] ${transitionHover}`}
              >
                Mock tests
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AdminDeskLayout>
  );
}
