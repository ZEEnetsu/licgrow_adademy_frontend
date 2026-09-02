import { NavLink, useSearchParams } from "react-router-dom";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout";
import DataTable from "../../components/dataTable/DataTable";
import TestCard from "../../components/TestCard";
import draftIcon from "../../../../assets/testIcons/draft.svg";
import publishedIcon from "../../../../assets/testIcons/published.svg";
import deletedIcon from "../../../../assets/testIcons/deleted.svg";
import {
  useGetTestsQuery,
  TEST_STATUS,
} from "../../../../app/apis/tests.api";
import { getUserMessage } from "../../../../app/apis/apiError";

/**
 * Test overview — `api-contracts/09-test.md` §2.
 *
 * With no `?status=`, shows all three status groups. The tabs in Test.jsx set
 * `?status=` to narrow to one. Server-side filtering, so the list endpoint
 * does the work rather than fetching everything and filtering client-side.
 */

const STATUS_META = {
  [TEST_STATUS.DRAFT]: { label: "Draft tests", icon: draftIcon },
  [TEST_STATUS.PUBLISHED]: { label: "Published tests", icon: publishedIcon },
  [TEST_STATUS.ARCHIVED]: { label: "Archived tests", icon: deletedIcon },
};

const TestOverview = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  const { data, isLoading, isError, error, isFetching } = useGetTestsQuery(
    status ? { status } : undefined,
  );

  if (isLoading) {
    return (
      <DashboardCompLayout>
        <p className="text-text-muted">Loading tests…</p>
      </DashboardCompLayout>
    );
  }

  if (isError) {
    return (
      <DashboardCompLayout>
        <p className="text-danger">
          Couldn&apos;t load tests — {getUserMessage(error)}
        </p>
      </DashboardCompLayout>
    );
  }

  const tests = data?.items ?? [];
  const total = data?.meta?.total ?? tests.length;

  if (!tests.length) {
    return (
      <DashboardCompLayout>
        <p className="font-semibold text-text-muted">
          {status ? `No ${status} tests.` : "No tests yet."}
        </p>
        <p className="text-text-muted text-xs mt-1">
          Use “draft test” above to create one.
        </p>
      </DashboardCompLayout>
    );
  }

  // one group when filtered, all three otherwise
  const groups = status
    ? [[status, tests]]
    : Object.keys(STATUS_META)
        .map((key) => [key, tests.filter((test) => test.status === key)])
        .filter(([, list]) => list.length > 0);

  return (
    <div className={isFetching ? "opacity-60 transition-opacity" : undefined}>
      {groups.map(([groupStatus, list]) =>
        groupStatus === TEST_STATUS.ARCHIVED ? (
          <DashboardCompLayout key={groupStatus}>
            <DataTable
              title={STATUS_META[groupStatus].label}
              borderColor="border-danger"
              toAllTests="/admin/manage-test/view-all-test"
              testData={list.map((test) => ({
                Id: test.id,
                title: test.title,
                kind: test.kind,
                totalMarks: test.totalMarks,
                questionCount: test.questionCount,
              }))}
            />
          </DashboardCompLayout>
        ) : (
          <DashboardCompLayout key={groupStatus}>
            <div className="flex items-baseline justify-between">
              <h1 className="font-semibold">
                {STATUS_META[groupStatus]?.label ?? groupStatus}
              </h1>
              <span className="text-xs text-text-muted">
                {list.length}
                {status ? ` of ${total}` : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-3 items-center">
              {list.map((test) => (
                <NavLink key={test.id} to={`tests/${test.id}`}>
                  <TestCard
                    title={test.title}
                    iconURL={STATUS_META[groupStatus]?.icon ?? draftIcon}
                    Id={test.id}
                    meta={`${test.questionCount ?? 0} Q · ${test.totalMarks ?? 0} marks`}
                  />
                </NavLink>
              ))}
            </div>
          </DashboardCompLayout>
        ),
      )}
    </div>
  );
};

export default TestOverview;
