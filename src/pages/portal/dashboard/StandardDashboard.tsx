import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  Clock3,
  CreditCard,
  MessageCircle,
  MessagesSquare,
  RefreshCcw,
  ShieldCheck,
  SquareArrowOutUpRight,
  Users,
  UserRoundCog,
  ListOrdered,
  BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import TitleTag from "../../../components/TitleTag";
import useAuth from "../../../hooks/useAuth";
import useGetRole from "../../../hooks/useGetRole";
import { useGetActiveLiveChat, useGetLiveChatHistory, useGetLiveChatQueue } from "../../../hooks/useLiveChat";
import { useGetAgents } from "../../../services/agentServices";
import type { LiveChatConversation, LiveChatQueueEntry } from "../../../models/LiveChatModel";
import toTitleCase from "../../../utils/toTitleCase";

type StandardDashboardProps = {
  hideAnalyticsTeaser?: boolean;
};

type DashboardAction = {
  label: string;
  description: string;
  icon: typeof Activity;
  to: string;
  accent: "cyan" | "emerald" | "slate" | "amber" | "violet" | "rose";
};

const formatInteger = (value?: number | null) => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Number(value).toLocaleString();
};

const formatDuration = (seconds?: number | null) => {
  if (!Number.isFinite(seconds) || seconds === null) {
    return "--";
  }

  const safeSeconds = Math.max(0, Math.round(Number(seconds)));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

const formatElapsedTime = (value?: string | null) => {
  if (!value) {
    return "--";
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "--";
  }

  return formatDuration((Date.now() - timestamp) / 1000);
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const isConversationObject = (value: LiveChatQueueEntry["conversationId"]): value is LiveChatConversation => {
  return typeof value === "object" && value !== null;
};

const isCurrentAgentEntry = (entry: LiveChatQueueEntry, currentAgentId: string) => {
  if (!currentAgentId) {
    return false;
  }

  const directAgentId = typeof entry.agentId === "object" ? entry.agentId?._id : entry.agentId;
  const conversation = isConversationObject(entry.conversationId) ? entry.conversationId : null;
  const conversationAgentId = conversation
    ? typeof conversation.agentId === "object"
      ? conversation.agentId?._id
      : conversation.agentId
    : null;

  return String(directAgentId || conversationAgentId || "").trim() === currentAgentId;
};

const getVisitorName = (entry: LiveChatQueueEntry) => {
  const visitor = typeof entry.visitorId === "object" ? entry.visitorId : null;
  const conversation = isConversationObject(entry.conversationId) ? entry.conversationId : null;
  const fallbackVisitor = conversation?.visitorToken
    ? `Visitor ${String(conversation.visitorToken).slice(-4)}`
    : "Website Visitor";

  return visitor?.fullName || visitor?.name || fallbackVisitor;
};

const getAgentName = (entry: LiveChatQueueEntry) => {
  const agent = typeof entry.agentId === "object" ? entry.agentId : null;
  const conversation = isConversationObject(entry.conversationId) ? entry.conversationId : null;
  const conversationAgent = conversation && typeof conversation.agentId === "object" ? conversation.agentId : null;

  return agent?.fullName || conversationAgent?.fullName || "Unassigned";
};

const getConversationStatusLabel = (entry: LiveChatQueueEntry) => {
  const conversation = isConversationObject(entry.conversationId) ? entry.conversationId : null;
  const status = String(conversation?.status || entry.status || "WAITING").toUpperCase();

  if (status === "OPEN") {
    return "Live";
  }

  if (status === "ASSIGNED") {
    return "Assigned";
  }

  return "Waiting";
};

const getQueueWaitTime = (entry: LiveChatQueueEntry) => formatElapsedTime(entry.queuedAt || entry.createdAt || null);

const getConversationDuration = (conversation: LiveChatConversation) => {
  const startedAt = conversation.assignedAt || conversation.queuedAt || conversation.createdAt;
  const endedAt = conversation.closedAt || conversation.updatedAt || conversation.createdAt;

  if (!startedAt || !endedAt) {
    return "--";
  }

  const startTime = new Date(startedAt).getTime();
  const endTime = new Date(endedAt).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return "--";
  }

  return formatDuration((Math.max(0, endTime - startTime)) / 1000);
};

const sectionCardClass = "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6";
const chipClass = "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

const DashboardButton = ({ action, onNavigate }: { action: DashboardAction; onNavigate: (to: string) => void }) => {
  const iconStyles: Record<DashboardAction["accent"], string> = {
    cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    slate: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  };

  return (
    <button
      type="button"
      onClick={() => onNavigate(action.to)}
      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyles[action.accent]}`}>
        <action.icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{action.label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{action.description}</span>
      </span>
      <ArrowRight className="mt-1 h-4 w-4 text-slate-400" />
    </button>
  );
};

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
    <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
    <p className="mt-1 leading-6">{description}</p>
  </div>
);

const QueueCard = ({
  title,
  rows,
  emptyTitle,
  emptyDescription,
  onViewAll,
}: {
  title: string;
  rows: LiveChatQueueEntry[];
  emptyTitle: string;
  emptyDescription: string;
  onViewAll: () => void;
}) => {
  return (
    <div className={sectionCardClass}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live operational queue activity.</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          View all
          <SquareArrowOutUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          rows.slice(0, 5).map((entry) => {
            const conversation = isConversationObject(entry.conversationId) ? entry.conversationId : null;

            return (
              <div
                key={String(entry._id || entry.conversationId)}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{getVisitorName(entry)}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {getAgentName(entry)} · {formatDateTime(entry.queuedAt || conversation?.queuedAt || null)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={chipClass}>{getConversationStatusLabel(entry)}</span>
                    <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                      {getQueueWaitTime(entry)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const HistoryCard = ({
  rows,
  onViewAll,
}: {
  rows: LiveChatConversation[];
  onViewAll: () => void;
}) => {
  return (
    <div className={sectionCardClass}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Recent Resolved Chats</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Latest closed conversations from the live chat system.</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          View history
          <SquareArrowOutUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <EmptyState title="No recent resolutions yet" description="Closed conversations will appear here once chats are completed." />
        ) : (
          rows.slice(0, 5).map((conversation) => {
            const visitor = typeof conversation.visitorId === "object" ? conversation.visitorId : null;
            const agent = typeof conversation.agentId === "object" ? conversation.agentId : null;

            return (
              <div
                key={conversation._id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {visitor?.fullName || visitor?.name || "Website Visitor"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {agent?.fullName || "Unassigned"} · {formatDateTime(conversation.closedAt || conversation.updatedAt || conversation.createdAt || null)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className={chipClass}>Resolved</span>
                    <span>{getConversationDuration(conversation)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const PrivilegedAgentStatusSection = () => {
  const navigate = useNavigate();
  const { agents, isLoading, error } = useGetAgents({ page: 1, limit: 5 });

  return (
    <div className={sectionCardClass}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Agent Status</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Current availability across the support team.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/portal/agents")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          Manage agents
          <SquareArrowOutUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {error && (
          <EmptyState
            title="Agent data unavailable"
            description="Agent status could not be loaded right now. Refresh to try again."
          />
        )}
        {!error && isLoading && (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
          </div>
        )}
        {!error && !isLoading && agents.slice(0, 5).map((agent) => (
          <div
            key={agent._id}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{agent.fullName}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{toTitleCase(agent.role)} · {agent.emailAddress}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <BadgeCheck className="h-3.5 w-3.5" />
              {String(agent.status || "AVAILABLE")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StandardDashboard = ({ hideAnalyticsTeaser = false }: StandardDashboardProps) => {
  const navigate = useNavigate();
  const { user, tenant } = useAuth();
  const { isAdmin, isMasterAdmin, isSupportAgent } = useGetRole();

  const { queue: waitingQueue, isLoading: isWaitingLoading, error: waitingError, mutate: mutateWaitingQueue } =
    useGetLiveChatQueue({ page: 1, limit: 10 });
  const { queue: activeQueue, isLoading: isActiveLoading, error: activeError, mutate: mutateActiveQueue } =
    useGetActiveLiveChat({ page: 1, limit: 10 });
  const { conversations: historyConversations, isLoading: isHistoryLoading, error: historyError, mutate: mutateHistory } =
    useGetLiveChatHistory({ page: 1, limit: 10 });

  const currentAgentId = String(user?._id || "").trim();
  const currentRole = String(user?.role || "").toUpperCase();
  const planName = tenant?.subscriptionData?.planName || tenant?.subscription?.planName || "Basic";
  const hasAdvancedAnalytics = Boolean(tenant?.subscriptionData?.configuration?.limits?.hasAdvancedAnalytics);

  const visibleActiveQueue = useMemo(
    () => (isSupportAgent ? activeQueue.filter((entry) => isCurrentAgentEntry(entry, currentAgentId)) : activeQueue),
    [activeQueue, currentAgentId, isSupportAgent],
  );

  const visibleHistory = useMemo(
    () => {
      if (!isSupportAgent) {
        return historyConversations;
      }

      return historyConversations.filter((conversation) => {
        const agent = typeof conversation.agentId === "object" ? conversation.agentId : null;
        const conversationAgentId = agent?._id || conversation.agentId || "";

        return String(conversationAgentId || "").trim() === currentAgentId;
      });
    },
    [currentAgentId, historyConversations, isSupportAgent],
  );

  const visibleWaitingQueue = useMemo(() => waitingQueue, [waitingQueue]);

  const waitSeconds = useMemo(() => {
    const values = visibleWaitingQueue
      .map((entry) => {
        const startedAt = entry.queuedAt || entry.createdAt;
        if (!startedAt) {
          return null;
        }

        const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
        return Number.isFinite(elapsed) && elapsed > 0 ? elapsed : null;
      })
      .filter((value): value is number => typeof value === "number");

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [visibleWaitingQueue]);

  const summaryCards = useMemo(
    () => [
      {
        label: isSupportAgent ? "My Active Chats" : "Active Chats",
        value: formatInteger(visibleActiveQueue.length),
        icon: MessageCircle,
        tone: "emerald",
        helper: "Live conversations assigned right now.",
      },
      {
        label: "Waiting Queue",
        value: formatInteger(visibleWaitingQueue.length),
        icon: ListOrdered,
        tone: "amber",
        helper: "Visitors waiting for the next available agent.",
      },
      {
        label: "Recent Resolutions",
        value: formatInteger(visibleHistory.length),
        icon: ShieldCheck,
        tone: "cyan",
        helper: "Closed chats captured from the live chat service.",
      },
      {
        label: "Avg. Wait Time",
        value: formatDuration(waitSeconds),
        icon: Clock3,
        tone: "violet",
        helper: "Average time visitors stay in the queue.",
      },
    ],
    [isSupportAgent, visibleActiveQueue.length, visibleHistory.length, visibleWaitingQueue.length, waitSeconds],
  );

  const navigationActions: DashboardAction[] = useMemo(() => {
    const actions: DashboardAction[] = [
      {
        label: "Chat Sessions",
        description: "Review active and resolved conversations.",
        icon: MessagesSquare,
        to: "/portal/chat-sessions",
        accent: "cyan",
      },
      {
        label: "Queue",
        description: "Monitor visitors waiting for support.",
        icon: ListOrdered,
        to: "/portal/queue",
        accent: "amber",
      },
      {
        label: "Analytics",
        description: "Open live analytics and reporting.",
        icon: Activity,
        to: "/portal/analytics",
        accent: "emerald",
      },
    ];

    if (isAdmin || isMasterAdmin) {
      actions.push(
        {
          label: "Agents",
          description: "Manage team availability and status.",
          icon: UserRoundCog,
          to: "/portal/agents",
          accent: "slate",
        },
        {
          label: "Tenants",
          description: "Inspect tenant and subscription data.",
          icon: Users,
          to: "/portal/tenants",
          accent: "violet",
        },
        {
          label: "Payments",
          description: "Review billing and plan purchases.",
          icon: CreditCard,
          to: "/portal/payments",
          accent: "rose",
        },
      );
    }

    return actions;
  }, [isAdmin, isMasterAdmin]);

  const isLoading = isWaitingLoading || isActiveLoading || isHistoryLoading;
  const hasError = Boolean(waitingError || activeError || historyError);

  const refreshAll = async () => {
    await Promise.all([mutateWaitingQueue(), mutateActiveQueue(), mutateHistory()]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <TitleTag
              title={`Welcome back, ${user?.fullName || "Agent"}`}
              subtitle="Here is a live operational snapshot of your workspace."
              icon={<Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={chipClass}>Role: {toTitleCase(currentRole) || "UNKNOWN"}</span>
              <span className={chipClass}>Plan: {planName}</span>
              <span className={chipClass}>{hasAdvancedAnalytics ? "Advanced analytics enabled" : "Standard analytics"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh data
            </button>
            <button
              type="button"
              onClick={() => navigate("/portal/chat-sessions")}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-600 dark:hover:bg-cyan-500"
            >
              Open sessions
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {hasError && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">Some live dashboard data could not be loaded. Refresh to retry the current API requests.</p>
            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const iconStyles = {
            emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
            amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
            cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
            violet: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
          } as const;

          return (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyles[card.tone as keyof typeof iconStyles]}`}>
                  <card.icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Live
                </span>
              </div>
              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.helper}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {navigationActions.map((action) => (
            <DashboardButton key={action.label} action={action} onNavigate={navigate} />
          ))}
        </div>

        <div className="xl:col-span-2 grid gap-4">
          <QueueCard
            title="Waiting Queue"
            rows={visibleWaitingQueue}
            emptyTitle={isLoading ? "Loading queue" : "No visitors waiting"}
            emptyDescription={isLoading ? "Fetching the latest queue data from the live chat API." : "The queue is empty right now. New visitors will appear here as they wait for support."}
            onViewAll={() => navigate("/portal/queue")}
          />

          <HistoryCard rows={visibleHistory} onViewAll={() => navigate("/portal/chat-sessions?tab=chat-history")} />
        </div>

        <div className="grid gap-4">
          <div className={sectionCardClass}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Active Conversations</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Currently assigned conversations in progress.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/portal/chat-sessions?tab=active-chats")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                View active
                <SquareArrowOutUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {visibleActiveQueue.length === 0 ? (
                <EmptyState
                  title={isLoading ? "Loading active chats" : "No active chats"}
                  description={isLoading ? "Fetching the latest active conversations from the API." : "Once an agent accepts a conversation, it will appear here."}
                />
              ) : (
                visibleActiveQueue.slice(0, 5).map((entry) => (
                  <div key={String(entry._id || entry.conversationId)} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{getVisitorName(entry)}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{getAgentName(entry)} · {getConversationStatusLabel(entry)}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {getQueueWaitTime(entry)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {!hideAnalyticsTeaser && (
            <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm dark:border-cyan-900/30 dark:from-cyan-900/20 dark:to-slate-800 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-700 dark:border-cyan-900/40 dark:bg-slate-900 dark:text-cyan-300">
                    Analytics
                  </div>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Open analytics</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Review chat volume, response times, and customer patterns from the live analytics service.
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-cyan-600 dark:text-cyan-300" />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/portal/analytics")}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
                >
                  View analytics
                  <ArrowRight className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {hasAdvancedAnalytics ? "Advanced insights available" : "Standard analytics available"}
                </span>
              </div>
            </div>
          )}
        </div>

        {(isAdmin || isMasterAdmin) && <PrivilegedAgentStatusSection />}
      </div>
    </div>
  );
};

export default StandardDashboard;