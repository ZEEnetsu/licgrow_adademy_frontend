import { useMemo } from "react";

import QueryBoundary from "../../../components/ui/QueryBoundary.jsx";
import DashboardView from "./dashboard/DashboardView.jsx";
import { toDashboardViewModel } from "./dashboard/dashboard.viewModel.js";
import { useGetPlatformAnalyticsQuery } from "../../../app/apis/analytics.api.js";

/**
 * Admin dashboard — container half of the pair.
 *
 * Its whole job: fetch, shape, hand over. Fetching lives here, the shaping
 * lives in `dashboard.viewModel.js`, and every pixel lives in
 * `DashboardView.jsx`. Nothing in this file knows what the page looks like,
 * and nothing in the view knows where the numbers came from.
 *
 * `useMemo` is not a micro-optimisation here. The view-model builds fresh
 * arrays each call, and PieChart keys its effect on the array it is given — an
 * unmemoised model would tear down and rebuild both charts on every render of
 * the admin shell, including a theme toggle.
 */
const Dashboard = () => {
  const query = useGetPlatformAnalyticsQuery();
  const model = useMemo(
    () => (query.data ? toDashboardViewModel(query.data) : null),
    [query.data],
  );

  return (
    <QueryBoundary query={query} label="analytics">
      {/* `analytics:view` gates the page; a viewer without it sees the error */}
      {() => <DashboardView {...model} />}
    </QueryBoundary>
  );
};

export default Dashboard;
