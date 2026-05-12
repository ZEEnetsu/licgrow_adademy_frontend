import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithAuthGuard } from './baseQuery.js';

/** RTK cache tags — grouped by APIdocs domains. */
export const API_TAG_TYPES = [
  'Auth',
  'User',
  'UserStats',
  'Enrollment',
  'Assignment',
  'Course',
  'Webinar',
  'Test',
  'Attempt',
  'Announcement',
  'Notification',
  'AdminStats',
  'AdminEnrollment',
  'AdminCourse',
  'AdminWebinar',
  'AdminTest',
  'AdminUser',
  'AdminAnnouncement',
  'OpsHealth',
  'OpsLog',
  'OpsAdmin',
  'OpsRole',
];

/**
 * Root slice. Endpoints are injected from `src/store/api/endpoints/*.js`
 * to keep modules aligned with `APIdocs.md`.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: API_TAG_TYPES,
  endpoints: () => ({}),
});
