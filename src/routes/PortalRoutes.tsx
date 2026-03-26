import { Navigate, type RouteObject } from "react-router";
import { USER_ROLES } from "../constants/constants";

import DashboardLayout from "../layouts/DashboardLayout";
import AgentDashboardLayout from "../layouts/AgentDashboardLayout";
import RouteGuard from "../layouts/RouteGuard";
import AuthGuard from "../components/guards/AuthGuard";
import Dashboard from "../pages/portal/dashboard";
import AnalyticsPage from "../pages/portal/analytics";
import QueuePage from "../pages/portal/queue";
import HistoryPage from "../pages/portal/history";
import ConversationsPage from "../pages/portal/conversations";
import BillingPage from "../pages/portal/billing";
import AssignmentPage from "../pages/portal/assignment";
import AccountSettingsPage from "../pages/portal/account-settings";
import WidgetSettingsPage from "../pages/portal/widget-settings";
import AgentDetailsPage from "../pages/portal/agent-details";
import AgentsPage from "../pages/portal/agents";
import CustomerDashboard from "../pages/portal/customer-dashboard";
import ChatSessionManagementPage from "../pages/portal/chat-session-management";
import AgentDashboard from "../pages/portal/agent-dashboard";
import AgentQueuePage from "../pages/portal/agent-queue";
import AgentHistoryPage from "../pages/portal/agent-history";
import AgentQuickRepliesPage from "../pages/portal/agent-quick-replies";
import CompanyInfoPage from "../pages/portal/company-info";
import SubscriptionPlansPage from "../pages/portal/subscription-plans";
import HomepageFaqsPage from "../pages/portal/homepage-faqs";
import QuickRepliesPage from "../pages/portal/quick-replies";
import QueueAssignmentPage from "../pages/portal/queue-assignment";
import AgentSettingsPage from "../sections/settings/AgentSettingsPage";
import Tenants from "../pages/portal/tenants";
import TenantDetails from "../pages/portal/tenants/details";
import Payments from "../pages/portal/payments";

const PortalRoutes: RouteObject[] = [
  {
    element: <RouteGuard />,
    children: [
      {
        path: "portal",
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            element: (
              <AuthGuard
                allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
              >
                <DashboardLayout />
              </AuthGuard>
            ),
            children: [
              {
                path: "dashboard",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <Dashboard />
                  </AuthGuard>
                ),
              },
              {
                path: "analytics",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <AnalyticsPage />
                  </AuthGuard>
                ),
              },
              {
                path: "agents",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <AgentsPage />
                  </AuthGuard>
                ),
              },
              {
                path: "agents/:id",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <AgentDetailsPage />
                  </AuthGuard>
                ),
              },
              {
                path: "queue",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    <QueuePage />
                  </AuthGuard>
                ),
              },
              {
                path: "history",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <HistoryPage />
                  </AuthGuard>
                ),
              },
              {
                path: "conversations",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <ConversationsPage />
                  </AuthGuard>
                ),
              },
              {
                path: "billing",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <BillingPage />
                  </AuthGuard>
                ),
              },
              {
                path: "assignment",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <AssignmentPage />
                  </AuthGuard>
                ),
              },
              {
                path: "account-settings",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <AccountSettingsPage />
                  </AuthGuard>
                ),
              },
              {
                path: "widget-settings",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <WidgetSettingsPage />
                  </AuthGuard>
                ),
              },
              {
                path: "company-info",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}
                  >
                    <CompanyInfoPage />
                  </AuthGuard>
                ),
              },
              {
                path: "subscription-plans",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}
                  >
                    <SubscriptionPlansPage />
                  </AuthGuard>
                ),
              },
              {
                path: "homepage-faqs",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <HomepageFaqsPage />
                  </AuthGuard>
                ),
              },
              {
                path: "tools",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <Dashboard />
                  </AuthGuard>
                ),
              },
              {
                path: "quick-replies",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    <QuickRepliesPage />
                  </AuthGuard>
                ),
              },
              {
                path: "queue-assignment",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    <QueueAssignmentPage />
                  </AuthGuard>
                ),
              },
              {
                path: "chat-sessions",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    <ChatSessionManagementPage />
                  </AuthGuard>
                ),
              },
              {
                path: "tenants",
                children: [
                  {
                    index: true, element: (
                      <AuthGuard
                        allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}
                      >
                        <Tenants />
                      </AuthGuard>
                    ),
                  },
                  {
                    path: ':id',
                    element: (
                      <AuthGuard
                        allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}
                      >
                        <TenantDetails />
                      </AuthGuard>
                    )
                  }
                ]
              },
              {
                path: 'payments',
                children: [
                  {
                    index: true,
                    element: (
                      <AuthGuard
                        allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}
                      >
                        <Payments />
                      </AuthGuard>
                    )
                  }
                ]
              }
            ],
          },
          {
            path: "agent",
            element: (
              <AuthGuard allowedRoles={[USER_ROLES.SUPPORT_AGENT.value]}>
                <AgentDashboardLayout />
              </AuthGuard>
            ),
            children: [
              {
                index: true,
                element: (
                  <AuthGuard allowedRoles={[USER_ROLES.SUPPORT_AGENT.value]}>
                    <AgentDashboard />
                  </AuthGuard>
                ),
              },
              {
                path: "queue",
                element: (
                  <AuthGuard allowedRoles={[USER_ROLES.SUPPORT_AGENT.value]}>
                    <AgentQueuePage />
                  </AuthGuard>
                ),
              },
              {
                path: "history",
                element: (
                  <AuthGuard allowedRoles={[USER_ROLES.SUPPORT_AGENT.value]}>
                    <AgentHistoryPage />
                  </AuthGuard>
                ),
              },
              {
                path: "quick-replies",
                element: (
                  <AuthGuard allowedRoles={[USER_ROLES.SUPPORT_AGENT.value]}>
                    <AgentQuickRepliesPage />
                  </AuthGuard>
                ),
              },
              {
                path: "chat-sessions",
                element: (
                  <AuthGuard allowedRoles={[USER_ROLES.SUPPORT_AGENT.value]}>
                    <ChatSessionManagementPage />
                  </AuthGuard>
                ),
              },
              {
                path: "settings",
                element: (
                  <AuthGuard allowedRoles={[USER_ROLES.SUPPORT_AGENT.value]}>
                    <AgentSettingsPage />
                  </AuthGuard>
                ),
              },
            ],
          },
          { path: "account", element: <CustomerDashboard /> },
        ],
      },
    ],
  },
];

export default PortalRoutes;
