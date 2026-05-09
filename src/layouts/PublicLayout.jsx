import { Outlet } from 'react-router-dom';

import AcademyNav from '../components/AcademyNav.jsx';

/**
 * Public shell — sticky AcademyNav; landing includes its own footer (§11).
 */
const PublicLayout = () => (
  <div className="min-h-screen bg-white text-lic-body antialiased">
    <AcademyNav />
    <Outlet />
  </div>
);

export default PublicLayout;
