import React, { useEffect, useState } from "react";
import DashboardCompLayout from "../../../../layouts/DashboardCompLayout";
import DataTable from "../../components/dataTable/DataTable";
import Btn from "../../components/Btn";
import TestCard from "../../components/TestCard";
import draftIcon from "../../../../assets/testIcons/draft.svg";
import publishedIcon from "../../../../assets/testIcons/published.svg";
import { NavLink } from "react-router-dom";
import useApiCall from "../../../../hooks/useApiCall";
import { useGetTestsQuery } from "../../../../app/apis/tests.api";
const TestOverview = () => {
  const testData = [
    {
      Id: 1,
      title: "Quantitative Aptitude Quantitative Aptitude",
      passingMarks: 15,
      totalMarks: 30,
      userAppeared: 120,
      avgScore: 17,
      highestScore: 29,
    },
    {
      Id: 2,
      title: "Logical Reasoning Basics",
      passingMarks: 20,
      totalMarks: 50,
      userAppeared: 345,
      avgScore: 32,
      highestScore: 48,
    },
    {
      Id: 3,
      title: "Verbal Ability Full Length",
      passingMarks: 40,
      totalMarks: 100,
      userAppeared: 89,
      avgScore: 61,
      highestScore: 94,
    },
    {
      Id: 4,
      title: "Data Interpretation Adv.",
      passingMarks: 12,
      totalMarks: 25,
      userAppeared: 210,
      avgScore: 14,
      highestScore: 24,
    },
    {
      Id: 5,
      title: "General Knowledge Weekly",
      passingMarks: 15,
      totalMarks: 40,
      userAppeared: 530,
      avgScore: 22,
      highestScore: 38,
    },
    {
      Id: 6,
      title: "Quantitative Aptitude",
      passingMarks: 15,
      totalMarks: 30,
      userAppeared: 120,
      avgScore: 17,
      highestScore: 29,
    },
    {
      Id: 7,
      title: "Logical Reasoning Basics",
      passingMarks: 20,
      totalMarks: 50,
      userAppeared: 345,
      avgScore: 32,
      highestScore: 48,
    },
    {
      Id: 8,
      title: "Verbal Ability Full Length",
      passingMarks: 40,
      totalMarks: 100,
      userAppeared: 89,
      avgScore: 61,
      highestScore: 94,
    },
    {
      Id: 9,
      title: "Data Interpretation Adv.",
      passingMarks: 12,
      totalMarks: 25,
      userAppeared: 210,
      avgScore: 14,
      highestScore: 24,
    },
    {
      Id: 10,
      title: "General Knowledge Weekly",
      passingMarks: 15,
      totalMarks: 40,
      userAppeared: 530,
      avgScore: 22,
      highestScore: 38,
    },
  ];
  const testData2 = [
    {
      Id: 1,
      title: "Quantitative Aptitude",
      passingMarks: 15,
      totalMarks: 30,
      userAppeared: 120,
      avgScore: 17,
      highestScore: 29,
      Actions: <Btn title={"publish"} size="xs" variant="secondary" />,
    },
    {
      Id: 2,
      title: "Logical Reasoning Basics",
      passingMarks: 20,
      totalMarks: 50,
      userAppeared: 345,
      avgScore: 32,
      highestScore: 48,
      Actions: <Btn title={"publish"} size="xs" variant="secondary" />,
    },
    {
      Id: 3,
      title: "Verbal Ability Full Length",
      passingMarks: 40,
      totalMarks: 100,
      userAppeared: 89,
      avgScore: 61,
      highestScore: 94,
      Actions: <Btn title={"publish"} size="xs" variant="secondary" />,
    },
    {
      Id: 4,
      title: "Data Interpretation Adv.",
      passingMarks: 12,
      totalMarks: 25,
      userAppeared: 210,
      avgScore: 14,
      highestScore: 24,
      Actions: <Btn title={"publish"} size="xs" variant="secondary" />,
    },
    {
      Id: 5,
      title: "General Knowledge Weekly",
      passingMarks: 15,
      totalMarks: 40,
      userAppeared: 530,
      avgScore: 22,
      highestScore: 38,
      Actions: <Btn title={"publish"} size="xs" variant="secondary" />,
    },
  ];

  // const [test, setTest] = useState(null);
  // const { data, loading, error } = useApiCall("/tests");
  //  console.log(data);
  // if (loading) {
  //   return (
  //     <DashboardCompLayout>
  //       <div className="text-zinc-400 p-6">Loading tests...</div>
  //     </DashboardCompLayout>
  //   );
  // }

  // if (error) {
  //   return (
  //     <DashboardCompLayout>
  //       <div className="text-red-400 p-6">Failed to load tests.</div>
  //     </DashboardCompLayout>
  //   );
  // }

  // const testsArray = data?.tests || [];

  const { data, isLoading, isError, error } = useGetTestsQuery();
    console.log("Raw RTK query data -> ", data);
  
    if (isLoading) {
      return <div>Loading Data ...</div>;
    }
  
    if (isError) {
      console.error("RTK Query Fetch Error:", error);
      return (
        <div className="text-red-400 font-semibold">Error Loading Data X </div>
      );
    };
    const testList = data?.data?.tests || [];


  return (
    <div>
      <DashboardCompLayout>
        <div>
          <h1 className="font-semibold">Draft Test</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-3 items-center">
            {testList.map((test) => {
              return (
                <NavLink key={test.testId} to={`tests/${test.testId}`}>
                  <TestCard
                    title={test.title}
                    iconURL={draftIcon}
                    Id={test.testId}
                  />
                </NavLink>
              );
            })}
          </div>
        </div>
      </DashboardCompLayout>
      <DashboardCompLayout>
        <div className="">
          <h1 className="font-semibold">Published Test</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-3 items-center">
            {testData.map((test) => {
              return (
                <TestCard
                  key={test.Id}
                  title={test.title}
                  iconURL={publishedIcon}
                />
              );
            })}
          </div>
        </div>
      </DashboardCompLayout>
      <DashboardCompLayout>
        <DataTable
          testData={testData}
          title={"Removed Tests"}
          borderColor={"border-red-500"}
        />
      </DashboardCompLayout>
    </div>
  );
};

export default TestOverview;
