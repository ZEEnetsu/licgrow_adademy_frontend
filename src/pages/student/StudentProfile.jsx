import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  useChangePasswordMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "../../app/apis/learner.api.js";
import { useGetMyEnrollmentsQuery } from "../../app/apis/enrollment.api.js";
import { getUserMessage } from "../../app/apis/apiError.js";

/**
 * Learner profile — `api-contracts/02-learner.md` §2–4, plus the learner's own
 * enrollment history from 07 §2.
 *
 * The four fields in the second group are what 07 §1 requires before an
 * enrollment request will be accepted. `profile.isComplete` comes from the
 * server, so this page shows the gate rather than re-deriving it.
 */

const STATUS_TONE = {
  approved: "text-success",
  pending: "text-warning",
  rejected: "text-danger",
};

const StudentProfile = () => {
  const { data: me, isLoading, isError, error } = useGetMyProfileQuery();
  const { data: enrollments } = useGetMyEnrollmentsQuery();

  const [updateProfile, updateState] = useUpdateMyProfileMutation();
  const [changePassword, passwordState] = useChangePasswordMutation();

  const [form, setForm] = useState(null);
  const [syncedFrom, setSyncedFrom] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  /*
   * Seed the form from the server, during render rather than in an effect.
   * Keyed on the fetched object's identity, so a successful save (which
   * returns fresh, normalized data) re-seeds — while ordinary re-renders
   * leave the user's in-progress typing alone.
   */
  if (me && syncedFrom !== me) {
    setSyncedFrom(me);
    setForm({
      fullName: me.fullName ?? "",
      phone: me.phone ?? "",
      licAgentCode: me.profile?.licAgentCode ?? "",
      dob: me.profile?.dob ?? "",
      city: me.profile?.city ?? "",
      experienceYears:
        me.profile?.experienceYears === null ||
        me.profile?.experienceYears === undefined
          ? ""
          : String(me.profile.experienceYears),
    });
  }

  if (isLoading || !form) {
    return <p className="text-text-muted text-sm">Loading your profile…</p>;
  }

  if (isError) {
    return (
      <p className="text-danger text-sm">
        Couldn&apos;t load your profile — {getUserMessage(error)}
      </p>
    );
  }

  const handleChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.id]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault();

    // send null rather than "" so clearing a field really clears it
    const value = (raw) => (raw.trim() === "" ? null : raw.trim());

    const payload = {
      fullName: form.fullName.trim(),
      phone: value(form.phone),
      licAgentCode: value(form.licAgentCode),
      dob: value(form.dob),
      city: value(form.city),
      experienceYears:
        form.experienceYears === "" ? null : Number(form.experienceYears),
    };

    try {
      await updateProfile(payload).unwrap();
    } catch {
      // surfaced below
    }
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    try {
      await changePassword(passwords).unwrap();
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch {
      // surfaced below
    }
  };

  const issues = Object.fromEntries(
    (updateState.error?.details ?? []).map((d) => [d.field, d.issue]),
  );
  const passwordIssues = Object.fromEntries(
    (passwordState.error?.details ?? []).map((d) => [d.field, d.issue]),
  );

  const complete = me.profile?.isComplete;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Your profile</h1>

      <div
        className={`mt-4 rounded-md border px-4 py-3 ${
          complete
            ? "bg-success-muted border-success/40"
            : "bg-warning-muted border-warning/40"
        }`}
      >
        <p
          className={`text-xs font-semibold ${
            complete ? "text-success" : "text-warning"
          }`}
        >
          {complete
            ? "Profile complete — you can request a batch."
            : "Complete the four fields below to request a batch."}
        </p>
        {complete && (
          <NavLink
            to="/student/browse"
            className="text-[11px] text-accent hover:underline mt-1 inline-block"
          >
            Browse batches open for enrollment →
          </NavLink>
        )}
      </div>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-wide text-text-muted">
          Account
        </p>
        <Field id="fullName" label="Full name" value={form.fullName} onChange={handleChange} issue={issues.fullName} />
        <Field id="phone" label="Phone" value={form.phone} onChange={handleChange} issue={issues.phone} hint="E.164, e.g. +919812345678" />

        <div className="text-xs text-text-muted">
          {me.email}
          {me.username ? ` · ${me.username}` : ""} — email and username
          can&apos;t be changed here.
        </div>

        <p className="text-xs uppercase tracking-wide text-text-muted mt-4">
          Required to enroll
        </p>
        <Field id="licAgentCode" label="LIC agent code" value={form.licAgentCode} onChange={handleChange} issue={issues.licAgentCode} />
        <Field id="dob" label="Date of birth" type="date" value={form.dob} onChange={handleChange} issue={issues.dob} hint="You must be 18 or older" />
        <Field id="city" label="City" value={form.city} onChange={handleChange} issue={issues.city} />
        <Field id="experienceYears" label="Years of experience" type="number" min={0} max={60} value={form.experienceYears} onChange={handleChange} issue={issues.experienceYears} />

        {updateState.error && !updateState.error.details?.length && (
          <p className="text-danger text-xs font-semibold">
            {getUserMessage(updateState.error, "Couldn't save your profile.")}
          </p>
        )}
        {updateState.isSuccess && (
          <p className="text-success text-xs font-semibold">Profile saved.</p>
        )}

        <button
          type="submit"
          disabled={updateState.isLoading}
          className="self-start px-5 py-2 rounded-md bg-accent/20 text-accent font-medium text-sm hover:bg-accent/30 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {updateState.isLoading ? "Saving…" : "Save profile"}
        </button>
      </form>

      {enrollments?.items?.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            My requests
          </h2>
          <div className="flex flex-col gap-2 mt-3">
            {enrollments.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border-muted p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-text-primary">{item.batchName}</p>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      STATUS_TONE[item.status] ?? "text-text-muted"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                {item.reviewNote && (
                  <p className="text-[11px] text-text-muted mt-1">
                    Reviewer note: {item.reviewNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Change password
        </h2>
        <form onSubmit={handlePassword} className="mt-3 flex flex-col gap-3 max-w-sm">
          <Field
            id="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <Field
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
            issue={passwordIssues.newPassword}
            hint="8+ characters, letters and digits"
          />

          {passwordState.error && (
            <p className="text-danger text-xs font-semibold">
              {getUserMessage(passwordState.error, "Couldn't change your password.")}
            </p>
          )}
          {passwordState.isSuccess && (
            <p className="text-success text-xs font-semibold">
              Password changed.
            </p>
          )}

          <button
            type="submit"
            disabled={passwordState.isLoading}
            className="self-start px-5 py-2 rounded-md bg-surface hover:bg-surface-hover text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {passwordState.isLoading ? "Changing…" : "Change password"}
          </button>
        </form>
      </section>
    </div>
  );
};

const Field = ({ id, label, issue, hint, ...inputProps }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-text-muted text-sm">
      {label}
    </label>
    <input
      id={id}
      className="px-4 py-2 bg-surface rounded-md outline-none text-text-primary focus:ring-1 focus:ring-accent [color-scheme:dark]"
      {...inputProps}
    />
    {issue ? (
      <p className="text-danger text-xs">{issue}</p>
    ) : (
      hint && <p className="text-text-muted text-[11px] opacity-70">{hint}</p>
    )}
  </div>
);

export default StudentProfile;
