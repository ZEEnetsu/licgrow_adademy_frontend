import { useId, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import Icon from "../../../../components/ui/Icon.jsx";
import { useCountTo } from "../../../../hooks/useCountTo.js";
import {
  Button,
  Callout,
  EmptyState,
  LoadError,
  PageHeader,
  RowActions,
  SegmentedTabs,
  Skeleton,
  SkeletonCard,
  StatusBadge,
  Switch,
  Tooltip,
  cx,
  useConfirm,
  useTabParam,
  useToast,
} from "../../../../components/admin";
import { formatDate, formatRange } from "../../../../components/admin/format.js";
import { selectCan } from "../../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  BATCH_STATUS,
  useArchiveBatchMutation,
  useGetBatchQuery,
  useUpdateBatchMutation,
} from "../../../../app/apis/batches.api.js";
import { COURSE_STATUS, useGetCoursesQuery } from "../../../../app/apis/courses.api.js";
import { TEST_KIND, TEST_STATUS, useGetTestsQuery } from "../../../../app/apis/tests.api.js";
import BatchContentPanel from "./BatchContentPanel.jsx";
import BatchMembersPanel from "./BatchMembersPanel.jsx";

/**
 * Batch detail — `api-contracts/06-batch.md` §3–11.
 *
 *   PageHeader (status, enrollment switch, next step, ⋯) → go-live steps →
 *   key figures → Courses / Tests / Members tabs (`?tab=`)
 *
 * Getting a batch live means clearing four gates in order, each with its own
 * error code:
 *
 *   publish the course/test        (08 §5 / 09 §6)
 *     → add it to the batch        (06 §6, CONTENT_NOT_PUBLISHED)
 *       → activate the batch       (06 §4, INVALID_STATUS_TRANSITION)
 *         → open enrollment        (06 §4, requires active)
 *
 * An admin who can't see which gate they're behind is stuck, so the stepper
 * names it and the header's one primary button is always the next step.
 */

const BACK = { to: "/admin/manage-batch", label: "All batches" };

// on phones the next step gets its own full-width row above the switch and ⋯
const PRIMARY_ON_PHONE = "max-sm:order-first max-sm:w-full";

const TABS = [
  { value: "courses", label: "Courses", icon: "book" },
  { value: "tests", label: "Tests", icon: "clipboardCheck" },
  { value: "members", label: "Members", icon: "users" },
];
const TAB_VALUES = TABS.map((tab) => tab.value);

/*
 * The contract marks this module's codes user-safe (06, "Module error codes"),
 * but apiError.js doesn't list them, so getUserMessage would fall back to a
 * generic line. These fallbacks say what actually went wrong.
 */
const ERROR_COPY = {
  BATCH_ARCHIVED: "This batch is archived, so it can't be changed.",
  NOT_FOUND: "This batch no longer exists.",
};
const explain = (error, fallback, byCode = {}) =>
  getUserMessage(error, byCode[error?.code] ?? ERROR_COPY[error?.code] ?? fallback);

/** For a confirm dialog's `onConfirm`: it shows `getUserMessage(error)` inline. */
const asUserSafe = (message) => Object.assign(new Error(message), { userSafe: true, code: "BATCH_ACTION_FAILED" });

const isNotFound = (error) => error?.code === "NOT_FOUND" || error?.status === 404;

const BatchDetail = () => {
  const { batchId } = useParams();
  // `currentData`, not `data`: moving to another batch must not show the
  // previous one while the next loads
  const { currentData: batch, isFetching, isError, error, refetch } = useGetBatchQuery(batchId, { skip: !batchId });
  const [tab, setTab] = useTabParam("tab", { values: TAB_VALUES, defaultValue: "courses" });

  if (!batch && isFetching) return <DetailSkeleton />;

  if (!batch && (!isError || isNotFound(error))) {
    return (
      <>
        <PageHeader back={BACK} eyebrow="Batch" title="Batch not found" />
        <EmptyState
          icon="layers"
          title="There's no batch at this address"
          description="The link may be mistyped, or the batch was removed."
          action={
            <Button to="/admin/manage-batch" variant="secondary" icon="arrowLeft">
              All batches
            </Button>
          }
        />
      </>
    );
  }

  if (!batch) {
    return (
      <>
        <PageHeader back={BACK} eyebrow="Batch" title="Batch details" />
        <LoadError what="this batch" error={error} onRetry={refetch} />
      </>
    );
  }

  return <BatchView key={batch.id} batch={batch} tab={tab} setTab={setTab} />;
};

export default BatchDetail;

/* ── the page ───────────────────────────────────────────────────────────── */

function BatchView({ batch, tab, setTab }) {
  const can = useSelector(selectCan);
  const canManage = can(PERMISSIONS.BATCH_MANAGE);
  const confirm = useConfirm();
  const toast = useToast();

  // one hook per action, so each has its own pending state
  const [activate] = useUpdateBatchMutation();
  const [setEnrollment, enrollmentState] = useUpdateBatchMutation();
  const [archive] = useArchiveBatchMutation();

  // bumping this asks the content panel to focus its picker ("Add content")
  const [addSignal, setAddSignal] = useState(0);

  const isDraft = batch.status === BATCH_STATUS.DRAFT;
  const isActive = batch.status === BATCH_STATUS.ACTIVE;
  const isArchived = batch.status === BATCH_STATUS.ARCHIVED;
  const counts = batch.counts ?? {};
  const hasContent = (counts.courses ?? 0) + (counts.tests ?? 0) > 0;
  const canEdit = canManage && !isArchived;

  // step 1 of going live: is there any published content to add at all? Two
  // count-only requests, made only while the batch is still empty
  const probe = canEdit && !hasContent;
  const publishedCourses = useGetCoursesQuery({ status: COURSE_STATUS.PUBLISHED, limit: 1 }, { skip: !probe });
  const publishedTests = useGetTestsQuery(
    { status: TEST_STATUS.PUBLISHED, kind: TEST_KIND.TEST, limit: 1 },
    { skip: !probe },
  );
  const hasPublished =
    (publishedCourses.data?.meta?.total ?? 0) + (publishedTests.data?.meta?.total ?? 0) > 0;

  const steps = [
    {
      key: "publish",
      title: "Publish content",
      body: "Publish a course or a full-length test in Courses or Tests.",
      done: hasContent || hasPublished,
    },
    {
      key: "add",
      title: "Add it to this batch",
      body: "Pick published courses and tests in the tabs below.",
      done: hasContent,
    },
    {
      key: "activate",
      title: "Activate the batch",
      body: "Members can then open its content.",
      done: !isDraft,
    },
    {
      key: "enroll",
      title: "Open enrollment",
      body: "Learners can find the batch and ask to join. Needs an active batch.",
      done: isActive && batch.enrollmentOpen,
    },
  ];
  const showSteps = canEdit && steps.some((step) => !step.done);

  const onTabChange = (value) => {
    setTab(value);
    setAddSignal(0);
  };

  const onAddContent = () => {
    if (tab === "members") setTab("courses");
    setAddSignal((n) => n + 1);
  };

  const onActivate = async () => {
    const done = await confirm({
      title: `Activate ${batch.name}?`,
      description:
        "Members can open its courses and tests straight away. Enrollment stays closed until you open it, and an active batch can't go back to draft.",
      confirmLabel: "Activate batch",
      icon: "play",
      onConfirm: async () => {
        try {
          await activate({ batchId: batch.id, status: BATCH_STATUS.ACTIVE }).unwrap();
        } catch (error) {
          throw asUserSafe(
            explain(error, "Couldn't activate the batch. Please try again.", {
              INVALID_STATUS_TRANSITION: "Add at least one published course or test before activating this batch.",
            }),
          );
        }
      },
    });
    if (done) {
      toast.success(`${batch.name} is active`, { description: "Open enrollment when you're ready for learners to join." });
    }
  };

  const onToggleEnrollment = async (open) => {
    try {
      await setEnrollment({ batchId: batch.id, enrollmentOpen: open }).unwrap();
      toast.success(open ? `Enrollment is open for ${batch.name}` : `Enrollment is closed for ${batch.name}`, {
        description: open
          ? "Learners can find it and ask to join."
          : "Learners can't send new requests. Members keep their access.",
        action: { label: "Undo", onClick: () => onToggleEnrollment(!open) },
      });
    } catch (error) {
      toast.error(open ? "Couldn't open enrollment" : "Couldn't close enrollment", {
        description: explain(error, "Please try again.", {
          INVALID_STATUS_TRANSITION: "Enrollment can only open on an active batch.",
        }),
      });
    }
  };

  const onArchive = async () => {
    const done = await confirm({
      title: `Archive ${batch.name}?`,
      description:
        "Enrollment closes and the batch becomes read-only. This can't be undone. Members keep access to its content, and every attempt and score is kept.",
      confirmLabel: "Archive batch",
      tone: "danger",
      icon: "archive",
      onConfirm: async () => {
        try {
          await archive(batch.id).unwrap();
        } catch (error) {
          throw asUserSafe(explain(error, "Couldn't archive the batch. Please try again."));
        }
      },
    });
    if (done) {
      toast.success(`${batch.name} is archived`, { description: "It's read-only now. Members can still open its content." });
    }
  };

  let primary = null;
  if (canEdit && !hasContent) {
    primary = (
      <Button variant="primary" icon="plus" onClick={onAddContent} className={PRIMARY_ON_PHONE}>
        Add content
      </Button>
    );
  } else if (canEdit && isDraft) {
    primary = (
      <Button variant="primary" icon="play" onClick={onActivate} className={PRIMARY_ON_PHONE}>
        Activate batch
      </Button>
    );
  }

  return (
    <>
      <PageHeader
       
        back={BACK}
        eyebrow="Batch"
        title={batch.name}
        meta={
          <>
            <StatusBadge status={batch.status} />
            <StatusBadge status={batch.enrollmentOpen ? "enrollmentOpen" : "enrollmentClosed"} />
          </>
        }
        description={
          <>
            <span className="flex items-center gap-2 font-semibold text-text-primary tabular-nums">
              <Icon name="calendar" className="h-4 w-4 shrink-0 text-text-muted" />
              {formatRange(batch.startDate, batch.endDate)}
            </span>
            {batch.description && <span className="mt-1 block">{batch.description}</span>}
          </>
        }
        actions={
          canEdit && (
            <>
              <EnrollmentSwitch
                checked={batch.enrollmentOpen}
                disabled={!isActive}
                busy={enrollmentState.isLoading}
                onChange={onToggleEnrollment}
              />
              {primary}
              <RowActions
                label="More batch actions"
                size="lg"
                items={[
                  {
                    id: "archive",
                    label: "Archive batch",
                    description: "Read-only; enrollment closes",
                    icon: "archive",
                    tone: "danger",
                    onSelect: onArchive,
                  },
                ]}
              />
            </>
          )
        }
      />

      {isArchived ? (
        <Callout tone="info" icon="archive" title="This batch is archived">
          {
            "It's read-only: enrollment is closed and its content can't change. Members can still open its courses and tests, and their attempts and scores are kept."
          }
        </Callout>
      ) : (
        showSteps && <GoLiveSteps steps={steps} />
      )}

      <KeyFigures batch={batch} />

      <section aria-label="Batch content and members" className="flex flex-col gap-4">
        <SegmentedTabs
          layoutId="batch-detail-tab"
          ariaLabel="Batch sections"
          items={TABS}
          value={tab}
          onChange={onTabChange}
          className="self-start"
        />
        <div role="tabpanel" aria-label={TABS.find((item) => item.value === tab)?.label}>
          {tab === "members" ? (
            <BatchMembersPanel batch={batch} canManage={canManage} readOnly={isArchived} />
          ) : (
            <BatchContentPanel
              key={tab}
              batch={batch}
              kind={tab}
              canManage={canManage}
              readOnly={isArchived}
              focusSignal={addSignal}
            />
          )}
        </div>
      </section>
    </>
  );
}

/* ── enrollment switch ──────────────────────────────────────────────────── */

/**
 * Takes effect at once, so it's a Switch, not a button. Only an active batch
 * can open enrollment (§4); on a draft the switch stays visible but disabled,
 * and says why — on hover, to screen readers, and in the steps below.
 */
function EnrollmentSwitch({ checked, disabled, busy, onChange }) {
  const id = useId();
  const control = (
    <div className="flex h-10 items-center gap-3 rounded-full bg-surface-elevated pr-2 pl-4 ring-1 ring-inset ring-border">
      <label
        htmlFor={id}
        className={cx("text-sm font-semibold whitespace-nowrap", disabled ? "text-text-muted" : "cursor-pointer text-text-primary")}
      >
        Enrollment open
      </label>
      <Switch
        id={id}
        checked={checked}
        onChange={onChange}
        busy={busy}
        disabled={disabled}
        label={disabled ? "Enrollment open. Available once the batch is active" : undefined}
      />
    </div>
  );

  return disabled ? <Tooltip content="Activate the batch to open enrollment">{control}</Tooltip> : control;
}

/* ── go-live steps ──────────────────────────────────────────────────────── */

const STEP_CHIP = {
  done: "bg-success-muted text-success",
  current: "bg-accent-solid text-accent-solid-contrast",
  upcoming: "bg-surface-elevated text-text-muted ring-1 ring-inset ring-border",
};

const STEP_STATE_LABEL = { done: "Done", current: "Current step", upcoming: "Not yet" };

/** The four gates as a stepper: done / current / upcoming. */
function GoLiveSteps({ steps }) {
  const current = steps.findIndex((step) => !step.done);

  return (
    <Callout tone="info" icon="route" title={`Next step: ${steps[current].title}`}>
      <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, i) => {
          const state = step.done ? "done" : i === current ? "current" : "upcoming";
          return (
            <li
              key={step.key}
              aria-current={state === "current" ? "step" : undefined}
              className={cx(
                "flex gap-3 rounded-xl p-3",
                state === "current" && "bg-surface-elevated shadow-elevate ring-1 ring-inset ring-accent/25",
              )}
            >
              <span
                className={cx(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums",
                  STEP_CHIP[state],
                )}
                aria-hidden
              >
                {state === "done" ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <div className="min-w-0">
                <p className={cx("text-sm font-semibold", state === "upcoming" ? "text-text-muted" : "text-text-primary")}>
                  <span className="sr-only">{`Step ${i + 1}, ${STEP_STATE_LABEL[state]}: `}</span>
                  {step.title}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-text-muted">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Callout>
  );
}

/* ── key figures ────────────────────────────────────────────────────────── */

const DAY_MS = 86_400_000;
const utcDay = (iso) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / DAY_MS);
const todayUtcDay = (date) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);

/** Where the batch is on its calendar: not started, week n of m, or ended. */
function schedule(batch, today) {
  const start = utcDay(batch.startDate);
  const end = utcDay(batch.endDate);
  const now = todayUtcDay(today);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

  if (now < start) {
    const days = start - now;
    return { label: "Starts in", value: days, unit: days === 1 ? "day" : "days", caption: formatDate(batch.startDate) };
  }
  if (now > end) {
    const days = now - end;
    return { label: "Ended", value: days, unit: days === 1 ? "day ago" : "days ago", caption: formatDate(batch.endDate) };
  }
  const totalWeeks = Math.max(1, Math.ceil((end - start + 1) / 7));
  const week = Math.min(totalWeeks, Math.floor((now - start) / 7) + 1);
  return { label: "Running", value: week, unit: `of ${totalWeeks} weeks`, caption: `Ends ${formatDate(batch.endDate)}` };
}

function KeyFigures({ batch }) {
  const [today] = useState(() => new Date());
  const counts = batch.counts ?? {};
  const when = schedule(batch, today);

  return (
    <section
      aria-label="Key figures"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-border/70 shadow-elevate ring-1 ring-border/70 lg:grid-cols-4"
    >
      <Figure icon="book" label="Courses" value={counts.courses ?? 0} />
      <Figure icon="clipboardCheck" label="Tests" value={counts.tests ?? 0} />
      <Figure icon="users" label="Members" value={counts.members ?? 0} caption="With access" />
      {when ? (
        <Figure icon="calendar" label={when.label} value={when.value} unit={when.unit} caption={when.caption} />
      ) : (
        <Figure icon="calendar" label="Dates" value="—" />
      )}
    </section>
  );
}

function Figure({ icon, label, value, unit, caption }) {
  const shown = useCountTo(typeof value === "number" ? value : undefined);
  return (
    <div className="flex min-w-0 flex-col gap-3 bg-surface-elevated p-4 sm:p-5">
      <p className="flex min-w-0 items-center gap-2 text-text-muted">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-tint-slate text-text-primary">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <span className="caps truncate text-[10.5px] font-bold">{label}</span>
      </p>
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-1.5 font-display leading-none text-text-primary">
          <span className="text-[1.75rem] font-extrabold tracking-tight tabular-nums">
            {typeof value === "number" ? Math.round(shown) : value}
          </span>
          {unit && <span className="text-sm font-bold text-text-muted">{unit}</span>}
        </p>
        {caption && <p className="mt-1.5 truncate text-[13px] text-text-muted tabular-nums">{caption}</p>}
      </div>
    </div>
  );
}

/* ── loading ────────────────────────────────────────────────────────────── */

function DetailSkeleton() {
  return (
    <>
      <PageHeader
       
        back={BACK}
        eyebrow="Batch"
        title={
          <>
            <span className="sr-only">Loading batch</span>
            <Skeleton className="h-9 w-80 max-w-full" />
          </>
        }
        description={<Skeleton className="h-4 w-56" />}
      />
      <Skeleton className="h-34 w-full rounded-[24px]" />
      <div className="flex flex-col gap-4" aria-hidden>
        <Skeleton className="h-11 w-72 max-w-full rounded-full" />
        <SkeletonCard />
      </div>
    </>
  );
}
