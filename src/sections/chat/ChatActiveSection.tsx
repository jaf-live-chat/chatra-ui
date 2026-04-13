import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Clock,
  Eye,
  FileText,
  Info,
  Loader2,
  MessagesSquare,
  Paperclip,
  Send,
  Smile,
  X,
  Zap,
} from "lucide-react";
import { ActiveChat, ChatAttachmentUpload, ChatMessage, mapServerMessageToChatMessage, QuickReplyItem } from "../../models/ChatSessionManagementModel";
import { LiveChatConversationEndedEvent, LiveChatMessage, LiveChatParticipantRole, LiveChatQueueEntry } from "../../models/LiveChatModel";
import { useDarkMode } from "../../providers/DarkModeContext";
import { useStaffLiveChat } from "../../hooks/useStaffLiveChat";
import useAuth from "../../hooks/useAuth";
import liveChatWidgetServices from "../../services/liveChatWidgetServices";
import liveChatServices from "../../services/liveChatServices";
import Agents from "../../services/agentServices";
import { USER_STATUS } from "../../constants/constants";
import MessageStatusBadge from "../../components/MessageStatusBadge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/Sheet";
import getInitials from "../../utils/getInitials";

// Seeds for quick replies (assuming it's from constants)
const SEED_REPLIES: QuickReplyItem[] = [
  {
    id: "1",
    shortcut: "/greet",
    title: "Greeting",
    message: "Hi! Thanks for reaching out. How can I help you today?",
    category: "Greetings",
  },
  {
    id: "2",
    shortcut: "/thanks",
    title: "Thank You",
    message: "Thanks for your patience. Is there anything else I can help with?",
    category: "General",
  },
];

const avatarColors = ["#0891b2", "#7c3aed", "#059669", "#d97706", "#dc2626", "#2563eb"];

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

function getQueueDisplayId(id: string) {
  const num = parseInt(id.replace(/[^\d]/g, ""), 10) || 0;
  const hash = ((num * 7919 + 1234) % 9000) + 1000;
  return `Q-${hash}`;
}

function getVisitorMapEmbedUrl(city?: string | null, country?: string | null) {
  const query = [city, country]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ");

  if (!query) {
    return null;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=10&output=embed`;
}

interface ChatActiveSectionProps {
  queue: LiveChatQueueEntry[];
  mutateQueue: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const ChatActiveSection = ({ queue, mutateQueue, searchQuery, setSearchQuery }: ChatActiveSectionProps) => {
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isMobileChatPanelOpen, setIsMobileChatPanelOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isEndingChat, setIsEndingChat] = useState(false);
  const [isSyncingMessages, setIsSyncingMessages] = useState(false);
  const [endedChatNotice, setEndedChatNotice] = useState("");

  const [attachedFiles, setAttachedFiles] = useState<ChatAttachmentUpload[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReplyItem[]>([]);
  const [qrSearchQuery, setQrSearchQuery] = useState("");
  const [qrActiveCategory, setQrActiveCategory] = useState("All");

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickRepliesRef = useRef<HTMLDivElement>(null);

  const { isDark } = useDarkMode();
  const { user, tenant } = useAuth();

  // WebSocket event handlers
  const handleNewMessage = useCallback((message: LiveChatMessage) => {
    const targetConversationId = String(message?.conversationId || "");
    if (!targetConversationId) {
      return;
    }

    console.log("[REALTIME] New message received:", message);

    setActiveChats((currentChats) => currentChats.map((chat) => {
      if (String(chat.sessionId || chat.id) !== targetConversationId) {
        return chat;
      }

      const mappedIncoming = mapServerMessageToChatMessage(
        message,
        `${targetConversationId}-${Date.now()}`,
        getTime(),
      );

      const nextMessages = [...chat.messages];
      const existingById = nextMessages.findIndex((m) => String(m.id) === String(mappedIncoming.id));

      if (existingById >= 0) {
        nextMessages[existingById] = {
          ...nextMessages[existingById],
          ...mappedIncoming,
        };
        return { ...chat, messages: nextMessages };
      }

      if (message.senderType !== "VISITOR") {
        const pendingIndex = nextMessages.findIndex(
          (m) => m.sender === "agent"
            && m.status === "SENDING"
            && String(m.text).trim() === String(mappedIncoming.text).trim(),
        );

        if (pendingIndex >= 0) {
          nextMessages[pendingIndex] = {
            ...nextMessages[pendingIndex],
            ...mappedIncoming,
          };
          return { ...chat, messages: nextMessages };
        }
      }

      console.log("[REALTIME] Adding new message to chat");
      return {
        ...chat,
        messages: [...nextMessages, mappedIncoming],
      };
    }));
  }, []);

  const handleMessageStatusUpdated = useCallback(
    (payload: { conversationId?: string; messageIds?: string[]; status?: "DELIVERED" | "SEEN"; seenByRole?: string | null }) => {
      const targetConversationId = String(payload?.conversationId || "");
      const messageIds = Array.isArray(payload?.messageIds) ? new Set(payload.messageIds.map((id) => String(id))) : null;

      if (!targetConversationId || !messageIds || !payload.status) {
        return;
      }

      setActiveChats((currentChats) => currentChats.map((chat) => {
        if (String(chat.sessionId || chat.id) !== targetConversationId) {
          return chat;
        }

        return {
          ...chat,
          messages: chat.messages.map((message) => {
            if (!messageIds.has(String(message.id))) {
              return message;
            }

            return {
              ...message,
              status: payload.status,
              seenByRole: payload.seenByRole || message.seenByRole || null,
            };
          }),
        };
      }));
    },
    []
  );

  const resolveEndedByText = useCallback((payload: LiveChatConversationEndedEvent) => {
    const endedByName = String(payload.endedBy?.displayName || "").trim();
    if (!endedByName) {
      return "This chat has ended.";
    }

    return `This chat has ended. Ended by ${endedByName}.`;
  }, []);

  const handleConversationEnded = useCallback((payload: LiveChatConversationEndedEvent) => {
    const targetConversationId = String(payload?.conversation?._id || "");
    if (!targetConversationId) {
      return;
    }

    const notice = resolveEndedByText(payload);
    setEndedChatNotice(notice);

    setActiveChats((currentChats) => currentChats.map((chat) => {
      if (String(chat.sessionId || chat.id) !== targetConversationId) {
        return chat;
      }

      const terminalMessage: ChatMessage = {
        id: `ended-${targetConversationId}`,
        sender: "agent",
        text: notice,
        timestamp: getTime(),
        status: "DELIVERED",
      };

      if (chat.messages.some((message) => String(message.id) === terminalMessage.id)) {
        return chat;
      }

      return {
        ...chat,
        status: "Ended",
        messages: [...chat.messages, terminalMessage],
      };
    }));

    void mutateQueue();
  }, [mutateQueue, resolveEndedByText]);

  const handleQueueUpdated = useCallback(() => {
    console.log("[REALTIME] Queue updated");
    void mutateQueue();
  }, [mutateQueue]);

  // Connect to WebSocket and listen for events
  useStaffLiveChat(
    tenant?.apiKey ?? undefined,
    String(tenant?.databaseName || "") || undefined,
    tenant?.id,
    String(user?.role || "ADMIN"),
    String(user?._id || ""),
    {
      onNewMessage: handleNewMessage,
      onMessageStatusUpdated: handleMessageStatusUpdated,
      onConversationEnded: handleConversationEnded,
      onQueueUpdated: handleQueueUpdated,
    }
  );

  // Load quick replies
  useEffect(() => {
    try {
      const stored = localStorage.getItem("jaf_quick_replies");
      setQuickReplies(stored ? JSON.parse(stored) : SEED_REPLIES);
    } catch {
      /* ignore */
    }
  }, []);

  // Reload quick replies when dropdown opens
  useEffect(() => {
    if (showQuickReplies) {
      try {
        const stored = localStorage.getItem("jaf_quick_replies");
        setQuickReplies(stored ? JSON.parse(stored) : SEED_REPLIES);
      } catch {
        /* ignore */
      }
      setQrSearchQuery("");
      setQrActiveCategory("All");
    }
  }, [showQuickReplies]);

  // Close quick replies dropdown on outside click
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

  const selectedChat = useMemo(
    () => activeChats.find((chat) => chat.id === selectedChatId),
    [activeChats, selectedChatId],
  );

  const selectedChatSessionId = selectedChat?.sessionId ? String(selectedChat.sessionId) : null;
  const selectedChatResolvedId = selectedChat ? String(selectedChat.id) : null;
  const selectedVisitorInitials = getInitials(selectedChat?.visitorFullName, "V");
  const activeAgentInitials = getInitials(user?.fullName, "A");
  const visitorMapEmbedUrl = useMemo(() => {
    if (!selectedChat || selectedChat.locationConsent !== true) {
      return null;
    }

    return getVisitorMapEmbedUrl(selectedChat.location, selectedChat.country);
  }, [selectedChat]);
  const visitorLocationLabel = useMemo(() => {
    const parts = [selectedChat?.location, selectedChat?.country]
      .map((value) => String(value || "").trim())
      .filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    if (selectedChat?.locationConsent === true) {
      return "Location not resolved yet";
    }

    return "Location unavailable";
  }, [selectedChat?.country, selectedChat?.location, selectedChat?.locationConsent]);
  const latestAgentMessageId = useMemo(() => {
    const latestMessage = [...(selectedChat?.messages || [])].reverse().find((message) => message.sender === "agent");
    return latestMessage ? String(latestMessage.id) : null;
  }, [selectedChat?.messages]);

  const syncServerMessages = useCallback(async (conversationId: string, chatId: string) => {
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
      // Keep existing messages if sync fails
    } finally {
      setIsSyncingMessages(false);
    }
  }, []);

  // Sync active chats from queue
  useEffect(() => {
    const liveChats: ActiveChat[] = (queue || [])
      .map((entry: LiveChatQueueEntry) => {
        const conversation = typeof entry.conversationId === "object" ? entry.conversationId : null;
        const visitor = typeof entry.visitorId === "object" ? entry.visitorId : null;
        const agent = typeof entry.agentId === "object" ? entry.agentId : null;
        const conversationId = conversation?._id || entry.conversationId || entry._id;

        if (!conversationId || conversation?.status !== "OPEN") {
          return null;
        }

        return {
          id: String(conversationId),
          visitor: visitor?.fullName || visitor?.name || (visitor?.visitorToken ? `Visitor ${String(visitor.visitorToken).slice(-4)}` : "Website Visitor"),
          visitorFullName: visitor?.fullName || visitor?.name || undefined,
          sessionId: String(conversationId),
          message: "Active support conversation",
          status: "Active",
          timeInQueue: formatQueueDuration(entry.queuedAt || conversation?.queuedAt),
          messages: [],
          startedAt: Date.now(),
          agent: agent?.fullName || "Assigned Agent",
          agentFullName: agent?.fullName || undefined,
          location: conversation?.locationCity || visitor?.locationCity || "",
          country: conversation?.locationCountry || visitor?.locationCountry || "",
          locationConsent:
            typeof conversation?.locationConsent === "boolean"
              ? conversation.locationConsent
              : typeof visitor?.locationConsent === "boolean"
                ? visitor.locationConsent
                : undefined,
          ipAddress: visitor?.ipAddress || conversation?.ipAddress || "—",
          currentPage: (visitor as any)?.currentPage || "—",
          referrer: (visitor as any)?.referrer || "—",
          browser: (visitor as any)?.browser || "—",
          os: (visitor as any)?.os || "—",
          device: (visitor as any)?.device || "—",
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

  // Load initial messages when chat is selected
  useEffect(() => {
    if (!selectedChatSessionId || !selectedChatResolvedId) {
      return;
    }

    // Fetch initial message history from server
    void syncServerMessages(selectedChatSessionId, selectedChatResolvedId);
  }, [selectedChatSessionId, selectedChatResolvedId, syncServerMessages]);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  // Open mobile chat panel
  useEffect(() => {
    if (selectedChatId) {
      setIsMobileChatPanelOpen(true);
      setEndedChatNotice("");
    }
  }, [selectedChatId]);

  const filteredQuickReplies = quickReplies.filter((qr) => {
    const matchesCategory = qrActiveCategory === "All" || qr.category === qrActiveCategory;
    const matchesSearch =
      !qrSearchQuery ||
      qr.title.toLowerCase().includes(qrSearchQuery.toLowerCase()) ||
      qr.shortcut.toLowerCase().includes(qrSearchQuery.toLowerCase()) ||
      qr.message.toLowerCase().includes(qrSearchQuery.toLowerCase());
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
          setAttachedFiles((prev) => [...prev, { file, previewUrl: reader.result as string }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFileRemove = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    const hasText = chatMessage.trim().length > 0;
    const hasFiles = attachedFiles.length > 0;
    if ((!hasText && !hasFiles) || isSendingMessage) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "agent",
      text: hasText ? chatMessage.trim() : hasFiles ? `📎 ${attachedFiles.map((f) => f.file.name).join(", ")}` : "",
      timestamp: getTime(),
      status: "SENDING",
      ...(hasFiles ? { files: attachedFiles.map((f) => ({ name: f.file.name, url: f.previewUrl, type: f.file.type })) } : {}),
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
        { skipGlobalBlocking: true },
      );

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
          await liveChatServices.endConversation(String(chat.sessionId), { skipGlobalBlocking: true });

          // Update agent status to available
          try {
            await Agents.updateMyStatus(USER_STATUS.AVAILABLE);
          } catch {
            // Continue even if status update fails
          }
        } catch {
          // Remove local card even if API fails
        }
      }

      setActiveChats((prev) => prev.filter((c) => c.id !== selectedChatId));
      mutateQueue();

      setSelectedChatId(activeChats.length > 1 ? activeChats.find((c) => c.id !== selectedChatId)?.id || null : null);
      setShowEndConfirm(false);
      setIsMobileChatPanelOpen(false);
    } finally {
      setIsEndingChat(false);
    }
  };

  return (
    <div className="h-[calc(100vh-72px-64px)] sm:h-[calc(100vh-65px-64px)] flex flex-col lg:flex-row">
      {/* Chat List Sidebar */}
      <div className={`bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 flex flex-col shrink-0 w-full lg:w-80 ${isMobileChatPanelOpen ? "hidden lg:flex" : "flex"} lg:border-r`}>
        <div className="p-3 border-b border-gray-100 dark:border-slate-700">
          <div className="relative">
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
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 dark:border-slate-700/50 transition-colors cursor-pointer ${isSelected ? "bg-cyan-50 dark:bg-cyan-900/20 border-l-2 border-l-cyan-600" : "hover:bg-gray-50 dark:hover:bg-slate-700/40 border-l-2 border-l-transparent"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style={{ backgroundColor: getAvatarColor(chat.visitor) }}
                      >
                        {getInitials(chat.visitorFullName, "V")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{chat.visitor}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{lastMsg?.text || "No messages yet"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-gray-400 dark:text-slate-500">{chat.timeInQueue}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
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
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: getAvatarColor(selectedChat.visitor) }}
              >
                {selectedVisitorInitials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{selectedChat.visitor}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">Active now</span>
                  {selectedChat.sessionId && (
                    <span className="hidden sm:inline text-[10px] text-gray-400 dark:text-slate-500 font-mono ml-2">
                      {selectedChat.sessionId}
                    </span>
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

                {endedChatNotice ? (
                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300">
                    {endedChatNotice}
                  </div>
                ) : null}

                <div className="space-y-3">
                  {selectedChat.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex ${msg.sender === "agent" ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[88%] sm:max-w-[65%]`}>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${msg.sender === "agent" ? "bg-gray-700 dark:bg-slate-600" : ""
                            }`}
                          style={msg.sender === "visitor" ? { backgroundColor: getAvatarColor(selectedChat.visitor) } : undefined}
                        >
                          {msg.sender === "agent" ? activeAgentInitials : selectedVisitorInitials}
                        </div>
                        <div className={`flex flex-col ${msg.sender === "agent" ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <span className="text-[11px] text-gray-400 dark:text-slate-500">{msg.timestamp}</span>
                            {msg.sender === "agent" && String(msg.id) === latestAgentMessageId && (
                              <MessageStatusBadge status={msg.status} seenByRole={msg.seenByRole} />
                            )}
                          </div>
                          {msg.files && msg.files.length > 0 && (
                            <div className="flex flex-wrap gap-2 my-1">
                              {msg.files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs">
                                  <FileText className="w-3 h-3" />
                                  {file.name}
                                </div>
                              ))}
                            </div>
                          )}
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
                  ))}
                </div>

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 sm:px-4 py-3 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shrink-0">
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.zip" multiple />

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
                            <span className="text-[9px] text-gray-500 truncate">{af.file.name.slice(0, 8)}</span>
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
                  {showQuickReplies && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 overflow-hidden z-30" style={{ maxHeight: "340px" }}>
                      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">Quick Replies</span>
                        <button onClick={() => setShowQuickReplies(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="px-3 pt-2 pb-1.5 space-y-2 border-b border-gray-100 dark:border-slate-700">
                        <input
                          type="text"
                          placeholder="Search replies..."
                          value={qrSearchQuery}
                          onChange={(e) => setQrSearchQuery(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                        />
                        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                          {qrCategories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setQrActiveCategory(cat)}
                              className={`px-2 py-0.5 text-[10px] font-medium whitespace-nowrap rounded transition-colors ${qrActiveCategory === cat ? qrCategoryColors[cat] || "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400"
                                }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
                        {filteredQuickReplies.length === 0 ? (
                          <p className="text-center py-3 text-xs text-gray-400">No replies found</p>
                        ) : (
                          filteredQuickReplies.map((qr) => (
                            <button
                              key={qr.id}
                              onClick={() => handleInsertQuickReply(qr.message)}
                              className="w-full text-left px-3 py-2 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                            >
                              <p className="text-xs font-medium text-gray-900 dark:text-slate-100">{qr.title}</p>
                              <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1">{qr.message}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-end gap-1.5 sm:gap-2 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl p-1.5">
                    <div className="flex items-center gap-1 mb-0.5 ml-0.5 sm:ml-1">
                      <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer" title="Attach file">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                        <Smile className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowQuickReplies((v) => !v)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showQuickReplies ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}`}
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
                      className={`p-2 rounded-lg mb-0.5 mr-0.5 transition-colors cursor-pointer ${chatMessage.trim() || attachedFiles.length > 0 ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-gray-300 dark:bg-slate-600 text-white"} disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      {isSendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" style={{ marginLeft: 1 }} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Sidebar */}
            <Sheet open={showInfo} onOpenChange={setShowInfo}>
              <SheetContent side="right" className="w-[96vw] max-w-2xl lg:w-[40rem] p-0 gap-0 overflow-hidden bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <SheetHeader className="sr-only">
                  <SheetTitle>Visitor Details</SheetTitle>
                  <SheetDescription>Live chat visitor metadata and analytics map.</SheetDescription>
                </SheetHeader>

                <div className="h-full overflow-y-auto">
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700 text-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-2"
                      style={{ backgroundColor: getAvatarColor(selectedChat.visitor) }}
                    >
                      {selectedVisitorInitials}
                    </div>
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
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500">Location</p>
                        <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                          {visitorLocationLabel}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-slate-700 my-4" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Visitor Map</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedChat.locationConsent === true ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"}`}>
                          {selectedChat.locationConsent === true ? "Consent granted" : selectedChat.locationConsent === false ? "Consent denied" : "Consent unavailable"}
                        </span>
                      </div>

                      {selectedChat.locationConsent === false ? (
                        <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 p-3 text-xs text-gray-500 dark:text-slate-400">
                          Location not permitted by the visitor.
                        </div>
                      ) : selectedChat.locationConsent === true && visitorMapEmbedUrl ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                          <iframe
                            title={`${selectedChat.visitor} location map`}
                            src={visitorMapEmbedUrl}
                            loading="lazy"
                            className="h-56 w-full border-0"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                          <div className="px-3 py-2 text-[11px] text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-700">
                            Showing {visitorLocationLabel}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 p-3 text-xs text-gray-500 dark:text-slate-400">
                          {selectedChat.locationConsent === true ? "Location was granted but no map-ready location was resolved." : "Location permission unavailable for map plotting."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* End Chat Confirmation */}
          {showEndConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 w-full max-w-sm mx-4 overflow-hidden">
                <div className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">End Chat</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                    Are you sure you want to end this chat with <span className="font-semibold text-gray-700 dark:text-slate-300">{selectedChat.visitor}</span>? This will mark the conversation as resolved. Your status will be changed to available.
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
          <h3 className="text-base font-semibold text-gray-700 dark:text-slate-300">{activeChats.length === 0 ? "No active conversations" : "Select a conversation"}</h3>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1 max-w-xs">
            {activeChats.length === 0 ? "Head to the Queue to pick up a visitor and start chatting." : "Choose a chat from the list to view the conversation."}
          </p>
          {activeChats.length === 0 && (
            <Link to="/portal/queue" className="mt-4 px-5 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors">
              Go to Queue
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatActiveSection;
