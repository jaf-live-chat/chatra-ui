import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { Home } from "./Home";
import { FeaturesPage } from "./FeaturesPage";
import { HowItWorksPage } from "./HowItWorksPage";
import { IntegrationsPage } from "./IntegrationsPage";
import { PricingPage } from "./PricingPage";
import { LoginPage } from "./LoginPage";
import { FreeTrialPage } from "./FreeTrialPage";
import { Checkout } from "./components/Checkout";
import { DashboardSetup } from "./components/DashboardSetup";
import { Dashboard } from "./components/Dashboard";
import { CustomerDashboard } from "./components/CustomerDashboard";
import { ChatSessionManagementPage } from "./components/ChatSessionManagementPage";
import { RootLayout } from "./components/RootLayout";
import { DashboardLayout } from "./components/DashboardLayout";
import { AgentDashboardLayout } from "./components/AgentDashboardLayout";
import { AgentDashboard } from "./components/AgentDashboard";
import { AgentSettingsPage } from "./components/AgentSettingsPage";
import { HelpCenterPage } from "./components/HelpCenterPage";
import { ApiDocsPage } from "./components/ApiDocsPage";
import { ChangelogPage } from "./components/ChangelogPage";
import { BlogPage } from "./components/BlogPage";
import { SystemStatusPage } from "./components/SystemStatusPage";

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