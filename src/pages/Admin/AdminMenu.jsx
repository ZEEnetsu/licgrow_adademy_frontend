import dash_logo from "../../assets/dash_logo.svg";
import user from "../../assets/dashboardIcons/account.svg";
import batch from "../../assets/dashboardIcons/batch.svg";
import test from "../../assets/dashboardIcons/test.svg";
import announcement from "../../assets/dashboardIcons/announcement.svg";
import finance from "../../assets/dashboardIcons/finance.svg";
import settings from "../../assets/dashboardIcons/settings.svg";
import course from "../../assets/dashboardIcons/course.svg";
import notification from "../../assets/notifications.svg";
import { NavLink } from "react-router-dom";
import close_menu from "../../assets/dashboardIcons/close_menu.svg";
import ToggleBtn from "../../components/ToggleBtn";

const AdminMenu = ({ activeLink,  setActiveLink}) => {
  const menuData = [
    { id: 1, title: "Dashboard",     to: "/admin/overview",       iconPath: user         },
    { id: 2, title: "User",          to: "/admin/manage-users",   iconPath: user         },
    { id: 3, title: "Batch",         to: "/admin/manage-batch",   iconPath: batch        },
    { id: 4, title: "Course",        to: "/admin/manage-course",  iconPath: course       },
    { id: 5, title: "Test",          to: "/admin/manage-test",    iconPath: test         },
    { id: 6, title: "Announcement",  to: "/manage-users",         iconPath: announcement },
    { id: 7, title: "Finance",       to: "/manage-users",         iconPath: finance      },
    { id: 8, title: "Notifications", to: "/manage-users",         iconPath: notification },
    { id: 9, title: "Settings",      to: "/manage-users",         iconPath: settings     },
  ];

  return (
    <div className="row-span-12 border-r border-surface-elevated flex justify-between flex-col">
      <div>
        <div className="top px-3">
          <div className="logo py-3 flex items-center justify-between">
            <p
              className="text-green-400"
              style={{ fontFamily: '"Playwrite GB J", cursive', fontWeight: "bold" }}
            >
              Licgroww.
            </p>
            <img src={close_menu} alt="close menu" className="h-5 cursor-pointer" />
          </div>
        </div>

        <div className="flex flex-col mt-10">
          {menuData.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={()=>{
                setActiveLink(item.title)
              }}
              className={({ isActive }) =>
                `text-xs flex items-center gap-2 p-2 transition-colors duration-200
                 hover:bg-surface-elevated
                 ${isActive
                   ? "cursor-not-allowed border-t border-b border-border bg-surface-elevated"
                   : ""
                 }`
              }
            >
              <img src={item.iconPath} alt={item.title} className="p-1 h-7" />
              <p>{item.title}</p>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex justify-between p-4 text-xs">
        <p className="text-text-secondary font-medium">Dark mode</p>
        <ToggleBtn />
      </div>
    </div>
  );
};

export default AdminMenu;