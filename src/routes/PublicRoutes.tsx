import type { RouteObject } from "react-router";
import Home from "../pages/public/home";
import FeaturesPage from "../pages/public/features";
import HowItWorksPage from "../pages/public/how-it-works";
import IntegrationsPage from "../pages/public/integrations";
import PricingPage from "../pages/public/pricing";
import LoginPage from "../pages/public/login";
import ForgotPasswordPage from "../pages/public/forgot-password";
import ResetPasswordPage from "../pages/public/reset-password";
import Checkout from "../pages/portal/checkout/index";
import CheckoutCancelledPage from "../pages/public/checkout-cancelled/index";
import DashboardSetup from "../layouts/DashboardSetup";
import DashboardRenewal from "../layouts/DashboardRenewal";
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
  { path: "forgot-password", element: <ForgotPasswordPage /> },
  { path: "reset-password", element: <ResetPasswordPage /> },
  { path: "checkout/:planId", element: <Checkout /> },
  { path: "setup/cancelled", element: <CheckoutCancelledPage /> },
  { path: "renewal/cancelled", element: <CheckoutCancelledPage /> },
  { path: "setup", element: <DashboardSetup /> },
  { path: "renewal", element: <DashboardRenewal /> },
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
