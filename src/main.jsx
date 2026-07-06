import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Admin from "./pages/Admin/Admin.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Admin/pages/Dashboard.jsx";
import Notification from "./pages/Admin/pages/Notification.jsx";
import TestHistory from "./pages/Admin/pages/test/ViewAllTest.jsx";
import Test from "./pages/Admin/pages/test/Test.jsx";
import ViewAllTest from "./pages/Admin/pages/test/ViewAllTest.jsx";
import TestOverview from "./pages/Admin/pages/test/TestOverview.jsx";
import TestDetail from "./pages/Admin/pages/test/TestDetail.jsx";
import { store } from "./app/store";
import { Provider } from "react-redux";
import Batch from "./pages/Admin/pages/batch/Batch.jsx";
import Course from "./pages/Admin/pages/course/Course.jsx";
import CourceDetailPage from "./pages/Admin/pages/course/CourceDetailPage.jsx";

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
          { path: "tests/:testId", element: <TestDetail /> },
        ],
      },
      {
        path: "manage-batch",
        element: <Batch />,
      },
      {
        path:"manage-course",
        element:<Course/>,
        children:[
          {
             path : ":courseId", element:<CourceDetailPage/>
          }
        ]
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>,
);
