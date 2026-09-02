import { useState } from "react";

import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useCreateStaffAdminMutation,
  useCreateSuperAdminMutation,
} from "../../../../app/apis/governance.api.js";
import { useGetRolesQuery } from "../../../../app/apis/rbac.api.js";

/**
 * Provision an administrator — `03-staff-admin.md` §1 / `04-super-admin.md` §2.
 *
 * Admin passwords are stricter than learners': 12–128 with a letter, a digit
 * AND a symbol. The rule is checked here so the requirement is visible while
 * typing rather than arriving as a 400 after submit.
 *
 * The password is set by the provisioner and delivered out-of-band — an
 * invite-link flow is a planned enhancement, not part of v1.
 */

const adminPasswordOk = (value) =>
  value.length >= 12 &&
  value.length <= 128 &&
  /[A-Za-z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

const AdminForm = ({ kind, onClose }) => {
  const isStaff = kind === "staff";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    roleId: "",
  });

  const { data: roles } = useGetRolesQuery(undefined, { skip: !isStaff });
  const [createStaff, staffState] = useCreateStaffAdminMutation();
  const [createSuper, superState] = useCreateSuperAdminMutation();
  const { isLoading, error } = isStaff ? staffState : superState;

  const handleChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.id]: event.target.value }));

  const passwordWeak = form.password.length > 0 && !adminPasswordOk(form.password);
  const incomplete =
    !form.fullName ||
    !form.email ||
    !form.username ||
    !adminPasswordOk(form.password) ||
    (isStaff && !form.roleId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (incomplete) return;

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
    };
    if (isStaff) payload.roleId = form.roleId;

    try {
      if (isStaff) await createStaff(payload).unwrap();
      else await createSuper(payload).unwrap();
      onClose?.();
    } catch {
      // surfaced below
    }
  };

  const issues = Object.fromEntries(
    (error?.details ?? []).map((detail) => [detail.field, detail.issue]),
  );

  return (
    <form onSubmit={handleSubmit} className="min-w-104">
      <div className="flex flex-col gap-3">
        <Field
          id="fullName"
          label="Full name"
          value={form.fullName}
          onChange={handleChange}
          issue={issues.fullName}
          autoComplete="name"
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          issue={issues.email}
          autoComplete="email"
        />
        <Field
          id="username"
          label="Username"
          value={form.username}
          onChange={handleChange}
          issue={issues.username}
          hint="lowercase letters, digits and underscore"
          autoComplete="off"
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          issue={
            issues.password ??
            (passwordWeak
              ? "12-128 characters, with a letter, a digit and a symbol"
              : undefined)
          }
          hint="12+ characters, with a letter, a digit and a symbol"
          autoComplete="new-password"
        />

        {isStaff && (
          <div className="flex items-baseline gap-3">
            <label className="text-sm text-text-primary w-24 shrink-0" htmlFor="roleId">
              Role
            </label>
            <div className="flex-1">
              <select
                id="roleId"
                value={form.roleId}
                onChange={handleChange}
                className="w-full text-sm py-1.5 px-3 bg-surface-elevated text-text-primary rounded-md outline-none"
              >
                <option value="">Select a role…</option>
                {(roles ?? []).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} — {role.permissions.length} permissions
                  </option>
                ))}
              </select>
              {issues.roleId && (
                <p className="text-danger text-xs mt-1">{issues.roleId}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && !error.details?.length && (
        <p className="mt-3 text-danger text-xs font-semibold">
          {getUserMessage(error, "Couldn't create the account.")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || incomplete}
        className="mt-4 w-full px-4 py-2 bg-accent text-accent-contrast rounded-md font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creating…" : "Create account"}
      </button>

      <p className="text-text-muted text-[11px] mt-3">
        Share the password out of band. There is no invite-link flow in v1.
        {isStaff && " A role change takes effect on their next login."}
      </p>
    </form>
  );
};

const Field = ({ id, label, issue, hint, ...inputProps }) => (
  <div className="flex items-baseline gap-3">
    <label className="text-sm text-text-primary w-24 shrink-0" htmlFor={id}>
      {label}
    </label>
    <div className="flex-1">
      <input
        id={id}
        className="w-full text-sm py-1.5 px-3 bg-surface-elevated text-text-primary placeholder:text-text-muted rounded-md outline-none"
        {...inputProps}
      />
      {issue ? (
        <p className="text-danger text-xs mt-1">{issue}</p>
      ) : (
        hint && <p className="text-text-muted text-[11px] mt-1">{hint}</p>
      )}
    </div>
  </div>
);

export default AdminForm;
