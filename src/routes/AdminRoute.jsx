import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectRole } from '../store/authSlice.js';

/**
 * Restricts mentor-admin tools (`test:create`, `test:publish` per APIdocs §12).
 * Ops Administrator uses separate ops routes elsewhere.
 */
export default function AdminRoute({ children }) {
  const role = useSelector(selectRole);
  if (role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}
