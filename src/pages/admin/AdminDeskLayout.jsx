import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Sidebar from '../dashboard/Sidebar.jsx';
import TopBar from '../dashboard/TopBar.jsx';
import NotificationsDrawer from '../dashboard/NotificationsDrawer.jsx';
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../../store/api/index.js';
import {
  logout,
  selectDeskUser,
  selectEnrollmentStatus,
  selectIsAuthenticated,
  selectRole,
} from '../../store/authSlice.js';

/**
 * Shell for mentor-admin routes: same sidebar + top bar vocabulary as learner desk,
 * scoped to `/dashboard/admin/**`.
 */
export default function AdminDeskLayout({
  children,
  welcomeTitle = 'Admin console',
  tagline = 'Courses, mocks, and publish flows — all in one place.',
  primaryCta = {
    href: '/dashboard/admin/courses/new',
    label: 'Create course',
  },
}) {
  const dispatch = useDispatch();
  const deskUser = useSelector(selectDeskUser);
  const role = useSelector(selectRole);
  const enrollmentStatus = useSelector(selectEnrollmentStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: notifEnvelope, refetch: refetchNotifications } = useGetNotificationsQuery(
    { page: 1, limit: 40 },
    { skip: !isAuthenticated },
  );

  const { data: unreadWrap } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [markReadMutation] = useMarkNotificationReadMutation();
  const [markAllMutation] = useMarkAllNotificationsReadMutation();

  const notifications = useMemo(
    () => notifEnvelope ?? { unreadCount: 0, data: [] },
    [notifEnvelope],
  );

  const unreadBell = useMemo(() => {
    const u = unreadWrap?.unreadCount;
    if (typeof u === 'number') return u;
    if (typeof notifications.unreadCount === 'number') return notifications.unreadCount;
    const list = Array.isArray(notifications.data) ? notifications.data : [];
    return list.filter((n) => !n.isRead).length;
  }, [notifications, unreadWrap]);

  const drawerPayload = notifications;

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const markRead = useCallback(
    async (id) => {
      try {
        await markReadMutation(id).unwrap();
        await refetchNotifications();
      } catch {
        /* drawer tolerates stale */
      }
    },
    [markReadMutation, refetchNotifications],
  );

  const markAllRead = useCallback(async () => {
    try {
      await markAllMutation().unwrap();
      await refetchNotifications();
    } catch {
      /* ignore */
    }
  }, [markAllMutation, refetchNotifications]);

  const signOut = useCallback(() => dispatch(logout()), [dispatch]);

  const badge =
    role === 'ADMIN' ? 'Admin' : enrollmentStatus === 'APPROVED' ? 'Approved' : enrollmentStatus;

  return (
    <div
      className="flex min-h-screen bg-[#080C14] font-normal antialiased"
      style={{
        fontFamily: '"Google Sans", "DM Sans", system-ui, sans-serif',
      }}
    >
      <Sidebar
        user={deskUser}
        role={role}
        enrollmentLabel={badge}
        unreadCount={unreadBell}
        onNotificationsClick={() => {
          openDrawer();
          setSidebarOpen(false);
        }}
        onSignOut={signOut}
        sidebarOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col lg:min-w-0">
        <TopBar
          user={deskUser}
          unreadCount={unreadBell}
          welcomeTitle={welcomeTitle}
          tagline={tagline}
          primaryCta={primaryCta}
          onBellClick={openDrawer}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#1C2A3E] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#475569]">
          {children}
        </main>
      </div>

      <NotificationsDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        notifications={drawerPayload}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </div>
  );
}
