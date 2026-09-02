import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";

import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import RootLayout from "./layouts/RootLayout.jsx";
import RequireAuth from "./components/auth/RequireAuth.jsx";
import AuthSplash from "./components/auth/AuthSplash.jsx";
import StudentLayout from "./pages/student/StudentLayout.jsx";
import MyBatches from "./pages/student/MyBatches.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import MyCourses from "./pages/student/MyCourses.jsx";
import TestHistory from "./pages/student/TestHistory.jsx";
import BrowseBatches from "./pages/student/BrowseBatches.jsx";
import BatchArena from "./pages/student/BatchArena.jsx";
import CourseReader from "./pages/student/CourseReader.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";
import StudentTestOverview from "./pages/student/TestOverview.jsx";
import AttemptRunner from "./pages/student/AttemptRunner.jsx";
import AttemptResult from "./pages/student/AttemptResult.jsx";
import Leaderboard from "./pages/student/Leaderboard.jsx";
import Announcements from "./pages/student/Announcements.jsx";
import Admin from "./pages/Admin/Admin.jsx";
import Dashboard from "./pages/Admin/pages/Dashboard.jsx";
import Notification from "./pages/Admin/pages/Notification.jsx";
import Test from "./pages/Admin/pages/test/Test.jsx";
import ViewAllTest from "./pages/Admin/pages/test/ViewAllTest.jsx";
import TestOverview from "./pages/Admin/pages/test/TestOverview.jsx";
import TestDetail from "./pages/Admin/pages/test/TestDetail.jsx";
import BatchList from "./pages/Admin/pages/batch/BatchList.jsx";
import BatchDetail from "./pages/Admin/pages/batch/BatchDetail.jsx";
import EnrollmentQueue from "./pages/Admin/pages/enrollment/EnrollmentQueue.jsx";
import LearnerList from "./pages/Admin/pages/learner/LearnerList.jsx";
import LearnerDetail from "./pages/Admin/pages/learner/LearnerDetail.jsx";
import AnnouncementManager from "./pages/Admin/pages/announcement/AnnouncementManager.jsx";
import Governance from "./pages/Admin/pages/governance/Governance.jsx";
import CourseList from "./pages/Admin/pages/course/CourseList.jsx";
import CourseDetail from "./pages/Admin/pages/course/CourseDetail.jsx";
import { store } from "./app/store.js";
import { ACTOR } from "./app/features/auth/permissions.js";

/** Both admin actors reach the dashboard; RBAC narrows what they can do there. */
const ADMIN_ACTORS = [ACTOR.STAFF_ADMIN, ACTOR.SUPER_ADMIN];

const router = createBrowserRouter([
  {
    // RootLayout rehydrates the session once, before any guard evaluates
    element: <RootLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

      {
        element: <RequireAuth actor={ADMIN_ACTORS} fallback={<AuthSplash />} />,
        children: [
          {
            path: "/admin",
            element: <Admin />,
            children: [
              // landing on /admin used to render an empty shell
              { index: true, element: <Navigate to="overview" replace /> },
              { path: "overview", element: <Dashboard /> },
              {
                path: "manage-users",
                children: [
                  { index: true, element: <LearnerList /> },
                  { path: ":learnerId", element: <LearnerDetail /> },
                ],
              },
              { path: "enrollments", element: <EnrollmentQueue /> },
              { path: "announcements", element: <AnnouncementManager /> },
              { path: "administrators", element: <Governance /> },
              { path: "notifications", element: <Notification /> },
              { path: "test-history", element: <ViewAllTest /> },
              {
                path: "manage-test",
                element: <Test />,
                children: [
                  { index: true, element: <TestOverview /> },
                  { path: "view-all-test", element: <ViewAllTest /> },
                  { path: "tests/:testId", element: <TestDetail /> },
                ],
              },
              {
                path: "manage-batch",
                children: [
                  { index: true, element: <BatchList /> },
                  { path: ":batchId", element: <BatchDetail /> },
                ],
              },
              {
                // sibling routes, not parent/child: the old shape had the
                // parent branch on a :courseId param it could never see
                path: "manage-course",
                children: [
                  { index: true, element: <CourseList /> },
                  { path: ":courseId", element: <CourseDetail /> },
                ],
              },
            ],
          },
        ],
      },

      {
        element: (
          <RequireAuth actor={ACTOR.LEARNER} fallback={<AuthSplash />} />
        ),
        children: [
          {
            path: "/student",
            element: <StudentLayout />,
            children: [
              { index: true, element: <StudentDashboard /> },
              { path: "batches", element: <MyBatches /> },
              { path: "courses", element: <MyCourses /> },
              { path: "history", element: <TestHistory /> },
              { path: "profile", element: <StudentProfile /> },
              { path: "announcements", element: <Announcements /> },
              { path: "tests/:testId", element: <StudentTestOverview /> },
              { path: "tests/:testId/leaderboard", element: <Leaderboard /> },
              { path: "attempts/:attemptId", element: <AttemptRunner /> },
              {
                path: "attempts/:attemptId/result",
                element: <AttemptResult />,
              },
              { path: "browse", element: <BrowseBatches /> },
              { path: "batches/:batchId", element: <BatchArena /> },
              {
                path: "batches/:batchId/courses/:courseId",
                element: <CourseReader />,
              },
            ],
          },
        ],
      },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

const render = () =>
  createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );

// ── TEMPORARY: dev-only mock API — delete this block with src/mocks/ ───────
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === "true") {
  import("./mocks/index.js").then(async ({ start }) => {
    await start();
    render();
  });
} else {
  render();
}
// ──────────────────────────────────────────────────────────────────────────
