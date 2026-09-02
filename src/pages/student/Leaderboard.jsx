import { useNavigate, useParams } from "react-router-dom";

import { getUserMessage } from "../../app/apis/apiError.js";
import { useGetLeaderboardQuery } from "../../app/apis/submission.api.js";

/**
 * Leaderboard - `api-contracts/10-submission.md` section 7.
 *
 * Opens only for a `kind=test` with `leaderboardEnabled`, and only after
 * `availableUntil`. Ranked by each learner's BEST attempt, not their latest.
 * Names are first name + last initial, per the contract's privacy note.
 */
const Leaderboard = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetLeaderboardQuery(testId, {
    skip: !testId,
  });

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading leaderboard...</p>;
  }

  if (isError) {
    const locked = error?.code === "LEADERBOARD_LOCKED";
    return (
      <div>
        <p className={locked ? "text-text-muted text-sm" : "text-danger text-sm"}>
          {locked
            ? "The leaderboard opens when the test closes."
            : `Couldn't load the leaderboard - ${getUserMessage(error)}`}
        </p>
        <button
          type="button"
          onClick={() => navigate(`/student/tests/${testId}`)}
          className="mt-3 text-sm text-accent underline cursor-pointer"
        >
          Back to the test
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <button
        type="button"
        onClick={() => navigate(`/student/tests/${testId}`)}
        className="text-sm text-text-muted hover:text-text-primary cursor-pointer"
      >
        &larr; Back to the test
      </button>

      <h1 className="text-2xl font-semibold mt-3">Leaderboard</h1>
      {data.closedAt && (
        <p className="text-xs text-text-muted mt-1">
          Closed {data.closedAt.slice(0, 10)}
        </p>
      )}

      <div className="flex flex-col gap-1 mt-6">
        {data.top.map((row) => (
          <div
            key={row.rank}
            className="flex items-center gap-4 rounded-md bg-surface/50 px-4 py-2.5"
          >
            <span className="w-8 text-sm font-mono text-text-muted">
              #{row.rank}
            </span>
            <span className="flex-1 text-sm text-text-primary">
              {row.learnerName}
            </span>
            <span className="text-sm font-semibold text-accent">
              {row.bestScorePct}%
            </span>
          </div>
        ))}
      </div>

      {data.me && (
        <div className="mt-4 flex items-center gap-4 rounded-md border border-accent/40 bg-accent/10 px-4 py-2.5">
          <span className="w-8 text-sm font-mono text-accent">#{data.me.rank}</span>
          <span className="flex-1 text-sm text-text-primary">You</span>
          <span className="text-sm font-semibold text-accent">
            {data.me.bestScorePct}%
          </span>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
