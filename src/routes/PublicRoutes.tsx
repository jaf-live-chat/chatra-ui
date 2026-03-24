import type { RouteObject } from "react-router";
import Home from "../pages/public/home";
import FeaturesPage from "../pages/public/features";
import HowItWorksPage from "../pages/public/how-it-works";
import IntegrationsPage from "../pages/public/integrations";
import PricingPage from "../pages/public/pricing";
import LoginPage from "../pages/public/login";
import FreeTrialPage from "../pages/public/free-trial";
import Checkout from "../pages/portal/checkout";
import DashboardSetup from "../layouts/DashboardSetup";
import HelpCenterPage from "../pages/public/help-center";
import ApiDocsPage from "../pages/public/api-docs";
import ChangelogPage from "../pages/public/changelog";
import BlogPage from "../pages/public/blog";
import SystemStatusPage from "../pages/public/system-status";

const PublicRoutes: RouteObject[] = [
  { index: true, element: <Home /> },
  { path: "features", element: <FeaturesPage /> },
  { path: "how-it-works", element: <HowItWorksPage /> },
  { path: "integrations", element: <IntegrationsPage /> },
  { path: "pricing", element: <PricingPage /> },
  { path: "login", element: <LoginPage /> },
  { path: "free-trial", element: <FreeTrialPage /> },
  { path: "checkout", element: <Checkout /> },
  { path: "checkout/:planId", element: <Checkout /> },
  { path: "setup", element: <DashboardSetup /> },
  {
    path: "resources/help-center",
    element: <HelpCenterPage />,
  },
  {
    path: "resources/api-developers",
    element: <ApiDocsPage />,
  },
  {
    path: "resources/changelog",
    element: <ChangelogPage />,
  },
  {
    path: "resources/blog-guides",
    element: <BlogPage />,
  },
  {
    path: "resources/system-status",
    element: <SystemStatusPage />,
  },
];

export default PublicRoutes;
