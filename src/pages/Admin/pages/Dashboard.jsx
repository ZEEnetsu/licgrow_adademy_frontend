import StatsCard from "../components/StatsCard.jsx";
import user from "../../../assets/user.svg";
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

  return (
    <div className="p-5 row-span-11 col-span-7">
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
    </div>
  );
};

export default Dashboard;
