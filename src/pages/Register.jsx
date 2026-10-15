import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import AuthShell from "../components/auth/AuthShell.jsx";
import AuthField, { AuthNotice, AuthSubmit } from "../components/auth/AuthField.jsx";
import LoginCard from "../components/LoginCard.jsx";
import { PORTAL_CARDS } from "../components/auth/portalCards.js";
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
    <AuthShell
      title="Create your account · licgrow"
      headline="Get Started with Us"
      highlight="Started"
      sub="Free to start. You'll complete your profile next, then request a batch."
      note="IC-38 · IRDAI exam prep"
      wide
      cards={PORTAL_CARDS.map((card, i) => (
        <LoginCard key={card.id} index={i} title={card.title} des={card.des} icon={card.icon} motif={card.motif} />
      ))}
    >
      <div className="rounded-[28px] bg-white p-7 shadow-lift ring-1 ring-ink/[0.06] sm:p-9 short:p-7 tiny:p-6">
        <h1 className="h-display text-[2.25rem] font-extrabold text-ink short:text-[2rem]">Create your account</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-plum">
          Free to start. You&apos;ll complete your profile next, then request a
          batch.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5 short:mt-5 short:gap-4" noValidate>
          <div className="grid gap-5 sm:grid-cols-2 short:gap-4">
            <AuthField
              id="fullName"
              label="Full name"
              value={form.fullName}
              onChange={handleChange}
              issue={issues.fullName}
              autoComplete="name"
              required
            />
            <AuthField
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              issue={issues.email}
              autoComplete="email"
              required
            />
          </div>
          <AuthField
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
          <div className="grid gap-5 sm:grid-cols-2 short:gap-4">
            <AuthField
              id="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              issue={issues.username}
              hint="optional — lowercase letters, digits, underscore"
              autoComplete="username"
            />
            <AuthField
              id="phone"
              label="Phone"
              value={form.phone}
              onChange={handleChange}
              issue={issues.phone}
              hint="optional — e.g. +919812345678"
              autoComplete="tel"
            />
          </div>

          {error && !error.details?.length && (
            <AuthNotice tone="error">{getUserMessage(error, "Couldn't create your account.")}</AuthNotice>
          )}

          <AuthSubmit busy={isLoading} disabled={isLoading || passwordWeak}>
            {isLoading ? "Creating…" : "Create account"}
          </AuthSubmit>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-plum short:mt-4">
        Already have an account?{" "}
        <NavLink to="/login" className="font-semibold text-ember-deep hover:underline">
          Sign in
        </NavLink>
      </p>
    </AuthShell>
  );
};

export default Register;
