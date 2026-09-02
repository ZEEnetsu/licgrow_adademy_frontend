import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

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
    <div className="px-5 lg:px-10 py-5 w-full">
      <h1 className="text-4xl font-semibold text-zinc-200">Sign in</h1>
      <p className="text-zinc-500 text-[15px] mt-3">
        Access your dashboard, track progress, take mock tests and join live
        webinars.
      </p>

      <div
        className="flex gap-1 mt-5 p-1 bg-black/30 rounded-lg"
        role="tablist"
        aria-label="Account type"
      >
        {ACTOR_TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            role="tab"
            aria-selected={actor === tab.type}
            onClick={() => setActor(tab.type)}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
              actor === tab.type
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="identifier" className="text-zinc-300 text-sm">
            Email or username
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            value={form.identifier}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={Boolean(fieldIssues.identifier)}
            className="px-4 py-3 bg-black/30 outline-none rounded-md text-zinc-200 focus:ring-1 focus:ring-green-600 disabled:opacity-50"
          />
          {fieldIssues.identifier && (
            <p className="text-red-400 text-xs">{fieldIssues.identifier}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label htmlFor="password" className="text-zinc-300 text-sm">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={Boolean(fieldIssues.password)}
            className="px-4 py-3 bg-black/30 outline-none rounded-md text-zinc-200 focus:ring-1 focus:ring-green-600 disabled:opacity-50"
          />
          {fieldIssues.password && (
            <p className="text-red-400 text-xs">{fieldIssues.password}</p>
          )}
        </div>

        {localIssue && !error && (
          <p className="text-amber-400/90 text-xs mt-3">{localIssue}</p>
        )}

        {error && (
          <div className="mt-3 rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2">
            <p className="text-red-400 text-xs font-semibold">
              {getUserMessage(error, "Couldn't sign you in.")}
            </p>
          </div>
        )}

        {locked && (
          <p className="text-amber-400 text-xs mt-3">
            Too many attempts. Try again in {secondsRemaining}s.
          </p>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="mt-5 px-6 py-3 w-full rounded-md bg-green-900 hover:bg-green-700 text-zinc-100 font-medium cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
