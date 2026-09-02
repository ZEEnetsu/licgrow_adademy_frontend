import { NavLink } from "react-router-dom";

import {
  Card,
  EmptyState,
  InteractiveCard,
  Pill,
  ScoreBar,
  SectionTitle,
  StatTile,
} from "../../components/ui/Surface.jsx";
import AreaChart from "../../components/AreaChart.jsx";
import { useLearnerPerformance } from "./useLearnerPerformance.js";
import {
  useGetMyBatchArenaQuery,
  useGetMyBatchesQuery,
} from "../../app/apis/batches.api.js";
import { useGetMyAnnouncementsQuery } from "../../app/apis/announcement.api.js";

/**
 * The learner's home — a performance overview built from what a learner is
 * permitted to read.
 *
 * 13-analytics.md has no learner-facing endpoints by design, so everything
 * here is composed from the batch arenas (06 §14), which carry each learner's
 * own attempt state. See useLearnerPerformance for the reasoning.
 *
 * Visual language mirrors the admin dashboard: StatTile row, then paired
 * panels, all built from theme tokens so light and dark both work.
 */

/** Opens one arena subscription so the aggregate hook has data to select. */
const ArenaSubscription = ({ batchId }) => {
  useGetMyBatchArenaQuery(batchId);
  return null;
};

const scoreTone = (pct) => {
  if (pct === null) return "default";
  if (pct >= 70) return "accent";
  if (pct >= 50) return "warn";
  return "danger";
};

const StudentDashboard = () => {
  const { data: batches = [] } = useGetMyBatchesQuery();
  const performance = useLearnerPerformance();
  const { data: announcements } = useGetMyAnnouncementsQuery({ limit: 3 });

  const latest = announcements?.items ?? [];

  if (performance.isLoading) {
    return (
      <>
        {batches.map((batch) => (
          <ArenaSubscription key={batch.id} batchId={batch.id} />
        ))}
        <p className="text-text-muted text-sm">Loading your dashboard…</p>
      </>
    );
  }

  if (batches.length === 0) {
    return (
      <EmptyState
        title="You're not in a batch yet"
        hint="Join a cohort to unlock courses and mock tests."
        action={
          <NavLink
            to="/student/browse"
            className="inline-block px-4 py-2 rounded-md bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-colors"
          >
            Browse batches →
          </NavLink>
        }
      />
    );
  }

  const { attempted, tests, averagePct, bestPct, passRatePct, completionPct, trend } =
    performance;

  return (
    <div>
      {batches.map((batch) => (
        <ArenaSubscription key={batch.id} batchId={batch.id} />
      ))}

      <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
      <p className="text-sm text-text-muted mt-1">
        Your progress across {batches.length} batch
        {batches.length === 1 ? "" : "es"}.
      </p>

      {/* ── performance matrix ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatTile
          label="Average score"
          tone={scoreTone(averagePct)}
          value={averagePct === null ? "—" : `${averagePct}%`}
          caption="best attempt per test"
        />
        <StatTile
          label="Best score"
          tone="accent"
          value={bestPct === null ? "—" : `${bestPct}%`}
        />
        <StatTile
          label="Pass rate"
          tone={scoreTone(passRatePct)}
          value={passRatePct === null ? "—" : `${passRatePct}%`}
          caption={`${attempted.length} of ${tests.length} tests`}
        />
        <StatTile
          label="Completion"
          value={completionPct === null ? "—" : `${completionPct}%`}
          caption={`${performance.totalAttempts} total attempts`}
        />
      </div>

      {/* ── performance indicator ──────────────────────────────────────── */}
      {attempted.length >= 2 && (
        <div className="mt-6">
          <SectionTitle
            action={
              trend !== null && (
                <Pill tone={trend >= 0 ? "good" : "warn"}>
                  {trend >= 0 ? `▲ ${trend}%` : `▼ ${Math.abs(trend)}%`} recent
                </Pill>
              )
            }
          >
            Score trend
          </SectionTitle>
          <Card>
            <AreaChart
              height={180}
              yAxisLabel="Best score %"
              coordinates={[...attempted]
                .reverse()
                .map((test, index) => ({
                  x: `T${index + 1}`,
                  y: test.myBestScorePct,
                }))}
            />
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5 mt-8">
        {/* ── test score matrix ───────────────────────────────────────── */}
        <div>
          <SectionTitle
            action={
              <NavLink
                to="/student/history"
                className="text-[11px] text-accent hover:underline normal-case tracking-normal"
              >
                Full history →
              </NavLink>
            }
          >
            Test scores
          </SectionTitle>

          {tests.length === 0 ? (
            <Card>
              <p className="text-sm text-text-muted">
                No tests published into your batches yet.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {tests.slice(0, 6).map((test) => {
                const done = test.myBestScorePct !== null;
                const passed =
                  done && test.totalMarks
                    ? (test.myBestScorePct / 100) * test.totalMarks >=
                      (test.passingMarks ?? 0)
                    : false;

                return (
                  <InteractiveCard
                    key={test.id}
                    as={NavLink}
                    to={`/student/tests/${test.id}`}
                    className="block py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-text-primary truncate">
                        {test.title}
                      </p>
                      {done ? (
                        <Pill tone={passed ? "good" : "bad"}>
                          {test.myBestScorePct}%
                        </Pill>
                      ) : (
                        <Pill
                          tone={
                            test.myStatus === "in_progress" ? "warn" : "neutral"
                          }
                        >
                          {test.myStatus === "in_progress"
                            ? "in progress"
                            : "not started"}
                        </Pill>
                      )}
                    </div>

                    {done && (
                      <div className="mt-2">
                        <ScoreBar
                          percentage={test.myBestScorePct}
                          passed={passed}
                        />
                      </div>
                    )}

                    <p className="text-[11px] text-text-muted mt-1.5">
                      {test.batchName}
                      {test.myAttemptCount > 0 &&
                        ` · ${test.myAttemptCount} attempt${test.myAttemptCount === 1 ? "" : "s"}`}
                    </p>
                  </InteractiveCard>
                );
              })}
            </div>
          )}
        </div>

        {/* ── announcement snapshot ───────────────────────────────────── */}
        <div>
          <SectionTitle
            action={
              <NavLink
                to="/student/announcements"
                className="text-[11px] text-accent hover:underline normal-case tracking-normal"
              >
                See all →
              </NavLink>
            }
          >
            Latest announcements
          </SectionTitle>

          {latest.length === 0 ? (
            <Card>
              <p className="text-sm text-text-muted">Nothing right now.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {latest.map((announcement) => (
                <Card key={announcement.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-text-primary">
                      {announcement.isPinned && (
                        <span className="text-accent mr-1" title="Pinned">
                          📌
                        </span>
                      )}
                      {announcement.title}
                    </p>
                    <Pill tone={announcement.scope === "global" ? "neutral" : "accent"}>
                      {announcement.scope === "global" ? "platform" : "batch"}
                    </Pill>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1 line-clamp-2">
                    {announcement.body}
                  </p>
                  <p className="text-[10px] text-text-muted mt-2 opacity-70">
                    {announcement.publishedAt?.slice(0, 10)}
                  </p>
                </Card>
              ))}
            </div>
          )}

          <SectionTitle>My batches</SectionTitle>
          <div className="flex flex-col gap-2">
            {batches.map((batch) => (
              <InteractiveCard
                key={batch.id}
                as={NavLink}
                to={`/student/batches/${batch.id}`}
                className="block py-3"
              >
                <p className="text-sm text-text-primary">{batch.name}</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {batch.counts?.courses ?? 0} courses ·{" "}
                  {batch.counts?.tests ?? 0} tests
                </p>
              </InteractiveCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
