import { useCallback, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  useGetAnnouncementsQuery,
  useGetMyDashboardStatsQuery,
  useGetNotificationsQuery,
  useGetRecentAttemptsQuery,
  useGetTestsQuery,
  useGetUnreadNotificationCountQuery,
  useGetUpcomingWebinarsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useRegisterWebinarMutation,
} from '../../store/api/index.js';
import {
  logout,
  selectDeskUser,
  selectEnrollmentStatus,
  selectIsAuthenticated,
  selectRole,
} from '../../store/authSlice.js';

import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import StatCardRow from './StatCardRow.jsx';
import ProgressPanel from './ProgressPanel.jsx';
import UpcomingPanel from './UpcomingPanel.jsx';
import PerformanceBarChart from './PerformanceBarChart.jsx';
import RecentAttemptsTable from './RecentAttemptsTable.jsx';
import NotificationsDrawer from './NotificationsDrawer.jsx';

const EMPTY_STATS = {
  testsTaken: 0,
  testsPassed: 0,
  passRate: 0,
  averageScore: 0,
  averagePercentage: 0,
  bestScore: 0,
  coursesEnrolled: 0,
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);
  const enrollmentStatus = useSelector(selectEnrollmentStatus);
  const deskUser = useSelector(selectDeskUser);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [registeringWebinarId, setRegisteringWebinarId] = useState(null);

  const studentDeskApproved = role === 'STUDENT' && enrollmentStatus === 'APPROVED';
  const skipLearnerFeeds =
    role === 'ADMINISTRATOR' || !studentDeskApproved;

  const { data: statsRaw } = useGetMyDashboardStatsQuery(undefined, {
    skip: skipLearnerFeeds,
  });

  const { data: tests = [], isFetching: testsLoading } = useGetTestsQuery(undefined, {
    skip: skipLearnerFeeds,
  });

  const { data: webinars = [], isFetching: webinarsLoading } = useGetUpcomingWebinarsQuery(
    undefined,
    { skip: skipLearnerFeeds },
  );

  const { data: announcements = [], isFetching: annLoading } = useGetAnnouncementsQuery(undefined, {
    skip: skipLearnerFeeds,
  });

  const { data: recentAttempts = [] } = useGetRecentAttemptsQuery(
    { limit: 5 },
    { skip: skipLearnerFeeds },
  );

  const { data: notifEnvelope, refetch: refetchNotifications } = useGetNotificationsQuery(
    { page: 1, limit: 40 },
    { skip: !isAuthenticated },
  );

  const { data: unreadWrap } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [markReadMutation] = useMarkNotificationReadMutation();
  const [markAllMutation] = useMarkAllNotificationsReadMutation();
  const [registerWebinar] = useRegisterWebinarMutation();

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

  const stats = statsRaw && typeof statsRaw === 'object' ? { ...EMPTY_STATS, ...statsRaw } : EMPTY_STATS;

  const sortedAnnouncements = useMemo(() => {
    const a = [...(Array.isArray(announcements) ? announcements : [])];
    return a.sort((x, y) => {
      if (Boolean(y.isPinned) !== Boolean(x.isPinned)) return y.isPinned ? 1 : -1;
      return String(y.postedAt ?? '').localeCompare(String(x.postedAt ?? ''));
    });
  }, [announcements]);

  const sparklinePercentages = useMemo(() => {
    const arr = Array.isArray(recentAttempts) ? recentAttempts : [];
    return [...arr]
      .reverse()
      .map((a) => Number(a.percentage ?? 0));
  }, [recentAttempts]);

  const deskBadge =
    role === 'ADMINISTRATOR'
      ? 'Ops'
      : enrollmentStatus === 'APPROVED'
        ? 'Approved'
        : enrollmentStatus;

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const markRead = useCallback(
    async (id) => {
      try {
        await markReadMutation(id).unwrap();
        await refetchNotifications();
      } catch {
        /* drawer still tolerates stale UI */
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

  const handleRegisterWebinar = useCallback(
    async (webinarId) => {
      setRegisteringWebinarId(webinarId);
      try {
        await registerWebinar(webinarId).unwrap();
      } finally {
        setRegisteringWebinarId(null);
      }
    },
    [registerWebinar],
  );

  const signOut = useCallback(() => dispatch(logout()), [dispatch]);

  const topBarDesk = {
    title: 'Your desk',
    subtitle: 'Jump into your next mock or join live sessions lined up today.',
    ctaHref: '/mock-tests',
    ctaLabel: 'Start mock test',
  };

  const feedLoadingRow = skipLearnerFeeds ? null : (
    <div className="mb-6 rounded-xl border border-white/[0.06] bg-[#111827] px-4 py-3 text-sm text-[#94A3B8]">
      {testsLoading || webinarsLoading || annLoading
        ? 'Syncing coursework, webinars, and announcements…'
        : null}
    </div>
  );

  if (role === 'ADMIN') {
    return <Navigate to="/dashboard/admin" replace />;
  }

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
        enrollmentLabel={deskBadge}
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
          welcomeTitle={topBarDesk.title}
          tagline={topBarDesk.subtitle}
          primaryCta={{ href: topBarDesk.ctaHref, label: topBarDesk.ctaLabel }}
          onBellClick={openDrawer}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#1C2A3E] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#475569]">
          {feedLoadingRow}

          {studentDeskApproved ? (
            <>
              <StatCardRow stats={stats} sparklinePercentages={sparklinePercentages} />

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <ProgressPanel tests={Array.isArray(tests) ? tests : []} />
                <UpcomingPanel
                  webinars={Array.isArray(webinars) ? webinars : []}
                  announcements={sortedAnnouncements}
                  onRegisterWebinar={handleRegisterWebinar}
                  registeringWebinarId={registeringWebinarId}
                />
              </div>

              <div className="mt-6">
                <PerformanceBarChart attempts={Array.isArray(recentAttempts) ? recentAttempts : []} />
              </div>

              <div className="mt-6">
                <RecentAttemptsTable attempts={Array.isArray(recentAttempts) ? recentAttempts : []} />
              </div>
            </>
          ) : (
            <p className="text-[#64748B]">
              Complete onboarding to unlock your learner desk. Approval status:{` `}
              <span className="font-semibold text-[#CBD5E1]">{enrollmentStatus}</span>
            </p>
          )}
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
