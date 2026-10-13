import { useMemo } from "react";
import { useSelector } from "react-redux";

import DashboardView from "./dashboard/DashboardView.jsx";
import { toDashboardViewModel } from "./dashboard/dashboard.viewModel.js";
import { useGetPlatformAnalyticsQuery } from "../../../app/apis/analytics.api.js";
import { useGetEnrollmentsQuery } from "../../../app/apis/enrollment.api.js";
import { useGetTestsQuery } from "../../../app/apis/tests.api.js";
import { selectCan } from "../../../app/features/auth/auth.selectors.js";
import { PERMISSIONS } from "../../../app/features/auth/permissions.js";
import { PENDING_PREVIEW, RECENT_TESTS } from "../queries.js";

/**
 * Admin dashboard — container half of the pair.
 *
 * Its whole job: fetch, shape, hand over. Fetching lives here, the shaping
 * lives in `dashboard.viewModel.js`, and every pixel lives in
 * `DashboardView.jsx`.
 *
 * Three independent queries, so each section loads (and fails) on its own
 * instead of one slow call blanking the page. The pending preview shares its
 * cache entry with the sidebar badge (same args), so it costs no extra call.
 */
const Dashboard = () => {
  const can = useSelector(selectCan);
  const canReview = can(PERMISSIONS.ENROLLMENT_REVIEW);
  const canSeeTests = can(PERMISSIONS.TEST_READ);

  const analytics = useGetPlatformAnalyticsQuery();
  const pending = useGetEnrollmentsQuery(PENDING_PREVIEW, { skip: !canReview });
  const tests = useGetTestsQuery(RECENT_TESTS, { skip: !canSeeTests });

  const model = useMemo(
    () => (analytics.data ? toDashboardViewModel(analytics.data) : null),
    [analytics.data],
  );

  return (
    <DashboardView
      model={model}
      analytics={analytics}
      pending={canReview ? pending : null}
      tests={canSeeTests ? tests : null}
    />
  );
};

export default Dashboard;
