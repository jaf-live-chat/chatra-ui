import { createBrowserRouter } from "react-router";
import Home from "../pages/public/home";
import RootLayout from "../layouts/RootLayout";
import PublicRoutes from "./PublicRoutes";
import PortalRoutes from "./PortalRoutes";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      ...PublicRoutes,
      ...PortalRoutes,
      { path: "*", element: <NotFound /> },
    ],
  },
]);

