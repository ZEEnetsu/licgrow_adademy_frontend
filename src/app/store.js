import { configureStore } from '@reduxjs/toolkit';
import { testSlice } from './apis/tests.api.js';
import authApi from './apis/auth.api.js';
import rbacApi from './apis/rbac.api.js';
import coursesApi from './apis/courses.api.js';
import batchesApi from './apis/batches.api.js';
import learnerApi from './apis/learner.api.js';
import enrollmentApi from './apis/enrollment.api.js';
import submissionApi from './apis/submission.api.js';
import announcementApi from './apis/announcement.api.js';
import notificationApi from './apis/notification.api.js';
import analyticsApi from './apis/analytics.api.js';
import governanceApi from './apis/governance.api.js';
import themeReducer from './features/theme.slice.js';
import authReducer from './features/auth/auth.slice.js';

export const store = configureStore({
  reducer: {
    // Only register the slice reducer using its dynamic path
    theme : themeReducer,
    // identity only — tokens live in features/auth/tokenStorage.js, never here
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [rbacApi.reducerPath]: rbacApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [batchesApi.reducerPath]: batchesApi.reducer,
    [learnerApi.reducerPath]: learnerApi.reducer,
    [enrollmentApi.reducerPath]: enrollmentApi.reducer,
    [submissionApi.reducerPath]: submissionApi.reducer,
    [announcementApi.reducerPath]: announcementApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [governanceApi.reducerPath]: governanceApi.reducer,
    [testSlice.reducerPath]: testSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      rbacApi.middleware,
      coursesApi.middleware,
      batchesApi.middleware,
      learnerApi.middleware,
      enrollmentApi.middleware,
      submissionApi.middleware,
      announcementApi.middleware,
      notificationApi.middleware,
      analyticsApi.middleware,
      governanceApi.middleware,
      testSlice.middleware,
    ),
});
