import StatsCard from "../components/StatsCard.jsx";
import user from "../../../assets/user.svg";
import AreaChart from "../../../components/AreaChart.jsx";
import DataTable from "../components/dataTable/DataTable.jsx";
import DashboardCompLayout from "../../../layouts/DashboardCompLayout.jsx";
import PieChart from "../../../components/PieChart.jsx";
const Dashboard = () => {
  const statsData = [
    {
      id: 1,
      iconPath: user,
      title: "Total users",
      value: 30,
      compareTo: "compare to last month",
    },
    {
      id: 2,
      iconPath: user,
      title: "Total users",
      value: 30,
      compareTo: "compare to last month",
    },
    {
      id: 3,
      iconPath: user,
      title: "Total users",
      value: 30,
      compareTo: "compare to last month",
    },
    {
      id: 4,
      iconPath: user,
      title: "Total users",
      value: 30,
      compareTo: "compare to last month",
    },
  ];
  const testData = [
    {
      Id: 1,
      title: "Quantitative Aptitude",
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
  ];

  const scores = [
  { label: "Math",    value: 40 },
  { label: "Science", value: 25 },
  { label: "English", value: 20 },
  { label: "History", value: 15 },
];
  return (
    <div>
      <DashboardCompLayout>
        <div className="grid grid-cols-4 gap-3">
          {statsData.map((stat) => {
            return (
              <StatsCard
                key={stat.id}
                iconPath={stat.iconPath}
                title={stat.title}
                value={stat.value}
              />
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <AreaChart
            xAxisLabel="courses"
            yAxisLabel="students"
            coordinates={[
              { x: "Maths", y: 20 },
              { x: "Physics", y: 10 },
              { x: "Chemistry", y: 20 },
              { x: "Pyhton", y: 50 },
              { x: "cpp", y: 5 },
              { x: "DAA", y: 66 },
              { x: "System Design", y: 30 },
            ]}
          />
          <p className="rounded-md grid grid-cols-2 gap-3">
            <PieChart data={scores} title="student"/>
            <PieChart data={scores} title="student"/>
          </p>
        </div>
      </DashboardCompLayout>
      <DashboardCompLayout>
        <DataTable testData={testData} title={"Recent Tests"} />
      </DashboardCompLayout>
    </div>
  );
};

export default Dashboard;
