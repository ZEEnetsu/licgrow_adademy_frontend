import { PERMISSIONS } from "../../../app/features/auth/permissions.js";

/**
 * The admin's sections, in the order they appear in the rail and the command
 * palette. `perm` hides an item from anyone without it; `superOnly` limits it
 * to super admins. (Hiding is UX, not security — the API still says 403.)
 */
export const NAV_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", to: "/admin/overview", icon: "layoutGrid", perm: PERMISSIONS.ANALYTICS_VIEW, keywords: "home stats analytics" }],
  },
  {
    id: "people",
    label: "People",
    items: [
      { id: "learners", label: "Learners", to: "/admin/manage-users", icon: "users", perm: PERMISSIONS.LEARNER_READ, keywords: "users students agents suspend" },
      { id: "enrollments", label: "Enrollments", to: "/admin/enrollments", icon: "userCheck", perm: PERMISSIONS.ENROLLMENT_REVIEW, keywords: "requests approve reject queue", badge: "pending" },
    ],
  },
  {
    id: "learning",
    label: "Learning",
    items: [
      { id: "batches", label: "Batches", to: "/admin/manage-batch", icon: "layers", perm: PERMISSIONS.BATCH_READ, keywords: "cohorts groups" },
      { id: "courses", label: "Courses", to: "/admin/manage-course", icon: "book", perm: PERMISSIONS.COURSE_READ, keywords: "units chapters videos" },
      { id: "tests", label: "Tests", to: "/admin/manage-test", icon: "clipboardCheck", perm: PERMISSIONS.TEST_READ, keywords: "quizzes exams questions" },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    items: [
      { id: "announcements", label: "Announcements", to: "/admin/announcements", icon: "megaphone", perm: PERMISSIONS.ANNOUNCEMENT_READ, keywords: "news notices pin" },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    items: [
      { id: "administrators", label: "Administrators", to: "/admin/administrators", icon: "shield", superOnly: true, keywords: "staff roles permissions" },
    ],
  },
];

/** Sections with only the items this admin may see; empty sections drop out. */
export const visibleSections = (can, isSuperAdmin) =>
  NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => (item.superOnly ? isSuperAdmin : !item.perm || can(item.perm))),
  })).filter((section) => section.items.length > 0);

/** Where an admin's notification should take them, by `relatedEntityType`. */
export const ADMIN_NOTIFICATION_LINKS = {
  batch: (id) => `/admin/manage-batch/${id}`,
  course: (id) => `/admin/manage-course/${id}`,
  test: (id) => `/admin/manage-test/tests/${id}`,
  enrollment: () => "/admin/enrollments",
  announcement: () => "/admin/announcements",
};
