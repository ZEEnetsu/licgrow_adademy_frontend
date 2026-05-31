import ShieldMark from "../../components/ShieldMark";
import notification from "../../assets/notifications.svg";
import Icon from "../../components/Icon";
import info from "../../assets/info.svg";
import search from "../../assets/search.svg";
import { NavLink } from "react-router-dom";
import Link from '../../components/Link.jsx'
import calendar_month from '../../assets/calendar_month.svg'
import { useEffect, useState } from "react";
const AdminHeader = ({ classname = "" }) => {

  const navData = [
     {id:1,to:'/admin/overview',name:'Overview'},
     {id:2,to:'/admin/notifications',name:'Notifications'},
     {id:3,to:'/admin/test-history',name:'Test History'},
  ]


  const [currentDate] = useState(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  });

  return (
    <header className="px-3 border-b border-1 border-green-100/10 col-span-7 row-span-2 flex flex-col justify-between">
      <div className="flex items-center justify-between px-2 py-4">
        <div className="font-semibold text-3xl">Dashboard</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <input
              placeholder="search"
              className="px-2 py-1 rounded-xl bg-zinc-900 text-[14px] placeholder:text-[14px] placeholder:font-semibold placeholder:text-zinc-600 outline-none"
            />
            <Icon imageURL={search} />
          </div>
          <div className="flex gap-2 items-center">
            <Icon imageURL={info} />
            <Icon imageURL={notification} />
          </div>
        </div>
      </div>
      <div className="flex px-2 items-center justify-between">
        <div className="flex gap-3 text-xs text-zinc-400">
          {
            navData.map((link)=>{
               return <Link to={link.to} name={link.name} key={link.id}/>
            })
          }
        </div>
        <div>
          <span className="flex text-xs rounded-md items-center gap-2 bg-zinc-800/10"> <Icon imageURL={calendar_month}/> <div className="mr-3">{currentDate}</div></span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
