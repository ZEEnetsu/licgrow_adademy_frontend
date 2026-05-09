import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Sidebar from '../../pages/dashboard/Sidebar.jsx';
import TopBar from '../../pages/dashboard/TopBar.jsx';
import { logout } from '../../store/authSlice.js';

// Mirrors dashboard dummy user shape for Sidebar/TopBar
const MOCK_PORTAL_USER = {
  userId: 'uuid-001',
  username: 'LIC-00342',
  fullName: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com',
  hasActiveEnrollment: true,
};

/**
 * Dashboard-class shell for mock test module (list/detail/result).
 */
export default function MockTestShell() {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const signOut = useCallback(() => dispatch(logout()), [dispatch]);

  return (
    <div
      className="flex min-h-screen bg-[#080C14] font-normal antialiased"
      style={{
        fontFamily: '"Google Sans", "DM Sans", system-ui, sans-serif',
      }}
    >
      <Sidebar
        user={MOCK_PORTAL_USER}
        unreadCount={0}
        onNotificationsClick={() => setSidebarOpen(false)}
        onSignOut={signOut}
        sidebarOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col lg:min-w-0">
        <TopBar
          user={MOCK_PORTAL_USER}
          unreadCount={0}
          onBellClick={() => {}}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#1C2A3E] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#475569]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
