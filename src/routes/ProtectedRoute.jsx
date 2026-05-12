import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  selectIsAuthenticated,
  selectEnrollmentStatus,
  selectBootstrapped,
  selectRole,
} from '../store/authSlice.js';

/**
 * ProtectedRoute
 * --------------------------------------------------------------------------
 * Single guard that handles all three stages of the onboarding pipeline. Drop
 * it above any route subtree and tell it which `stage` is being protected:
 *
 *   <ProtectedRoute stage="public">       ...      // /, /login, /register
 *   <ProtectedRoute stage="intermediary"> ...      // /register-course, /pending-approval
 *   <ProtectedRoute stage="dashboard">    ...      // /dashboard
 *
 * Decision matrix
 * ────────────────────────────────────────────────────────────────────────────
 * stage = 'public'
 *   - authenticated + ADMIN        → /dashboard/admin
 *   - authenticated + APPROVED     → /dashboard
 *   - authenticated + PENDING      → /pending-approval
 *   - authenticated + NONE         → /register-course
 *   - unauthenticated              → render <Outlet />
 *
 * stage = 'intermediary'
 *   - unauthenticated               → /login
 *   - ADMIN                         → /dashboard/admin
 *   - APPROVED                      → /dashboard
 *   - else                          → render <Outlet />
 *     (the route itself decides whether NONE shows the form or PENDING shows
 *      the waiting screen — see the page components.)
 *
 * stage = 'dashboard'
 *   - unauthenticated              → /login
 *   - ADMIN                         → render <Outlet /> (enrollment exempt)
 *   - else + PENDING                → /pending-approval
 *   - else + not APPROVED           → /register-course
 *   - APPROVED                      → render <Outlet />
 */
const ProtectedRoute = ({ stage }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const enrollmentStatus = useSelector(selectEnrollmentStatus);
  const role = useSelector(selectRole);
  const bootstrapped = useSelector(selectBootstrapped);
  const location = useLocation();

  // Avoid a flash redirect on first paint while we rehydrate the session.
  if (!bootstrapped && isAuthenticated) {
    return <BootstrapFallback />;
  }

  if (stage === 'public') {
    if (!isAuthenticated) return <Outlet />;
    if (role === 'ADMIN')
      return <Navigate to="/dashboard/admin" replace />;
    if (enrollmentStatus === 'APPROVED') return <Navigate to="/dashboard" replace />;
    if (enrollmentStatus === 'PENDING')
      return <Navigate to="/pending-approval" replace />;
    return <Navigate to="/register-course" replace />;
  }

  if (stage === 'intermediary') {
    if (!isAuthenticated)
      return <Navigate to="/login" replace state={{ from: location }} />;
    if (role === 'ADMIN')
      return <Navigate to="/dashboard/admin" replace />;
    if (enrollmentStatus === 'APPROVED')
      return <Navigate to="/dashboard" replace />;
    return <Outlet />;
  }

  if (stage === 'dashboard') {
    if (!isAuthenticated)
      return <Navigate to="/login" replace state={{ from: location }} />;
    if (role === 'ADMIN') return <Outlet />;
    if (enrollmentStatus === 'PENDING')
      return <Navigate to="/pending-approval" replace />;
    if (enrollmentStatus !== 'APPROVED')
      return <Navigate to="/register-course" replace />;
    return <Outlet />;
  }

  // Unknown stage — fail closed.
  return <Navigate to="/" replace />;
};

const BootstrapFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-white">
    <div className="flex items-center gap-3 text-lic-body">
      <span className="h-2 w-2 animate-pulse rounded-full bg-lic-teal" />
      <span className="text-sm font-medium">Restoring your session…</span>
    </div>
  </div>
);

export default ProtectedRoute;
