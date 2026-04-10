import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircle, Paperclip, Send, X, CheckCheck, Settings, Zap, ChevronUp, ChevronDown, ArrowLeft, Moon, Volume2, Shield, AlertCircle } from "lucide-react";
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

type WidgetView = "chat" | "settings";
type TextSize = "small" | "default" | "large";

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
const WIDGET_TEXT_SIZE_KEY = "jaf_text_size";
const WIDGET_MESSAGE_SOUNDS_KEY = "jaf_message_sounds";
const QUICK_MESSAGES_KEY = "jaf_quick_messages";

const DEFAULT_TITLE = "Support";
const DEFAULT_WELCOME = "Hi there. Welcome to JAF Chatra. How can I help you today?";
const DEFAULT_ACCENT = "#0891b2";
const MESSAGE_PAGE_LIMIT = 100;
const PANEL_CLOSE_ANIMATION_MS = 320;

const isHexColor = (value: string) => /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value.trim());

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

const clearStoredValue = (key: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
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
    apiKey: initialConfig.apiKey || windowConfig.apiKey || "",
    title: initialConfig.title || readStoredValue(WIDGET_TITLE_KEY, windowConfig.title || DEFAULT_TITLE),
    welcomeMessage: initialConfig.welcomeMessage || readStoredValue(WIDGET_WELCOME_KEY, windowConfig.welcomeMessage || DEFAULT_WELCOME),
    accentColor: initialConfig.accentColor || windowConfig.accentColor || DEFAULT_ACCENT,
  };
};

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

const parseTextSizePreference = (value: string): TextSize => {
  if (value === "small" || value === "default" || value === "large") {
    return value;
  }

  return "default";
};

const LiveChatWidget = ({ initialConfig = {} }: LiveChatWidgetProps) => {
  const [widgetConfig, setWidgetConfig] = useState<LiveChatWidgetConfig>(() => getResolvedConfig(initialConfig));
  const [visitorToken] = useState(() => getVisitorToken());
  const [conversationId, setConversationId] = useState(() => readStoredValue(CONVERSATION_ID_KEY));
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
  const [unreadCount, setUnreadCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => readStoredValue(WIDGET_DARK_MODE_KEY) === "true");
  const [widgetView, setWidgetView] = useState<WidgetView>("chat");
  const [textSize, setTextSize] = useState<TextSize>(() => parseTextSizePreference(readStoredValue(WIDGET_TEXT_SIZE_KEY, "default")));
  const [isMessageSoundsEnabled, setIsMessageSoundsEnabled] = useState(() => readStoredValue(WIDGET_MESSAGE_SOUNDS_KEY, "true") !== "false");
  const [isEndChatModalOpen, setIsEndChatModalOpen] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(true);
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  const apiKey = String(widgetConfig.apiKey || "").trim();
  const hasApiKey = Boolean(apiKey);
  const title = widgetConfig.title || DEFAULT_TITLE;
  const welcomeMessage = widgetConfig.welcomeMessage || DEFAULT_WELCOME;
  const accentColor = widgetConfig.accentColor || DEFAULT_ACCENT;
  const resolvedAccent = isHexColor(accentColor) ? accentColor : DEFAULT_ACCENT;
  const hasRuntimeError = Boolean(errorMessage.trim());
  const isInvalidApiKeyError = /invalid\s+api\s+key/i.test(errorMessage);
  const isActionBlocked = !hasApiKey || hasRuntimeError || isLoading || isSending;
  const displayErrorMessage = hasApiKey
    ? errorMessage
    : "This widget is not configured correctly. Missing apiKey.";
  const displayErrorTitle = isInvalidApiKeyError
    ? "Invalid API key"
    : !hasApiKey
      ? "Configuration required"
      : "Live chat unavailable";
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

  const playIncomingMessageSound = useCallback(() => {
    if (!isMessageSoundsEnabled || typeof window === "undefined") {
      return;
    }

    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }

    try {
      const context = audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = context;

      if (context.state === "suspended") {
        void context.resume();
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const now = context.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, now);
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch {
      // Ignore browser audio restrictions or unsupported playback environments.
    }
  }, [isMessageSoundsEnabled]);

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
    if (!hasApiKey) {
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
  }, [hasApiKey, syncMessages, visitorToken, widgetConfig]);

  const handleSendMessage = useCallback(async (presetMessage?: string) => {
    const trimmedMessage = String(presetMessage ?? messageText).trim();

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
      if (!presetMessage) {
        setMessageText("");
        if (messageInputRef.current) {
          messageInputRef.current.style.height = "auto";
        }
      }

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

  const handleEndChat = useCallback(() => {
    disconnectSocket();
    setConversationId("");
    setMessages([]);
    setMessageText("");
    setUnreadCount(0);
    setErrorMessage("");
    clearStoredValue(CONVERSATION_ID_KEY);
  }, [disconnectSocket]);

  const messageSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-xs";
    }

    if (textSize === "large") {
      return "text-[16px]";
    }

    return "text-sm";
  }, [textSize]);

  const messageMetaSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[10px]";
    }

    if (textSize === "large") {
      return "text-xs";
    }

    return "text-[11px]";
  }, [textSize]);

  const helperTextSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-xs";
    }

    if (textSize === "large") {
      return "text-sm";
    }

    return "text-[13px]";
  }, [textSize]);

  useEffect(() => {
    const syncConfig = () => {
      setWidgetConfig(getResolvedConfig(initialConfig));
      setIsDarkMode(readStoredValue(WIDGET_DARK_MODE_KEY) === "true");
      setTextSize(parseTextSizePreference(readStoredValue(WIDGET_TEXT_SIZE_KEY, "default")));
      setIsMessageSoundsEnabled(readStoredValue(WIDGET_MESSAGE_SOUNDS_KEY, "true") !== "false");
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
    if (isOpen) {
      setShouldRenderPanel(true);
      const rafId = window.requestAnimationFrame(() => {
        setIsPanelVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }

    setIsPanelVisible(false);

    if (!shouldRenderPanel) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldRenderPanel(false);
    }, PANEL_CLOSE_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, shouldRenderPanel]);

  useEffect(() => {
    if (isOpen) {
      setWidgetView("chat");
      setIsEndChatModalOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setUnreadCount(0);

    if (!hasApiKey) {
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
  }, [conversationId, hasApiKey, isOpen, startConversation, syncMessages]);

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

          if (payload.event === "NEW_MESSAGE" && payload.data?.senderType !== "VISITOR") {
            playIncomingMessageSound();
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
  }, [apiKey, conversationId, disconnectSocket, isOpen, playIncomingMessageSound, syncMessages, visitorToken]);

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
      shell: "bg-slate-900/96 border-slate-500/90 text-slate-100 shadow-[0_34px_78px_-30px_rgba(2,6,23,1)] ring-2 ring-cyan-400/25 outline outline-1 outline-white/10 backdrop-blur-xl",
      header: "bg-[linear-gradient(135deg,#0b8aa8_0%,#0284c7_55%,#0e7490_100%)] border-b border-cyan-300/20 text-white shadow-sm",
      panel: "bg-slate-900 border-slate-700/90",
      body: "bg-slate-950/65",
      subText: "text-cyan-100/90 text-xs font-medium",
      muted: "text-slate-400 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg border border-cyan-500/70 shadow-sm",
      bubbleAgent: "bg-slate-800/95 text-slate-100 border border-slate-600 rounded-3xl rounded-tl-lg shadow-sm",
      composer: "bg-slate-900/95 border-t border-slate-700",
      input: "bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-2xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-700 disabled:cursor-not-allowed",
      buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600",
      quickBar: "bg-slate-900 border-y border-slate-700",
      quickMsg: "bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700 text-xs cursor-pointer shadow-sm",
      error: "bg-red-950/50 text-red-200 border border-red-900/50",
      welcomeTitle: "text-slate-100 text-sm font-semibold",
      headerAction: "bg-white/15 text-white border border-white/25 hover:bg-white/25",
      settingsSectionTitle: "text-slate-400 text-[11px] font-semibold tracking-wide",
      settingsDivider: "border-slate-700/80",
      settingsText: "text-slate-200 text-[13px]",
      settingsMuted: "text-slate-400 text-[11px]",
      settingsCard: "rounded-2xl border border-slate-700/70 bg-slate-900/45 px-4 py-3",
      settingsControlShell: "grid grid-cols-3 rounded-xl border p-1",
      settingsControlShellTone: "border-slate-700 bg-slate-800/80",
      settingsControlActive: "bg-cyan-600 text-white shadow",
      settingsControlIdle: "text-slate-300 hover:bg-slate-700",
      toggleOff: "bg-slate-600",
      toggleOn: "bg-cyan-600",
      modalBackdrop: "bg-slate-950/65",
      modalCard: "bg-slate-900 border border-slate-700 shadow-2xl",
      modalPrimary: "bg-red-500 hover:bg-red-600 text-white",
      modalSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
      poweredText: "text-slate-300",
      poweredBrand: "text-cyan-300",
    }
    : {
      shell: "bg-white/96 border-cyan-300 text-slate-900 shadow-[0_34px_74px_-30px_rgba(8,145,178,0.5)] ring-2 ring-cyan-100 outline outline-1 outline-cyan-200/90 backdrop-blur-xl",
      header: "bg-[linear-gradient(135deg,#0891b2_0%,#0ea5e9_58%,#0d9488_100%)] border-b border-cyan-200/80 text-white shadow-sm",
      panel: "bg-white border-slate-200 shadow-md",
      body: "bg-slate-100/70",
      subText: "text-slate-600 text-xs font-medium",
      muted: "text-slate-500 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg border border-cyan-500/80 shadow-sm",
      bubbleAgent: "bg-white text-slate-900 border border-slate-300 rounded-3xl rounded-tl-lg shadow-sm",
      composer: "bg-white border-t border-slate-200",
      input: "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-2xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-200 disabled:cursor-not-allowed",
      buttonSecondary: "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200",
      quickBar: "bg-white border-y border-slate-200",
      quickMsg: "bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100 text-xs cursor-pointer shadow-sm",
      error: "bg-red-50 text-red-700 border border-red-200",
      welcomeTitle: "text-slate-800 text-sm font-semibold",
      headerAction: "bg-white/90 text-cyan-700 border border-cyan-100 hover:bg-white",
      settingsSectionTitle: "text-slate-500 text-[11px] font-semibold tracking-wide",
      settingsDivider: "border-slate-200",
      settingsText: "text-slate-700 text-[13px]",
      settingsMuted: "text-slate-500 text-[11px]",
      settingsCard: "rounded-2xl border border-slate-200 bg-white/85 px-4 py-3",
      settingsControlShell: "grid grid-cols-3 rounded-xl border p-1",
      settingsControlShellTone: "border-slate-200 bg-slate-100/90",
      settingsControlActive: "bg-white text-slate-900 border border-slate-300 shadow-sm",
      settingsControlIdle: "text-slate-500 hover:bg-white",
      toggleOff: "bg-slate-300",
      toggleOn: "bg-cyan-600",
      modalBackdrop: "bg-slate-900/45",
      modalCard: "bg-white border border-slate-200 shadow-2xl",
      modalPrimary: "bg-red-500 hover:bg-red-600 text-white",
      modalSecondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
      poweredText: "text-slate-500",
      poweredBrand: "text-cyan-700",
    };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-[70] flex flex-col items-end gap-4" style={{ fontFamily: "Sora, Avenir Next, Segoe UI, sans-serif" }}>
      {shouldRenderPanel ? (
        <div
          className={`w-[min(390px,calc(100vw-1rem))] sm:w-[378px] h-[min(640px,calc(100vh-1rem))] sm:h-[588px] overflow-hidden rounded-[24px] border-2 flex flex-col origin-bottom-right transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${theme.shell}`}
          style={{
            opacity: isPanelVisible ? 1 : 0,
            transform: isPanelVisible ? "translateY(0) scale(1)" : "translateY(22px) scale(0.9)",
            filter: isPanelVisible ? "blur(0px)" : "blur(6px)",
          }}
        >
          <div className={`${theme.header} px-5 py-4 flex items-center justify-between gap-3 flex-shrink-0`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 rounded-full bg-white/20 border border-white/35 flex items-center justify-center text-white text-lg font-semibold">
                {title.trim().charAt(0).toUpperCase() || "J"}
              </div>
              <div className="min-w-0">
                <p className="text-[1.05rem] font-semibold leading-tight truncate">{title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${socketStatus === "connected" ? "bg-emerald-400 animate-pulse" : socketStatus === "connecting" ? "bg-yellow-300" : "bg-slate-300"}`} />
                  <p className={theme.subText}>{statusLabel}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEndChatModalOpen(true)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${theme.headerAction}`}
              >
                End chat
              </button>
              <button
                type="button"
                onClick={() => setWidgetView((current) => (current === "settings" ? "chat" : "settings"))}
                className="h-9 w-9 rounded-lg border border-white/30 bg-white/10 text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
                aria-label="Toggle quick replies"
              >
                <Settings className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-9 w-9 rounded-lg border border-white/30 bg-white/10 text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
                aria-label="Close live chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {widgetView === "settings" ? (
            <>
              <div className={`flex-1 overflow-y-auto px-5 py-5 ${theme.body}`}>
                <button
                  type="button"
                  onClick={() => setWidgetView("chat")}
                  className={`inline-flex items-center gap-2 text-[11px] font-semibold mb-4 transition-colors ${theme.settingsText}`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to chat</span>
                </button>

                <div className={theme.settingsCard}>
                  <p className={`${theme.settingsSectionTitle} mb-2`}>TEXT SIZE</p>
                  <div className={`${theme.settingsControlShell} ${theme.settingsControlShellTone}`}>
                    {(["small", "default", "large"] as TextSize[]).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setTextSize(size);
                          writeStoredValue(WIDGET_TEXT_SIZE_KEY, size);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${textSize === size ? theme.settingsControlActive : theme.settingsControlIdle}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`my-5 border-t ${theme.settingsDivider}`} />

                <div className={`flex items-center justify-between ${theme.settingsCard}`}>
                  <div className="flex items-center gap-2.5">
                    <Moon className={`h-4.5 w-4.5 ${theme.settingsMuted}`} />
                    <p className={theme.settingsText}>Dark Mode</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isDarkMode;
                      setIsDarkMode(next);
                      writeStoredValue(WIDGET_DARK_MODE_KEY, String(next));
                    }}
                    className={`relative h-7 w-14 rounded-full transition-colors ${isDarkMode ? theme.toggleOn : theme.toggleOff}`}
                    aria-label="Toggle dark mode"
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${isDarkMode ? "left-8" : "left-1"}`} />
                  </button>
                </div>

                <div className={`my-5 border-t ${theme.settingsDivider}`} />

                <div className={`flex items-center justify-between ${theme.settingsCard}`}>
                  <div className="flex items-center gap-2.5">
                    <Volume2 className={`h-4.5 w-4.5 ${theme.settingsMuted}`} />
                    <p className={theme.settingsText}>Message Sounds</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMessageSoundsEnabled((current) => {
                        const next = !current;
                        writeStoredValue(WIDGET_MESSAGE_SOUNDS_KEY, String(next));
                        return next;
                      });
                    }}
                    className={`relative h-7 w-14 rounded-full transition-colors ${isMessageSoundsEnabled ? theme.toggleOn : theme.toggleOff}`}
                    aria-label="Toggle message sounds"
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${isMessageSoundsEnabled ? "left-8" : "left-1"}`} />
                  </button>
                </div>

                <div className={`my-5 border-t ${theme.settingsDivider}`} />

                <div className={theme.settingsCard}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className={`h-4.5 w-4.5 ${theme.settingsMuted}`} />
                    <p className={`font-semibold tracking-wide ${theme.settingsText}`}>SESSION & PRIVACY</p>
                  </div>
                  <p className={`leading-relaxed ${theme.settingsMuted}`}>
                    We securely store your session so you do not lose your chat on reload. You can end and clear this session at any time.
                  </p>
                </div>
              </div>

              <div className={`border-t ${theme.composer} px-4 py-3.5 flex-shrink-0`}>
                <p className={`text-xs text-center font-medium ${theme.poweredText}`}>
                  Powered by <span className={`font-bold text-[0.65rem] ${theme.poweredBrand}`}>JAF Chatra</span>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Messages Area */}
              <div className={`flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col ${theme.body}`}>
                {isLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Starting your chat session...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className={`rounded-2xl border-2 p-5 text-center ${theme.panel}`}>
                    <div className="flex justify-center mb-3">
                      <div className="h-14 w-14 rounded-full bg-cyan-100/90 dark:bg-cyan-900/30 flex items-center justify-center ring-8 ring-cyan-50/60 dark:ring-cyan-900/30">
                        <MessageCircle className="h-7 w-7 text-cyan-600" />
                      </div>
                    </div>
                    <p className={`${theme.welcomeTitle} ${helperTextSizeClass}`}>{welcomeMessage}</p>
                    <p className={`mt-2 ${theme.muted} ${helperTextSizeClass}`}>We're here to help. Send a message to get started.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map((message) => {
                      const isVisitorMessage = message.senderType === "VISITOR";
                      return (
                        <div key={message._id} className={`flex ${isVisitorMessage ? "justify-end" : "justify-start"} items-end gap-2`}>
                          {!isVisitorMessage && (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold border border-cyan-400/40">
                              J
                            </div>
                          )}
                          <div className={`max-w-[80%] sm:max-w-[74%] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isVisitorMessage ? theme.bubbleVisitor : theme.bubbleAgent}`}>
                            <p className={`px-4 py-2.5 whitespace-pre-wrap leading-relaxed ${messageSizeClass}`}>{message.message}</p>
                            <div className={`px-4 pb-1 flex items-center gap-1 ${isVisitorMessage ? "text-white/70" : theme.muted}`}>
                              <p className={messageMetaSizeClass}>{formatTime(message.createdAt)}</p>
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
              {quickMessages.length > 0 && (
                <div className={`${theme.quickBar} px-4 sm:px-5 py-2.5 flex-shrink-0`}>
                  <button
                    type="button"
                    onClick={() => setShowQuickMessages((current) => !current)}
                    disabled={isActionBlocked}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-500 dark:text-slate-300 dark:hover:text-slate-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Quick Messages</span>
                    {showQuickMessages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {showQuickMessages ? (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {quickMessages.slice(0, 5).map((qm) => (
                        <button
                          key={qm._id}
                          type="button"
                          onClick={() => {
                            setMessageText(qm.response);
                            setShowQuickMessages(false);
                            void handleSendMessage(qm.response);
                          }}
                          disabled={isActionBlocked}
                          className={`px-3 py-1.5 rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-xs font-medium ${theme.quickMsg} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {qm.title}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Input Area */}
              <div className={`border-t ${theme.composer} px-4 sm:px-5 py-3.5 flex-shrink-0`}>
                {!hasApiKey || hasRuntimeError ? (
                  <div className={`mb-3 rounded-2xl border px-3.5 py-3 ${theme.error} flex items-start gap-2.5`}>
                    <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide">{displayErrorTitle}</p>
                      <p className="mt-1 text-xs leading-relaxed">{displayErrorMessage}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isActionBlocked}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 ${theme.buttonSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
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

                  <div className={`flex-1 rounded-2xl border-2 px-1 py-1 ${theme.input} flex items-end`}>
                    <textarea
                      ref={messageInputRef}
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      rows={1}
                      onInput={(event) => {
                        const target = event.currentTarget;
                        target.style.height = "auto";
                        target.style.height = `${Math.min(target.scrollHeight, 84)}px`;
                      }}
                      onKeyDown={(event) => {
                        if (isActionBlocked) {
                          return;
                        }

                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void handleSendMessage();
                        }
                      }}
                      placeholder={hasApiKey ? (hasRuntimeError ? "Resolve the error to continue chatting..." : "Type a message...") : "Widget apiKey is missing..."}
                      disabled={isActionBlocked}
                      className={`w-full bg-transparent ${messageSizeClass} outline-none px-3 py-2 disabled:opacity-50 resize-none overflow-y-auto leading-5 max-h-[84px] ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isActionBlocked) {
                        return;
                      }

                      void handleSendMessage();
                    }}
                    disabled={isActionBlocked || !messageText.trim()}
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-200 hover:-translate-y-0.5 ${theme.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{ backgroundColor: resolvedAccent }}
                    aria-label="Send message"
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>

                <p className={`text-xs mt-2.5 text-center font-medium ${theme.poweredText}`}>
                  Powered by <span className={`font-bold text-[0.65rem] ${theme.poweredBrand}`}>JAF Chatra</span>
                </p>
              </div>
            </>
          )}

          {isEndChatModalOpen ? (
            <div className={`absolute inset-0 z-40 backdrop-blur-[5px] ${theme.modalBackdrop} flex items-center justify-center p-4`}>
              <div className={`w-full max-w-[320px] rounded-3xl p-5 ${theme.modalCard}`}>
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </div>

                <h3 className="text-center text-xl font-semibold">End this conversation?</h3>
                <p className={`text-center mt-2 text-sm ${theme.settingsMuted}`}>
                  Your conversation history will be cleared.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEndChatModalOpen(false)}
                    className={`h-11 rounded-2xl text-base font-semibold transition-colors ${theme.modalSecondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleEndChat();
                      setIsEndChatModalOpen(false);
                      setWidgetView("chat");
                    }}
                    className={`h-11 rounded-2xl text-base font-semibold transition-colors ${theme.modalPrimary}`}
                  >
                    Yes, end chat
                  </button>
                </div>
              </div>
            </div>
          ) : null}
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
        className={`group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-white/30 text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95 ${theme.button}`}
        style={{
          background: `linear-gradient(140deg, ${resolvedAccent} 0%, #0ea5e9 85%)`,
          boxShadow: `0 16px 34px -16px ${resolvedAccent}`,
        }}
        aria-label="Open live chat"
      >
        {isOpen ? <X className="h-5 w-5 transition-transform duration-200" /> : <MessageCircle className="h-5 w-5 transition-transform duration-200 group-hover:rotate-6" />}

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
