import { useGetMyAnnouncementsQuery } from "../../app/apis/announcement.api.js";
import { getUserMessage } from "../../app/apis/apiError.js";

/**
 * Learner announcement feed — `api-contracts/11-announcement.md` §6.
 *
 * A merged view: global announcements plus those for every batch the learner
 * actively belongs to, expired ones excluded, pinned first then newest.
 *
 * All of that ordering and filtering happens server-side, so this renders the
 * list as received rather than re-sorting it — the two could otherwise drift.
 */
const Announcements = () => {
  const { data, isLoading, isError, error } = useGetMyAnnouncementsQuery();

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading announcements…</p>;
  }

  if (isError) {
    return (
      <p className="text-danger text-sm">
        Couldn&apos;t load announcements — {getUserMessage(error)}
      </p>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Announcements</h1>
      <p className="text-sm text-text-muted mt-1">
        Updates from your batches and the platform.
      </p>

      {items.length === 0 ? (
        <p className="text-text-muted mt-6">Nothing right now.</p>
      ) : (
        <div className="flex flex-col gap-3 mt-6">
          {items.map((announcement) => (
            <article
              key={announcement.id}
              className={`rounded-lg border p-4 ${
                announcement.isPinned
                  ? "border-accent/40 bg-accent/5"
                  : "border-border-muted bg-surface/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-medium text-text-primary">
                  {announcement.isPinned && (
                    <span className="text-accent mr-1" title="Pinned">
                      📌
                    </span>
                  )}
                  {announcement.title}
                </h2>
                <span className="text-[10px] uppercase tracking-wide text-text-muted shrink-0">
                  {announcement.scope === "global"
                    ? "Platform"
                    : (announcement.batchName ?? "Batch")}
                </span>
              </div>

              <p className="text-sm text-text-muted mt-2 whitespace-pre-line">
                {announcement.body}
              </p>

              <p className="text-[11px] text-text-muted mt-3 opacity-70">
                {announcement.publishedAt?.slice(0, 10)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
