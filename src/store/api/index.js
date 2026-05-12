/**
 * RTK Query entry — aligns with repo root `APIdocs.md` (base `/api/v1`).
 * Endpoint modules inject into `apiSlice` on import for a clean mental model per domain.
 */
import './endpoints/authEndpoints.js';
import './endpoints/userEndpoints.js';
import './endpoints/enrollmentEndpoints.js';
import './endpoints/courseEndpoints.js';
import './endpoints/webinarEndpoints.js';
import './endpoints/testEndpoints.js';
import './endpoints/attemptEndpoints.js';
import './endpoints/announcementEndpoints.js';
import './endpoints/notificationEndpoints.js';
import './endpoints/adminEndpoints.js';
import './endpoints/opsEndpoints.js';

export { apiSlice, API_TAG_TYPES } from './apiSlice.js';

export {
  unwrapApiData,
  unwrapListResponse,
  normalizeAuthSessionData,
  normalizeUserDeskProfile,
  pickApiErrorMessage,
  formatMutationError,
} from './transforms.js';

export {
  deriveEnrollmentGate,
  enrollmentStatusFromLoginUser,
  fetchEnrollmentStatuses,
} from './enrollmentGate.js';

export * from './endpoints/authEndpoints.js';
export * from './endpoints/userEndpoints.js';
export * from './endpoints/enrollmentEndpoints.js';
export * from './endpoints/courseEndpoints.js';
export * from './endpoints/webinarEndpoints.js';
export * from './endpoints/testEndpoints.js';
export * from './endpoints/attemptEndpoints.js';
export * from './endpoints/announcementEndpoints.js';
export * from './endpoints/notificationEndpoints.js';
export * from './endpoints/adminEndpoints.js';
export * from './endpoints/opsEndpoints.js';

/** Stable alias matching older hook name (`GET /courses`). */
export {
  useGetCoursesQuery as useGetAvailableCoursesQuery,
  useLazyGetCoursesQuery as useLazyGetAvailableCoursesQuery,
} from './endpoints/courseEndpoints.js';
