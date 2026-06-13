import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // Consolidated imports
import Admin from "./pages/Admin/Admin.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Admin/pages/Dashboard.jsx";
import Notification from "./pages/Admin/pages/Notification.jsx";
import TestHistory from "./pages/Admin/pages/ViewAllTest.jsx";
import Test from "./pages/Admin/pages/Test.jsx";
import { path } from "framer-motion/client";
import ViewAllTest from "./pages/Admin/pages/ViewAllTest.jsx";
import TestOverview from "./pages/Admin/pages/TestOverview.jsx";
import TestDetail from "./pages/Admin/pages/TestDetail.jsx";

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
      { index: true, element: <Dashboard /> },
      { path: "overview", element: <Dashboard /> },
      { path: "notifications", element: <Notification /> },
      { path: "test-history", element: <TestHistory /> },
      {
        path: "manage-test",
        element: <Test />,
        
        children: [
          { index: true, element: <TestOverview /> },
          { path: "view-all-test", element: <ViewAllTest /> },
          { path:"tests/:testId", element: <TestDetail/> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);
