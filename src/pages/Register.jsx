import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ShieldMark from "../components/ShieldMark.jsx";
import { useRegisterMutation } from "../app/apis/learner.api.js";
import { getUserMessage } from "../app/apis/apiError.js";
import { selectIsAuthenticated } from "../app/features/auth/auth.selectors.js";

/**
 * Learner registration — `api-contracts/02-learner.md` §1.
 *
 * Returns tokens, so the learner is signed in immediately. The account starts
 * `active` but has no batch access until an enrollment is approved, and the
 * profile still needs the four enrollment fields — so success routes straight
 * to profile completion rather than to an empty dashboard.
 */
const Register = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    username: "",
    phone: "",
  });

  const [register, { isLoading, error }] = useRegisterMutation();

  useEffect(() => {
    if (isAuthenticated) navigate("/student/profile", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.id]: event.target.value }));

  // mirrors 02 §1: 8–128 chars, letters AND digits
  const passwordWeak =
    form.password.length > 0 &&
    !(
      form.password.length >= 8 &&
      /[A-Za-z]/.test(form.password) &&
      /\d/.test(form.password)
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (passwordWeak) return;

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    if (form.username.trim()) payload.username = form.username.trim();
    if (form.phone.trim()) payload.phone = form.phone.trim();

    try {
      await register(payload).unwrap();
    } catch {
      // surfaced below
    }
  };

  const issues = Object.fromEntries(
    (error?.details ?? []).map((detail) => [detail.field, detail.issue]),
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-black/95 to-green-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <ShieldMark />
          <NavLink to="/" className="text-sm text-zinc-400 hover:text-zinc-200">
            <span>{"<"}</span> back home
          </NavLink>
        </div>

        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="text-zinc-500 text-sm mt-2">
          Free to start. You&apos;ll complete your profile next, then request a
          batch.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <Field
            id="fullName"
            label="Full name"
            value={form.fullName}
            onChange={handleChange}
            issue={issues.fullName}
            autoComplete="name"
            required
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            issue={issues.email}
            autoComplete="email"
            required
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
                ? "At least 8 characters, with letters and digits."
                : undefined)
            }
            hint="8+ characters, letters and digits"
            autoComplete="new-password"
            required
          />
          <Field
            id="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            issue={issues.username}
            hint="optional — lowercase letters, digits, underscore"
            autoComplete="username"
          />
          <Field
            id="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
            issue={issues.phone}
            hint="optional — e.g. +919812345678"
            autoComplete="tel"
          />

          {error && !error.details?.length && (
            <div className="rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2">
              <p className="text-red-400 text-xs font-semibold">
                {getUserMessage(error, "Couldn't create your account.")}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || passwordWeak}
            className="mt-2 px-6 py-3 w-full rounded-md bg-green-900 hover:bg-green-700 text-zinc-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="text-zinc-500 text-sm mt-6 text-center">
          Already have an account?{" "}
          <NavLink to="/login" className="text-accent hover:underline">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
};

const Field = ({ id, label, issue, hint, ...inputProps }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-zinc-300 text-sm">
      {label}
    </label>
    <input
      id={id}
      className="px-4 py-2.5 bg-black/30 outline-none rounded-md text-zinc-200 focus:ring-1 focus:ring-green-600"
      {...inputProps}
    />
    {issue ? (
      <p className="text-red-400 text-xs">{issue}</p>
    ) : (
      hint && <p className="text-zinc-600 text-[11px]">{hint}</p>
    )}
  </div>
);

export default Register;
