import { breakdown } from "../../../../app/utils/statusBreakdown.js";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";

/**
 * Data layer for the admin dashboard — `api-contracts/13-analytics.md` §1.
 *
 * Turns the platform-analytics payload into the exact shape the view renders.
 * Every decision that is *about the data* lives here: which statuses roll up
 * into a caption, when a figure is a dash instead of a number, when the review
 * link is worth showing, which slices are non-zero.
 *
 * Deliberately free of React and of asset imports — icons are named, not
 * imported — so this can be exercised as a plain function with no DOM and no
 * bundler. When the real backend replaces the mock, this file is where a
 * payload change lands, and the view does not move.
 */

/** `1 pending request` / `2 pending requests`. */
const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;

/** Chart.js draws a zero slice as an invisible wedge with a live legend entry. */
const slices = (pairs) =>
  pairs
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({ label, value }));

export const toDashboardViewModel = ({
  learners,
  batches,
  content,
  enrollments,
  activity,
}) => ({
  stats: [
    {
      key: "learners",
      icon: "learners",
      title: "Learners",
      value: learners.total,
      caption: breakdown(
        learners.total,
        [
          [learners.active, "active"],
          [learners.suspended, "suspended"],
        ],
        "other",
      ),
    },
    {
      key: "batches",
      icon: "batches",
      title: "Batches",
      value: batches.total,
      caption: breakdown(
        batches.total,
        [
          [batches.active, "active"],
          [batches.archived, "archived"],
        ],
        "draft",
      ),
    },
    {
      key: "courses",
      icon: "courses",
      title: "Courses",
      value: content.courses,
      caption: `${content.quizzes} unit quizzes`,
    },
    {
      key: "tests",
      icon: "tests",
      title: "Tests",
      value: content.tests,
      caption: "full-length papers",
    },
  ],

  // Paired by row: two figure panels, then two charts. Order here is the order
  // on screen, so rebalancing the page is a reordering rather than a rewrite.
  panels: [
    {
      key: "activity",
      kind: "figures",
      title: "Last 30 days",
      figures: [
        { label: "Attempts recorded", value: activity.attemptsLast30d },
        {
          label: "Average score",
          // the contract returns null, not 0, when nothing has been sat yet —
          // and 0% would be a claim about performance rather than about data
          value:
            activity.avgScorePctLast30d === null
              ? "—"
              : `${activity.avgScorePctLast30d}%`,
          tone: "accent",
        },
      ],
      note:
        activity.attemptsLast30d === 0
          ? "No attempts yet — figures appear once learners start sitting tests."
          : null,
    },
    {
      key: "enrollment",
      kind: "figures",
      title: "Enrollment",
      figures: [
        { label: "Awaiting review", value: enrollments.pending, tone: "warn" },
        { label: "Approved (30d)", value: enrollments.approvedLast30d },
      ],
      link:
        enrollments.pending > 0
          ? {
              to: "/admin/enrollments",
              label: `Review ${plural(enrollments.pending, "pending request")}`,
              perm: PERMISSIONS.ENROLLMENT_REVIEW,
            }
          : null,
    },
    {
      key: "accounts",
      kind: "chart",
      title: "Learner accounts",
      chart: {
        type: "doughnut",
        slices: slices([
          ["Active", learners.active],
          ["Suspended", learners.suspended],
        ]),
      },
    },
    {
      key: "content",
      kind: "chart",
      title: "Content mix",
      chart: {
        type: "pie",
        slices: slices([
          ["Courses", content.courses],
          ["Tests", content.tests],
          ["Quizzes", content.quizzes],
        ]),
      },
    },
  ],
});
