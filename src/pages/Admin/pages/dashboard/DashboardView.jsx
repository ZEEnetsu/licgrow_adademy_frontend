import { NavLink } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import StatsCard from "../../components/StatsCard.jsx";
import PieChart from "../../../../components/PieChart.jsx";
import Can from "../../../../components/auth/Can.jsx";
import { Panel, FigureList } from "../../../../components/ui/Panel.jsx";
import account from "../../../../assets/dashboardIcons/account.svg";
import batchIcon from "../../../../assets/dashboardIcons/batch.svg";
import courseIcon from "../../../../assets/dashboardIcons/course.svg";
import testIcon from "../../../../assets/dashboardIcons/test.svg";

/**
 * UI layer for the admin dashboard.
 *
 * A pure function of a view-model: no query hook, no `data?.` guards, no
 * knowledge of the analytics contract. Hand it the object
 * `dashboard.viewModel.js` produces and it renders — which is why it can be
 * exercised from a literal in a test with no store and no network.
 *
 * There is one copy of each visual shape. The four stat cards, the two figure
 * panels and the two charts are all `map` calls over the view-model, so adding
 * a card is a line of data rather than a block of JSX.
 */

/** The view-model names icons; binding a name to a file is a UI concern. */
const ICONS = {
  learners: account,
  batches: batchIcon,
  courses: courseIcon,
  tests: testIcon,
};

/**
 * One renderer per panel kind. A new kind is a new entry here — never a new
 * branch inside the loop, and never a fifth hand-written `<section>`.
 */
const PANEL_BODY = {
  figures: ({ figures, note, link }) => (
    <FigureList figures={figures} note={note}>
      {link && (
        // an affordance, not a guard — the server re-checks on the way in
        <Can perm={link.perm}>
          <NavLink
            to={link.to}
            className="text-[11px] text-accent hover:underline mt-3 inline-block"
          >
            {link.label} →
          </NavLink>
        </Can>
      )}
    </FigureList>
  ),

  chart: ({ chart }) => (
    <PieChart type={chart.type} data={chart.slices} showLegend height={220} />
  ),
};

const DashboardView = ({ stats, panels }) => (
  <>
    <DashboardCompLayout>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ key, icon, ...card }) => (
          <StatsCard key={key} iconPath={ICONS[icon]} {...card} />
        ))}
      </div>
    </DashboardCompLayout>

    <DashboardCompLayout>
      <div className="grid gap-4 md:grid-cols-2">
        {panels.map((panel) => (
          <Panel key={panel.key} title={panel.title}>
            {PANEL_BODY[panel.kind](panel)}
          </Panel>
        ))}
      </div>
    </DashboardCompLayout>
  </>
);

export default DashboardView;
