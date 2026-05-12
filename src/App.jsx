import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import PublicLayout from './layouts/PublicLayout.jsx';
import IntermediaryLayout from './layouts/IntermediaryLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

import ProtectedRoute from './routes/ProtectedRoute.jsx';
import ThemeTransitionOverlay from './components/ThemeTransitionOverlay.jsx';

import Landing from './pages/landing/index.jsx';
import Auth from './pages/Auth.jsx';
import CourseRegister from './pages/CourseRegister.jsx';
import PendingApproval from './pages/PendingApproval.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MockTestModule from './modules/mockTest/MockTestModule.jsx';

import {
  selectIsAuthenticated,
  selectBootstrapped,
  selectRole,
  markBootstrapped,
} from './store/authSlice.js';
import { useGetCurrentUserQuery } from './store/api/index.js';
import AdminRoute from './routes/AdminRoute.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminCoursesListPage from './pages/admin/AdminCoursesListPage.jsx';
import AdminCourseCreatePage from './pages/admin/AdminCourseCreatePage.jsx';
import AdminTestsListPage from './pages/admin/AdminTestsListPage.jsx';
import AdminTestCreatePage from './pages/admin/AdminTestCreatePage.jsx';
import AdminTestBuilderPage from './pages/admin/AdminTestBuilderPage.jsx';

/**
 * App
 * --------------------------------------------------------------------------
 * Top of the routing tree. Three layouts (light, light, dark) wrap their
 * respective protected route subtrees. The same `ProtectedRoute` component
 * handles all three onboarding stages — see ProtectedRoute.jsx for the full
 * decision matrix.
 *
 * Bootstrap behaviour
 * ────────────────────────────────────────────────────────────────────────────
 * On mount we:
 *   1. Trigger `getCurrentUser` if a token exists (to rehydrate user_id +
 *      enrollment_status from the server). The endpoint's onQueryStarted
 *      handler dispatches setCredentials/logout for us.
 *   2. If no token, mark the auth slice as `bootstrapped` so guards stop
 *      showing the rehydration fallback.
 */
const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const bootstrapped = useSelector(selectBootstrapped);
  const role = useSelector(selectRole);

  // Only fire `/users/me` when we actually have a token. `skip` keeps the
  // request from running anonymously.
  useGetCurrentUserQuery(undefined, {
    skip:
      !isAuthenticated ||
      role === 'ADMIN' ||
      role === 'ADMINISTRATOR',
  });

  useEffect(() => {
    if (isAuthenticated && (role === 'ADMIN' || role === 'ADMINISTRATOR')) {
      dispatch(markBootstrapped());
    }
  }, [isAuthenticated, role, dispatch]);

  useEffect(() => {
    if (!isAuthenticated && !bootstrapped) {
      dispatch(markBootstrapped());
    }
  }, [isAuthenticated, bootstrapped, dispatch]);

  return (
    <>
      <ThemeTransitionOverlay />

      <Routes>
        {/* ────────────────────────────────────────────────────────────────
            Layout A — Public (light theme, Dribbble-inspired)
            ──────────────────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute stage="public" />}>
          <Route element={<PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Auth />} />
            <Route path="register" element={<Auth />} />
          </Route>
        </Route>

        {/* ────────────────────────────────────────────────────────────────
            Layout B — Intermediary (light theme, focused chrome)
            ──────────────────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute stage="intermediary" />}>
          <Route element={<IntermediaryLayout />}>
            <Route path="register-course" element={<CourseRegister />} />
            <Route path="pending-approval" element={<PendingApproval />} />
          </Route>
        </Route>

        {/* ────────────────────────────────────────────────────────────────
            Layout C — Dashboard (dark theme, code-editor aesthetic)
            ──────────────────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute stage="dashboard" />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route
              path="dashboard/admin/courses"
              element={
                <AdminRoute>
                  <AdminCoursesListPage />
                </AdminRoute>
              }
            />
            <Route
              path="dashboard/admin/courses/new"
              element={
                <AdminRoute>
                  <AdminCourseCreatePage />
                </AdminRoute>
              }
            />
            <Route
              path="dashboard/admin/tests"
              element={
                <AdminRoute>
                  <AdminTestsListPage />
                </AdminRoute>
              }
            />
            <Route
              path="dashboard/admin/tests/new"
              element={
                <AdminRoute>
                  <AdminTestCreatePage />
                </AdminRoute>
              }
            />
            <Route
              path="dashboard/admin/tests/:testId/build"
              element={
                <AdminRoute>
                  <AdminTestBuilderPage />
                </AdminRoute>
              }
            />
            <Route path="mock-tests/*" element={<MockTestModule />} />
          </Route>
        </Route>

        {/* Catch-all → home. The public guard will then route the user to the
            correct stage based on their enrollment_status. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
