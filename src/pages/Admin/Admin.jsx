import React , {useState} from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import AdminMenu from "./AdminMenu";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import DashboardLayout from "../../layouts/DashboardLayout";
import {useThemeSync} from '../../app/features/useThemeSync.js'

const Admin = () => {

  const [activeLink , setActiveLink] = useState("Dashboard");

  useThemeSync();
  return (
    <AdminLayout>
      <AdminMenu activeLink={activeLink} setActiveLink={setActiveLink} />
      <AdminHeader activeLink={activeLink} />
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </AdminLayout>
  );
};

export default Admin;
