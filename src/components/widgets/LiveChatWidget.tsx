import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, X, Paperclip, MoreVertical, Check, CheckCheck } from "lucide-react";
import { API_BASE_URL } from "../../constants/constants";
import type {
  LiveChatMessage,
  LiveChatWidgetConfig,
  LiveChatStartConversationResponse,
} from "../../models/LiveChatModel";
import liveChatWidgetServices from "../../services/liveChatWidgetServices";

type SocketStatus = "idle" | "connecting" | "connected" | "closed" | "error" | "unsupported";

interface QuickMessage {
  _id: string;
  title: string;
  response: string;
}

type WindowWithLiveChatConfig = Window & {
  LiveChatConfig?: LiveChatWidgetConfig;
};

interface LiveChatWidgetProps {
  initialConfig?: LiveChatWidgetConfig;
}

const VISITOR_TOKEN_KEY = "chat_visitor_token";
const CONVERSATION_ID_KEY = "chat_conversation_id";
const WIDGET_TITLE_KEY = "jaf_widget_title";
const WIDGET_WELCOME_KEY = "jaf_welcome_message";
const WIDGET_DARK_MODE_KEY = "jaf_dark_mode";
const QUICK_MESSAGES_KEY = "jaf_quick_messages";

const DEFAULT_TITLE = "Support";
const DEFAULT_WELCOME = "👋 Hi there! Welcome to JAF Live Chat. How can I help you today?";
const DEFAULT_ACCENT = "#0891b2";
const MESSAGE_PAGE_LIMIT = 100;

const readStoredValue = (key: string, fallback = "") => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const writeStoredValue = (key: string, value: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors in embedded contexts.
  }
};

const getVisitorToken = () => {
  const existingToken = readStoredValue(VISITOR_TOKEN_KEY);
  if (existingToken) {
    return existingToken;
  }

  const token = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `visitor-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  writeStoredValue(VISITOR_TOKEN_KEY, token);
  return token;
};

const getWindowConfig = (): LiveChatWidgetConfig => {
  if (typeof window === "undefined") {
    return {};
  }

  const liveChatWindow = window as WindowWithLiveChatConfig;
  return liveChatWindow.LiveChatConfig || {};
};

const getResolvedConfig = (initialConfig: LiveChatWidgetConfig = {}): LiveChatWidgetConfig => {
  const windowConfig = getWindowConfig();

  return {
    apiKey: initialConfig.apiKey || windowConfig.apiKey || readStoredValue("chat_widget_api_key") || "",
    title: initialConfig.title || readStoredValue(WIDGET_TITLE_KEY, windowConfig.title || DEFAULT_TITLE),
    welcomeMessage: initialConfig.welcomeMessage || readStoredValue(WIDGET_WELCOME_KEY, windowConfig.welcomeMessage || DEFAULT_WELCOME),
    accentColor: initialConfig.accentColor || windowConfig.accentColor || DEFAULT_ACCENT,
  };
};

const normalizeSocketUrl = (value: string) => value.replace(/\/$/, "");

const resolveSocketUrl = () => {
  const apiBaseUrl = String(API_BASE_URL).trim().replace(/\/$/, "");
  const rootUrl = apiBaseUrl.replace(/\/api\/v\d+\/?$/i, "");

  if (rootUrl.startsWith("https://")) {
    return `wss://${rootUrl.slice("https://".length)}`;
  }

  if (rootUrl.startsWith("http://")) {
    return `ws://${rootUrl.slice("http://".length)}`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
  }

  return "";
};

const formatTime = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const normalizeMessages = (messages: LiveChatMessage[]) => {
  return [...messages].sort((left, right) => {
    const leftTime = new Date(left.createdAt || left.updatedAt || 0).getTime();
    const rightTime = new Date(right.createdAt || right.updatedAt || 0).getTime();
    return leftTime - rightTime;
  });
};

const getErrorMessage = (error: unknown) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Unable to load live chat.";
};

const resolveConversationIdFromStart = (response: LiveChatStartConversationResponse) => {
  if (response.conversation?._id) {
    return response.conversation._id;
  }

  const queuedConversation = response.queueEntry?.conversationId;

  if (typeof queuedConversation === "string") {
    return queuedConversation;
  }

  if (queuedConversation && typeof queuedConversation === "object" && "_id" in queuedConversation) {
    return queuedConversation._id;
  }

  return "";
};

const LiveChatWidget = ({ initialConfig = {} }: LiveChatWidgetProps) => {
  const [widgetConfig, setWidgetConfig] = useState<LiveChatWidgetConfig>(() => getResolvedConfig(initialConfig));
  const [visitorToken] = useState(() => getVisitorToken());
  const [conversationId, setConversationId] = useState(() => readStoredValue(CONVERSATION_ID_KEY));
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
  const [unreadCount, setUnreadCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => readStoredValue(WIDGET_DARK_MODE_KEY) === "true");
  const [showQuickMessages, setShowQuickMessages] = useState(true);
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const apiKey = String(widgetConfig.apiKey || "").trim();
  const title = widgetConfig.title || DEFAULT_TITLE;
  const welcomeMessage = widgetConfig.welcomeMessage || DEFAULT_WELCOME;
  const accentColor = widgetConfig.accentColor || DEFAULT_ACCENT;
  const statusLabel = useMemo(() => {
    switch (socketStatus) {
      case "connected":
        return "Online";
      case "connecting":
        return "Connecting...";
      case "unsupported":
        return "Unsupported";
      case "error":
        return "Reconnect required";
      case "closed":
        return "Offline";
      default:
        return "Support";
    }
  }, [socketStatus]);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current !== null) {
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const disconnectSocket = useCallback(() => {
    clearHeartbeat();

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, [clearHeartbeat]);

  const syncMessages = useCallback(
    async (targetConversationId: string) => {
      if (!apiKey || !targetConversationId) {
        return;
      }

      try {
        const response = await liveChatWidgetServices.getConversationMessages(
          widgetConfig,
          visitorToken,
          targetConversationId,
          { page: 1, limit: MESSAGE_PAGE_LIMIT },
        );

        setMessages(normalizeMessages(response.messages));
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    },
    [apiKey, visitorToken, widgetConfig],
  );

  const startConversation = useCallback(async (): Promise<string | null> => {
    if (!apiKey) {
      setErrorMessage("Configure an apiKey to start the live chat widget.");
      return null;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response: LiveChatStartConversationResponse = await liveChatWidgetServices.startConversation(
        widgetConfig,
        visitorToken,
        {},
      );

      const nextConversationId = resolveConversationIdFromStart(response);

      if (!nextConversationId) {
        throw new Error("Conversation could not be created.");
      }

      setConversationId(nextConversationId);
      writeStoredValue(CONVERSATION_ID_KEY, nextConversationId);

      if (response.initialMessage) {
        setMessages(normalizeMessages([response.initialMessage]));
      } else {
        setMessages([]);
      }

      await syncMessages(nextConversationId);
      return nextConversationId;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, syncMessages, visitorToken, widgetConfig]);

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    let activeConversationId: string | null = conversationId || null;

    if (!activeConversationId) {
      activeConversationId = await startConversation();
      if (!activeConversationId) {
        return;
      }
    }

    const resolvedConversationId = activeConversationId;

    setIsSending(true);
    setErrorMessage("");

    try {
      const optimisticMessage: LiveChatMessage = {
        _id: `local-${Date.now()}`,
        conversationId: resolvedConversationId,
        senderType: "VISITOR",
        senderId: visitorToken,
        message: trimmedMessage,
        createdAt: new Date().toISOString(),
      };

      setMessages((currentMessages) => normalizeMessages([...currentMessages, optimisticMessage]));
      setMessageText("");

      await liveChatWidgetServices.sendMessage(widgetConfig, visitorToken, {
        conversationId: resolvedConversationId,
        message: trimmedMessage,
      });

      await syncMessages(resolvedConversationId);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      await syncMessages(resolvedConversationId);
    } finally {
      setIsSending(false);
    }
  }, [conversationId, isSending, messageText, startConversation, syncMessages, visitorToken, widgetConfig]);

  useEffect(() => {
    const syncConfig = () => {
      setWidgetConfig(getResolvedConfig(initialConfig));
      setIsDarkMode(readStoredValue(WIDGET_DARK_MODE_KEY) === "true");
    };

    const handleOpenChat = () => {
      setIsOpen(true);
    };

    const handleStorage = () => syncConfig();

    window.addEventListener("open-live-chat", handleOpenChat);
    window.addEventListener("storage", handleStorage);

    syncConfig();

    return () => {
      window.removeEventListener("open-live-chat", handleOpenChat);
      window.removeEventListener("storage", handleStorage);
    };
  }, [initialConfig]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setUnreadCount(0);

    if (!apiKey) {
      setErrorMessage("Configure an apiKey to start the live chat widget.");
      return;
    }

    // Load quick messages from localStorage (or API in the future)
    try {
      const stored = readStoredValue(QUICK_MESSAGES_KEY);
      if (stored) {
        setQuickMessages(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }

    if (!conversationId) {
      void startConversation();
      return;
    }

    void syncMessages(conversationId);
  }, [apiKey, conversationId, isOpen, startConversation, syncMessages]);

  useEffect(() => {
    if (!isOpen || !apiKey || !conversationId) {
      disconnectSocket();
      setSocketStatus(apiKey ? "closed" : "idle");
      return;
    }

    const socketUrl = resolveSocketUrl();
    if (!socketUrl) {
      setSocketStatus("unsupported");
      return;
    }

    disconnectSocket();

    try {
      const url = new URL(`${socketUrl.replace(/\/$/, "")}/ws/live-chat`);
      url.searchParams.set("apiKey", apiKey);
      url.searchParams.set("visitorToken", visitorToken);
      url.searchParams.set("conversationId", conversationId);

      const socket = new WebSocket(url.toString());
      socketRef.current = socket;
      setSocketStatus("connecting");

      socket.addEventListener("open", () => {
        setSocketStatus("connected");
        clearHeartbeat();
        heartbeatRef.current = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "PING" }));
          }
        }, 30000);
      });

      socket.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data) as { event?: string; data?: { senderType?: string } };

          if (payload.event === "NEW_MESSAGE" || payload.event === "CONVERSATION_ASSIGNED") {
            void syncMessages(conversationId);
          }

          if (payload.event === "NEW_MESSAGE" && payload.data?.senderType !== "VISITOR" && !isOpen) {
            setUnreadCount((currentCount) => currentCount + 1);
          }
        } catch {
          // Ignore malformed socket payloads.
        }
      });

      socket.addEventListener("error", () => {
        setSocketStatus("error");
      });

      socket.addEventListener("close", () => {
        clearHeartbeat();
        setSocketStatus("closed");
      });
    } catch {
      setSocketStatus("error");
    }

    return () => {
      disconnectSocket();
    };
  }, [apiKey, conversationId, disconnectSocket, isOpen, syncMessages, visitorToken]);

  useEffect(() => {
    if (!isOpen || messages.length === 0) {
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages]);

  useEffect(() => {
    const storedVisitorToken = readStoredValue(VISITOR_TOKEN_KEY);
    if (!storedVisitorToken) {
      writeStoredValue(VISITOR_TOKEN_KEY, visitorToken);
    }

    const storedConversationId = readStoredValue(CONVERSATION_ID_KEY);
    if (storedConversationId && storedConversationId !== conversationId) {
      setConversationId(storedConversationId);
    }
  }, [conversationId, visitorToken]);

  const theme = isDarkMode
    ? {
      shell: "bg-slate-950 border-slate-800 text-slate-100",
      header: "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg",
      panel: "bg-slate-900 border-slate-800",
      body: "bg-slate-950",
      headerText: "text-white font-semibold text-sm",
      subText: "text-cyan-200 text-xs font-medium",
      muted: "text-slate-400 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg shadow-sm",
      bubbleAgent: "bg-slate-800 text-slate-100 border border-slate-700 rounded-3xl rounded-tl-lg shadow-sm",
      composer: "bg-slate-900 border-t border-slate-800",
      input: "bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-700 disabled:cursor-not-allowed",
      buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
      quickMsg: "bg-slate-800 border border-slate-700 text-slate-100 hover:bg-slate-700 text-xs cursor-pointer",
      error: "bg-red-950/50 text-red-200 border border-red-900/50",
      divider: "bg-slate-800",
    }
    : {
      shell: "bg-white border-slate-200 text-slate-900 shadow-2xl",
      header: "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg",
      panel: "bg-slate-50 border-slate-200",
      body: "bg-white",
      headerText: "text-white font-semibold text-sm",
      subText: "text-cyan-100 text-xs font-medium",
      muted: "text-slate-500 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg shadow-sm",
      bubbleAgent: "bg-slate-100 text-slate-900 border border-slate-200 rounded-3xl rounded-tl-lg shadow-sm",
      composer: "bg-white border-t border-slate-200",
      input: "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-200 disabled:cursor-not-allowed",
      buttonSecondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
      quickMsg: "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs cursor-pointer",
      error: "bg-red-50 text-red-700 border border-red-200",
      divider: "bg-slate-200",
    };

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-4 font-sans" style={{ fontFamily: "Inter, sans-serif" }}>
      {isOpen ? (
        <div className={`w-[400px] max-w-[calc(100vw-1.5rem)] h-[600px] overflow-hidden rounded-2xl border flex flex-col ${theme.shell}`}>
          {/* Header */}
          <div className={`${theme.header} px-6 py-4 flex-shrink-0`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white font-bold text-lg">
                  {title.trim().charAt(0).toUpperCase() || "J"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white leading-tight">{title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`h-2 w-2 rounded-full ${socketStatus === "connected" ? "bg-green-400 animate-pulse" : socketStatus === "connecting" ? "bg-yellow-400" : "bg-slate-400"}`} />
                    <p className={theme.subText}>{statusLabel}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 active:bg-white/30"
                  aria-label="Close live chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto px-6 py-4 flex flex-col ${theme.body}`}>
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Starting your chat session...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className={`rounded-2xl border p-6 text-center ${theme.panel}`}>
                <div className="flex justify-center mb-3">
                  <div className="h-14 w-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <MessageCircle className="h-7 w-7 text-cyan-600" />
                  </div>
                </div>
                <p className={`font-semibold ${theme.headerText}`}>{welcomeMessage}</p>
                <p className={`mt-2 ${theme.muted}`}>We're here to help. Send a message to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((message) => {
                  const isVisitorMessage = message.senderType === "VISITOR";
                  const isRead = message.createdAt; // Placeholder for read status

                  return (
                    <div key={message._id} className={`flex ${isVisitorMessage ? "justify-end" : "justify-start"} items-end gap-2`}>
                      {!isVisitorMessage && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                          J
                        </div>
                      )}
                      <div className={`max-w-[70%] ${isVisitorMessage ? theme.bubbleVisitor : theme.bubbleAgent}`}>
                        <p className="px-4 py-2.5 whitespace-pre-wrap leading-relaxed text-sm">{message.message}</p>
                        <div className={`px-4 pb-1 flex items-center gap-1 ${isVisitorMessage ? "text-white/70" : theme.muted}`}>
                          <p className="text-[11px]">{formatTime(message.createdAt)}</p>
                          {isVisitorMessage && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Quick Messages */}
          {showQuickMessages && (
            <div className={`border-t px-6 py-4 ${theme.divider}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-wide mb-2 ${theme.muted}`}>Quick Replies</p>
              <div className="flex flex-wrap gap-2">
                {quickMessages.slice(0, 5).map((qm) => (
                  <button
                    key={qm._id}
                    type="button"
                    onClick={() => {
                      setMessageText(qm.response);
                      void handleSendMessage();
                    }}
                    disabled={!apiKey || isLoading || isSending}
                    className={`px-3 py-1.5 rounded-full border transition-colors text-xs font-medium ${theme.quickMsg} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {qm.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className={`border-t ${theme.composer} px-6 py-4 flex-shrink-0`}>
            {errorMessage ? (
              <div className={`mb-3 rounded-xl border px-3 py-2 text-xs ${theme.error} flex items-start gap-2`}>
                <span className="flex-shrink-0 mt-0.5">!</span>
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!apiKey || isLoading || isSending}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl flex-shrink-0 transition-colors ${theme.buttonSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Attach file"
                title="Attach file (coming soon)"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                disabled
              />

              <div className={`flex-1 rounded-2xl border px-1 py-1 ${theme.input} flex items-center`}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  placeholder={apiKey ? "Type a message..." : "Configure apiKey to chat..."}
                  disabled={!apiKey || isLoading || isSending}
                  className={`w-full bg-transparent text-sm outline-none px-3 py-2 disabled:opacity-50 ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleSendMessage();
                }}
                disabled={!apiKey || isLoading || isSending || !messageText.trim()}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl transition-colors ${theme.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Send message"
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>

            <p className={`text-[10px] mt-2 text-center ${theme.muted}`}>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">Shift+Enter</kbd> for new line</p>
          </div>
        </div>
      ) : null}

      {/* Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) {
            setUnreadCount(0);
          }
        }}
        className={`relative flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl transition-all hover:scale-110 active:scale-95 ${theme.button}`}
        aria-label="Open live chat"
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}

        {unreadCount > 0 && !isOpen ? (
          <span className="absolute -right-3 -top-3 flex min-w-[24px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
    </div>
  );
};

export default LiveChatWidget;
