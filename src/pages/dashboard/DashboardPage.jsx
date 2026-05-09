import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { logout } from '../../store/authSlice.js';

import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import StatCardRow from './StatCardRow.jsx';
import ProgressPanel from './ProgressPanel.jsx';
import UpcomingPanel from './UpcomingPanel.jsx';
import PerformanceBarChart from './PerformanceBarChart.jsx';
import RecentAttemptsTable from './RecentAttemptsTable.jsx';
import NotificationsDrawer from './NotificationsDrawer.jsx';

// ─── Dummy data — API-shaped. One-line swap per block when backend exists. ───

// TODO: Replace with GET /api/v1/users/me
const dummyUser = {
  userId: 'uuid-001',
  username: 'LIC-00342',
  fullName: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com',
  hasActiveEnrollment: true,
};

// TODO: Replace with GET /api/v1/users/me/stats
const dummyStats = {
  testsTaken: 12,
  testsPassed: 9,
  passRate: 75.0,
  averageScore: 68.4,
  averagePercentage: 68.4,
  bestScore: 92,
  coursesEnrolled: 1,
};

// TODO: Replace with GET /api/v1/tests
const dummyTests = [
  {
    testId: 't-001',
    title: 'Chapter 1 — IRDA Fundamentals',
    totalMarks: 25,
    passingMarks: 15,
    canAttempt: true,
    canAttemptReason: null,
    attemptsUsed: 2,
    lastAttemptResult: {
      score: 20,
      percentage: 80.0,
      passed: true,
      submittedAt: '2025-05-08T10:20:00.000Z',
    },
  },
  {
    testId: 't-002',
    title: 'Chapter 2 — Policy Types & Riders',
    totalMarks: 30,
    passingMarks: 18,
    canAttempt: false,
    canAttemptReason: 'Please wait until 3:45 PM to reattempt.',
    attemptsUsed: 1,
    lastAttemptResult: {
      score: 17,
      percentage: 56.6,
      passed: false,
      submittedAt: '2025-05-07T15:00:00.000Z',
    },
  },
  {
    testId: 't-003',
    title: 'Chapter 3 — Life Insurance Concepts',
    totalMarks: 25,
    passingMarks: 15,
    canAttempt: true,
    canAttemptReason: null,
    attemptsUsed: 0,
    lastAttemptResult: null,
  },
  {
    testId: 't-004',
    title: 'Chapter 4 — Ethics & Conduct',
    totalMarks: 20,
    passingMarks: 12,
    canAttempt: true,
    canAttemptReason: null,
    attemptsUsed: 3,
    lastAttemptResult: {
      score: 18,
      percentage: 90.0,
      passed: true,
      submittedAt: '2025-05-06T11:00:00.000Z',
    },
  },
  {
    testId: 't-005',
    title: 'Chapter 5 — Insurance Products',
    totalMarks: 35,
    passingMarks: 21,
    canAttempt: false,
    canAttemptReason: 'Maximum attempts reached.',
    attemptsUsed: 3,
    lastAttemptResult: {
      score: 22,
      percentage: 62.8,
      passed: true,
      submittedAt: '2025-05-05T09:30:00.000Z',
    },
  },
];

// TODO: Replace with GET /api/v1/webinars/upcoming
const dummyWebinars = [
  {
    webinarId: 'w-001',
    title: 'Live Doubt Hour — IRDA Regulations',
    scheduledAt: '2025-05-09T13:30:00.000Z',
    durationMinutes: 60,
    status: 'scheduled',
    isRegistered: true,
  },
  {
    webinarId: 'w-002',
    title: 'Timed Mock #12 — Full Syllabus',
    scheduledAt: '2025-05-10T04:30:00.000Z',
    durationMinutes: 90,
    status: 'live',
    isRegistered: true,
  },
  {
    webinarId: 'w-003',
    title: 'Guest Mentor Session — Career in LIC',
    scheduledAt: '2025-05-13T13:00:00.000Z',
    durationMinutes: 75,
    status: 'scheduled',
    isRegistered: false,
  },
];

// TODO: Replace with GET /api/v1/attempts/recent?limit=5
const dummyRecentAttempts = [
  {
    attemptId: 'a-001',
    testId: 't-001',
    testTitle: 'Chapter 1 — IRDA Fundamentals',
    attemptNumber: 2,
    score: 20,
    totalMarks: 25,
    percentage: 80.0,
    passed: true,
    submittedAt: '2025-05-08T10:20:00.000Z',
  },
  {
    attemptId: 'a-002',
    testId: 't-002',
    testTitle: 'Chapter 2 — Policy Types & Riders',
    attemptNumber: 1,
    score: 17,
    totalMarks: 30,
    percentage: 56.6,
    passed: false,
    submittedAt: '2025-05-07T15:00:00.000Z',
  },
  {
    attemptId: 'a-003',
    testId: 't-004',
    testTitle: 'Chapter 4 — Ethics & Conduct',
    attemptNumber: 3,
    score: 18,
    totalMarks: 20,
    percentage: 90.0,
    passed: true,
    submittedAt: '2025-05-06T11:00:00.000Z',
  },
  {
    attemptId: 'a-004',
    testId: 't-005',
    testTitle: 'Chapter 5 — Insurance Products',
    attemptNumber: 2,
    score: 22,
    totalMarks: 35,
    percentage: 62.8,
    passed: true,
    submittedAt: '2025-05-05T09:30:00.000Z',
  },
  {
    attemptId: 'a-005',
    testId: 't-003',
    testTitle: 'Chapter 3 — Life Insurance Concepts',
    attemptNumber: 1,
    score: 10,
    totalMarks: 25,
    percentage: 40.0,
    passed: false,
    submittedAt: '2025-05-04T08:00:00.000Z',
  },
];

// TODO: Replace with GET /api/v1/announcements
const dummyAnnouncements = [
  {
    announcementId: 'ann-001',
    courseTitle: null,
    title: 'Platform Maintenance on May 20th',
    body: 'The platform will be down from 2AM to 4AM IST.',
    isPinned: true,
    postedAt: '2025-05-08T09:00:00.000Z',
  },
  {
    announcementId: 'ann-002',
    courseTitle: 'iC-38 Batch May 2025',
    title: 'New Test Published — Chapter 5',
    body: 'Chapter 5 mock test is now live.',
    isPinned: false,
    postedAt: '2025-05-07T11:00:00.000Z',
  },
];

// TODO: Replace with GET /api/v1/notifications
const dummyNotificationsSeed = {
  unreadCount: 3,
  data: [
    {
      notificationId: 'n-001',
      type: 'enrollment_approved',
      title: 'Enrollment Approved',
      body: 'Your enrollment for iC-38 Batch May 2025 has been approved.',
      isRead: false,
      createdAt: '2025-04-11T10:05:00.000Z',
    },
    {
      notificationId: 'n-002',
      type: 'test_published',
      title: 'New Test Available',
      body: 'Chapter 5 mock test is now live in your course.',
      isRead: false,
      createdAt: '2025-05-07T11:00:00.000Z',
    },
    {
      notificationId: 'n-003',
      type: 'webinar_starting',
      title: 'Webinar Starting Soon',
      body: 'Timed Mock #12 starts in 15 minutes.',
      isRead: false,
      createdAt: '2025-05-10T04:15:00.000Z',
    },
    {
      notificationId: 'n-004',
      type: 'test_published',
      title: 'Chapter 3 Test Published',
      body: 'Life Insurance Concepts test is now available.',
      isRead: true,
      createdAt: '2025-05-03T08:00:00.000Z',
    },
  ],
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => ({
    ...dummyNotificationsSeed,
    data: dummyNotificationsSeed.data.map((n) => ({ ...n })),
  }));

  const sparklinePercentages = useMemo(
    () => [...dummyRecentAttempts].reverse().map((a) => a.percentage),
    [],
  );

  const unreadCount = useMemo(
    () => notifications.data.filter((n) => !n.isRead).length,
    [notifications.data],
  );

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const markRead = useCallback((id) => {
    setNotifications((prev) => ({
      ...prev,
      data: prev.data.map((n) =>
        n.notificationId === id ? { ...n, isRead: true } : n,
      ),
    }));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => ({
      ...prev,
      unreadCount: 0,
      data: prev.data.map((n) => ({ ...n, isRead: true })),
    }));
  }, []);

  const signOut = useCallback(() => dispatch(logout()), [dispatch]);

  return (
    <div
      className="flex min-h-screen bg-[#080C14] font-normal antialiased"
      style={{
        fontFamily: '"Google Sans", "DM Sans", system-ui, sans-serif',
      }}
    >
      <Sidebar
        user={dummyUser}
        unreadCount={unreadCount}
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
          user={dummyUser}
          unreadCount={unreadCount}
          onBellClick={openDrawer}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#1C2A3E] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#475569]">
          <StatCardRow stats={dummyStats} sparklinePercentages={sparklinePercentages} />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <ProgressPanel tests={dummyTests} />
            <UpcomingPanel webinars={dummyWebinars} announcements={dummyAnnouncements} />
          </div>

          <div className="mt-6">
            <PerformanceBarChart attempts={dummyRecentAttempts} />
          </div>

          <div className="mt-6">
            <RecentAttemptsTable attempts={dummyRecentAttempts} />
          </div>
        </main>
      </div>

      <NotificationsDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </div>
  );
}
