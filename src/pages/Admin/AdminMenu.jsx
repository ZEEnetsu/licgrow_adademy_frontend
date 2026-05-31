import dash_logo from "../../assets/dash_logo.svg";
import user from "../../assets/dashboardIcons/account.svg";
import batch from "../../assets/dashboardIcons/batch.svg";
import test from "../../assets/dashboardIcons/test.svg";
import announcement from "../../assets/dashboardIcons/announcement.svg";
import finance from "../../assets/dashboardIcons/finance.svg";
import settings from "../../assets/dashboardIcons/settings.svg";
import course from "../../assets/dashboardIcons/course.svg";
import notification from "../../assets/notifications.svg";
import { div } from "framer-motion/client";
import { NavLink } from "react-router-dom";
import close_menu from "../../assets/dashboardIcons/close_menu.svg";
const AdminMenu = () => {
  const menuData = [
    { id: 1, title: "User", to: "/manage-users", iconPath: user },
    { id: 2, title: "Batch", to: "/manage-users", iconPath: batch },
    { id: 3, title: "Cource", to: "/manage-users", iconPath: test },
    { id: 4, title: "Test", to: "/manage-users", iconPath: test },
    {
      id: 5,
      title: "Announcement",
      to: "/manage-users",
      iconPath: announcement,
    },
    { id: 6, title: "Finance", to: "/manage-users", iconPath: finance },
    {
      id: 7,
      title: "Notifications",
      to: "/manage-users",
      iconPath: notification,
    },
    { id: 8, title: "Settings", to: "/manage-users", iconPath: settings },
  ];

  return (
    <div className="p-2 row-span-12 border-r border-green-100/10">
      <div className="top">
        <div className="logo p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={dash_logo} alt={dash_logo} className="h-6" />
            <p className="font-semibold text-zinc-300">Licgrow</p>
          </div>
          <img
            src={close_menu}
            alt={close_menu}
            className="h-6 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 mt-10">
        {menuData.map((item) => {
          return (
            <div key={item.id}>
              <NavLink
                to={item.to}
                className={`text-xs flex items-center gap-2 px-2 py-1 rounded-md hover:bg-green-400/30 transition-all duration-200`}
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
  );
};

export default AdminMenu;
