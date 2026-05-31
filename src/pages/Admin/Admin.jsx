import React from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import AdminMenu from "./AdminMenu";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";

const Admin = () => {
  return (
    <AdminLayout>
      <AdminMenu />
      <AdminHeader />
      <Outlet/>
    </AdminLayout>
  );
};

export default Admin;
