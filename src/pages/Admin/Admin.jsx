import React from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import AdminMenu from "./AdminMenu";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import DashboardLayout from "../../layouts/DashboardLayout";

const Admin = () => {
  return (
    <AdminLayout>
      <AdminMenu />
      <AdminHeader />
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </AdminLayout>
  );
};

export default Admin;
