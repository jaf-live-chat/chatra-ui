import { Navigate, type RouteObject } from "react-router";
import type { ReactElement } from "react";
import { USER_ROLES } from "../constants/constants";

import DashboardLayout from "../layouts/DashboardLayout";
import RouteGuard from "../layouts/RouteGuard";
import AuthGuard from "../components/guards/AuthGuard";
import SubscriptionGuard from "../components/guards/SubscriptionGuard";
import Dashboard from "../pages/portal/dashboard";
import AnalyticsPage from "../pages/portal/analytics";
import QueuePage from "../pages/portal/queue";
import AccountSettingsPage from "../pages/portal/account-settings";
import WidgetSettingsPage from "../pages/portal/widget-settings";
import AgentDetailsPage from "../pages/portal/agent-details";
import AgentsPage from "../pages/portal/agents";
import ChatSessionManagementPage from "../pages/portal/chat-session-management";
import CompanyInfoPage from "../pages/portal/company-info";
import SubscriptionPlansPage from "../pages/portal/subscription-plans";
import HomepageFaqsPage from "../pages/portal/homepage-faqs";
import QuickRepliesPage from "../pages/portal/quick-replies";
import QuickMessagesPage from "../pages/portal/quick-messages";
import QueueAssignmentPage from "../pages/portal/queue-assignment";
import NotificationsPage from "../pages/portal/notifications";
import Tenants from "../pages/portal/tenants";
import TenantDetails from "../pages/portal/tenants/details";
import Payments from "../pages/portal/payments";
import Visitors from "../pages/portal/visitors";
import VisitorDetails from "../pages/portal/visitors/details";

const withSubscriptionGuard = (element: ReactElement, allowWhenInactive = false) => (
  <SubscriptionGuard allowWhenInactive={allowWhenInactive}>
    {element}
  </SubscriptionGuard>
);

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
                allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
              >
                <DashboardLayout />
              </AuthGuard>
            ),
            children: [
              {
                path: "dashboard",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    {withSubscriptionGuard(<Dashboard />)}
                  </AuthGuard>
                ),
              },
              {
                path: "analytics",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    {withSubscriptionGuard(<AnalyticsPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "agents",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    {withSubscriptionGuard(<AgentsPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "agents/:id",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    {withSubscriptionGuard(<AgentDetailsPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "queue",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    {withSubscriptionGuard(<QueuePage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "queue",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    {withSubscriptionGuard(<QueuePage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "visitors",
                children: [
                  {
                    index: true,
                    element: (
                      <AuthGuard
                        allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                      >
                        {withSubscriptionGuard(<Visitors />)}
                      </AuthGuard>
                    ),
                  },
                  {
                    path: ":id",
                    element: (
                      <AuthGuard
                        allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                      >
                        {withSubscriptionGuard(<VisitorDetails />)}
                      </AuthGuard>
                    ),
                  }
                ]
              },
              {
                path: "account-settings",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    {withSubscriptionGuard(<AccountSettingsPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "notifications",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    {withSubscriptionGuard(<NotificationsPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "widget-settings",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    {withSubscriptionGuard(<WidgetSettingsPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "company-info",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}
                  >
                    {withSubscriptionGuard(<CompanyInfoPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "subscription-plans",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}
                  >
                    {withSubscriptionGuard(<SubscriptionPlansPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "homepage-faqs",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value]}
                  >
                    {withSubscriptionGuard(<HomepageFaqsPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "tools",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    {withSubscriptionGuard(<Dashboard />)}
                  </AuthGuard>
                ),
              },
              {
                path: "quick-replies",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    {withSubscriptionGuard(<QuickRepliesPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "quick-messages",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    {withSubscriptionGuard(<QuickMessagesPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "queue-assignment",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                  >
                    {withSubscriptionGuard(<QueueAssignmentPage />)}
                  </AuthGuard>
                ),
              },
              {
                path: "chat-sessions",
                element: (
                  <AuthGuard
                    allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value]}
                  >
                    {withSubscriptionGuard(<ChatSessionManagementPage />, true)}
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
                        {withSubscriptionGuard(<Tenants />)}
                      </AuthGuard>
                    ),
                  },
                  {
                    path: ':id',
                    element: (
                      <AuthGuard
                        allowedRoles={[USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value]}
                      >
                        {withSubscriptionGuard(<TenantDetails />, true)}
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
                        {withSubscriptionGuard(<Payments />)}
                      </AuthGuard>
                    )
                  }
                ]
              }
            ],
          },
        ],
      },
    ],
  },
];

export default PortalRoutes;
