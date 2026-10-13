import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import Icon from "../../../../components/ui/Icon.jsx";
import { EXPO } from "../../../../components/motion/primitives.js";
import {
  Avatar,
  Button,
  Callout,
  EmptyState,
  LoadError,
  PageHeader,
  Panel,
  Skeleton,
  StatCard,
  StatusBadge,
  cx,
  useConfirm,
  useToast,
} from "../../../../components/admin";
import { formatDate, plural, timeAgo } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useGetLearnerQuery,
  useReactivateLearnerMutation,
  useSuspendLearnerMutation,
} from "../../../../app/apis/learner.api.js";
import { useGetLearnerAnalyticsQuery } from "../../../../app/apis/analytics.api.js";

/**
 * One learner, in full — `02-learner.md` §6–8 plus `13-analytics.md` §3.
 *
 *   PageHeader (avatar beside it) → four StatCards → Profile + Batches | Test performance
 *
 * Analytics is fetched separately and tolerated as optional: it needs
 * `analytics:view`, which a `learner:read` holder may not have, and half a
 * page is better than an error page. Without it the figures fall back to the
 * learner's own `stats` block and the panels say why they're short.
 *
 * Every score is the learner's BEST attempt per test (13 §counting rule); only
 * the attempt counts include every attempt.
 */

const BACK = { to: "/admin/manage-users", label: "All learners" };

// beside the avatar, the back link still starts at the page edge: pulled left
// by the avatar (64px) plus the row gap (20px)
const BACK_OUTDENT = "[&>div>a:first-child]:-ml-21";

// the fields `profile.isComplete` checks (02 §2) — missing ones gate enrollment
const ENROLLMENT_FIELDS = ["licAgentCode", "dob", "city", "experienceYears"];

/** "1996-03-14" as a local date, so it never slips a day west of UTC. */
const localDate = (value) => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : value);

const experienceLabel = (years) => (years == null ? null : years === 0 ? "Under a year" : plural(years, "year"));

const LearnerDetail = () => {
  const { learnerId } = useParams();
  const can = useSelector(selectCan);
  const canSuspend = can(PERMISSIONS.LEARNER_SUSPEND);
  const canAnalytics = can(PERMISSIONS.ANALYTICS_VIEW);

  // `currentData`, not `data`: moving to another learner must not show the last
  // one while the next loads
  const { currentData: learner, isError, error, refetch } = useGetLearnerQuery(learnerId, { skip: !learnerId });
  const analytics = useGetLearnerAnalyticsQuery(learnerId, { skip: !learnerId || !canAnalytics });

  const confirm = useConfirm();
  const toast = useToast();
  const [suspend] = useSuspendLearnerMutation();
  const [reactivate, { isLoading: reactivating }] = useReactivateLearnerMutation();

  /* ── failure states ───────────────────────────────────────────────────── */

  if (isError) {
    const notFound = error?.status === 404 || error?.code === "NOT_FOUND";
    const forbidden = error?.status === 403;
    return (
      <>
        <PageHeader back={BACK} eyebrow="Learner" title={notFound ? "Unknown learner" : "Learner profile"} />
        {notFound ? (
          <EmptyState
            icon="userX"
            title="Learner not found"
            description="There's no learner at this link. The account may have been removed, or the link is incomplete."
            action={
              <Button to={BACK.to} variant="secondary" icon="arrowLeft">
                Back to all learners
              </Button>
            }
          />
        ) : forbidden ? (
          <EmptyState
            icon="lock"
            title="Learner profiles aren't part of your role"
            description="Viewing a learner needs the learner read permission. A super admin can add it to your role."
          />
        ) : (
          <LoadError what="this learner" error={error} onRetry={refetch} />
        )}
      </>
    );
  }

  /* ── actions ──────────────────────────────────────────────────────────── */

  const onReactivate = async () => {
    const name = learner.fullName;
    try {
      await reactivate(learner.id).unwrap();
      toast.success(`${name} is active again`, { description: "They can sign in and use their batches." });
    } catch (err) {
      toast.error(`Couldn't reactivate ${name}`, { description: getUserMessage(err) });
    }
  };

  const onSuspend = async () => {
    const name = learner.fullName;
    const done = await confirm({
      title: `Suspend ${name}?`,
      description:
        "They're signed out everywhere and can't sign in or reach any batch until reactivated. Their history and scores are kept.",
      confirmLabel: "Suspend learner",
      tone: "danger",
      icon: "userX",
      input: { label: "Reason", placeholder: "Kept with the audit log", maxLength: 255 },
      onConfirm: (reason) => suspend({ learnerId: learner.id, reason: reason || undefined }).unwrap(),
    });
    if (done) {
      toast.success(`${name} is suspended`, {
        description: "They can't sign in until you reactivate them.",
        action: { label: "Undo", onClick: onReactivate },
      });
    }
  };

  /* ── figures ──────────────────────────────────────────────────────────── */

  // analytics is either loaded, failed, or not allowed; the learner's own
  // `stats` block covers what it can in the last two cases
  const analyticsLoading = canAnalytics && (analytics.isLoading || (analytics.isFetching && !analytics.currentData));
  const insights = analytics.currentData ?? null;
  const unavailable = !canAnalytics || (analytics.isError && !insights);
  const stats = learner?.stats ?? {};
  const summary = insights?.summary;
  const lastActiveAt = summary?.lastActiveAt ?? stats.lastActiveAt;

  const figures = learner && !analyticsLoading && [
    {
      key: "batches",
      label: "Batches",
      tone: "default",
      chip: "lavender",
      icon: "layers",
      value: insights?.batches?.length ?? stats.batchesActive ?? null,
      caption: "Active memberships",
    },
    {
      key: "attempted",
      label: "Tests attempted",
      tone: "default",
      chip: "mint",
      icon: "clipboardCheck",
      value: summary?.testsAttempted ?? stats.testsAttempted ?? null,
      caption: lastActiveAt ? `Last active ${timeAgo(lastActiveAt)}` : "No attempts yet",
    },
    {
      key: "average",
      label: "Average score",
      tone: "default",
      chip: "lavender",
      icon: "target",
      value: summary ? summary.avgScorePct : stats.averageScorePct ?? null,
      suffix: "%",
      caption: "Best attempt per test",
    },
    {
      key: "pass",
      label: "Pass rate",
      tone: "default",
      chip: "mint",
      icon: "trophy",
      value: summary?.passRatePct ?? null,
      suffix: "%",
      caption: unavailable ? "Needs performance data" : "Tests passed on the best attempt",
    },
  ];

  const unavailableReason =
    !canAnalytics || analytics.error?.status === 403
      ? "Your role doesn't include performance analytics, so scores and batch names are hidden."
      : getUserMessage(analytics.error, "Scores couldn't be loaded just now.");

  /* ── render ───────────────────────────────────────────────────────────── */

  const profile = learner?.profile;

  return (
    <>
      <div className="flex items-start gap-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EXPO }}
          className="mt-13 shrink-0"
        >
          {learner ? (
            <Avatar name={learner.fullName} size="xl" />
          ) : (
            <Skeleton className="h-16 w-16 rounded-2xl" />
          )}
        </motion.div>
        <PageHeader
          className={cx("min-w-0 flex-1", BACK_OUTDENT)}
          back={BACK}
          eyebrow="Learner"
          title={
            learner ? (
              learner.fullName
            ) : (
              <>
                <Skeleton className="h-9 w-56 max-w-full sm:w-72" />
                <span className="sr-only">Loading learner…</span>
              </>
            )
          }
          meta={
            learner && (
              <>
                <StatusBadge status={learner.status} />
                {profile?.isComplete === false && (
                  <StatusBadge label="Profile incomplete" tone="warning" icon="alertTriangle" />
                )}
              </>
            )
          }
          description={
            learner ? (
              <>
                <span className="wrap-anywhere">{learner.email}</span>
                <span aria-hidden> · </span>
                joined {formatDate(learner.createdAt)}
              </>
            ) : (
              <Skeleton className="mt-1 h-4 w-64 max-w-full" />
            )
          }
          actions={
            learner &&
            canSuspend &&
            (learner.status === "active" ? (
              <Button variant="dangerSoft" icon="userX" onClick={onSuspend}>
                Suspend
              </Button>
            ) : (
              <Button variant="tonal" icon="refresh" loading={reactivating} onClick={onReactivate}>
                Reactivate
              </Button>
            ))
          }
        />
      </div>

      <section aria-label="Key figures" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {figures
          ? figures.map(({ key, ...figure }) => <StatCard key={key} {...figure} className="h-full" />)
          : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-38 rounded-[24px]" />)}
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-5">
          <ProfilePanel learner={learner} />
          <BatchesPanel
            batches={insights?.batches}
            loading={!learner || analyticsLoading}
            unavailable={unavailable}
            activeCount={stats.batchesActive}
            canOpenBatch={can(PERMISSIONS.BATCH_READ)}
            canReview={can(PERMISSIONS.ENROLLMENT_REVIEW)}
          />
        </div>
        <PerformancePanel
          className="xl:col-span-7"
          perTest={insights?.perTest}
          loading={!learner || analyticsLoading}
          unavailable={unavailable}
          unavailableReason={unavailableReason}
          onRetry={canAnalytics && analytics.error?.status !== 403 ? analytics.refetch : undefined}
          retrying={analytics.isFetching}
        />
      </div>
    </>
  );
};

export default LearnerDetail;

/* ── profile ────────────────────────────────────────────────────────────── */

function Detail({ label, value, required = false, className }) {
  const empty = value == null || value === "";
  return (
    <div className={cx("min-w-0", className)}>
      <dt className="caps text-[10.5px] font-bold text-text-muted">{label}</dt>
      <dd
        className={cx(
          "mt-1 text-sm wrap-anywhere",
          empty ? (required ? "font-semibold text-warning" : "text-text-muted") : "text-text-primary",
        )}
      >
        {empty ? (required ? "Missing" : "Not provided") : value}
      </dd>
    </div>
  );
}

function ProfilePanel({ learner }) {
  const profile = learner?.profile ?? {};
  const missing = ENROLLMENT_FIELDS.filter((field) => profile[field] == null || profile[field] === "");

  return (
    <Panel
      title="Profile"
      icon="briefcase"
      description="Filled in by the learner"
      action={
        learner &&
        (profile.isComplete ? (
          <StatusBadge size="sm" label="Complete" tone="success" icon="check" />
        ) : (
          <StatusBadge size="sm" label="Incomplete" tone="warning" icon="alertTriangle" />
        ))
      }
    >
      {!learner ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="mt-2 h-3.5 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Detail label="LIC agent code" value={profile.licAgentCode} required />
            <Detail label="City" value={profile.city} required />
            <Detail label="Date of birth" value={profile.dob && formatDate(localDate(profile.dob))} required />
            <Detail label="Experience" value={experienceLabel(profile.experienceYears)} required />
            <Detail label="Phone" value={learner.phone} />
            <Detail label="Username" value={learner.username && `@${learner.username}`} />
          </dl>
          {profile.isComplete === false && (
            <Callout tone="warning" title="Can't request enrollment yet" className="mt-5">
              {missing.length > 0
                ? `They need to add ${plural(missing.length, "missing field")} before they can apply to a batch.`
                : "Their profile has to be completed before they can apply to a batch."}
            </Callout>
          )}
        </>
      )}
    </Panel>
  );
}

/* ── batches ────────────────────────────────────────────────────────────── */

function BatchesPanel({ batches, loading, unavailable, activeCount, canOpenBatch, canReview }) {
  const count = batches?.length;

  return (
    <Panel
      title="Batches"
      icon="layers"
      description={count != null ? plural(count, "active membership") : "Active memberships"}
    >
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
          ))}
        </div>
      ) : unavailable ? (
        <p className="text-sm text-text-muted">
          {activeCount != null ? `A member of ${plural(activeCount, "batch", "batches")}. ` : ""}
          Batch names come with performance data, which isn&apos;t available.
        </p>
      ) : !batches?.length ? (
        <EmptyState
          compact
          tone="sand"
          icon="layers"
          title="Not in a batch yet"
          description="They join a batch when an enrollment request is approved."
          action={
            canReview && (
              <Button to="/admin/enrollments" variant="secondary" size="sm" iconRight="arrowRight">
                Review requests
              </Button>
            )
          }
        />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {batches.map((batch) => {
            const body = (
              <>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tint-slate text-text-primary">
                  <Icon name="layers" className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary transition-colors duration-200 group-hover/row:text-accent">
                  {batch.name}
                </span>
                <StatusBadge status="active" size="sm" />
              </>
            );
            return (
              <li key={batch.batchId}>
                {canOpenBatch ? (
                  <Link
                    to={`/admin/manage-batch/${batch.batchId}`}
                    className="group/row focus-ring flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors duration-200 hover:bg-surface-hover/60"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-2 py-2">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/* ── test performance ───────────────────────────────────────────────────── */

const clampPct = (value) => Math.min(100, Math.max(0, Number(value) || 0));

function PerformancePanel({ perTest, loading, unavailable, unavailableReason, onRetry, retrying, className }) {
  return (
    <Panel
      title="Test performance"
      icon="clipboardCheck"
      description="Best score per test, with every attempt counted"
      className={className}
    >
      {loading ? (
        <div className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : unavailable ? (
        <Callout
          title="Performance data isn't available"
          action={
            onRetry && (
              <Button size="sm" variant="secondary" icon="refresh" loading={retrying} onClick={onRetry}>
                Try again
              </Button>
            )
          }
        >
          {unavailableReason}
        </Callout>
      ) : !perTest?.length ? (
        <EmptyState
          compact
          icon="clipboardCheck"
          title="No attempts yet"
          description="Scores appear here once they sit a test in one of their batches."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border/60">
          {perTest.map((test, i) => {
            const pct = clampPct(test.bestScorePct);
            return (
              <li key={test.testId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{test.title ?? "Untitled test"}</p>
                    <p className="text-[13px] text-text-muted tabular-nums">{plural(test.attempts ?? 0, "attempt")}</p>
                  </div>
                  <StatusBadge
                    size="sm"
                    label={test.passed ? "Passed" : "Not passed"}
                    tone={test.passed ? "success" : "danger"}
                    icon={test.passed ? "check" : "x"}
                  />
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="block h-2 flex-1 overflow-hidden rounded-full bg-surface-muted ring-1 ring-inset ring-border/60"
                  >
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1, ease: EXPO, delay: 0.2 + Math.min(i, 8) * 0.06 }}
                      className={cx("block h-full origin-left rounded-full", test.passed ? "bg-success" : "bg-danger")}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-12 shrink-0 text-right text-sm font-semibold text-text-primary tabular-nums">
                    <span className="sr-only">Best score </span>
                    {Math.round(pct * 10) / 10}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
