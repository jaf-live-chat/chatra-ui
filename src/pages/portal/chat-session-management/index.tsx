import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MessagesSquare,
  Search,
  Clock,
  Send,
  Loader2,
  Paperclip,
  Smile,
  Globe,
  Monitor,
  MapPin,
  Link as LinkIcon,
  Info,
  History,
  FileText,
  X,
  Eye,
  Zap,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { getQueueDisplayId } from "../../../sections/chat/QueueView";
import { useDarkMode } from "../../../providers/DarkModeContext";
import { SEED_REPLIES } from "../../../sections/settings/QuickRepliesView";
import PageTitle from "../../../components/common/PageTitle";
import TitleTag from "../../../components/TitleTag";
import liveChatServices from "../../../services/liveChatServices";
import useAuth from "../../../hooks/useAuth";
import { useGetActiveLiveChat, useGetLiveChatHistory } from "../../../hooks/useLiveChat";
import type {
  LiveChatConversation,
  LiveChatMessage,
  LiveChatParticipantRole,
  LiveChatQueueEntry,
  LiveChatVisitor,
} from "../../../models/LiveChatModel";
import type {
  ActiveChat,
  AttachedFile,
  ChatAttachmentUpload,
  ChatHistoryTranscriptMap,
  ChatMessage,
  HistoryEntry,
  QuickReplyItem,
  SelectedVisitorStorage,
  SubTab,
  TranscriptMessage,
} from "../../../models/ChatSessionManagementModel";
import { mapServerMessageToChatMessage } from "../../../models/ChatSessionManagementModel";

const avatarColors = ["#0891b2", "#7c3aed", "#059669", "#d97706", "#dc2626", "#2563eb"];

const subTabs: { key: SubTab; label: string; icon: React.ReactNode }[] = [
  { key: "active-chats", label: "Active Chats", icon: <MessagesSquare className="w-4 h-4" /> },
  { key: "chat-history", label: "Chat History", icon: <History className="w-4 h-4" /> },
];

function getAvatarColor(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return avatarColors[code % avatarColors.length];
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatQueueDuration(queuedAt?: string | null) {
  if (!queuedAt) {
    return "0m";
  }

  const queuedTime = new Date(queuedAt).getTime();
  if (Number.isNaN(queuedTime)) {
    return "0m";
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - queuedTime) / 1000));
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

const ChatSessionManagementPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab: SubTab = searchParams.get("tab") === "chat-history" ? "chat-history" : "active-chats";
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isMobileChatPanelOpen, setIsMobileChatPanelOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isEndingChat, setIsEndingChat] = useState(false);
  const [isSyncingMessages, setIsSyncingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageSyncRef = useRef<Record<string, number>>({});
  const { isDark } = useDarkMode();
  const { user } = useAuth();
  const { queue, mutate: mutateQueue } = useGetActiveLiveChat({ page: 1, limit: 100 });
  const { conversations: historyConversations, mutate: mutateHistory } = useGetLiveChatHistory({ page: 1, limit: 100 });

  // File attachment state
  const [attachedFiles, setAttachedFiles] = useState<ChatAttachmentUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Replies state
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReplyItem[]>([]);
  const [qrSearchQuery, setQrSearchQuery] = useState("");
  const [qrActiveCategory, setQrActiveCategory] = useState("All");
  const quickRepliesRef = useRef<HTMLDivElement>(null);

  // Load quick replies from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("jaf_quick_replies");
      setQuickReplies(stored ? JSON.parse(stored) : SEED_REPLIES);
    } catch { /* ignore */ }
  }, []);

  // Reload quick replies whenever dropdown opens
  useEffect(() => {
    if (showQuickReplies) {
      try {
        const stored = localStorage.getItem("jaf_quick_replies");
        setQuickReplies(stored ? JSON.parse(stored) : SEED_REPLIES);
      } catch { /* ignore */ }
      setQrSearchQuery("");
      setQrActiveCategory("All");
    }
  }, [showQuickReplies]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showQuickReplies) return;
    const handler = (e: MouseEvent) => {
      if (quickRepliesRef.current && !quickRepliesRef.current.contains(e.target as Node)) {
        setShowQuickReplies(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showQuickReplies]);

  const filteredQuickReplies = quickReplies.filter((qr) => {
    const matchesCategory = qrActiveCategory === "All" || qr.category === qrActiveCategory;
    const matchesSearch = !qrSearchQuery || qr.title.toLowerCase().includes(qrSearchQuery.toLowerCase()) || qr.shortcut.toLowerCase().includes(qrSearchQuery.toLowerCase()) || qr.message.toLowerCase().includes(qrSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const qrCategories = ["All", ...Array.from(new Set(quickReplies.map((qr) => qr.category)))];

  const qrCategoryColors: Record<string, string> = {
    Greetings: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    General: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Billing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    Technical: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  };

  const handleInsertQuickReply = (message: string) => {
    setChatMessage((prev) => (prev ? prev + " " + message : message));
    setShowQuickReplies(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachedFiles((prev) => [...prev, {
            file,
            previewUrl: reader.result as string,
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFileRemove = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedChat = useMemo(
    () => activeChats.find((chat) => chat.id === selectedChatId),
    [activeChats, selectedChatId],
  );

  const selectedChatSessionId = selectedChat?.sessionId ? String(selectedChat.sessionId) : null;
  const selectedChatResolvedId = selectedChat ? String(selectedChat.id) : null;

  const syncServerMessages = useCallback(async (conversationId: string, chatId: string) => {
    const now = Date.now();
    const lastSyncedAt = lastMessageSyncRef.current[conversationId] ?? 0;

    // Prevent accidental duplicate sync bursts caused by overlapping lifecycle triggers.
    if (now - lastSyncedAt < 900) {
      return;
    }

    lastMessageSyncRef.current[conversationId] = now;
    setIsSyncingMessages(true);
    try {
      const response = await liveChatServices.getConversationMessages(conversationId, { page: 1, limit: 100 });
      const syncedMessages: ChatMessage[] = (response.messages || []).map((message: LiveChatMessage, index: number) =>
        mapServerMessageToChatMessage(message, `${conversationId}-${index}`, getTime()),
      );

      setActiveChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, messages: syncedMessages } : chat)),
      );
    } catch {
      // Keep existing message list if server sync fails.
    } finally {
      setIsSyncingMessages(false);
    }
  }, []);

  useEffect(() => {
    const liveChats: ActiveChat[] = (queue || [])
      .map((entry: LiveChatQueueEntry) => {
        const conversation = typeof entry.conversationId === "object" ? entry.conversationId : null;
        const visitor = typeof entry.visitorId === "object" ? entry.visitorId : null;
        const visitorMeta = (visitor || {}) as LiveChatVisitor & {
          currentPage?: string | null;
          referrer?: string | null;
          browser?: string | null;
          os?: string | null;
          device?: string | null;
        };
        const agent = typeof entry.agentId === "object" ? entry.agentId : null;
        const conversationId = conversation?._id || entry.conversationId || entry._id;

        if (!conversationId || conversation?.status !== "OPEN") {
          return null;
        }

        return {
          id: String(conversationId),
          visitor: visitor?.name || (visitor?.visitorToken ? `Visitor ${String(visitor.visitorToken).slice(-4)}` : "Website Visitor"),
          sessionId: String(conversationId),
          message: "Active support conversation",
          status: "Active",
          timeInQueue: formatQueueDuration(entry.queuedAt || conversation?.queuedAt),
          messages: [],
          startedAt: Date.now(),
          agent: agent?.fullName || "Assigned Agent",
          location: conversation?.locationCity || visitor?.locationCity || "Unknown",
          country: conversation?.locationCountry || visitor?.locationCountry || "Unknown",
          ipAddress: visitor?.ipAddress || conversation?.ipAddress || "—",
          currentPage: visitorMeta.currentPage || "—",
          referrer: visitorMeta.referrer || "—",
          browser: visitorMeta.browser || "—",
          os: visitorMeta.os || "—",
          device: visitorMeta.device || "—",
        };
      })
      .filter(Boolean) as ActiveChat[];

    setActiveChats((prev) => {
      const prevById = new Map(prev.map((chat) => [chat.id, chat]));
      return liveChats.map((chat) => {
        const existing = prevById.get(chat.id);
        return {
          ...chat,
          messages: existing?.messages || [],
          startedAt: existing?.startedAt || chat.startedAt,
        };
      });
    });

    setSelectedChatId((previousSelectedChatId) => {
      if (previousSelectedChatId || liveChats.length === 0) {
        return previousSelectedChatId;
      }

      return liveChats[0].id;
    });
  }, [queue]);

  // Load active chat visitor from Queue navigation state.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("jaf_active_chat_visitor");
      if (stored) {
        const visitor = JSON.parse(stored) as SelectedVisitorStorage;
        const targetId = String(visitor.sessionId || visitor.conversationId || visitor.id || "");
        if (targetId) {
          setSelectedChatId(targetId);
          setActiveSubTab("active-chats");
          setIsMobileChatPanelOpen(true);
          void syncServerMessages(targetId, targetId);
        }
        localStorage.removeItem("jaf_active_chat_visitor");
      }
    } catch {
      // silently fail
    }
  }, [syncServerMessages]);

  useEffect(() => {
    if (!selectedChatSessionId || !selectedChatResolvedId) {
      return;
    }

    void syncServerMessages(selectedChatSessionId, selectedChatResolvedId);
    const interval = setInterval(() => {
      void syncServerMessages(selectedChatSessionId, selectedChatResolvedId);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [selectedChatSessionId, selectedChatResolvedId, syncServerMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChats, selectedChatId]);

  useEffect(() => {
    if (selectedChatId) {
      setIsMobileChatPanelOpen(true);
    }
  }, [selectedChatId]);

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
      queueDisplayId: getQueueDisplayId(String(conversation._id)),
    };
  });

  const handleSendMessage = async () => {
    const hasText = chatMessage.trim().length > 0;
    const hasFiles = attachedFiles.length > 0;
    if ((!hasText && !hasFiles) || isSendingMessage) return;

    const fileAttachments: AttachedFile[] = attachedFiles.map((f) => ({
      name: f.file.name,
      url: f.previewUrl,
      type: f.file.type,
    }));

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "agent",
      text: hasText ? chatMessage.trim() : (hasFiles ? `📎 ${attachedFiles.map((f) => f.file.name).join(", ")}` : ""),
      timestamp: getTime(),
      ...(hasFiles ? { files: fileAttachments } : {}),
    };

    setActiveChats((prev) =>
      prev.map((c) => (c.id === selectedChatId ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
    setChatMessage("");
    setAttachedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const chat = activeChats.find((c) => c.id === selectedChatId);
    if (!chat?.sessionId || !newMsg.text.trim()) {
      return;
    }

    setIsSendingMessage(true);

    try {
      await liveChatServices.sendMessage(
        String(chat.sessionId),
        newMsg.text,
        String(user?.role || "ADMIN") as LiveChatParticipantRole,
        String(user?._id || ""),
        {
          skipGlobalBlocking: true,
        },
      );
      await syncServerMessages(String(chat.sessionId), String(chat.id));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleEndChat = async () => {
    if (!selectedChatId) return;
    const chat = activeChats.find((c) => c.id === selectedChatId);
    if (!chat || isEndingChat) return;

    setIsEndingChat(true);

    try {
      if (chat.sessionId) {
        try {
          await liveChatServices.endConversation(String(chat.sessionId), {
            skipGlobalBlocking: true,
          });
        } catch {
          // Preserve current UI behavior: remove local card even if end API fails.
        }
      }

      setActiveChats((prev) => prev.filter((c) => c.id !== selectedChatId));
      void mutateQueue();
      void mutateHistory();

      setSelectedChatId(activeChats.length > 1 ? activeChats.find((c) => c.id !== selectedChatId)?.id || null : null);
      setShowEndConfirm(false);
      setIsMobileChatPanelOpen(false);
    } finally {
      setIsEndingChat(false);
    }
  };

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
                    if (tab.key === "active-chats" && !selectedChatId) {
                      setIsMobileChatPanelOpen(false);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer flex-1 sm:flex-none ${activeSubTab === tab.key
                    ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400"
                    : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.key === "active-chats" && activeChats.length > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center">
                      {activeChats.length}
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
            <div className="h-[calc(100vh-72px-64px)] sm:h-[calc(100vh-65px-64px)] flex flex-col lg:flex-row">
              {/* Chat List Sidebar */}
              <div className={`bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 flex flex-col shrink-0 w-full lg:w-80 ${isMobileChatPanelOpen ? "hidden lg:flex" : "flex"} lg:border-r`}>
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <MessagesSquare className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">No active chats</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                        Pick up a visitor from the{" "}
                        <Link to="/portal/queue" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                          Queue
                        </Link>{" "}
                        to start chatting.
                      </p>
                    </div>
                  ) : (
                    activeChats
                      .filter((c) => c.visitor.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((chat) => {
                        const lastMsg = chat.messages[chat.messages.length - 1];
                        const isSelected = chat.id === selectedChatId;
                        return (
                          <button
                            key={chat.id}
                            onClick={() => {
                              setSelectedChatId(chat.id);
                              setIsMobileChatPanelOpen(true);
                            }}
                            className={`w-full text-left px-4 py-3.5 border-b border-gray-50 dark:border-slate-700/50 transition-colors cursor-pointer ${isSelected
                              ? "bg-cyan-50 dark:bg-cyan-900/20 border-l-2 border-l-cyan-600"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/40 border-l-2 border-l-transparent"
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                                style={{ backgroundColor: getAvatarColor(chat.visitor) }}
                              >
                                {chat.visitor.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{chat.visitor}</p>
                                  <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0 ml-2">{lastMsg?.timestamp}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                                  {lastMsg?.sender === "agent" ? "You: " : ""}
                                  {lastMsg?.text}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Active
                                  </span>
                                  {chat.timeInQueue && (
                                    <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                      Queue: {chat.timeInQueue}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Main Chat Area */}
              {selectedChat ? (
                <div className={`flex-1 flex flex-col min-w-0 ${isMobileChatPanelOpen ? "flex" : "hidden lg:flex"}`}>
                  {/* Chat Header */}
                  <div className="min-h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-5 py-2 shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsMobileChatPanelOpen(false)}
                        className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                        aria-label="Back to chat list"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ backgroundColor: getAvatarColor(selectedChat.visitor) }}
                      >
                        {selectedChat.visitor.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{selectedChat.visitor}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[11px] text-gray-500 dark:text-slate-400">Active now</span>
                          {selectedChat.sessionId && (
                            <span className="hidden sm:inline text-[10px] text-gray-400 dark:text-slate-500 font-mono ml-2">{selectedChat.sessionId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`p-2 rounded-lg transition-colors ${showInfo
                          ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
                          : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                          }`}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowEndConfirm(true)}
                        disabled={isEndingChat}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isEndingChat ? "Ending..." : "End Chat"}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex overflow-hidden">
                    {/* Messages */}
                    <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-slate-900/50">
                      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4" style={{ scrollbarWidth: "thin" }}>
                        <div className="text-center mb-6">
                          <span className="text-[11px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-3 py-1 rounded-full">
                            Chat started from Queue
                          </span>
                        </div>

                        {isSyncingMessages && (
                          <div className="mb-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Syncing latest messages...
                          </div>
                        )}

                        <div className="space-y-3">
                          {selectedChat.messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                              <div className={`flex ${msg.sender === "agent" ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[88%] sm:max-w-[65%]`}>
                                {msg.sender === "visitor" ? (
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                                    style={{ backgroundColor: getAvatarColor(selectedChat.visitor) }}
                                  >
                                    {selectedChat.visitor.charAt(0)}
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-gray-800 dark:bg-slate-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                                    You
                                  </div>
                                )}
                                <div className={`flex flex-col ${msg.sender === "agent" ? "items-end" : "items-start"}`}>
                                  <span className="text-[10px] text-gray-400 dark:text-slate-500 mb-1 px-1">
                                    {msg.sender === "visitor" ? selectedChat.visitor : "You"} &middot; {msg.timestamp}
                                  </span>
                                  {/* Image attachments */}
                                  {msg.files && msg.files.filter(f => f.type?.startsWith("image/") && f.url).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-1">
                                      {msg.files.filter(f => f.type?.startsWith("image/") && f.url).map((file, i) => (
                                        <img
                                          key={`img-${i}`}
                                          src={file.url}
                                          alt={file.name}
                                          className="max-w-[200px] max-h-[180px] rounded-xl shadow-sm object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => window.open(file.url, "_blank")}
                                        />
                                      ))}
                                    </div>
                                  )}
                                  {/* Non-image file attachments */}
                                  {msg.files && msg.files.filter(f => !f.type?.startsWith("image/") || !f.url).length > 0 && (
                                    <div className="flex flex-col gap-1 mb-1">
                                      {msg.files.filter(f => !f.type?.startsWith("image/") || !f.url).map((file, i) => {
                                        const attachmentBody = (
                                          <>
                                            <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                            <div className="min-w-0">
                                              <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{file.name}</p>
                                              <p className="text-[10px] text-gray-400 dark:text-slate-500">{file.type?.startsWith("image/") ? "Image attachment" : "Attachment"}</p>
                                            </div>
                                          </>
                                        );

                                        if (file.url) {
                                          return (
                                            <a
                                              key={`file-${i}`}
                                              href={file.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                                            >
                                              {attachmentBody}
                                            </a>
                                          );
                                        }

                                        return (
                                          <div
                                            key={`file-${i}`}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-sm"
                                          >
                                            {attachmentBody}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {/* Text bubble */}
                                  {msg.text && !(msg.files?.length && msg.text.startsWith("📎")) && (
                                    <div
                                      className={`px-3.5 py-2 text-sm shadow-sm ${msg.sender === "visitor"
                                        ? "bg-[#e5e7eb] dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-2xl rounded-bl-[4px]"
                                        : "bg-cyan-600 text-white rounded-2xl rounded-br-[4px]"
                                        }`}
                                    >
                                      {msg.text}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                        </div>

                        <div ref={bottomRef} />
                      </div>

                      {/* Input */}
                      <div className="px-3 sm:px-4 py-3 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shrink-0">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip"
                          multiple
                        />

                        {/* Inline file previews */}
                        {attachedFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 dark:bg-slate-700/60 rounded-xl border border-gray-200 dark:border-slate-600">
                            {attachedFiles.map((af, index) => (
                              <div key={index} className="relative group">
                                {af.file.type.startsWith("image/") ? (
                                  <img
                                    src={af.previewUrl}
                                    alt={af.file.name}
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-slate-600"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex flex-col items-center justify-center p-1">
                                    <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-0.5" />
                                    <p className="text-[8px] text-gray-500 dark:text-slate-400 truncate w-full text-center">{af.file.name}</p>
                                  </div>
                                )}
                                <button
                                  onClick={() => handleFileRemove(index)}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="relative" ref={quickRepliesRef}>
                          {/* Quick Replies Dropdown */}
                          {showQuickReplies && (
                            <div
                              className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 overflow-hidden z-30"
                              style={{ borderColor: isDark ? '#475569' : '#e5e7eb', maxHeight: '340px' }}
                            >
                              {/* Header */}
                              <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-slate-700" style={{ borderColor: isDark ? '#334155' : '#f3f4f6' }}>
                                <div className="flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-cyan-500" />
                                  <span className="text-sm text-gray-800 dark:text-slate-200">Quick Replies</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">{filteredQuickReplies.length}</span>
                                </div>
                                <button
                                  onClick={() => setShowQuickReplies(false)}
                                  className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Search + Category filters */}
                              <div className="px-3 pt-2 pb-1.5 space-y-2 border-b border-gray-100 dark:border-slate-700" style={{ borderColor: isDark ? '#334155' : '#f3f4f6' }}>
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                                  <input
                                    type="text"
                                    placeholder="Search replies..."
                                    value={qrSearchQuery}
                                    onChange={(e) => setQrSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
                                    style={{ borderColor: isDark ? '#475569' : '#e5e7eb' }}
                                    autoFocus
                                  />
                                </div>
                                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                                  {qrCategories.map((cat) => (
                                    <button
                                      key={cat}
                                      onClick={() => setQrActiveCategory(cat)}
                                      className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${qrActiveCategory === cat
                                        ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300"
                                        : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                                        }`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Replies list */}
                              <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                                {filteredQuickReplies.length === 0 ? (
                                  <div className="py-6 text-center text-xs text-gray-400 dark:text-slate-500">
                                    No quick replies found
                                  </div>
                                ) : (
                                  filteredQuickReplies.map((qr) => (
                                    <button
                                      key={qr.id}
                                      onClick={() => handleInsertQuickReply(qr.message)}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer border-b border-gray-50 dark:border-slate-700/50 last:border-b-0"
                                      style={{ borderColor: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(249,250,251,1)' }}
                                    >
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-1.5 py-0.5 rounded">
                                          {qr.shortcut}
                                        </span>
                                        <span className="text-xs text-gray-800 dark:text-slate-200 truncate flex-1">
                                          {qr.title}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${qrCategoryColors[qr.category] || "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                                          {qr.category}
                                        </span>
                                        <ChevronRight className="w-3 h-3 text-gray-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                      <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                                        {qr.message}
                                      </p>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {/* Chat Input Bar */}
                          <div className="flex items-end gap-1.5 sm:gap-2 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl p-1.5" style={{ borderColor: isDark ? '#475569' : '#e5e7eb' }}>
                            <div className="flex items-center gap-1 mb-0.5 ml-0.5 sm:ml-1">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                title="Attach file"
                              >
                                <Paperclip className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                                <Smile className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowQuickReplies((v) => !v)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showQuickReplies
                                  ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30"
                                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                                  }`}
                                title="Quick Replies"
                              >
                                <Zap className="w-4 h-4" />
                              </button>
                            </div>
                            <textarea
                              placeholder="Type your reply... (or use quick replies ⚡)"
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  void handleSendMessage();
                                }
                              }}
                              rows={1}
                              className="flex-1 py-2 px-2 text-sm bg-transparent outline-none resize-none min-h-[36px] max-h-[100px] text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                            />
                            <button
                              onClick={() => {
                                void handleSendMessage();
                              }}
                              disabled={(!chatMessage.trim() && attachedFiles.length === 0) || isSendingMessage}
                              className={`p-2 rounded-lg mb-0.5 mr-0.5 transition-colors cursor-pointer ${chatMessage.trim() || attachedFiles.length > 0
                                ? "bg-cyan-600 text-white hover:bg-cyan-700"
                                : "bg-gray-300 dark:bg-slate-600 text-white"
                                } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                              {isSendingMessage ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" style={{ marginLeft: 1 }} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Sidebar */}
                    {showInfo && (
                      <React.Fragment>
                        <button
                          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                          aria-label="Close info panel"
                          onClick={() => setShowInfo(false)}
                        />
                        <div className="fixed lg:static inset-y-0 right-0 z-40 w-[88vw] max-w-xs lg:w-72 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col shrink-0 overflow-y-auto">
                          <div className="p-4 border-b border-gray-100 dark:border-slate-700 text-center relative">
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-2"
                              style={{ backgroundColor: getAvatarColor(selectedChat.visitor) }}
                            >
                              {selectedChat.visitor.charAt(0)}
                            </div>
                            <button
                              onClick={() => setShowInfo(false)}
                              className="absolute top-3 right-3 p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 lg:hidden"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{selectedChat.visitor}</p>
                            <div className="flex items-center gap-1 justify-center mt-1">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-[11px] text-gray-500 dark:text-slate-400">Online</span>
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Session Details</p>
                            <div className="space-y-2.5">
                              <div>
                                <p className="text-[11px] text-gray-400 dark:text-slate-500">Session ID</p>
                                <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 font-mono">{getQueueDisplayId(selectedChat.id)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-gray-400 dark:text-slate-500">Status</p>
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  Active
                                </span>
                              </div>
                              {selectedChat.timeInQueue && (
                                <div>
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Time in Queue</p>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{selectedChat.timeInQueue}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[11px] text-gray-400 dark:text-slate-500">Messages</p>
                                <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{selectedChat.messages.length}</p>
                              </div>
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-slate-700 my-4" />

                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Visitor Metadata</p>
                            <div className="space-y-2.5">
                              <div className="flex items-start gap-2">
                                <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Browser</p>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{selectedChat.browser || "—"}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Monitor className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500">OS / Device</p>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{selectedChat.os || "—"} &middot; {selectedChat.device || "—"}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Location</p>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{selectedChat.location || "Unknown"}, {selectedChat.country || "Unknown"}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Local Time</p>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500">IP Address</p>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 font-mono">{selectedChat.ipAddress || "—"}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <LinkIcon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Current Page</p>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 break-all">{selectedChat.currentPage || "—"}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <LinkIcon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Referrer</p>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 break-all">{selectedChat.referrer || "—"}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                  </div>

                  {/* End Chat Confirmation */}
                  {showEndConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 w-full max-w-sm mx-4 overflow-hidden">
                        <div className="p-5">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">End Chat</h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                            Are you sure you want to end this chat with{" "}
                            <span className="font-semibold text-gray-700 dark:text-slate-300">{selectedChat.visitor}</span>? This will mark the conversation as resolved.
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-700">
                          <button
                            onClick={() => setShowEndConfirm(false)}
                            disabled={isEndingChat}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              void handleEndChat();
                            }}
                            disabled={isEndingChat}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            {isEndingChat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {isEndingChat ? "Ending..." : "Confirm End Chat"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* No chat selected */
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-slate-900/50 px-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center mb-4">
                    <MessagesSquare className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-700 dark:text-slate-300">
                    {activeChats.length === 0 ? "No active conversations" : "Select a conversation"}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-slate-500 mt-1 max-w-xs">
                    {activeChats.length === 0
                      ? "Head to the Queue to pick up a visitor and start chatting."
                      : "Choose a chat from the list to view the conversation."}
                  </p>
                  {activeChats.length === 0 && (
                    <Link
                      to="/portal/queue"
                      className="mt-4 px-5 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      Go to Queue
                    </Link>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
              {activeSubTab === "chat-history" && (
                <ChatHistorySection
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  endedChats={historyEntries}
                  endedTranscripts={{}}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

/* ─── Chat History Section ─── */
function ChatHistorySection({
  searchQuery,
  setSearchQuery,
  endedChats,
  endedTranscripts,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  endedChats: HistoryEntry[];
  endedTranscripts: ChatHistoryTranscriptMap;
}) {
  const [transcriptChatId, setTranscriptChatId] = useState<string | null>(null);
  const [transcriptCache, setTranscriptCache] = useState<ChatHistoryTranscriptMap>(endedTranscripts);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const { isDark } = useDarkMode();

  const allHistory: HistoryEntry[] = [...endedChats];

  const transcriptChat = transcriptChatId ? allHistory.find((c) => c.id === transcriptChatId) : null;
  const transcriptMessages = transcriptChatId
    ? transcriptCache[transcriptChatId] ?? []
    : [];

  useEffect(() => {
    if (!transcriptChatId || transcriptCache[transcriptChatId]) {
      return;
    }

    setIsTranscriptLoading(true);

    void liveChatServices.getConversationMessages(transcriptChatId, { page: 1, limit: 100 })
      .then((response) => {
        const mappedTranscript: TranscriptMessage[] = (response.messages || []).map((message: LiveChatMessage, index: number) => ({
          sender: message.senderType === "VISITOR" ? ("visitor" as const) : ("agent" as const),
          text: String(message.message || ""),
          time: message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : `${index + 1}`,
        }));

        setTranscriptCache((previousCache) => ({
          ...previousCache,
          [transcriptChatId]: mappedTranscript,
        }));
      })
      .finally(() => {
        setIsTranscriptLoading(false);
      });
  }, [transcriptCache, transcriptChatId]);

  const filtered = allHistory.filter((chat) => {
    return (
      chat.visitor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (


    <div className={isDark ? "dark" : ""}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Chat History</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Browse and review past chat conversations and their outcomes.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Chats</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{allHistory.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Resolved</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{allHistory.filter((c) => c.status === "Resolved").length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Avg Duration</p>
          <p className="text-2xl font-semibold text-cyan-600 dark:text-cyan-400">11m 28s</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          {/* Header row — div-based to avoid <tr>/<td> DOM nesting issues in preview */}
          <div className="min-w-[860px] grid grid-cols-[160px_1fr_140px_160px_130px_130px] border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">ID</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Visitor</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Agent</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date &amp; Time</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Duration</div>
            <div className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center">Action</div>
          </div>
          {/* Data rows */}
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {filtered.map((chat) => (
              <div key={chat.id} className="min-w-[860px] grid grid-cols-[160px_1fr_140px_160px_130px_130px] hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer">
                {/* ID */}
                <div className="px-5 py-3.5 flex items-center">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-[#0891b2] dark:text-cyan-400 bg-[#ecfeff] dark:bg-cyan-900/20 px-2 py-0.5 rounded font-semibold tracking-wide">
                      {chat.queueDisplayId ?? (() => {
                        const num = parseInt(chat.id.replace(/[^\d]/g, ''), 10) || 0;
                        const hash = ((num * 7919 + 1234) % 9000) + 1000;
                        return `Q-${hash}`;
                      })()}
                    </span>
                    {chat.isLive && (
                      <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full">New</span>
                    )}
                  </div>
                </div>
                {/* Visitor */}
                <div className="px-5 py-3.5 flex items-center">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                      style={{ backgroundColor: getAvatarColor(chat.visitor) }}
                    >
                      {chat.visitor.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{chat.visitor}</span>
                  </div>
                </div>
                {/* Agent */}
                <div className="px-5 py-3.5 flex items-center text-sm text-gray-600 dark:text-slate-400">{chat.agent}</div>
                {/* Date & Time */}
                <div className="px-5 py-3.5 flex items-center">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{chat.date}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{chat.time}</p>
                  </div>
                </div>
                {/* Duration */}
                <div className="px-5 py-3.5 flex items-center">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                    <span className="text-sm text-gray-600 dark:text-slate-400">{chat.duration}</span>
                  </div>
                </div>
                {/* Action */}
                <div className="px-5 py-3.5 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTranscriptChatId(chat.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Transcript
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">No matching chat history found.</p>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((chat) => (
          <div key={chat.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ backgroundColor: getAvatarColor(chat.visitor) }}
                >
                  {chat.visitor.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{chat.visitor}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{chat.agent}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#0891b2] dark:text-cyan-400 bg-[#ecfeff] dark:bg-cyan-900/20 px-2 py-0.5 rounded font-semibold tracking-wide shrink-0">
                {chat.queueDisplayId ?? (() => {
                  const num = parseInt(chat.id.replace(/[^\d]/g, ""), 10) || 0;
                  const hash = ((num * 7919 + 1234) % 9000) + 1000;
                  return `Q-${hash}`;
                })()}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <span>{chat.date} {chat.time}</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {chat.duration}</span>
            </div>
            <button
              onClick={() => setTranscriptChatId(chat.id)}
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View Transcript
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <History className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">No matching chat history found.</p>
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      {transcriptChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60" onClick={() => setTranscriptChatId(null)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 w-full max-w-lg mx-4 overflow-hidden max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: getAvatarColor(transcriptChat.visitor) }}
                >
                  {transcriptChat.visitor.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{transcriptChat.visitor}</p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">
                    {transcriptChat.id} &middot; {transcriptChat.date} at {transcriptChat.time} &middot; {transcriptChat.duration}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTranscriptChatId(null)}
                className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transcript Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50 dark:bg-slate-900/30" style={{ scrollbarWidth: "thin" }}>
              {isTranscriptLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 dark:text-slate-500">Loading transcript...</p>
                </div>
              ) : transcriptMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessagesSquare className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-slate-500">No transcript available.</p>
                </div>
              ) : (
                transcriptMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex ${msg.sender === "agent" ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[75%]`}>
                      {msg.sender === "visitor" ? (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                          style={{ backgroundColor: getAvatarColor(transcriptChat.visitor) }}
                        >
                          {transcriptChat.visitor.charAt(0)}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-800 dark:bg-slate-600 flex items-center justify-center text-white text-[9px] font-semibold shrink-0">
                          {transcriptChat.agent.charAt(0)}
                        </div>
                      )}
                      <div className={`flex flex-col ${msg.sender === "agent" ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 mb-0.5 px-1">
                          {msg.sender === "visitor" ? transcriptChat.visitor : transcriptChat.agent} &middot; {msg.time}
                        </span>
                        <div
                          className={`px-3 py-2 text-sm shadow-sm ${msg.sender === "visitor"
                            ? "bg-[#e5e7eb] dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-2xl rounded-bl-[4px]"
                            : "bg-cyan-600 text-white rounded-2xl rounded-br-[4px]"
                            }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 shrink-0 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 dark:text-slate-500">
                {transcriptMessages.length} message{transcriptMessages.length !== 1 ? "s" : ""} &middot; Agent: {transcriptChat.agent}
              </span>
              <button
                onClick={() => setTranscriptChatId(null)}
                className="px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

export default ChatSessionManagementPage;



