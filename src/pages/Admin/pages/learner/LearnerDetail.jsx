import { useNavigate, useParams } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import Can from "../../../../components/auth/Can.jsx";
import {
  Card,
  EmptyState,
  Pill,
  ScoreBar,
  SectionTitle,
  StatTile,
} from "../../../../components/ui/Surface.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useGetLearnerQuery,
  useReactivateLearnerMutation,
  useSuspendLearnerMutation,
} from "../../../../app/apis/learner.api.js";
import { useGetLearnerAnalyticsQuery } from "../../../../app/apis/analytics.api.js";

/**
 * One learner, in full — `02-learner.md` §6 plus `13-analytics.md` §3.
 *
 * Both endpoints existed and neither had a screen: the list could only show
 * name, email and status while these two carried the whole profile, the
 * enrollment-readiness flag, batch membership and a per-test breakdown.
 *
 * Analytics is fetched separately and tolerated as optional — it needs
 * `analytics:view`, which a `learner:read` holder may not have, and half a
 * page is better than an error page.
 */
const LearnerDetail = () => {
  const { learnerId } = useParams();
  const navigate = useNavigate();

  const { data: learner, isLoading, isError, error } = useGetLearnerQuery(
    learnerId,
    { skip: !learnerId },
  );
  const analytics = useGetLearnerAnalyticsQuery(learnerId, { skip: !learnerId });

  const [suspend, suspendState] = useSuspendLearnerMutation();
  const [reactivate, reactivateState] = useReactivateLearnerMutation();
  const busy = suspendState.isLoading || reactivateState.isLoading;

  if (isLoading) {
    return (
      <DashboardCompLayout>
        <p className="text-text-muted text-sm">Loading learner…</p>
      </DashboardCompLayout>
    );
  }

  if (isError || !learner) {
    return (
      <DashboardCompLayout>
        <p className="text-danger text-sm">
          Couldn&apos;t load this learner — {getUserMessage(error)}
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/manage-users")}
          className="mt-3 text-sm text-accent underline cursor-pointer"
        >
          Back to learners
        </button>
      </DashboardCompLayout>
    );
  }

  const { profile, stats } = learner;
  const summary = analytics.data?.summary;
  const perTest = analytics.data?.perTest ?? [];
  const batches = analytics.data?.batches ?? [];

  return (
    <>
      <DashboardCompLayout>
        <button
          type="button"
          onClick={() => navigate("/admin/manage-users")}
          className="mb-4 text-sm text-text-muted hover:text-text-primary cursor-pointer"
        >
          ← Back to learners
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-text-primary">
                {learner.fullName}
              </h1>
              <Pill tone={learner.status === "active" ? "good" : "bad"}>
                {learner.status}
              </Pill>
            </div>
            <p className="text-xs text-text-muted mt-1">
              {learner.email}
              {learner.username ? ` · ${learner.username}` : ""}
              {learner.phone ? ` · ${learner.phone}` : ""}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Joined {learner.createdAt?.slice(0, 10)}
            </p>
          </div>

          <Can perm={PERMISSIONS.LEARNER_SUSPEND}>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                learner.status === "active"
                  ? suspend({ learnerId })
                  : reactivate(learnerId)
              }
              title={
                learner.status === "active"
                  ? "Blocks login and all access"
                  : undefined
              }
              className={`shrink-0 text-xs px-3 py-1.5 rounded-md border border-border transition-colors disabled:opacity-40 cursor-pointer ${
                learner.status === "active"
                  ? "text-text-muted hover:text-danger dark:hover:text-danger"
                  : "text-text-muted hover:text-accent"
              }`}
            >
              {learner.status === "active" ? "Suspend" : "Reactivate"}
            </button>
          </Can>
        </div>
      </DashboardCompLayout>

      <DashboardCompLayout>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Batches"
            value={stats?.batchesActive ?? batches.length}
            caption="active membership"
          />
          <StatTile
            label="Tests attempted"
            value={summary?.testsAttempted ?? stats?.testsAttempted ?? 0}
          />
          <StatTile
            label="Average score"
            tone="accent"
            value={
              summary?.avgScorePct === null || summary?.avgScorePct === undefined
                ? "—"
                : `${summary.avgScorePct}%`
            }
            caption="best attempt per test"
          />
          <StatTile
            label="Pass rate"
            tone={
              (summary?.passRatePct ?? 0) >= 50 && summary?.passRatePct !== null
                ? "accent"
                : "warn"
            }
            value={
              summary?.passRatePct === null || summary?.passRatePct === undefined
                ? "—"
                : `${summary.passRatePct}%`
            }
          />
        </div>
      </DashboardCompLayout>

      <DashboardCompLayout>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <SectionTitle>
              Profile
              {profile?.isComplete === false && (
                <Pill tone="warn">incomplete</Pill>
              )}
            </SectionTitle>
            <Card>
              <dl className="grid grid-cols-2 gap-y-3 gap-x-4">
                <Detail label="LIC agent code" value={profile?.licAgentCode} />
                <Detail label="Date of birth" value={profile?.dob} />
                <Detail label="City" value={profile?.city} />
                <Detail
                  label="Experience"
                  value={
                    profile?.experienceYears === null ||
                    profile?.experienceYears === undefined
                      ? null
                      : `${profile.experienceYears} years`
                  }
                />
              </dl>
              {profile?.isComplete === false && (
                <p className="text-[11px] text-warning mt-3">
                  This learner cannot request enrollment until every field above
                  is filled in.
                </p>
              )}
            </Card>

            <SectionTitle>Batches</SectionTitle>
            {batches.length === 0 ? (
              <Card>
                <p className="text-sm text-text-muted">
                  Not a member of any batch.
                </p>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {batches.map((batch) => (
                  <Card key={batch.batchId} className="py-2.5">
                    <p className="text-sm text-text-primary">{batch.name}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionTitle>
              Test performance
              {stats?.lastActiveAt && (
                <span className="text-[11px] text-text-muted normal-case tracking-normal">
                  last active {stats.lastActiveAt.slice(0, 10)}
                </span>
              )}
            </SectionTitle>

            {analytics.isError ? (
              <Card>
                <p className="text-sm text-text-muted">
                  Performance data needs the <code>analytics:view</code>{" "}
                  permission.
                </p>
              </Card>
            ) : perTest.length === 0 ? (
              <EmptyState
                title="No attempts yet"
                hint="Scores appear once this learner sits a test."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {perTest.map((test) => (
                  <Card key={test.testId} className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-text-primary truncate">
                        {test.title}
                      </p>
                      <Pill tone={test.passed ? "good" : "bad"}>
                        {test.passed ? "passed" : "not passed"}
                      </Pill>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <ScoreBar
                        percentage={test.bestScorePct}
                        passed={test.passed}
                      />
                      <span className="text-xs font-semibold text-text-primary shrink-0 w-10 text-right">
                        {test.bestScorePct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">
                      {test.attempts} attempt{test.attempts === 1 ? "" : "s"} ·
                      best shown
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardCompLayout>
    </>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-[11px] uppercase tracking-wide text-text-muted">
      {label}
    </dt>
    <dd className="text-sm text-text-primary mt-0.5">
      {value ?? <span className="text-text-muted opacity-60">—</span>}
    </dd>
  </div>
);

export default LearnerDetail;
