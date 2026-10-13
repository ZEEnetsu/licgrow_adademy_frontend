import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Icon from "../../../../components/ui/Icon.jsx";
import Can from "../../../../components/auth/Can.jsx";
import { EXPO } from "../../../../components/motion/primitives.js";
import { useCountTo } from "../../../../hooks/useCountTo.js";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  IconButton,
  LoadError,
  PageHeader,
  Panel,
  Skeleton,
  StatCard,
  StatusBadge,
  cx,
  usePendingIds,
  useConfirm,
  useToast,
} from "../../../../components/admin";
import { formatDate, greeting, plural, timeAgo } from "../../../../components/admin/format.js";
import { useAuth } from "../../../../app/features/auth/useAuth.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { useApproveEnrollmentMutation, useRejectEnrollmentMutation } from "../../../../app/apis/enrollment.api.js";

/**
 * UI layer for the admin dashboard: a pure function of the view-model and
 * the query states the container hands it.
 *
 * Reading order, top to bottom: who you are and today's date; the four
 * headline numbers; what is waiting on you (pending requests) beside what
 * happened lately; recent tests beside the two breakdowns; then shortcuts to
 * the create flows.
 */

/** Sections rise in one after another on first paint — the landing page's stagger. */
const Rise = ({ index = 0, className, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EXPO, delay: 0.05 + index * 0.06 }}
    className={className}
  >
    {children}
  </motion.div>
);

const DashboardView = ({ model, analytics, pending, tests }) => {
  const { actor } = useAuth();
  const [today] = useState(() => new Date());
  const firstName = (actor?.fullName ?? "").split(/\s+/)[0];

  return (
    <>
      <PageHeader
        eyebrow={formatDate(today)}
        title={firstName ? `${greeting(today)}, ${firstName}` : greeting(today)}
        description="What's waiting on you, and how learning is going across the platform."
        actions={
          <>
            <Can perm={PERMISSIONS.ENROLLMENT_REVIEW}>
              <Button to="/admin/enrollments" variant="secondary" icon="userCheck">
                Review enrollments
              </Button>
            </Can>
            <Can perm={PERMISSIONS.BATCH_MANAGE}>
              <Button to="/admin/manage-batch?new=1" variant="primary" icon="plus">
                New batch
              </Button>
            </Can>
          </>
        }
      />

      {analytics.isError ? (
        <LoadError what="platform figures" error={analytics.error} onRetry={analytics.refetch} />
      ) : (
        <section aria-label="Key figures" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {model
            ? model.stats.map(({ key, ...stat }, i) => (
                <Rise key={key} index={i}>
                  <StatCard {...stat} className="h-full" />
                </Rise>
              ))
            : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-38 rounded-[24px]" />)}
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {pending && (
          <Rise index={4} className="xl:col-span-7">
            <NeedsAttention query={pending} />
          </Rise>
        )}
        <Rise index={5} className={pending ? "xl:col-span-5" : "xl:col-span-12"}>
          <ActivityPanel activity={model?.activity} />
        </Rise>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {tests && (
          <Rise index={6} className="xl:col-span-7">
            <RecentTests query={tests} />
          </Rise>
        )}
        <Rise index={7} className={cx("grid grid-cols-1 gap-4", tests ? "xl:col-span-5" : "md:grid-cols-2 xl:col-span-12")}>
          <AccountsPanel accounts={model?.accounts} />
          <ContentPanel content={model?.content} />
        </Rise>
      </div>

      <Rise index={8}>
        <QuickActions />
      </Rise>
    </>
  );
};

export default DashboardView;

/* ── needs attention ────────────────────────────────────────────────────── */

function NeedsAttention({ query }) {
  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();
  const [approve] = useApproveEnrollmentMutation();
  const [reject] = useRejectEnrollmentMutation();

  const items = query.data?.items ?? [];
  const total = query.data?.meta?.total ?? items.length;

  const onApprove = (request) =>
    run(request.id, async () => {
      try {
        await approve(request.id).unwrap();
        toast.success(`Approved ${request.learner?.fullName ?? "the request"}`, {
          description: request.batch ? `They're now a member of ${request.batch.name}.` : undefined,
        });
      } catch (error) {
        toast.error("Couldn't approve that request", { description: getUserMessage(error) });
      }
    });

  const onReject = async (request) => {
    const name = request.learner?.fullName ?? "this learner";
    const done = await confirm({
      title: `Decline ${name}'s request?`,
      description: "They'll see the request was declined, with your note, and can apply again later.",
      confirmLabel: "Decline request",
      tone: "danger",
      icon: "userX",
      input: { label: "Note to the learner", placeholder: "e.g. This batch is full — please apply to the next one.", maxLength: 500 },
      onConfirm: (note) => reject({ enrollmentId: request.id, reviewNote: note || undefined }).unwrap(),
    });
    if (done) toast.info(`Declined ${name}'s request`);
  };

  return (
    <Panel
      title="Needs attention"
      icon="inbox"
      description={total > 0 ? `${plural(total, "enrollment request")} waiting for review` : "Enrollment requests waiting for review"}
      action={
        total > 0 && (
          <Button to="/admin/enrollments" variant="ghost" size="sm" iconRight="arrowRight">
            Review all
          </Button>
        )
      }
      className="h-full"
    >
      {query.isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <LoadError what="pending requests" error={query.error} onRetry={query.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          compact
          tone="mint"
          icon="checkCircle"
          title="Inbox zero"
          description="No enrollment requests are waiting. New ones will appear here."
        />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {items.map((request) => {
            const busy = pendingIds.has(request.id);
            return (
              <motion.li
                layout
                key={request.id}
                aria-busy={busy || undefined}
                className={cx(
                  "flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-[background-color,opacity] duration-200 hover:bg-surface-hover/60",
                  busy && "opacity-60",
                )}
              >
                <Avatar name={request.learner?.fullName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {request.learner?.fullName ?? "Unknown learner"}
                  </p>
                  <p className="truncate text-[13px] text-text-muted">
                    wants to join <span className="font-medium text-text-primary">{request.batch?.name ?? "a batch"}</span>
                    <span aria-hidden> · </span>
                    {timeAgo(request.submittedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="sm" variant="tonal" icon="check" loading={busy} onClick={() => onApprove(request)}>
                    Approve
                  </Button>
                  <IconButton icon="x" label={`Decline ${request.learner?.fullName ?? "request"}`} tone="danger" size="md" disabled={busy} onClick={() => onReject(request)} />
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/* ── last 30 days ───────────────────────────────────────────────────────── */

function Figure({ label, value, suffix = "", children }) {
  const shown = useCountTo(typeof value === "number" ? value : undefined);
  return (
    <div>
      <p className="caps text-[10.5px] font-bold text-text-muted">{label}</p>
      <p className="mt-1.5 font-display text-[1.875rem] leading-none font-extrabold tracking-tight text-text-primary tabular-nums">
        {typeof value === "number" ? `${shown}${suffix}` : "—"}
      </p>
      {children}
    </div>
  );
}

function ActivityPanel({ activity }) {
  return (
    <Panel title="Last 30 days" icon="trendingUp" description="Test activity and enrollments" className="h-full">
      {!activity ? (
        <div className="grid grid-cols-2 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <Figure label="Attempts" value={activity.attempts} />
            <Figure label="Approved" value={activity.approved} />
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="caps text-[10.5px] font-bold text-text-muted">Average score</p>
              <p className="font-display text-xl font-extrabold text-text-primary tabular-nums">
                {activity.avgScore == null ? "—" : `${activity.avgScore}%`}
              </p>
            </div>
            <div
              className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-surface-muted ring-1 ring-inset ring-border/60"
              role="img"
              aria-label={activity.avgScore == null ? "No scores yet" : `Average score ${activity.avgScore}%`}
            >
              {activity.avgScore != null && (
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.1, ease: EXPO, delay: 0.3 }}
                  className="block h-full origin-left rounded-full bg-accent-vivid"
                  style={{ width: `${Math.min(100, Math.max(0, activity.avgScore))}%` }}
                />
              )}
            </div>
            <p className="mt-2 text-xs text-text-muted">
              {activity.empty
                ? "No attempts yet — figures appear once learners start sitting tests."
                : "Across every test attempt submitted in the last 30 days."}
            </p>
          </div>
          {activity.pending > 0 && (
            <Can perm={PERMISSIONS.ENROLLMENT_REVIEW}>
              <Link
                to="/admin/enrollments"
                className="group/link focus-ring flex items-center justify-between gap-3 rounded-2xl bg-warning-muted px-4 py-3 text-sm font-semibold text-warning transition-colors duration-200"
              >
                <span className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
                    <span className="relative h-2 w-2 rounded-full bg-current" />
                  </span>
                  {plural(activity.pending, "request")} awaiting review
                </span>
                <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/link:translate-x-0.5" strokeWidth={2} />
              </Link>
            </Can>
          )}
        </div>
      )}
    </Panel>
  );
}

/* ── recent tests ───────────────────────────────────────────────────────── */

function RecentTests({ query }) {
  const items = query.data?.items ?? [];

  return (
    <Panel
      title="Recently edited tests"
      icon="clipboardCheck"
      action={
        <Button to="/admin/manage-test" variant="ghost" size="sm" iconRight="arrowRight">
          All tests
        </Button>
      }
      className="h-full"
    >
      {query.isLoading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <LoadError what="tests" error={query.error} onRetry={query.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          compact
          icon="clipboardCheck"
          title="No tests yet"
          description="Draft a test, add questions in English and Hindi, then publish it into a batch."
          action={
            <Can perm={PERMISSIONS.TEST_AUTHOR}>
              <Button to="/admin/manage-test?new=1" variant="primary" size="sm" icon="plus">
                Draft a test
              </Button>
            </Can>
          }
        />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {items.map((test) => (
            <li key={test.id}>
              <Link
                to={`/admin/manage-test/tests/${test.id}`}
                className="group/row focus-ring flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors duration-200 hover:bg-surface-hover/60"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tint-slate text-text-primary">
                  <Icon name={test.kind === "quiz" ? "listOrdered" : "fileText"} className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text-primary transition-colors duration-200 group-hover/row:text-accent">
                    {test.title}
                  </span>
                  <span className="block truncate text-[13px] text-text-muted">
                    {test.kind === "quiz" ? "Quiz" : "Test"} · {plural(test.questionCount ?? 0, "question")} · edited {timeAgo(test.updatedAt)}
                  </span>
                </span>
                <StatusBadge status={test.status} size="sm" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ── breakdowns ─────────────────────────────────────────────────────────── */

const SEGMENT_TONE = {
  positive: "bg-success",
  negative: "bg-danger",
  neutral: "bg-border-strong/50",
};

/**
 * Learner accounts as one proportion bar with a labelled legend — a two-part
 * whole reads faster as a bar than as a doughnut, and the labels carry the
 * numbers so colour is never the only key.
 */
function AccountsPanel({ accounts }) {
  return (
    <Panel title="Learner accounts" icon="users">
      {!accounts ? (
        <Skeleton className="h-16 w-full" />
      ) : accounts.total === 0 ? (
        <p className="text-sm text-text-muted">No learner accounts yet.</p>
      ) : (
        <>
          <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={accounts.segments.map((s) => `${s.label} ${s.value}`).join(", ")}>
            {accounts.segments.map((segment, i) => (
              <motion.span
                key={segment.key}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, ease: EXPO, delay: 0.25 + i * 0.1 }}
                className={cx("h-full origin-left first:rounded-l-full last:rounded-r-full", SEGMENT_TONE[segment.tone])}
                style={{ width: `${segment.pct}%` }}
              />
            ))}
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {accounts.segments.map((segment) => (
              <li key={segment.key} className="flex items-center gap-2.5 text-sm">
                <span className={cx("h-2.5 w-2.5 shrink-0 rounded-full", SEGMENT_TONE[segment.tone])} aria-hidden />
                <span className="flex-1 text-text-primary">{segment.label}</span>
                <span className="font-semibold text-text-primary tabular-nums">{segment.value}</span>
                <span className="w-12 text-right text-text-muted tabular-nums">{Math.round(segment.pct)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

/** Content counts as labelled bars: one hue, because the labels carry identity. */
function ContentPanel({ content }) {
  const max = Math.max(1, ...(content ?? []).map((row) => row.value));
  return (
    <Panel title="Content library" icon="book">
      {!content ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <ul className="flex flex-col gap-1">
          {content.map((row, i) => (
            <li key={row.key}>
              <Link
                to={row.to}
                className="group/bar focus-ring -mx-2 grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-xl px-2 py-1.5 transition-colors duration-200 hover:bg-surface-hover/60"
              >
                <span className="truncate text-sm text-text-primary">{row.label}</span>
                <span className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.9, ease: EXPO, delay: 0.3 + i * 0.08 }}
                    className="block h-full origin-left rounded-full bg-accent-vivid transition-[filter] duration-200 group-hover/bar:brightness-110"
                    style={{ width: `${(row.value / max) * 100}%` }}
                  />
                </span>
                <span className="text-right text-sm font-semibold text-text-primary tabular-nums">{row.value}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ── quick actions ──────────────────────────────────────────────────────── */

const QUICK_ACTIONS = [
  { to: "/admin/manage-batch?new=1", label: "New batch", description: "Open a new cohort", icon: "layers", tint: "bg-tint-lavender text-accent", perm: PERMISSIONS.BATCH_MANAGE },
  { to: "/admin/manage-course?new=1", label: "New course", description: "Units and chapters", icon: "book", tint: "bg-tint-mint text-success", perm: PERMISSIONS.COURSE_AUTHOR },
  { to: "/admin/manage-test?new=1", label: "Draft a test", description: "Bilingual and timed", icon: "clipboardCheck", tint: "bg-tint-slate text-text-primary", perm: PERMISSIONS.TEST_AUTHOR },
  { to: "/admin/announcements?new=1", label: "Announce", description: "To all or one batch", icon: "megaphone", tint: "bg-accent-muted text-accent", perm: PERMISSIONS.ANNOUNCEMENT_MANAGE },
];

function QuickActions() {
  return (
    <section aria-labelledby="quick-actions">
      <h2 id="quick-actions" className="caps mb-3 text-[11px] font-bold text-text-muted">
        Quick actions
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Can key={action.to} perm={action.perm}>
            <Card as={Link} to={action.to} interactive padding="sm" className="flex items-center gap-3.5">
              <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", action.tint)}>
                <Icon name={action.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-text-primary">{action.label}</span>
                <span className="block truncate text-[13px] text-text-muted">{action.description}</span>
              </span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-muted text-text-muted transition-[transform,background-color,color] duration-500 ease-out-expo group-hover/card:rotate-45 group-hover/card:bg-accent-solid group-hover/card:text-accent-solid-contrast">
                <Icon name="arrowUpRight" className="h-4 w-4" strokeWidth={2} />
              </span>
            </Card>
          </Can>
        ))}
      </div>
    </section>
  );
}
