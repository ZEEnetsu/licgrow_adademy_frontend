import { Outlet } from 'react-router-dom';

/**
 * Dashboard shell — chrome lives in `Dashboard.jsx` (sidebar + flagship desk UI).
 */
const DashboardLayout = () => (
  <div className="min-h-screen bg-[#0F172A] antialiased">
    <Outlet />
  </div>
);

export default DashboardLayout;
