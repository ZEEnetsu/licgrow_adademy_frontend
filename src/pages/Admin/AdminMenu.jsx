import dash_logo from "../../assets/dash_logo.svg";
import user from "../../assets/dashboardIcons/account.svg";
import batch from "../../assets/dashboardIcons/batch.svg";
import test from "../../assets/dashboardIcons/test.svg";
import announcement from "../../assets/dashboardIcons/announcement.svg";
import finance from "../../assets/dashboardIcons/finance.svg";
import settings from "../../assets/dashboardIcons/settings.svg";
import course from "../../assets/dashboardIcons/course.svg";
import notification from "../../assets/notifications.svg";
import { div, title } from "framer-motion/client";
import { NavLink } from "react-router-dom";
import close_menu from "../../assets/dashboardIcons/close_menu.svg";
import ToggleBtn from "../../components/ToggleBtn";
const AdminMenu = () => {
  const menuData = [
    {id:1, title:"Dashboard", to:"/admin/overview", iconPath:user},
    { id: 2, title: "User", to: "/manage-users", iconPath: user },
    { id: 3, title: "Batch", to: "/manage-users", iconPath: batch },
    { id: 4, title: "Cource", to: "/manage-users", iconPath: test },
    { id: 5, title: "Test", to: "/admin/manage-test", iconPath: test },
    {
      id: 6,
      title: "Announcement",
      to: "/manage-users",
      iconPath: announcement,
    },
    { id: 7, title: "Finance", to: "/manage-users", iconPath: finance },
    {
      id: 8,
      title: "Notifications",
      to: "/manage-users",
      iconPath: notification,
    },
    { id: 9, title: "Settings", to: "/manage-users", iconPath: settings },
  ];

  return (
    <div className="row-span-12 border-r border-green-100/10 flex justify-between flex-col">
      <div>
        <div className="top px-3">
          <div className="logo py-3 flex items-center justify-between">
            <p
            className="text-green-400"
            style={{
              fontFamily:'"Playwrite GB J", cursive',
              fontWeight:'bold'
            }}
            >Licgroww.</p>
            <img
              src={close_menu}
              alt={close_menu}
              className="h-5 cursor-pointer"
            />
          </div>
        </div>
        <div className="flex flex-col mt-10">
          {menuData.map((item) => {
            return (
              <div key={item.id}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `text-xs flex items-center gap-2 p-2 hover:bg-zinc-900 transition-colors duration-200
                  ${isActive ? "cursor-not-allowed border-t border-b border-zinc-800 bg-zinc-800/20" : ""}
                  `
                  }
                >
                  <img
                    src={item.iconPath}
                    alt={item.iconPath}
                    className="p-1 h-7"
                  />
                  <p>{item.title}</p>
                </NavLink>
              </div>
            );
          })}
        </div>
      </div>
      <div className="">
        <div className="flex justify-between p-4 text-xs">
          <p className="text-zinc-500 font-medium">Dark mode</p>
          <ToggleBtn/>
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;
