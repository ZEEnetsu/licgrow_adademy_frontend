import { useId, useRef, useState } from "react";

import {
  Button,
  Checkbox,
  DateInput,
  EntityCombobox,
  Field,
  FormActions,
  FormError,
  Input,
  Modal,
  SegmentedTabs,
  StatusBadge,
  Textarea,
  fieldIssues,
  useToast,
} from "../../../../components/admin";
import { plural } from "../../../../components/admin/format.js";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  ANNOUNCEMENT_SCOPE,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from "../../../../app/apis/announcement.api.js";
import { BATCH_STATUS, useGetBatchesQuery } from "../../../../app/apis/batches.api.js";

/**
 * Compose or edit an announcement — `11-announcement.md` §1 / §4.
 *
 * One component for both: `announcement` set means edit. It owns the Modal,
 * so the dialog can stay `busy` (no Escape, no backdrop close) while a save
 * is in flight.
 *
 * Scope is chosen at creation and fixed thereafter: §4 permits editing only
 * title, body, isPinned and expiresAt. The edit form shows the audience as a
 * badge rather than disabled controls that imply it might change.
 */

const TITLE_MAX = 160;
const BODY_MAX = 5000;

const SCOPES = [
  { value: ANNOUNCEMENT_SCOPE.BATCH, label: "One batch", icon: "layers" },
  { value: ANNOUNCEMENT_SCOPE.GLOBAL, label: "Everyone", icon: "globe" },
];

const SCOPE_HINT = {
  [ANNOUNCEMENT_SCOPE.BATCH]: "Only that batch's active members see it, and they're notified in-app.",
  [ANNOUNCEMENT_SCOPE.GLOBAL]: "Every learner sees it in their feed.",
};

const pad = (n) => String(n).padStart(2, "0");

/** A timestamp as the local "YYYY-MM-DD" a date input holds. */
const toDateValue = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** "YYYY-MM-DD" → the END of that local day, so "expires 3 Mar" still shows all of 3 Mar. */
const endOfDayIso = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
};

const initialForm = (announcement) => ({
  title: announcement?.title ?? "",
  body: announcement?.body ?? "",
  scope: announcement?.scope ?? ANNOUNCEMENT_SCOPE.BATCH,
  batch: null,
  isPinned: announcement?.isPinned ?? false,
  expires: toDateValue(announcement?.expiresAt),
});

/** The obvious checks, so they don't arrive as a 400 after submit. */
function validate(form, { isEdit, today, initialExpires }) {
  const errors = {};
  if (form.title.trim().length < 3) errors.title = "Give it a title of at least 3 characters.";
  if (!form.body.trim()) errors.body = "Write the message learners will read.";
  if (!isEdit && form.scope === ANNOUNCEMENT_SCOPE.BATCH && !form.batch) errors.batchId = "Pick the batch to post to.";
  // "YYYY-MM-DD" strings compare in date order; an unchanged past expiry on
  // an old announcement is left alone
  if (form.expires && form.expires !== initialExpires && form.expires < today) {
    errors.expiresAt = "Pick today or a later date.";
  }
  return errors;
}

/** Who sees it: the "Everyone" badge, or the batch's name. */
export function ScopeBadge({ announcement, size }) {
  if (announcement.scope === ANNOUNCEMENT_SCOPE.GLOBAL) return <StatusBadge status="global" size={size} />;
  return (
    <StatusBadge
      status="batch"
      tone="neutral"
      icon="layers"
      size={size}
      className="max-w-full"
      label={<span className="min-w-0 truncate">{announcement.batchName ?? "One batch"}</span>}
    />
  );
}

export default function AnnouncementForm({ open, announcement, onClose }) {
  const isEdit = Boolean(announcement);
  const formId = useId();
  const [create, createState] = useCreateAnnouncementMutation();
  const [update, updateState] = useUpdateAnnouncementMutation();
  const { isLoading, error } = isEdit ? updateState : createState;

  const close = () => {
    createState.reset();
    updateState.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      busy={isLoading}
      size="md"
      title={isEdit ? "Edit announcement" : "New announcement"}
      description={
        isEdit ? "Changes show up for learners straight away." : "Post to one batch, or to every learner at once."
      }
      footer={
        <FormActions>
          <Button variant="ghost" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="primary" icon={isEdit ? "check" : "send"} loading={isLoading}>
            {isEdit ? "Save changes" : "Post announcement"}
          </Button>
        </FormActions>
      }
    >
      <AnnouncementFields
        key={announcement?.id ?? "new"}
        formId={formId}
        announcement={announcement}
        error={error}
        create={create}
        update={update}
        onSaved={close}
      />
    </Modal>
  );
}

function AnnouncementFields({ formId, announcement, error, create, update, onSaved }) {
  const isEdit = Boolean(announcement);
  const toast = useToast();
  const formRef = useRef(null);
  const [today] = useState(() => toDateValue(new Date()));
  const [form, setForm] = useState(() => initialForm(announcement));
  const [attempted, setAttempted] = useState(false);
  const initialExpires = toDateValue(announcement?.expiresAt);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // the batch picker: active batches only, searched on the server
  const [batchSearch, setBatchSearch] = useState("");
  const q = useDebouncedValue(batchSearch.trim(), 250);
  const batches = useGetBatchesQuery(
    { status: BATCH_STATUS.ACTIVE, limit: 20, ...(q.length >= 2 && { q }) },
    { skip: isEdit || form.scope !== ANNOUNCEMENT_SCOPE.BATCH },
  );

  const clientErrors = attempted ? validate(form, { isEdit, today, initialExpires }) : {};
  const serverIssues = fieldIssues(error);
  if (error?.code === "NOT_FOUND" && !isEdit) serverIssues.batchId = "That batch no longer exists. Pick another.";
  const errors = { ...serverIssues, ...clientErrors };
  const formError =
    error && !error.details?.length && !serverIssues.batchId
      ? getUserMessage(error, "Couldn't save the announcement. Please try again.")
      : null;

  const onSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(validate(form, { isEdit, today, initialExpires })).length > 0) {
      // once the errors have rendered, take the user to the first one
      requestAnimationFrame(() => formRef.current?.querySelector("[aria-invalid='true']")?.focus());
      return;
    }

    const title = form.title.trim();
    const body = form.body.trim();

    try {
      if (isEdit) {
        // send only what changed; an untouched expiry keeps its exact time
        const patch = {};
        if (title !== announcement.title) patch.title = title;
        if (body !== announcement.body) patch.body = body;
        if (form.isPinned !== announcement.isPinned) patch.isPinned = form.isPinned;
        if (form.expires !== initialExpires) patch.expiresAt = form.expires ? endOfDayIso(form.expires) : null;
        if (Object.keys(patch).length > 0) {
          await update({ id: announcement.id, ...patch }).unwrap();
          toast.success(`“${title}” is updated`);
        }
      } else {
        // exactly the documented shape: batchId only when scope=batch
        const payload = { scope: form.scope, title, body, isPinned: form.isPinned };
        if (form.scope === ANNOUNCEMENT_SCOPE.BATCH) payload.batchId = form.batch.id;
        if (form.expires) payload.expiresAt = endOfDayIso(form.expires);
        await create(payload).unwrap();
        toast.success(`“${title}” is posted`, {
          description:
            form.scope === ANNOUNCEMENT_SCOPE.GLOBAL
              ? "Every learner can see it now."
              : `Members of ${form.batch.name} have been notified.`,
        });
      }
      onSaved();
    } catch {
      // shown in the form: per field, or as the form error
    }
  };

  return (
    <form id={formId} ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Title" required error={errors.title}>
        <Input
          value={form.title}
          onChange={(event) => set("title", event.target.value)}
          maxLength={TITLE_MAX}
          placeholder="Batch starts Monday"
          autoComplete="off"
        />
      </Field>

      <Field
        label="Message"
        required
        error={errors.body}
        hint={`${form.body.length.toLocaleString("en-IN")} / ${BODY_MAX.toLocaleString("en-IN")} characters`}
      >
        <Textarea
          rows={5}
          value={form.body}
          onChange={(event) => set("body", event.target.value)}
          maxLength={BODY_MAX}
          placeholder="What do learners need to know?"
        />
      </Field>

      {isEdit ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-text-primary">Audience</p>
          <div className="flex min-w-0">
            <ScopeBadge announcement={announcement} />
          </div>
          <p className="text-xs text-text-muted">The audience is fixed once an announcement is posted.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-text-primary">Audience</p>
            <SegmentedTabs
              size="sm"
              layoutId="announcement-scope"
              ariaLabel="Audience"
              items={SCOPES}
              value={form.scope}
              onChange={(value) => set("scope", value)}
              className="self-start"
            />
            <p className="text-xs text-text-muted">{SCOPE_HINT[form.scope]}</p>
          </div>

          {form.scope === ANNOUNCEMENT_SCOPE.BATCH && (
            <Field label="Batch" required error={errors.batchId} hint="Only active batches can be posted to.">
              <EntityCombobox
                items={batches.data?.items}
                isFetching={batches.isFetching}
                search={batchSearch}
                onSearchChange={setBatchSearch}
                value={form.batch}
                onChange={(batch) => set("batch", batch)}
                getLabel={(batch) => batch.name}
                getDescription={(batch) => plural(batch.counts?.members ?? 0, "member")}
                placeholder="Search active batches…"
                emptyText={q.length >= 2 ? "No active batch matches" : "No active batches yet"}
              />
            </Field>
          )}
        </>
      )}

      <Field
        label="Expires"
        optional
        error={errors.expiresAt}
        hint="Learners stop seeing it after this day. Leave it empty to keep it up."
      >
        <DateInput min={today} value={form.expires} onChange={(event) => set("expires", event.target.value)} />
      </Field>

      <Checkbox
        label="Pin to the top"
        description="Pinned announcements sit above the rest, for admins and learners."
        checked={form.isPinned}
        onChange={(event) => set("isPinned", event.target.checked)}
      />

      <FormError>{formError}</FormError>
    </form>
  );
}
