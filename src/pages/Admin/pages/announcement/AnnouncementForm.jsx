import { useState } from "react";

import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  ANNOUNCEMENT_SCOPE,
} from "../../../../app/apis/announcement.api.js";
import {
  useGetBatchesQuery,
  BATCH_STATUS,
} from "../../../../app/apis/batches.api.js";

/**
 * Compose or edit an announcement — `11-announcement.md` §1 / §4.
 *
 * Scope is chosen at creation and fixed thereafter: §4 permits editing only
 * title, body, isPinned and expiresAt. The edit form therefore hides the scope
 * controls rather than showing disabled ones that imply they might work.
 */
const AnnouncementForm = ({ announcement, onClose }) => {
  const isEdit = Boolean(announcement);

  const [form, setForm] = useState(() => ({
    scope: announcement?.scope ?? ANNOUNCEMENT_SCOPE.BATCH,
    batchId: announcement?.batchId ?? "",
    title: announcement?.title ?? "",
    body: announcement?.body ?? "",
    isPinned: announcement?.isPinned ?? false,
    // datetime-local wants "YYYY-MM-DDTHH:mm"
    expiresAt: announcement?.expiresAt
      ? announcement.expiresAt.slice(0, 16)
      : "",
  }));

  // only active batches are worth announcing into
  const { data: batches } = useGetBatchesQuery(
    { status: BATCH_STATUS.ACTIVE },
    { skip: isEdit },
  );

  const [createAnnouncement, createState] = useCreateAnnouncementMutation();
  const [updateAnnouncement, updateState] = useUpdateAnnouncementMutation();
  const { isLoading, error } = isEdit ? updateState : createState;

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const expiresAt = form.expiresAt
      ? new Date(form.expiresAt).toISOString()
      : null;

    try {
      if (isEdit) {
        await updateAnnouncement({
          id: announcement.id,
          title: form.title.trim(),
          body: form.body.trim(),
          isPinned: form.isPinned,
          expiresAt,
        }).unwrap();
      } else {
        // build exactly the documented shape: batchId only when scope=batch
        const payload = {
          scope: form.scope,
          title: form.title.trim(),
          body: form.body.trim(),
          isPinned: form.isPinned,
        };
        if (form.scope === ANNOUNCEMENT_SCOPE.BATCH) payload.batchId = form.batchId;
        if (expiresAt) payload.expiresAt = expiresAt;

        await createAnnouncement(payload).unwrap();
      }
      onClose?.();
    } catch {
      // surfaced below
    }
  };

  const issues = Object.fromEntries(
    (error?.details ?? []).map((detail) => [detail.field, detail.issue]),
  );

  const needsBatch =
    !isEdit && form.scope === ANNOUNCEMENT_SCOPE.BATCH && !form.batchId;

  return (
    <form onSubmit={handleSubmit} className="min-w-104 max-w-lg">
      {!isEdit && (
        <div className="flex items-baseline gap-3 mb-3">
          <label className="text-sm text-text-primary w-24 shrink-0" htmlFor="scope">
            Audience
          </label>
          <div className="flex-1">
            <select
              id="scope"
              value={form.scope}
              onChange={handleChange}
              className="w-full text-sm py-1.5 px-3 bg-surface-elevated text-text-primary rounded-md outline-none"
            >
              <option value={ANNOUNCEMENT_SCOPE.BATCH}>One batch</option>
              <option value={ANNOUNCEMENT_SCOPE.GLOBAL}>
                Everyone (global)
              </option>
            </select>
            {issues.scope && (
              <p className="text-danger text-xs mt-1">{issues.scope}</p>
            )}
          </div>
        </div>
      )}

      {!isEdit && form.scope === ANNOUNCEMENT_SCOPE.BATCH && (
        <div className="flex items-baseline gap-3 mb-3">
          <label className="text-sm text-text-primary w-24 shrink-0" htmlFor="batchId">
            Batch
          </label>
          <div className="flex-1">
            <select
              id="batchId"
              value={form.batchId}
              onChange={handleChange}
              className="w-full text-sm py-1.5 px-3 bg-surface-elevated text-text-primary rounded-md outline-none"
            >
              <option value="">Select an active batch…</option>
              {(batches?.items ?? []).map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
            {issues.batchId && (
              <p className="text-danger text-xs mt-1">{issues.batchId}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-baseline gap-3 mb-3">
        <label className="text-sm text-text-primary w-24 shrink-0" htmlFor="title">
          Title
        </label>
        <div className="flex-1">
          <input
            id="title"
            value={form.title}
            onChange={handleChange}
            minLength={3}
            maxLength={160}
            placeholder="Batch starts Monday"
            className="w-full text-sm py-1.5 px-3 bg-surface-elevated text-text-primary placeholder:text-text-muted rounded-md outline-none"
          />
          {issues.title && (
            <p className="text-danger text-xs mt-1">{issues.title}</p>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <label className="text-sm text-text-primary w-24 shrink-0" htmlFor="body">
          Message
        </label>
        <div className="flex-1">
          <textarea
            id="body"
            rows={4}
            maxLength={5000}
            value={form.body}
            onChange={handleChange}
            className="w-full text-sm py-2 px-3 bg-surface-elevated text-text-primary rounded-md outline-none"
          />
          {issues.body && (
            <p className="text-danger text-xs mt-1">{issues.body}</p>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <label
          className="text-sm text-text-primary w-24 shrink-0"
          htmlFor="expiresAt"
        >
          Expires
        </label>
        <div className="flex-1">
          <input
            id="expiresAt"
            type="datetime-local"
            value={form.expiresAt}
            onChange={handleChange}
            className="w-full text-sm py-1.5 px-3 bg-surface-elevated text-text-primary rounded-md outline-none [color-scheme:dark]"
          />
          <p className="text-text-muted text-[11px] mt-1">
            Optional. Hidden from learners after this; must be in the future.
          </p>
          {issues.expiresAt && (
            <p className="text-danger text-xs mt-1">{issues.expiresAt}</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-primary mb-3">
        <input
          id="isPinned"
          type="checkbox"
          checked={form.isPinned}
          onChange={handleChange}
          className="accent-accent"
        />
        Pin to the top
      </label>

      {error && !error.details?.length && (
        <p className="text-danger text-xs font-semibold mb-2">
          {getUserMessage(error, "Couldn't save the announcement.")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || needsBatch}
        className="w-full px-4 py-2 bg-accent text-accent-contrast rounded-md font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Saving…" : isEdit ? "Save changes" : "Post announcement"}
      </button>

      {!isEdit && (
        <p className="text-text-muted text-[11px] mt-3">
          Posting notifies the recipients in-app.
        </p>
      )}
    </form>
  );
};

export default AnnouncementForm;
