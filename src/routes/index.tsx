import { createBrowserRouter, Outlet, Navigate } from "react-router";
import Home from "../pages/public/home";
import FeaturesPage from "../pages/public/features";
import HowItWorksPage from "../pages/public/how-it-works";
import IntegrationsPage from "../pages/public/integrations";
import PricingPage from "../pages/public/pricing";
import LoginPage from "../pages/public/login";
import FreeTrialPage from "../pages/public/free-trial";
import Checkout from "../pages/portal/checkout";
import DashboardSetup from "../layouts/DashboardSetup";
import Dashboard from "../pages/portal/dashboard";
import CustomerDashboard from "../pages/portal/customer-dashboard";
import ChatSessionManagementPage from "../pages/portal/chat-session-management";
import RootLayout from "../layouts/RootLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AgentDashboardLayout from "../layouts/AgentDashboardLayout";
import AgentDashboard from "../pages/portal/agent-dashboard";
import AgentSettingsPage from "../sections/settings/AgentSettingsPage";
import HelpCenterPage from "../pages/public/help-center";
import ApiDocsPage from "../pages/public/api-docs";
import ChangelogPage from "../pages/public/changelog";
import BlogPage from "../pages/public/blog";
import SystemStatusPage from "../pages/public/system-status";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
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
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "chat-sessions", element: <ChatSessionManagementPage /> },
          { path: "queue-assignment", element: <Navigate to="/dashboard?tab=tools" replace /> },
        ],
      },
      {
        path: "agent",
        element: <AgentDashboardLayout />,
        children: [
          { index: true, element: <AgentDashboard /> },
          { path: "chat-sessions", element: <ChatSessionManagementPage /> },
          { path: "settings", element: <AgentSettingsPage /> },
        ],
      },
      { path: "conversations", element: <Navigate to="/dashboard" replace /> },
      { path: "account", element: <CustomerDashboard /> },
      { path: "*", element: <Home /> },
    ],
  },
]);

