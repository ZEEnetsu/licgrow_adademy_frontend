import { breakdown } from "../../../../app/utils/statusBreakdown.js";

/**
 * Data layer for the admin dashboard — `api-contracts/13-analytics.md` §1.
 *
 * Turns the platform-analytics payload into the exact shape the view renders.
 * Every decision that is *about the data* lives here: which statuses roll up
 * into a caption, when a figure is a dash instead of a number, how a total
 * splits into bar segments.
 *
 * Deliberately free of React — icons and tones are named, not imported — so
 * it can be exercised as a plain function. When the real backend replaces the
 * mock, this file is where a payload change lands, and the view does not move.
 */

/**
 * Segments of a whole, for a proportion bar. Anything the named parts don't
 * cover becomes an "Other" segment so the bar always sums to the total; zero
 * segments are dropped (a 0-width segment would still carry a legend entry).
 */
const segments = (total, parts, otherLabel) => {
  const named = parts.filter((part) => part.value > 0);
  const other = total - parts.reduce((sum, part) => sum + part.value, 0);
  if (other > 0) named.push({ key: "other", label: otherLabel, value: other, tone: "neutral" });
  return named.map((part) => ({ ...part, pct: total > 0 ? (part.value / total) * 100 : 0 }));
};

export const toDashboardViewModel = ({ learners, batches, content, enrollments, activity }) => ({
  // Four plain cards; only the icon chips alternate lavender and mint.
  stats: [
    {
      key: "learners",
      label: "Learners",
      icon: "users",
      tone: "default",
      chip: "lavender",
      value: learners.total,
      to: "/admin/manage-users",
      caption: breakdown(learners.total, [[learners.active, "active"], [learners.suspended, "suspended"]], "other"),
    },
    {
      key: "batches",
      label: "Batches",
      icon: "layers",
      tone: "default",
      chip: "mint",
      value: batches.total,
      to: "/admin/manage-batch",
      caption: breakdown(batches.total, [[batches.active, "active"], [batches.archived, "archived"]], "draft"),
    },
    {
      key: "courses",
      label: "Courses",
      icon: "book",
      tone: "default",
      chip: "lavender",
      value: content.courses,
      to: "/admin/manage-course",
      caption: content.quizzes > 0 ? `${content.quizzes} unit quizzes inside` : "No unit quizzes yet",
    },
    {
      key: "tests",
      label: "Tests",
      icon: "clipboardCheck",
      tone: "default",
      chip: "mint",
      value: content.tests,
      to: "/admin/manage-test",
      caption: "Full-length papers",
    },
  ],

  activity: {
    attempts: activity.attemptsLast30d,
    // the contract returns null, not 0, when nothing has been sat yet — and 0%
    // would be a claim about performance rather than about data
    avgScore: activity.avgScorePctLast30d,
    approved: enrollments.approvedLast30d,
    pending: enrollments.pending,
    empty: activity.attemptsLast30d === 0,
  },

  accounts: {
    total: learners.total,
    segments: segments(
      learners.total,
      [
        { key: "active", label: "Active", value: learners.active, tone: "positive" },
        { key: "suspended", label: "Suspended", value: learners.suspended, tone: "negative" },
      ],
      "Other",
    ),
  },

  content: [
    { key: "courses", label: "Courses", value: content.courses, to: "/admin/manage-course" },
    { key: "tests", label: "Tests", value: content.tests, to: "/admin/manage-test" },
    { key: "quizzes", label: "Unit quizzes", value: content.quizzes, to: "/admin/manage-course" },
  ],
});
