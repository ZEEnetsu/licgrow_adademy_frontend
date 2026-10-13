import { forwardRef, useId, useRef, useState } from "react";

import {
  Button,
  Field,
  FormActions,
  FormError,
  IconButton,
  Input,
  Modal,
  SegmentedTabs,
  Select,
  fieldIssues,
  humanize,
  useToast,
} from "../../../../components/admin";
import { plural } from "../../../../components/admin/format.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useCreateStaffAdminMutation,
  useCreateSuperAdminMutation,
} from "../../../../app/apis/governance.api.js";
import { useGetRolesQuery } from "../../../../app/apis/rbac.api.js";

/**
 * Provision an administrator — `03-staff-admin.md` §1 / `04-super-admin.md` §2.
 *
 * One dialog for both account types: a staff admin needs a role, a super
 * admin doesn't. It owns the Modal so the dialog stays `busy` while the
 * account is being created.
 *
 * Admin passwords are stricter than learners': 12–128 with a letter, a digit
 * AND a symbol. The rule is checked here so the requirement is visible before
 * submit rather than arriving as a 400.
 *
 * The password is set by the provisioner and delivered out-of-band — an
 * invite-link flow is a planned enhancement, not part of v1.
 */

const KINDS = [
  { value: "staff", label: "Staff admin", icon: "users" },
  { value: "super", label: "Super admin", icon: "shield" },
];

const KIND_HINT = {
  staff: "Runs batches, content and learners, limited to what their role allows.",
  super: "Full control, including other administrators and roles. Give this sparingly.",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[a-z0-9_]{3,30}$/;

const adminPasswordOk = (value) =>
  value.length >= 12 &&
  value.length <= 128 &&
  /[A-Za-z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

/*
 * 03/04 mark these codes user-safe, but apiError.js doesn't list them, so
 * getUserMessage would hide them behind the generic message. They belong to
 * one field each, so they're shown there.
 */
const CODE_FIELD = {
  EMAIL_TAKEN: ["email", "That email is already registered."],
  USERNAME_TAKEN: ["username", "That username is already taken."],
  ROLE_NOT_FOUND: ["roleId", "That role no longer exists. Pick another."],
};

const EMPTY = { fullName: "", email: "", username: "", password: "", roleId: "" };

function validate(form, kind) {
  const errors = {};
  const name = form.fullName.trim();
  if (name.length < 2 || name.length > 120) errors.fullName = "Enter their full name (2–120 characters).";
  if (!EMAIL.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!USERNAME.test(form.username.trim())) errors.username = "Use 3–30 lowercase letters, digits or underscores.";
  if (!adminPasswordOk(form.password)) errors.password = "Use 12–128 characters, with a letter, a digit and a symbol.";
  if (kind === "staff" && !form.roleId) errors.roleId = "Choose what they can do.";
  return errors;
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {'staff'|'super'} [props.defaultKind]  the type selected when it opens
 * @param {() => void} props.onClose
 * @param {(kind: 'staff'|'super') => void} props.onCreated  closes the dialog and shows the new account's list
 */
export default function AdminForm({ open, defaultKind = "staff", onClose, onCreated }) {
  const formId = useId();
  // null = follow `defaultKind` (the tab the dialog was opened from)
  const [kindChoice, setKindChoice] = useState(null);
  const kind = kindChoice ?? defaultKind;

  const [createStaff, staffState] = useCreateStaffAdminMutation();
  const [createSuper, superState] = useCreateSuperAdminMutation();
  const busy = staffState.isLoading || superState.isLoading;

  const reset = () => {
    setKindChoice(null);
    staffState.reset();
    superState.reset();
  };
  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      busy={busy}
      size="md"
      title="Add administrator"
      description="They sign in with this email and password. Share the password with them directly."
      footer={
        <FormActions>
          <Button variant="ghost" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="primary" icon="userPlus" loading={busy}>
            {kind === "staff" ? "Add staff admin" : "Add super admin"}
          </Button>
        </FormActions>
      }
    >
      <AdminFields
        formId={formId}
        kind={kind}
        onKindChange={setKindChoice}
        create={kind === "staff" ? createStaff : createSuper}
        error={(kind === "staff" ? staffState : superState).error}
        onCreated={() => {
          reset();
          onCreated(kind);
        }}
      />
    </Modal>
  );
}

function AdminFields({ formId, kind, onKindChange, create, error, onCreated }) {
  const toast = useToast();
  const formRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [attempted, setAttempted] = useState(false);
  const roles = useGetRolesQuery(undefined, { skip: kind !== "staff" });
  const roleList = roles.data ?? [];
  const selectedRole = roleList.find((role) => role.id === form.roleId);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const clientErrors = attempted ? validate(form, kind) : {};
  const serverIssues = fieldIssues(error);
  const routed = CODE_FIELD[error?.code];
  if (routed) serverIssues[routed[0]] = routed[1];
  const errors = { ...serverIssues, ...clientErrors };
  const formError =
    error && !error.details?.length && !routed
      ? getUserMessage(error, "Couldn't create the account. Please try again.")
      : null;

  const onSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(validate(form, kind)).length > 0) {
      requestAnimationFrame(() => formRef.current?.querySelector("[aria-invalid='true']")?.focus());
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
    };
    if (kind === "staff") payload.roleId = form.roleId;

    try {
      await create(payload).unwrap();
      toast.success(`${payload.fullName} can now sign in`, {
        description:
          kind === "staff"
            ? `Staff admin with the ${humanize(selectedRole?.name)} role. Share their password with them directly.`
            : "Super admin. Share their password with them directly.",
      });
      onCreated();
    } catch {
      // shown in the form: per field, or as the form error
    }
  };

  return (
    <form id={formId} ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-text-primary">Account type</p>
        <SegmentedTabs
          size="sm"
          layoutId="admin-kind"
          ariaLabel="Account type"
          items={KINDS}
          value={kind}
          onChange={onKindChange}
          className="self-start"
        />
        <p className="text-xs text-text-muted">{KIND_HINT[kind]}</p>
      </div>

      <Field label="Full name" required error={errors.fullName}>
        <Input
          value={form.fullName}
          onChange={(event) => set("fullName", event.target.value)}
          maxLength={120}
          autoComplete="off"
          placeholder="Amit Rao"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email" required error={errors.email}>
          <Input
            type="email"
            inputMode="email"
            value={form.email}
            onChange={(event) => set("email", event.target.value)}
            maxLength={255}
            autoComplete="off"
            placeholder="amit@org.in"
          />
        </Field>
        <Field label="Username" required error={errors.username} hint="Lowercase letters, digits and _">
          <Input
            value={form.username}
            onChange={(event) => set("username", event.target.value.toLowerCase())}
            maxLength={30}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="amitr"
          />
        </Field>
      </div>

      <Field
        label="Password"
        required
        error={errors.password}
        hint="12 or more characters, with a letter, a digit and a symbol."
      >
        <PasswordInput value={form.password} onChange={(event) => set("password", event.target.value)} />
      </Field>

      {kind === "staff" && (
        <Field
          label="Role"
          required
          error={errors.roleId}
          hint={selectedRole?.description ?? "What they can do. You can change it later; it applies at their next sign-in."}
        >
          <Select value={form.roleId} onChange={(event) => set("roleId", event.target.value)} disabled={roles.isLoading}>
            <option value="" disabled>
              {roles.isLoading ? "Loading roles…" : "Choose a role…"}
            </option>
            {roleList.map((role) => (
              <option key={role.id} value={role.id}>
                {humanize(role.name)} · {plural(role.permissions.length, "permission")}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <FormError>{formError}</FormError>
    </form>
  );
}

/**
 * A password input with a show/hide toggle. The provisioner has to read the
 * password back to share it, so it can be revealed. `Field` wires the label
 * and aria props onto the input itself.
 */
const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <Input
        ref={ref}
        {...props}
        type={shown ? "text" : "password"}
        autoComplete="new-password"
        maxLength={128}
        spellCheck={false}
        className="pr-12"
      />
      <IconButton
        icon={shown ? "eyeOff" : "eye"}
        label={shown ? "Hide password" : "Show password"}
        size="sm"
        tooltip={false}
        active={shown}
        onClick={() => setShown((value) => !value)}
        className="absolute top-1/2 right-1.5 -translate-y-1/2"
      />
    </div>
  );
});
