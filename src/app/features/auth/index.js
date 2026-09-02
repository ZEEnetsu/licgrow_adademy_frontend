/**
 * Auth + RBAC public surface.
 *
 * Import from here rather than reaching into individual modules:
 *   import { useAuth, usePermission, PERMISSIONS } from "../../app/features/auth";
 *
 * Built against api-contracts/01-auth.md and 05-rbac.md.
 *
 * ── Quick start ────────────────────────────────────────────────────────────
 *
 * 1. Rehydrate once, high in the tree:
 *      const { isBootstrapped } = useAuthBootstrap();
 *      if (!isBootstrapped) return <Splash />;
 *
 * 2. Log in (three actors, same body `{ identifier, password }`):
 *      const [login, { isLoading }] = useLoginStaffAdminMutation();
 *      await login({ identifier, password }).unwrap();
 *
 * 3. Guard routes:
 *      <RequireAuth actor={ACTOR.STAFF_ADMIN} />
 *      <RequirePermission perm={PERMISSIONS.TEST_AUTHOR} />
 *
 * 4. Gate controls:
 *      <Can perm={PERMISSIONS.BATCH_MANAGE}><Btn … /></Can>
 */

// ── state ──────────────────────────────────────────────────────────────────
export { default as authReducer } from "./auth.slice.js";
export {
  AUTH_STATUS,
  LOGOUT_REASON,
  bootstrapStarted,
  sessionEstablished,
  sessionCleared,
  authErrored,
  errorCleared,
  rateLimited,
  lockoutCleared,
} from "./auth.slice.js";

export {
  bootstrapAuth,
  logout,
  syncLogoutFromOtherTab,
} from "./auth.thunks.js";

// ── selectors ──────────────────────────────────────────────────────────────
export * from "./auth.selectors.js";

// ── vocabulary ─────────────────────────────────────────────────────────────
export {
  ACTOR,
  PERMISSIONS,
  PERMISSION_LIST,
  SYSTEM_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  expandPermissions,
  checkPermission,
  checkExpanded,
  isKnownPermission,
} from "./permissions.js";

// ── hooks ──────────────────────────────────────────────────────────────────
export { useAuth, useAuthBootstrap, useIsLockedOut } from "./useAuth.js";
export {
  usePermission,
  useCan,
  useEffectivePermissions,
  useActorType,
} from "./usePermission.js";

// ── storage (exported for tests and for swapping the strategy) ─────────────
export { default as tokenStorage } from "./tokenStorage.js";
