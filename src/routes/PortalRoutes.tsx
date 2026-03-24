import { Navigate, type RouteObject } from "react-router";
import DashboardLayout from "../layouts/DashboardLayout";
import AgentDashboardLayout from "../layouts/AgentDashboardLayout";
import RouteGuard from "../layouts/RouteGuard";
import Dashboard from "../pages/portal/dashboard";
import CustomerDashboard from "../pages/portal/customer-dashboard";
import ChatSessionManagementPage from "../pages/portal/chat-session-management";
import AgentDashboard from "../pages/portal/agent-dashboard";
import AgentSettingsPage from "../sections/settings/AgentSettingsPage";

const PortalRoutes: RouteObject[] = [
  {
    element: <RouteGuard />,
    children: [
      {
        path: "portal",
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            element: <DashboardLayout />,
            children: [
              { path: "dashboard", element: <Dashboard /> },
              { path: "analytics", element: <Dashboard /> },
              { path: "agents", element: <Dashboard /> },
              { path: "queue", element: <Dashboard /> },
              { path: "history", element: <Dashboard /> },
              { path: "conversations", element: <Dashboard /> },
              { path: "billing", element: <Dashboard /> },
              { path: "assignment", element: <Dashboard /> },
              { path: "account-settings", element: <Dashboard /> },
              { path: "widget-settings", element: <Dashboard /> },
              { path: "company-info", element: <Dashboard /> },
              { path: "tools", element: <Dashboard /> },
              { path: "quick-replies", element: <Dashboard /> },
              { path: "chat-sessions", element: <ChatSessionManagementPage /> },
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
          { path: "account", element: <CustomerDashboard /> },
        ],
      },
    ],
  },
];

export default PortalRoutes;
