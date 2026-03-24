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
              { path: "chat-sessions", element: <ChatSessionManagementPage /> },
              { path: "queue-assignment", element: <Navigate to="/portal/dashboard?tab=tools" replace /> },
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
          { path: "conversations", element: <Navigate to="/portal/dashboard" replace /> },
          { path: "account", element: <CustomerDashboard /> },
        ],
      },
    ],
  },
  { path: "conversations", element: <Navigate to="/portal/dashboard" replace /> },
];

export default PortalRoutes;
