import React, { useState } from "react";
import { useSearchParams } from "react-router";
import { History, MessagesSquare } from "lucide-react";
import { HistoryEntry, SubTab } from "../../../models/ChatSessionManagementModel";
import { useDarkMode } from "../../../providers/DarkModeContext";
import TitleTag from "../../../components/TitleTag";
import PageTitle from "../../../components/common/PageTitle";
import ChatHistorySection from "../../../sections/chat/ChatHistorySection";
import ChatActiveSection from "../../../sections/chat/ChatActiveSection";
import { useGetActiveLiveChat, useGetLiveChatHistory } from "../../../hooks/useLiveChat";
import { LiveChatConversation } from "../../../models/LiveChatModel";

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
  const { queue, mutate: mutateQueue } = useGetActiveLiveChat({ page: 1, limit: 100 });
  const { conversations: historyConversations, mutate: mutateHistory } = useGetLiveChatHistory({ page: 1, limit: 100 });

  // Map history conversations to HistoryEntry format
  const historyEntries: HistoryEntry[] = historyConversations.map((conversation: LiveChatConversation) => {
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
    const visitorName = String(visitor?.name || "").trim();
    const visitorToken = String(visitor?.visitorToken || "").trim();

    return {
      id: String(conversation._id),
      visitor: visitorName || (visitorToken ? `Visitor ${visitorToken.slice(-4)}` : "Website Visitor"),
      agent: String(agent?.fullName || "Assigned Agent"),
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
                  {tab.key === "active-chats" && (queue || []).length > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center">
                      {queue.length}
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
            <ChatActiveSection queue={queue || []} mutateQueue={mutateQueue} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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
