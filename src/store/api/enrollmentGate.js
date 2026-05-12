import { unwrapApiData } from './transforms.js';
import { rawBaseQuery } from './baseQuery.js';

/**
 * Login payload user object (APIdocs §3). Prefer explicit enrollmentStatus later.
 */
export function enrollmentStatusFromLoginUser(user) {
  if (!user || typeof user !== 'object') return 'NONE';
  const direct =
    user.enrollmentStatus ?? user.enrollment_status ?? user.enrollmentState;
  if (direct === 'PENDING' || direct === 'APPROVED' || direct === 'NONE') {
    return direct;
  }
  return user.hasActiveEnrollment ? 'APPROVED' : 'NONE';
}

/**
 * Derive `authSlice` enrollment_status from APIdocs §5:
 * - `GET /enrollments/me/assignments` — active course rows
 * - `GET /enrollments/me` — submitted requests (pending / approved without assignment yet, etc.)
 */
export function deriveEnrollmentGate(assignments = [], enrollmentRows = []) {
  const hasActiveAssignment = assignments.some((a) => a && a.isActive === true);
  if (hasActiveAssignment) return 'APPROVED';

  const hasPendingRequest = enrollmentRows.some((r) => {
    const s = String(r?.status ?? '').toLowerCase();
    return s === 'pending';
  });
  if (hasPendingRequest) return 'PENDING';

  return 'NONE';
}

/**
 * Computes enrollment gate from §5 list endpoints (best-effort).
 *
 * Uses `rawBaseQuery` (no `401 → logout`). Some deployments return 401/403 here
 * for brand-new accounts while `/users/me` + login tokens are valid; treating
 * that as "empty lists" avoids wiping the session during bootstrap.
 *
 * @param {import('@reduxjs/toolkit/query').BaseQueryApi} api RTK thunk API (`getState`, etc.)
 */
export async function fetchEnrollmentStatuses(api) {
  const assignmentsRes = await rawBaseQuery(
    { url: '/enrollments/me/assignments', method: 'GET' },
    api,
    {},
  );
  let assignments = [];
  if (!assignmentsRes.error) {
    const data = unwrapApiData(assignmentsRes.data);
    assignments = Array.isArray(data) ? data : [];
  }

  const enrollmentRes = await rawBaseQuery(
    { url: '/enrollments/me', method: 'GET' },
    api,
    {},
  );
  let enrollmentRows = [];
  if (!enrollmentRes.error) {
    const data = unwrapApiData(enrollmentRes.data);
    enrollmentRows = Array.isArray(data) ? data : [];
  }

  return deriveEnrollmentGate(assignments, enrollmentRows);
}
