import {
  BarChart2,
  Building2,
  Headset,
  LayoutDashboard,
  ListOrdered,
  MessagesSquare,
  Settings2,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

import { USER_ROLES } from "./constants";

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]["value"];

type ModuleItem = {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  allowedRoles: UserRole[];
};

type ModuleGroup = {
  id: string;
  label: string;
  allowedRoles: UserRole[];
  modules: ModuleItem[];
};

const MODULE_GROUPS: ModuleGroup[] = [
  {
    id: "group-navigation",
    label: "Menu",
    allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value],
    modules: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/portal/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value],
      },
      {
        id: "analytics",
        label: "Analytics",
        path: "/portal/analytics",
        icon: <BarChart2 className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value],
      },
      {
        id: "agents",
        label: "Agents",
        path: "/portal/agents",
        icon: <Headset className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value],
      },
    ],
  },
  {
    id: "group-live-chat",
    label: "Live Chat",
    allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value],
    modules: [
      {
        id: "queue",
        label: "Queue",
        path: "/portal/queue",
        icon: <ListOrdered className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value],
      },
      {
        id: "chat-sessions",
        label: "Chat Sessions",
        path: "/portal/chat-sessions",
        icon: <MessagesSquare className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value, USER_ROLES.SUPPORT_AGENT.value],
      },
    ],
  },
  {
    id: "group-settings",
    label: "Settings",
    allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value],
    modules: [
      {
        id: "widget-settings",
        label: "Widget Settings",
        path: "/portal/widget-settings",
        icon: <Settings2 className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value],
      },
      {
        id: "company-info",
        label: "Company Info",
        path: "/portal/company-info",
        icon: <Building2 className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.MASTER_ADMIN.value],
      },
    ],
  },
  {
    id: "group-tools",
    label: "Tools",
    allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value],
    modules: [
      {
        id: "tools",
        label: "Tools",
        path: "/portal/tools",
        icon: <Zap className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.MASTER_ADMIN.value, USER_ROLES.ADMIN.value],
      },
    ],
  },
  {
    id: "group-agent-live-chat",
    label: "Live Chat",
    allowedRoles: [USER_ROLES.SUPPORT_AGENT.value],
    modules: [
      {
        id: "agent-queue",
        label: "Queue",
        path: "/portal/agent",
        icon: <ListOrdered className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.SUPPORT_AGENT.value],
      },
      {
        id: "agent-chat-sessions",
        label: "Chat Sessions",
        path: "/portal/agent/chat-sessions",
        icon: <MessagesSquare className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.SUPPORT_AGENT.value],
      },
    ],
  },
  {
    id: "group-agent-tools",
    label: "Tools",
    allowedRoles: [USER_ROLES.SUPPORT_AGENT.value],
    modules: [
      {
        id: "agent-quick-replies",
        label: "Quick Replies",
        path: "/portal/agent?tab=quick-replies",
        icon: <Zap className="w-5 h-5" />,
        allowedRoles: [USER_ROLES.SUPPORT_AGENT.value],
      },
    ],
  },
];

export type { ModuleGroup, ModuleItem, UserRole };
export { MODULE_GROUPS };