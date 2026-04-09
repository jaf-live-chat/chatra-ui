import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { API_BASE_URL } from "../../constants/constants";
import type {
  LiveChatMessage,
  LiveChatWidgetConfig,
  LiveChatStartConversationResponse,
} from "../../models/LiveChatModel";
import liveChatWidgetServices from "../../services/liveChatWidgetServices";

type SocketStatus = "idle" | "connecting" | "connected" | "closed" | "error" | "unsupported";

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

const DEFAULT_TITLE = "Live Chat";
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

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);

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
      shell: "bg-slate-900 border-slate-700 text-slate-100",
      panel: "bg-slate-800 border-slate-700",
      body: "bg-slate-900",
      headerText: "text-slate-100",
      muted: "text-slate-400",
      bubbleVisitor: "bg-cyan-600 text-white",
      bubbleAgent: "bg-slate-700 text-slate-100 border-slate-600",
      composer: "bg-slate-900 border-slate-700",
      input: "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500",
      launcher: "bg-cyan-600 hover:bg-cyan-700",
      error: "bg-red-950/70 text-red-200 border-red-900/40",
    }
    : {
      shell: "bg-white border-slate-200 text-slate-900",
      panel: "bg-white border-slate-200",
      body: "bg-slate-50",
      headerText: "text-slate-900",
      muted: "text-slate-500",
      bubbleVisitor: "bg-cyan-600 text-white",
      bubbleAgent: "bg-white text-slate-800 border-slate-200",
      composer: "bg-white border-slate-200",
      input: "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400",
      launcher: "bg-cyan-600 hover:bg-cyan-700",
      error: "bg-red-50 text-red-700 border-red-200",
    };

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-3 font-sans">
      {isOpen ? (
        <div className={`w-[360px] max-w-[calc(100vw-1.5rem)] h-[540px] overflow-hidden rounded-3xl border shadow-2xl ${theme.shell}`}>
          <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: accentColor }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white font-bold">
                {title.trim().charAt(0).toUpperCase() || "J"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-white/80">{statusLabel}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
              aria-label="Close live chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className={`flex h-[calc(100%-56px)] flex-col ${theme.body}`}>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isLoading && messages.length === 0 ? (
                <div className={`rounded-2xl border p-4 text-sm ${theme.panel}`}>
                  Starting your chat session...
                </div>
              ) : messages.length === 0 ? (
                <div className={`rounded-2xl border p-4 ${theme.panel}`}>
                  <p className={`text-sm font-semibold ${theme.headerText}`}>{welcomeMessage}</p>
                  <p className={`mt-1 text-xs ${theme.muted}`}>Your messages will appear here once the conversation starts.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((message) => {
                    const isVisitorMessage = message.senderType === "VISITOR";

                    return (
                      <div key={message._id} className={`flex ${isVisitorMessage ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${isVisitorMessage ? theme.bubbleVisitor : theme.bubbleAgent} ${!isVisitorMessage ? "border" : ""}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
                          <p className={`mt-1 text-[10px] ${isVisitorMessage ? "text-white/75" : theme.muted}`}>
                            {isVisitorMessage ? "You" : "Support"}{formatTime(message.createdAt) ? ` · ${formatTime(message.createdAt)}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <div className={`border-t p-3 ${theme.composer}`}>
              {errorMessage ? (
                <div className={`mb-2 rounded-xl border px-3 py-2 text-xs ${theme.error}`}>
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex items-end gap-2">
                <div className={`flex-1 rounded-2xl border px-3 py-2 ${theme.input}`}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    placeholder={apiKey ? "Type your message..." : "Configure apiKey to chat..."}
                    disabled={!apiKey || isLoading || isSending}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void handleSendMessage();
                  }}
                  disabled={!apiKey || isLoading || isSending || !messageText.trim()}
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${theme.launcher}`}
                  aria-label="Send message"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) {
            setUnreadCount(0);
          }
        }}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95 ${theme.launcher}`}
        aria-label="Open live chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}

        {unreadCount > 0 && !isOpen ? (
          <span className="absolute -right-2 -top-2 flex min-w-[22px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[11px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
    </div>
  );
};

export default LiveChatWidget;
