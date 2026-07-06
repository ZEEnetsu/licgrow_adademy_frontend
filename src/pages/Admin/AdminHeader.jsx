import ShieldMark from "../../components/ShieldMark";
import notification from "../../assets/notifications.svg";
import Icon from "../../components/Icon";
import info from "../../assets/info.svg";
import search from "../../assets/search.svg";
import { NavLink } from "react-router-dom";
import Link from "../../components/Link.jsx";
import calendar_month from "../../assets/calendar_month.svg";
import { useEffect, useState } from "react";
import avatarPlaceholder from "../../assets/dashboardIcons/avatarPlaceholder.svg";
import adminAvatar from '../../assets/avatar/adminAvatar.jpg'
const AdminHeader = ({ activeLink }) => {
  const navData = [
    { id: 1, to: "/admin/overview", name: "Overview" },
    { id: 2, to: "/admin/notifications", name: "Notifications" },
    { id: 3, to: "/admin/test-history", name: "Test History" },
  ];

  const [currentDate] = useState(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  });

  return (
    <header className="px-3 border-b border-surface-elevated col-span-7 row-span-1 flex flex-col justify-center">
      <div className="flex items-center justify-between px-2">
        <div className="font-semibold text-3xl">
          <div className="">{activeLink}</div>
        </div>
        <div className="flex items-center gap-2">
           <div className="mt-2 mr-4 text-zinc-400 text-xs">{currentDate}</div>
            <input
              placeholder="search"
              className="mt-3 px-2 py-1 rounded-xl bg-zinc-900 text-[14px] placeholder:text-[14px] placeholder:font-semibold placeholder:text-zinc-600 outline-none"
            />
          <div className="flex items-baseline gap-4">
            <Icon imageURL={search} />
            <Icon imageURL={info} />
            <Icon imageURL={notification} />
            <img
              src={adminAvatar}
              alt={avatarPlaceholder}
              className="h-10 rounded-full"
            />
          </div>    
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
