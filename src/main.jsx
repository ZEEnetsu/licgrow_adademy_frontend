import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // Consolidated imports
import Admin from "./pages/Admin/Admin.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Admin/pages/Dashboard.jsx";
import Notification from "./pages/Admin/pages/Notification.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <Admin />,
    children: [
      { path: "/admin/overview", element: <Dashboard /> },
      { path:"/admin/notifications",element:<Notification/>}
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
