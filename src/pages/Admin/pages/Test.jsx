import Btn from "../components/Btn";
import Heading from "../components/Heading";
import add from "../../../assets/dashboardIcons/add.svg";
import DataTable from "../components/dataTable/DataTable";
import { useState } from "react";
import ProtalLayout from "../../../layouts/PortalLayput";
import DraftTestFrom from "../../../modals/DraftTestFrom";
import TestCard from "../components/TestCard";
import draftIcon from "../../../assets/testIcons/draft.svg";
import publishedIcon from "../../../assets/testIcons/published.svg";
import DashboardCompLayout from "../../../layouts/DashboardCompLayout";
import { NavLink, Outlet } from "react-router-dom";
import { link } from "framer-motion/client";

const Test = () => {
  const [open, setOpen] = useState(false);
  const testNavData = [
    {name:"Overview", link:'/admin/manage-test'},
    { name: "Draft", link: "darft" },
    { name: "Published", link: "published" },
    { name: "Deleted", link: "deleted" },
  ];
  return (
    <div>
      <DashboardCompLayout>
        <div className="flex gap-2 justify-between items-center">
          <div className="flex gap-4 items-center">
            {testNavData.map((el, idx) => {
              return (
                <NavLink key={el.name} to={el.link} className={({isActive})=>
                  `
                  text-sm
                  ${isActive?'text-green-400':'text-zinc-500'}
                  `
                }>
                  {el.name}
                </NavLink>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NavLink
              to={"view-all-test"}
              className={
                "px-3 py-1 bg-zinc-800 text-center hover:bg-zinc-700 transition-all duration-300 rounded-md"
              }
            >
              view all test
            </NavLink>
            <Btn variant="secondary" size="xs" title={"Create Test"} onClick={() => setOpen(true)} />
          </div>
          {open && (
            <ProtalLayout heading={"Draft test"} onClose={() => setOpen(false)}>
              <DraftTestFrom onClose={open} />
            </ProtalLayout>
          )}
        </div>
      </DashboardCompLayout>
      <Outlet />
    </div>
  );
};

export default Test;
