import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom";

import Btn from "../../components/Btn";
import ProtalLayout from "../../../../layouts/PortalLayput";
import DraftTestFrom from "../../../../modals/DraftTestFrom";
import DashboardCompLayout from "../../../../layouts/DashboardCompLayout";
import { TEST_STATUS } from "../../../../app/apis/tests.api";

/**
 * Test module shell.
 *
 * The status tabs filter the overview via `?status=`, rather than pointing at
 * child routes — the previous links (`darft`, `published`, `deleted`) had no
 * matching routes and were dead. Filtering happens server-side in §2.
 */

const TABS = [
  { name: "Overview", status: null },
  { name: "Draft", status: TEST_STATUS.DRAFT },
  { name: "Published", status: TEST_STATUS.PUBLISHED },
  { name: "Archived", status: TEST_STATUS.ARCHIVED },
];

const Test = () => {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  const activeStatus = searchParams.get("status");
  // the tabs only apply to the index route
  const onOverview = pathname.replace(/\/$/, "").endsWith("/manage-test");

  return (
    <div>
      <DashboardCompLayout>
        <div className="flex gap-2 justify-between items-center">
          <div className="flex gap-4 items-center px-3">
            {TABS.map((tab) => {
              const isActive = onOverview && activeStatus === tab.status;
              return (
                <Link
                  key={tab.name}
                  to={
                    tab.status
                      ? `/admin/manage-test?status=${tab.status}`
                      : "/admin/manage-test"
                  }
                  className={`text-sm transition-colors ${
                    isActive
                      ? "text-text-primary font-medium"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NavLink
              to="view-all-test"
              className="px-3 py-1 bg-surface-elevated text-center hover:bg-surface-elevated-hover transition-all duration-300 rounded-md text-sm"
            >
              view all test
            </NavLink>
            <Btn
              variant="secondary"
              size="sm"
              title="draft test"
              className="text-center"
              onClick={() => setOpen(true)}
            />
          </div>

          {open && (
            <ProtalLayout heading="Draft test" onClose={() => setOpen(false)}>
              <DraftTestFrom onClose={() => setOpen(false)} />
            </ProtalLayout>
          )}
        </div>
      </DashboardCompLayout>

      <Outlet />
    </div>
  );
};

export default Test;
