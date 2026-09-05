import { useState } from "react";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import Btn from "../../components/Btn.jsx";
import Can from "../../../../components/auth/Can.jsx";
import ProtalLayout from "../../../../layouts/PortalLayput.jsx";
import AnnouncementForm from "./AnnouncementForm.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useDeleteAnnouncementMutation,
  useGetAnnouncementsQuery,
  useUpdateAnnouncementMutation,
  ANNOUNCEMENT_SCOPE,
} from "../../../../app/apis/announcement.api.js";

/**
 * Announcement management — `api-contracts/11-announcement.md` §1–5.
 *
 * Admins see everything, including expired ones — which is why an expired
 * badge is shown rather than the row being hidden. Learners never see these.
 */

const TABS = [
  { label: "All", scope: null },
  { label: "Global", scope: ANNOUNCEMENT_SCOPE.GLOBAL },
  { label: "Batch", scope: ANNOUNCEMENT_SCOPE.BATCH },
];

const isExpired = (announcement) =>
  Boolean(
    announcement.expiresAt &&
      new Date(announcement.expiresAt).getTime() <= Date.now(),
  );

const AnnouncementManager = () => {
  const [scope, setScope] = useState(null);
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionError, setActionError] = useState(null);

  const { data, isLoading, isError, error, isFetching } = useGetAnnouncementsQuery(
    scope ? { scope } : undefined,
  );

  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement, deleteState] = useDeleteAnnouncementMutation();

  const act = async (fn) => {
    setActionError(null);
    try {
      await fn().unwrap();
    } catch (err) {
      setActionError(getUserMessage(err, "That change was rejected."));
    }
  };

  const items = data?.items ?? [];

  return (
    <DashboardCompLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-4 items-center">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setScope(tab.scope)}
              className={`text-sm transition-colors cursor-pointer ${
                scope === tab.scope
                  ? "text-text-primary font-medium"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Can perm={PERMISSIONS.ANNOUNCEMENT_MANAGE}>
          <div className="w-44">
            <Btn
              title="New announcement"
              variant="secondary"
              size="sm"
              onClick={() => setComposing(true)}
            />
          </div>
        </Can>
      </div>

      {isLoading ? (
        <p className="text-text-muted text-sm">Loading announcements…</p>
      ) : isError ? (
        <p className="text-danger text-sm">
          Couldn&apos;t load announcements — {getUserMessage(error)}
        </p>
      ) : items.length === 0 ? (
        <div>
          <p className="font-semibold text-text-muted">
            No announcements yet.
          </p>
          <p className="text-text-muted text-xs mt-1">
            A batch announcement notifies that batch&apos;s members; a global
            one reaches every learner.
          </p>
        </div>
      ) : (
        <div className={`flex flex-col gap-2 ${isFetching ? "opacity-60" : ""}`}>
          {items.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-lg bg-surface-elevated shadow-elevate p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {announcement.isPinned && (
                      <span className="text-accent mr-1" title="Pinned">
                        📌
                      </span>
                    )}
                    {announcement.title}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {announcement.scope === ANNOUNCEMENT_SCOPE.GLOBAL
                      ? "Global"
                      : (announcement.batchName ?? "Batch")}{" "}
                    · {announcement.publishedAt?.slice(0, 10)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isExpired(announcement) && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-danger">
                      expired
                    </span>
                  )}
                  <Can perm={PERMISSIONS.ANNOUNCEMENT_MANAGE}>
                    <button
                      type="button"
                      onClick={() =>
                        act(() =>
                          updateAnnouncement({
                            id: announcement.id,
                            isPinned: !announcement.isPinned,
                          }),
                        )
                      }
                      className="text-[11px] text-text-muted hover:text-text-primary px-2 py-1 cursor-pointer"
                    >
                      {announcement.isPinned ? "unpin" : "pin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(announcement)}
                      className="text-[11px] text-text-muted hover:text-text-primary px-2 py-1 cursor-pointer"
                    >
                      edit
                    </button>
                    <button
                      type="button"
                      disabled={deleteState.isLoading}
                      onClick={() => act(() => deleteAnnouncement(announcement.id))}
                      className="text-[11px] text-text-muted hover:text-danger px-2 py-1 disabled:opacity-40 cursor-pointer"
                    >
                      delete
                    </button>
                  </Can>
                </div>
              </div>

              <p className="text-xs text-text-muted mt-2 line-clamp-3">
                {announcement.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {actionError && (
        <p className="mt-4 text-warning text-xs font-semibold">{actionError}</p>
      )}

      {(composing || editing) && (
        <ProtalLayout
          heading={editing ? "Edit announcement" : "New announcement"}
          onClose={() => {
            setComposing(false);
            setEditing(null);
          }}
        >
          <AnnouncementForm
            announcement={editing}
            onClose={() => {
              setComposing(false);
              setEditing(null);
            }}
          />
        </ProtalLayout>
      )}
    </DashboardCompLayout>
  );
};

export default AnnouncementManager;
