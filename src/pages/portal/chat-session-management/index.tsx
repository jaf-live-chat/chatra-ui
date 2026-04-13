import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { History, MessagesSquare } from "lucide-react";
import { HistoryEntry, SubTab } from "../../../models/ChatSessionManagementModel";
import { useDarkMode } from "../../../providers/DarkModeContext";
import TitleTag from "../../../components/TitleTag";
import PageTitle from "../../../components/common/PageTitle";
import ChatHistorySection from "../../../sections/chat/ChatHistorySection";
import ChatActiveSection from "../../../sections/chat/ChatActiveSection";
import { useGetActiveLiveChat, useGetLiveChatHistory } from "../../../hooks/useLiveChat";
import { LiveChatConversation, LiveChatQueueEntry } from "../../../models/LiveChatModel";
import useAuth from "../../../hooks/useAuth";
import { createLiveChatSocket } from "../../../services/liveChatRealtimeClient";

const subTabs: { key: SubTab; label: string; icon: React.ReactNode }[] = [
  { key: "active-chats", label: "Active Chats", icon: <MessagesSquare className="w-4 h-4" /> },
  { key: "chat-history", label: "Chat History", icon: <History className="w-4 h-4" /> },
];

const ChatSessionManagementPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab: SubTab = searchParams.get("tab") === "chat-history" ? "chat-history" : "active-chats";
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const { isDark } = useDarkMode();
  const { tenant, user } = useAuth();
  const { queue, mutate: mutateQueue } = useGetActiveLiveChat({ page: 1, limit: 100 });
  const { conversations: historyConversations, mutate: mutateHistory } = useGetLiveChatHistory({ page: 1, limit: 100 });
  const isSupportAgent = String(user?.role || "").toUpperCase() === "SUPPORT_AGENT";

  const assignedQueue = useMemo(() => {
    if (!isSupportAgent) {
      return queue || [];
    }

    const currentAgentId = String(user?._id || "").trim();
    if (!currentAgentId) {
      return [];
    }

    return (queue || []).filter((entry: LiveChatQueueEntry) => {
      const directAgentId = typeof entry.agentId === "object" ? entry.agentId?._id : entry.agentId;
      const conversation = typeof entry.conversationId === "object" ? entry.conversationId : null;
      const conversationAgentId = conversation
        ? typeof conversation.agentId === "object"
          ? conversation.agentId?._id
          : conversation.agentId
        : null;

      const resolvedAgentId = String(directAgentId || conversationAgentId || "").trim();
      return resolvedAgentId === currentAgentId;
    });
  }, [isSupportAgent, queue, user?._id]);

  const assignedHistoryConversations = useMemo(() => {
    if (!isSupportAgent) {
      return historyConversations;
    }

    const currentAgentId = String(user?._id || "").trim();
    if (!currentAgentId) {
      return [];
    }

    return historyConversations.filter((conversation: LiveChatConversation) => {
      const conversationAgentId = typeof conversation.agentId === "object"
        ? conversation.agentId?._id
        : conversation.agentId;

      return String(conversationAgentId || "").trim() === currentAgentId;
    });
  }, [historyConversations, isSupportAgent, user?._id]);

  useEffect(() => {
    if (!tenant?.apiKey) {
      return;
    }

    const socket = createLiveChatSocket({
      apiKey: tenant.apiKey,
      role: user?.role,
      agentId: user?._id,
    });

    if (!socket) {
      return;
    }

    const refreshQueue = () => {
      void mutateQueue();
    };

    const refreshHistory = () => {
      void mutateHistory();
    };

    const refreshAll = () => {
      refreshQueue();
      refreshHistory();
    };

    socket.on("NEW_CONVERSATION", refreshQueue);
    socket.on("CONVERSATION_ASSIGNED", refreshQueue);
    socket.on("CONVERSATION_TRANSFERRED", refreshQueue);
    socket.on("QUEUE_UPDATED", refreshQueue);
    socket.on("CONVERSATION_ENDED", refreshAll);

    return () => {
      socket.off("NEW_CONVERSATION", refreshQueue);
      socket.off("CONVERSATION_ASSIGNED", refreshQueue);
      socket.off("CONVERSATION_TRANSFERRED", refreshQueue);
      socket.off("QUEUE_UPDATED", refreshQueue);
      socket.off("CONVERSATION_ENDED", refreshAll);
      socket.disconnect();
    };
  }, [mutateHistory, mutateQueue, tenant?.apiKey, user?._id, user?.role]);

  // Map history conversations to HistoryEntry format
  const historyEntries: HistoryEntry[] = assignedHistoryConversations.map((conversation: LiveChatConversation) => {
    const visitor = typeof conversation.visitorId === "object" ? conversation.visitorId : null;
    const agent = typeof conversation.agentId === "object" ? conversation.agentId : null;
    const startedAt = conversation.assignedAt || conversation.queuedAt || conversation.createdAt;
    const endedAt = conversation.closedAt || conversation.updatedAt || conversation.createdAt;
    const startedTime = startedAt ? new Date(startedAt).getTime() : 0;
    const endedTime = endedAt ? new Date(endedAt).getTime() : 0;
    const durationMs = Math.max(0, endedTime - startedTime);
    const durationSeconds = Math.floor(durationMs / 1000);
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const displayDate = endedAt ? new Date(endedAt) : new Date();
    const visitorFullName = String(visitor?.fullName || visitor?.name || "").trim();
    const visitorToken = String(visitor?.visitorToken || "").trim();
    const agentFullName = String(agent?.fullName || "").trim();

    return {
      id: String(conversation._id),
      visitor: visitorFullName || (visitorToken ? `Visitor ${visitorToken.slice(-4)}` : "Website Visitor"),
      visitorFullName: visitorFullName || undefined,
      agent: agentFullName || "Assigned Agent",
      agentFullName: agentFullName || undefined,
      duration: `${mins}m ${String(secs).padStart(2, "0")}s`,
      messages: 0,
      rating: 0,
      date: displayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: displayDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Resolved",
      tags: [],
      isLive: false,
    };
  });

  const activeChatsBadgeCount = useMemo(
    () => assignedQueue.filter((entry: LiveChatQueueEntry) => {
      const conversation = typeof entry.conversationId === "object" ? entry.conversationId : null;
      const conversationId = conversation?._id || entry.conversationId || entry._id;

      return Boolean(conversation && conversationId && conversation.status === "OPEN");
    }).length,
    [assignedQueue],
  );

  return (
    <React.Fragment>
      <PageTitle
        title="Chat Session Management"
        description="Browse and review past chat conversations and their outcomes."
        canonical="/portal/chat-sessions"
      />
      <div className={`flex flex-col flex-1${isDark ? " dark" : ""}`}>
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shrink-0">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TitleTag
              title="Chat Session Management"
              subtitle="Browse and review past chat conversations and their outcomes."
              icon={<MessagesSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
            />
            <div className="flex gap-1 w-full sm:w-auto">
              {subTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveSubTab(tab.key);
                    setSearchQuery("");
                  }}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer flex-1 sm:flex-none ${activeSubTab === tab.key
                    ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.key === "active-chats" && activeChatsBadgeCount > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center">
                      {activeChatsBadgeCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeSubTab === "active-chats" ? (
            <ChatActiveSection queue={assignedQueue} mutateQueue={mutateQueue} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          ) : (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
              {activeSubTab === "chat-history" && (
                <ChatHistorySection
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  endedChats={historyEntries}
                  endedTranscripts={{}}
                  mutateHistory={mutateHistory}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ChatSessionManagementPage;
