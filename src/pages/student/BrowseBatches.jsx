import { useState } from "react";
import { NavLink } from "react-router-dom";

import { useGetAvailableBatchesQuery } from "../../app/apis/batches.api.js";
import { useSubmitEnrollmentMutation } from "../../app/apis/enrollment.api.js";
import { useGetMyProfileQuery } from "../../app/apis/learner.api.js";
import { ERROR_CODES, getUserMessage } from "../../app/apis/apiError.js";

/**
 * Batch discovery and enrollment — `06-batch.md` §12 + `07-enrollment.md` §1.
 *
 * §12 returns only batches that are `active` AND `enrollmentOpen`, each
 * annotated with `myEnrollmentStatus`, so the CTA needs no second request.
 *
 * The submit is gated on `profile.isComplete` before it's even attempted:
 * 07's flow note says an incomplete profile would 422 anyway, so the button
 * deep-links to the profile form instead of burning a rate-limited request.
 */

const CTA = {
  null: { label: "Request to join", canSubmit: true },
  undefined: { label: "Request to join", canSubmit: true },
  pending: { label: "Request pending", canSubmit: false },
  approved: { label: "Enrolled", canSubmit: false },
  rejected: { label: "Request again", canSubmit: true },
};

const BrowseBatches = () => {
  const { data, isLoading, isError, error } = useGetAvailableBatchesQuery();
  const { data: me } = useGetMyProfileQuery();
  const [submitEnrollment, { isLoading: submitting }] =
    useSubmitEnrollmentMutation();

  const [openFor, setOpenFor] = useState(null);
  const [motivation, setMotivation] = useState("");
  const [failure, setFailure] = useState(null);

  const profileComplete = me?.profile?.isComplete ?? false;

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading batches…</p>;
  }

  if (isError) {
    return (
      <p className="text-danger text-sm">
        Couldn&apos;t load batches — {getUserMessage(error)}
      </p>
    );
  }

  const batches = data?.items ?? [];

  const handleSubmit = async (event, batchId) => {
    event.preventDefault();
    setFailure(null);

    try {
      await submitEnrollment({
        batchId,
        motivation: motivation.trim() || undefined,
      }).unwrap();
      setOpenFor(null);
      setMotivation("");
    } catch (err) {
      setFailure({
        batchId,
        // PROFILE_INCOMPLETE lists the missing fields — worth showing verbatim
        message: getUserMessage(err, "Couldn't submit your request."),
        fields:
          err?.code === ERROR_CODES.UNPROCESSABLE || err?.details?.length
            ? err.details.map((d) => d.field)
            : [],
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Browse batches</h1>
      <p className="text-sm text-text-muted mt-1">
        Cohorts currently accepting new learners.
      </p>

      {!profileComplete && (
        <div className="mt-4 rounded-md bg-warning-muted border border-warning/40 px-4 py-3">
          <p className="text-warning text-xs font-semibold">
            Complete your profile before requesting a batch.
          </p>
          <NavLink
            to="/student/profile"
            className="text-[11px] text-accent hover:underline mt-1 inline-block"
          >
            Go to your profile →
          </NavLink>
        </div>
      )}

      {batches.length === 0 ? (
        <p className="text-text-muted mt-6">
          No batches are open for enrollment right now.
        </p>
      ) : (
        <div className="grid gap-4 mt-6 md:grid-cols-2">
          {batches.map((batch) => {
            const cta = CTA[String(batch.myEnrollmentStatus)] ?? CTA.null;
            const isOpen = openFor === batch.id;
            const err = failure?.batchId === batch.id ? failure : null;

            return (
              <div
                key={batch.id}
                className="rounded-lg border border-border-muted bg-surface p-5 flex flex-col"
              >
                <p className="font-semibold text-text-primary">{batch.name}</p>
                <p className="text-xs text-text-muted mt-1">
                  {batch.startDate} → {batch.endDate}
                </p>
                {batch.description && (
                  <p className="text-sm text-text-muted mt-3 flex-1">
                    {batch.description}
                  </p>
                )}

                {isOpen ? (
                  <form
                    onSubmit={(event) => handleSubmit(event, batch.id)}
                    className="mt-4"
                  >
                    <label
                      htmlFor={`motivation-${batch.id}`}
                      className="text-xs text-text-muted"
                    >
                      Why do you want to join?{" "}
                      <span className="opacity-60">(optional)</span>
                    </label>
                    <textarea
                      id={`motivation-${batch.id}`}
                      rows={3}
                      maxLength={1000}
                      value={motivation}
                      onChange={(event) => setMotivation(event.target.value)}
                      className="mt-1 w-full text-sm py-2 px-3 bg-bg rounded-md outline-none text-text-primary focus:ring-1 focus:ring-accent"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-accent/20 text-accent hover:bg-accent/30 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {submitting ? "Sending…" : "Send request"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenFor(null);
                          setMotivation("");
                          setFailure(null);
                        }}
                        className="px-4 py-2 rounded-md text-sm text-text-muted hover:text-text-primary cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    disabled={!cta.canSubmit || !profileComplete}
                    onClick={() => {
                      setOpenFor(batch.id);
                      setFailure(null);
                    }}
                    title={
                      profileComplete
                        ? undefined
                        : "Complete your profile to request a batch"
                    }
                    className={`mt-4 self-start px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      cta.canSubmit && profileComplete
                        ? "bg-accent/20 text-accent hover:bg-accent/30 cursor-pointer"
                        : "bg-bg text-text-muted opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {cta.label}
                  </button>
                )}

                {err && (
                  <div className="mt-3 rounded-md bg-danger-muted border border-danger/40 px-3 py-2">
                    <p className="text-danger text-xs font-semibold">
                      {err.message}
                    </p>
                    {err.fields.length > 0 && (
                      <p className="text-danger text-[11px] mt-1">
                        Missing: {err.fields.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseBatches;
