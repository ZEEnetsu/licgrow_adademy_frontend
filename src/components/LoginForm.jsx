import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

import {
  useLoginLearnerMutation,
  useLoginStaffAdminMutation,
  useLoginSuperAdminMutation,
} from "../app/apis/auth.api.js";
import { getUserMessage } from "../app/apis/apiError.js";
import { ACTOR } from "../app/features/auth/permissions.js";
import {
  selectIsAuthenticated,
  selectActorType,
} from "../app/features/auth/auth.selectors.js";
import { useIsLockedOut } from "../app/features/auth/useAuth.js";
import AuthField, { AuthNotice, AuthSubmit } from "./auth/AuthField.jsx";
import Icon from "./ui/Icon.jsx";

/**
 * Sign in — `api-contracts/01-auth.md` §1–3.
 *
 * All three actors share one request shape (`{ identifier, password }`) and
 * differ only by endpoint, so a single form serves them. A production split
 * would more likely put staff on their own route; this keeps one entry point
 * while the admin dashboard is the only built surface.
 */

const ACTOR_TABS = [
  { type: ACTOR.STAFF_ADMIN, label: "Staff admin" },
  { type: ACTOR.SUPER_ADMIN, label: "Super admin" },
  { type: ACTOR.LEARNER, label: "Learner" },
];

/** Where each actor lands when there's no usable `from` to return to. */
const HOME_FOR = {
  [ACTOR.STAFF_ADMIN]: "/admin/overview",
  [ACTOR.SUPER_ADMIN]: "/admin/overview",
  [ACTOR.LEARNER]: "/student",
};

/** Which path prefix each actor is allowed into, mirroring the route guards. */
const AREA_FOR = {
  [ACTOR.STAFF_ADMIN]: "/admin",
  [ACTOR.SUPER_ADMIN]: "/admin",
  [ACTOR.LEARNER]: "/student",
};

/**
 * Where to send someone after a successful sign-in.
 *
 * `from` is only honoured when this actor can actually reach it. A learner
 * bounced off /admin would otherwise be sent straight back to /admin, bounced
 * again, and ping-pong between the guard and this form forever.
 */
function destinationFor(actorType, from) {
  const home = HOME_FOR[actorType] ?? "/";
  if (!from) return home;

  const area = AREA_FOR[actorType];
  return area && from.startsWith(area) ? from : home;
}

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [actor, setActor] = useState(ACTOR.STAFF_ADMIN);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [touched, setTouched] = useState(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const actorType = useSelector(selectActorType);
  const { locked, secondsRemaining } = useIsLockedOut();

  const [loginLearner, learnerState] = useLoginLearnerMutation();
  const [loginStaffAdmin, staffState] = useLoginStaffAdminMutation();
  const [loginSuperAdmin, opsState] = useLoginSuperAdminMutation();

  const { trigger, state } = useMemo(
    () =>
      ({
        [ACTOR.LEARNER]: { trigger: loginLearner, state: learnerState },
        [ACTOR.STAFF_ADMIN]: { trigger: loginStaffAdmin, state: staffState },
        [ACTOR.SUPER_ADMIN]: { trigger: loginSuperAdmin, state: opsState },
      })[actor],
    [actor, loginLearner, loginStaffAdmin, loginSuperAdmin, learnerState, staffState, opsState],
  );

  const { isLoading, error } = state;

  /*
   * Navigate only once the session is fully established. Redirecting straight
   * after `unwrap()` would race the /auth/me follow-up that populates
   * permissions, and RequireAuth would bounce us back here.
   */
  // read once into a primitive: depending on `location.state` itself would put
  // an object identity in the dep array and re-fire this effect every render
  const from = location.state?.from?.pathname ?? null;

  useEffect(() => {
    if (!isAuthenticated || !actorType) return;
    navigate(destinationFor(actorType, from), { replace: true });
  }, [isAuthenticated, actorType, from, navigate]);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // mirrors the server rules so the obvious cases don't burn a rate-limit slot
  const localIssue = (() => {
    if (!touched) return null;
    if (form.identifier.trim().length < 3) return "Enter your email or username.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    return null;
  })();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);

    if (form.identifier.trim().length < 3 || form.password.length < 8) return;
    if (locked) return;

    try {
      await trigger({
        identifier: form.identifier.trim(),
        password: form.password,
      }).unwrap();
    } catch {
      // rendered from `error` below
    }
  };

  const fieldIssues = Object.fromEntries(
    (error?.details ?? []).map((detail) => [detail.field, detail.issue]),
  );

  const disabled = isLoading || locked;

  return (
    <div className="w-full">
      <h1 className="h-display text-[2.25rem] font-extrabold text-ink short:text-[2rem]">Sign in</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-plum">
        Access your dashboard, track progress, take mock tests and join live
        webinars.
      </p>

      <div
        className="mt-6 flex gap-1 rounded-2xl bg-sand p-1 ring-1 ring-ink/[0.05] short:mt-4"
        role="tablist"
        aria-label="Account type"
      >
        {ACTOR_TABS.map((tab) => {
          const on = actor === tab.type;
          return (
            <button
              key={tab.type}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActor(tab.type)}
              className={`relative flex-1 rounded-xl py-2.5 text-[13px] short:py-2 font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ember ${
                on ? "text-cream" : "text-plum hover:text-ink"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="actor-pill"
                  className="absolute inset-0 rounded-xl bg-ink shadow-navy-glow"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 short:mt-5 short:space-y-4" noValidate>
        <AuthField
          id="identifier"
          name="identifier"
          label="Email or username"
          type="text"
          autoComplete="username"
          value={form.identifier}
          onChange={handleChange}
          disabled={disabled}
          issue={fieldIssues.identifier}
        />

        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          disabled={disabled}
          issue={fieldIssues.password}
        />

        {localIssue && !error && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ember-deep">
            <Icon name="info" className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
            {localIssue}
          </p>
        )}

        {error && (
          <AuthNotice tone="error">{getUserMessage(error, "Couldn't sign you in.")}</AuthNotice>
        )}

        {locked && (
          <AuthNotice tone="warn" icon="clock">
            Too many attempts. Try again in {secondsRemaining}s.
          </AuthNotice>
        )}

        <AuthSubmit busy={isLoading} disabled={disabled}>
          {isLoading ? "Signing in…" : "Sign in"}
        </AuthSubmit>
      </form>
    </div>
  );
};

export default LoginForm;
