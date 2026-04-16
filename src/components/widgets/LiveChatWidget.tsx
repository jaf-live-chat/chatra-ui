import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircle, Paperclip, Send, X, Menu, Zap, ChevronUp, ChevronDown, ArrowLeft, Moon, Volume2, Shield, AlertCircle, Save, Star, User, Mail, Phone } from "lucide-react";
import type { Socket } from "socket.io-client";
import type {
  LiveChatConversation,
  LiveChatConversationEndedEvent,
  LiveChatMessage,
  LiveChatQueuePositionChangedEvent,
  LiveChatWidgetConfig,
  LiveChatStartConversationResponse,
} from "../../models/LiveChatModel";
import liveChatWidgetServices from "../../services/liveChatWidgetServices";
import { createLiveChatSocket } from "../../services/liveChatRealtimeClient";

type SocketStatus = "idle" | "connecting" | "connected" | "closed" | "error" | "unsupported";

interface QuickMessage {
  _id: string;
  title: string;
  response: string;
}

type WidgetTranscriptMessage = LiveChatMessage & {
  localKind?: "quick-question" | "quick-typing" | "quick-response" | "queue-update" | "assignment-update" | "system-typing" | "system-welcome";
  quickReplyId?: string;
};

type WidgetView = "chat" | "settings";
type TextSize = "small" | "default" | "large";

type BrowserLocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

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
const WIDGET_LOGO_KEY = "jaf_widget_logo";
const WIDGET_ACCENT_COLOR_KEY = "jaf_widget_accent_color";
const WIDGET_DARK_MODE_KEY = "jaf_dark_mode";
const WIDGET_TEXT_SIZE_KEY = "jaf_text_size";
const WIDGET_MESSAGE_SOUNDS_KEY = "jaf_message_sounds";
const SYSTEM_AUTO_MESSAGES_KEY = "jaf_widget_system_auto_messages";
const WIDGET_FEEDBACK_CONVERSATION_KEY = "jaf_widget_feedback_conversation_id";

type LocationPermissionState = "unknown" | "granted" | "denied" | "unavailable";

const DEFAULT_TITLE = "Support";
const DEFAULT_WELCOME = "Hi there. Welcome to JAF Chatra. How can I help you today?";
const DEFAULT_ACCENT = "#0891b2";
const MESSAGE_PAGE_LIMIT = 100;
const PANEL_CLOSE_ANIMATION_MS = 320;
const TYPING_IDLE_TIMEOUT_MS = 1400;
const TYPING_INDICATOR_GRACE_MS = 2200;
const SYSTEM_AUTO_REPLY_TYPING_MS = 850;

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

const createVisitorToken = () => {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `visitor-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

const getVisitorToken = () => {
  const existingToken = readStoredValue(VISITOR_TOKEN_KEY);
  if (existingToken) {
    return existingToken;
  }

  const token = createVisitorToken();

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
    widgetLogo: initialConfig.widgetLogo || readStoredValue(WIDGET_LOGO_KEY, windowConfig.widgetLogo || ""),
    accentColor: initialConfig.accentColor || readStoredValue(WIDGET_ACCENT_COLOR_KEY, windowConfig.accentColor || DEFAULT_ACCENT),
    visitorName: initialConfig.visitorName || windowConfig.visitorName || "",
    visitorEmail: initialConfig.visitorEmail || windowConfig.visitorEmail || "",
    visitorPhoneNumber: initialConfig.visitorPhoneNumber || windowConfig.visitorPhoneNumber || "",
    ipAddressConsent: typeof initialConfig.ipAddressConsent === "boolean"
      ? initialConfig.ipAddressConsent
      : (typeof windowConfig.ipAddressConsent === "boolean" ? windowConfig.ipAddressConsent : undefined),
  };
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

const normalizeMessages = (messages: WidgetTranscriptMessage[]) => {
  return [...messages].sort((left, right) => {
    const leftTime = new Date(left.createdAt || left.updatedAt || 0).getTime();
    const rightTime = new Date(right.createdAt || right.updatedAt || 0).getTime();
    return leftTime - rightTime;
  });
};

const getNextOrderedTimestamp = (messages: WidgetTranscriptMessage[]) => {
  const latestMessageTime = messages.reduce((latest, message) => {
    const timestamp = new Date(message.createdAt || message.updatedAt || 0).getTime();
    if (!Number.isFinite(timestamp)) {
      return latest;
    }

    return Math.max(latest, timestamp);
  }, 0);

  return new Date(Math.max(Date.now(), latestMessageTime + 1)).toISOString();
};

const resolveConversationIdFromAssignedEvent = (payload: LiveChatStartConversationResponse) => {
  const directConversationId = String(payload.conversation?._id || "").trim();
  if (directConversationId) {
    return directConversationId;
  }

  const queuedConversation = payload.queueEntry?.conversationId;
  if (typeof queuedConversation === "string") {
    return queuedConversation;
  }

  if (queuedConversation && typeof queuedConversation === "object" && "_id" in queuedConversation) {
    return String(queuedConversation._id || "").trim();
  }

  return "";
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

const isConversationNotFoundError = (error: unknown) => {
  const statusCode = (error as { response?: { status?: number } })?.response?.status;
  const message = getErrorMessage(error).toLowerCase();

  return statusCode === 404 || message.includes("conversation not found");
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

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getWidgetInitials = (value: string) => {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "JC";
  }

  if (words.length === 1) {
    return words[0].slice(0, 1).toUpperCase();
  }

  return `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`.toUpperCase();
};

const LiveChatWidget = ({ initialConfig = {} }: LiveChatWidgetProps) => {
  const [widgetConfig, setWidgetConfig] = useState<LiveChatWidgetConfig>(() => getResolvedConfig(initialConfig));
  const [preChatFullName, setPreChatFullName] = useState("");
  const [preChatEmailAddress, setPreChatEmailAddress] = useState("");
  const [preChatPhoneNumber, setPreChatPhoneNumber] = useState("");
  const [hasCompletedPreChat, setHasCompletedPreChat] = useState(() => {
    const storedConversationId = readStoredValue(CONVERSATION_ID_KEY);
    if (storedConversationId) {
      return true;
    }

    return Boolean(readStoredValue(VISITOR_TOKEN_KEY));
  });
  const [visitorToken, setVisitorToken] = useState(() => getVisitorToken());
  const [conversationId, setConversationId] = useState(() => readStoredValue(CONVERSATION_ID_KEY));
  const [messages, setMessages] = useState<WidgetTranscriptMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("idle");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => readStoredValue(WIDGET_DARK_MODE_KEY) === "true");
  const [widgetView, setWidgetView] = useState<WidgetView>("chat");
  const [textSize, setTextSize] = useState<TextSize>(() => parseTextSizePreference(readStoredValue(WIDGET_TEXT_SIZE_KEY, "default")));
  const [isMessageSoundsEnabled, setIsMessageSoundsEnabled] = useState(() => readStoredValue(WIDGET_MESSAGE_SOUNDS_KEY, "true") !== "false");
  const [browserLocation, setBrowserLocation] = useState<BrowserLocationSnapshot | null>(null);
  const [browserLocationStatus, setBrowserLocationStatus] = useState<"idle" | "resolving" | "resolved" | "denied" | "unavailable" | "error">("idle");
  const [locationPermissionState, setLocationPermissionState] = useState<LocationPermissionState>("unknown");
  const [isEndChatModalOpen, setIsEndChatModalOpen] = useState(false);
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);
  const [isSessionEndPendingFeedback, setIsSessionEndPendingFeedback] = useState(false);
  const [isFeedbackPromptOpen, setIsFeedbackPromptOpen] = useState(false);
  const [feedbackConversationId, setFeedbackConversationId] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);
  const [activeQuickReplyId, setActiveQuickReplyId] = useState<string | null>(null);
  const [historyConversations, setHistoryConversations] = useState<LiveChatConversation[]>([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryConversationId, setSelectedHistoryConversationId] = useState("");
  const [historyMessages, setHistoryMessages] = useState<WidgetTranscriptMessage[]>([]);
  const [isHistoryTranscriptLoading, setIsHistoryTranscriptLoading] = useState(false);
  const [isReturningVisitor, setIsReturningVisitor] = useState(false);
  const [returningVisitorName, setReturningVisitorName] = useState("");
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileStatusMessage, setProfileStatusMessage] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const widgetSettingsRequestRef = useRef<Promise<void> | null>(null);
  const quickMessagesRequestRef = useRef<Promise<void> | null>(null);
  const historyRequestRef = useRef<Promise<void> | null>(null);
  const profileRequestRef = useRef<Promise<void> | null>(null);
  const quickReplyTimerRef = useRef<number | null>(null);
  const visitorTypingTimerRef = useRef<number | null>(null);
  const agentTypingTimerRef = useRef<number | null>(null);
  const latestQueuePositionRef = useRef<number | null>(null);
  const pendingQueuePositionRef = useRef<LiveChatQueuePositionChangedEvent | null>(null);
  const assignmentNoticeConversationIdRef = useRef<string>("");
  const messagesRef = useRef<WidgetTranscriptMessage[]>([]);
  const systemAutoReplyTimersRef = useRef<number[]>([]);
  const isVisitorTypingRef = useRef(false);
  const conversationBootstrapRef = useRef(false);

  const apiKey = String(widgetConfig.apiKey || "").trim();
  const hasApiKey = Boolean(apiKey);
  const title = widgetConfig.title || DEFAULT_TITLE;
  const welcomeMessage = widgetConfig.welcomeMessage || DEFAULT_WELCOME;
  const widgetLogo = widgetConfig.widgetLogo || "";
  const accentColor = widgetConfig.accentColor || DEFAULT_ACCENT;
  const resolvedAccent = isHexColor(accentColor) ? accentColor : DEFAULT_ACCENT;
  const accentHeaderBackground = `linear-gradient(135deg, ${resolvedAccent} 0%, color-mix(in srgb, ${resolvedAccent} 72%, black 28%) 100%)`;
  const accentSoftBackground = `color-mix(in srgb, ${resolvedAccent} 12%, white)`;
  const accentSoftBorder = `color-mix(in srgb, ${resolvedAccent} 24%, white)`;
  const accentShadow = `0 16px 34px -16px ${resolvedAccent}`;
  const hasRuntimeError = Boolean(errorMessage.trim());
  const isInvalidApiKeyError = /invalid\s+api\s+key/i.test(errorMessage);
  const isActionBlocked = !hasApiKey || hasRuntimeError || isLoading || isSending;
  const hasEndedConversation = useMemo(() => {
    if (conversationId) {
      return false;
    }

    return messages.some((entry) => {
      if (entry.senderType !== "SUPPORT_AGENT") {
        return false;
      }

      return String(entry.message || "").toLowerCase().includes("this chat has ended");
    });
  }, [conversationId, messages]);
  const isPreChatPending = !conversationId && !hasCompletedPreChat;
  const isComposerBlocked = isActionBlocked || isPreChatPending || hasEndedConversation;
  const hasConversationStarted = useMemo(() => {
    if (conversationId) {
      return true;
    }

    return messages.some((message) => !message.localKind);
  }, [conversationId, messages]);
  const isQuickReplyBlocked = !hasApiKey || hasRuntimeError || isLoading || isSending || hasEndedConversation || hasConversationStarted || Boolean(activeQuickReplyId);
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
        return "Online";
      default:
        return "Support";
    }
  }, [socketStatus]);
  const welcomeTitleMessage = isReturningVisitor
    ? `Welcome back${returningVisitorName ? `, ${returningVisitorName}` : ""}.`
    : welcomeMessage;
  const selectedHistoryConversation = useMemo(() => {
    if (!selectedHistoryConversationId) {
      return null;
    }

    return historyConversations.find((entry) => String(entry._id) === selectedHistoryConversationId) || null;
  }, [historyConversations, selectedHistoryConversationId]);
  const locationPermissionLabel = useMemo(() => {
    if (locationPermissionState === "granted") {
      return "Browser location permission is granted. Location can be attached to new sessions.";
    }

    if (locationPermissionState === "denied") {
      return "Browser location permission is denied. Enable it in browser settings to share location.";
    }

    if (locationPermissionState === "unavailable") {
      return "Location access is unavailable on this browser/device.";
    }

    return "Location permission has not been requested yet.";
  }, [locationPermissionState]);

  const visitorGreetingName = useMemo(() => {
    const fromPreChat = String(preChatFullName || "").trim();
    if (fromPreChat) {
      return fromPreChat;
    }

    const fromReturning = String(returningVisitorName || "").trim();
    if (fromReturning) {
      return fromReturning;
    }

    const fromConfig = String(widgetConfig.visitorName || "").trim();
    if (fromConfig) {
      return fromConfig;
    }

    return "there";
  }, [preChatFullName, returningVisitorName, widgetConfig.visitorName]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const clearQuickReplyTimer = useCallback(() => {
    if (quickReplyTimerRef.current !== null) {
      window.clearTimeout(quickReplyTimerRef.current);
      quickReplyTimerRef.current = null;
    }
  }, []);

  const clearVisitorTypingTimer = useCallback(() => {
    if (visitorTypingTimerRef.current !== null) {
      window.clearTimeout(visitorTypingTimerRef.current);
      visitorTypingTimerRef.current = null;
    }
  }, []);

  const clearAgentTypingTimer = useCallback(() => {
    if (agentTypingTimerRef.current !== null) {
      window.clearTimeout(agentTypingTimerRef.current);
      agentTypingTimerRef.current = null;
    }
  }, []);

  const clearSystemAutoReplyTimers = useCallback(() => {
    if (systemAutoReplyTimersRef.current.length === 0) {
      return;
    }

    systemAutoReplyTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    systemAutoReplyTimersRef.current = [];
  }, []);

  const readPersistedSystemMessages = useCallback((targetConversationId: string) => {
    if (typeof window === "undefined" || !targetConversationId) {
      return [] as WidgetTranscriptMessage[];
    }

    try {
      const rawValue = window.localStorage.getItem(SYSTEM_AUTO_MESSAGES_KEY);
      if (!rawValue) {
        return [] as WidgetTranscriptMessage[];
      }

      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) {
        return [] as WidgetTranscriptMessage[];
      }

      return parsed
        .filter((entry) => entry && typeof entry === "object")
        .filter((entry) => String(entry.conversationId || "") === targetConversationId)
        .map((entry): WidgetTranscriptMessage => ({
          _id: String(entry._id || ""),
          conversationId: String(entry.conversationId || ""),
          senderType: "SUPPORT_AGENT",
          senderId: "SYSTEM",
          message: String(entry.message || ""),
          status: "DELIVERED",
          createdAt: String(entry.createdAt || ""),
          localKind: entry.localKind === "assignment-update"
            ? "assignment-update"
            : "queue-update",
        }))
        .filter((entry) => Boolean(entry._id && entry.conversationId && entry.message));
    } catch {
      return [] as WidgetTranscriptMessage[];
    }
  }, []);

  const persistSystemMessage = useCallback((message: WidgetTranscriptMessage) => {
    if (typeof window === "undefined") {
      return;
    }

    if (message.localKind !== "queue-update" && message.localKind !== "assignment-update") {
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(SYSTEM_AUTO_MESSAGES_KEY);
      const parsed = rawValue ? JSON.parse(rawValue) : [];
      const safeEntries = Array.isArray(parsed) ? parsed.filter((entry) => entry && typeof entry === "object") : [];

      const nextEntries = [
        ...safeEntries.filter((entry) => String(entry._id || "") !== String(message._id)),
        {
          _id: String(message._id),
          conversationId: String(message.conversationId || ""),
          message: String(message.message || ""),
          createdAt: String(message.createdAt || new Date().toISOString()),
          localKind: message.localKind,
        },
      ];

      window.localStorage.setItem(SYSTEM_AUTO_MESSAGES_KEY, JSON.stringify(nextEntries));
    } catch {
      // Ignore storage errors in embedded contexts.
    }
  }, []);

  const clearPersistedSystemMessages = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(SYSTEM_AUTO_MESSAGES_KEY);
    } catch {
      // Ignore storage errors in embedded contexts.
    }
  }, []);

  const stopVisitorTyping = useCallback((notifyServer = true) => {
    clearVisitorTypingTimer();

    if (!isVisitorTypingRef.current) {
      return;
    }

    const activeConversationId = String(conversationId || "").trim();
    if (notifyServer && socketRef.current && activeConversationId) {
      socketRef.current.emit("STOP_TYPING", { conversationId: activeConversationId });
    }

    isVisitorTypingRef.current = false;
  }, [clearVisitorTypingTimer, conversationId]);

  const markVisitorTyping = useCallback(() => {
    const activeConversationId = String(conversationId || "").trim();
    if (!activeConversationId || !socketRef.current) {
      return;
    }

    if (!isVisitorTypingRef.current) {
      socketRef.current.emit("TYPING", { conversationId: activeConversationId });
      isVisitorTypingRef.current = true;
    }

    clearVisitorTypingTimer();
    visitorTypingTimerRef.current = window.setTimeout(() => {
      if (socketRef.current && String(conversationId || "").trim()) {
        socketRef.current.emit("STOP_TYPING", { conversationId: activeConversationId });
      }

      isVisitorTypingRef.current = false;
      visitorTypingTimerRef.current = null;
    }, TYPING_IDLE_TIMEOUT_MS);
  }, [clearVisitorTypingTimer, conversationId]);

  const handleComposerTextChange = useCallback((nextValue: string) => {
    setMessageText(nextValue);

    if (!String(conversationId || "").trim()) {
      return;
    }

    if (!nextValue.trim()) {
      stopVisitorTyping();
      return;
    }

    markVisitorTyping();
  }, [conversationId, markVisitorTyping, stopVisitorTyping]);

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

  const requestBrowserLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setBrowserLocation(null);
      setLocationPermissionState("unavailable");
      setBrowserLocationStatus("unavailable");
      return;
    }

    setBrowserLocationStatus("resolving");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBrowserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: typeof position.coords.accuracy === "number" ? position.coords.accuracy : null,
        });
        setLocationPermissionState("granted");
        setBrowserLocationStatus("resolved");
      },
      (error) => {
        setBrowserLocation(null);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionState("denied");
          setBrowserLocationStatus("denied");
          return;
        }

        setLocationPermissionState("unavailable");
        setBrowserLocationStatus("error");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, []);

  const syncMessages = useCallback(
    async (targetConversationId: string) => {
      if (!apiKey || !targetConversationId) {
        return;
      }

      const responsePromise = liveChatWidgetServices.getConversationMessages(
        widgetConfig,
        visitorToken,
        targetConversationId,
        { page: 1, limit: MESSAGE_PAGE_LIMIT },
      );

      try {
        const response = await responsePromise;
        const persistedSystemMessages = readPersistedSystemMessages(targetConversationId);
        const mergedMessages = [...response.messages, ...persistedSystemMessages];
        const dedupedMessages = mergedMessages.filter((message, index, source) => {
          return source.findIndex((entry) => String(entry._id) === String(message._id)) === index;
        });

        setMessages(normalizeMessages(dedupedMessages));
      } catch (error) {
        if (targetConversationId === conversationId && isConversationNotFoundError(error)) {
          setConversationId("");
          clearStoredValue(CONVERSATION_ID_KEY);
          setMessages([]);
          setErrorMessage("");
          return;
        }

        setErrorMessage(getErrorMessage(error));
      }
    },
    [apiKey, conversationId, readPersistedSystemMessages, visitorToken, widgetConfig],
  );

  const appendQueuePositionMessage = useCallback((
    payload: LiveChatQueuePositionChangedEvent | null | undefined,
    overrideConversationId?: string,
  ) => {
    const targetConversationId = String(overrideConversationId || conversationId || "").trim();
    const payloadConversationId = String(payload?.conversationId || "").trim();

    if (!targetConversationId || !payloadConversationId || payloadConversationId !== targetConversationId) {
      return;
    }

    const position = Number(payload?.position);
    if (!Number.isFinite(position) || position < 1) {
      return;
    }

    const hasVisitorInitiated = messagesRef.current.some((entry) => entry.senderType === "VISITOR");
    if (!hasVisitorInitiated && String(payload?.reason || "").toUpperCase() === "ENTERED_QUEUE") {
      pendingQueuePositionRef.current = {
        ...payload,
        conversationId: targetConversationId,
        position,
      };
      return;
    }

    if (latestQueuePositionRef.current === position) {
      return;
    }

    latestQueuePositionRef.current = position;

    const targetMessage = `Hi ${visitorGreetingName} kindly wait while you're in queue and you're in Queue ${position}`;
    const replyToken = `${targetConversationId}-${position}-${Date.now()}`;
    const typingId = `queue-update-typing-${replyToken}`;
    const messageId = `queue-update-${replyToken}`;

    setMessages((currentMessages) => {
      const typingMessage: WidgetTranscriptMessage = {
        _id: typingId,
        conversationId: targetConversationId,
        senderType: "SUPPORT_AGENT",
        senderId: "SYSTEM",
        message: "",
        status: "DELIVERED",
        createdAt: getNextOrderedTimestamp(currentMessages),
        localKind: "system-typing",
      };

      return normalizeMessages([...currentMessages, typingMessage]);
    });

    const timerId = window.setTimeout(() => {
      setMessages((currentMessages) => {
        const withoutTyping = currentMessages.filter((entry) => String(entry._id) !== typingId);

        const queueMessage: WidgetTranscriptMessage = {
          _id: messageId,
          conversationId: targetConversationId,
          senderType: "SUPPORT_AGENT",
          senderId: "SYSTEM",
          message: targetMessage,
          status: "DELIVERED",
          createdAt: getNextOrderedTimestamp(withoutTyping),
          localKind: "queue-update",
        };

        persistSystemMessage(queueMessage);

        return normalizeMessages([...withoutTyping, queueMessage]);
      });

      systemAutoReplyTimersRef.current = systemAutoReplyTimersRef.current.filter((activeTimerId) => activeTimerId !== timerId);
    }, SYSTEM_AUTO_REPLY_TYPING_MS);

    systemAutoReplyTimersRef.current.push(timerId);
  }, [conversationId, persistSystemMessage, visitorGreetingName]);

  const startConversation = useCallback(async (): Promise<string | null> => {
    if (!hasApiKey) {
      setErrorMessage("Configure an apiKey to start the live chat widget.");
      return null;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const sanitizedEmail = preChatEmailAddress.trim();
      if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        setErrorMessage("Please enter a valid email address or leave it blank.");
        return null;
      }

      const response: LiveChatStartConversationResponse = await liveChatWidgetServices.startConversation(
        widgetConfig,
        visitorToken,
        {
          fullName: preChatFullName.trim(),
          emailAddress: sanitizedEmail,
          phoneNumber: preChatPhoneNumber.trim(),
          ipAddressConsent: locationPermissionState === "granted" && Boolean(browserLocation),
          locationConsent: locationPermissionState === "granted" && Boolean(browserLocation),
          browserLatitude: locationPermissionState === "granted" ? browserLocation?.latitude : undefined,
          browserLongitude: locationPermissionState === "granted" ? browserLocation?.longitude : undefined,
        },
      );

      const nextConversationId = resolveConversationIdFromStart(response);

      if (!nextConversationId) {
        throw new Error("Conversation could not be created.");
      }

      setConversationId(nextConversationId);
      setHasCompletedPreChat(true);
      writeStoredValue(CONVERSATION_ID_KEY, nextConversationId);

      if (response.initialMessage) {
        setMessages(normalizeMessages([response.initialMessage]));
      } else {
        setMessages([]);
      }

      await syncMessages(nextConversationId);

      if (response.queueEntry?.status === "WAITING" && response.queuePosition) {
        pendingQueuePositionRef.current = {
          ...response.queuePosition,
          conversationId: nextConversationId,
        };
      }

      return nextConversationId;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [browserLocation, hasApiKey, locationPermissionState, preChatEmailAddress, preChatFullName, preChatPhoneNumber, syncMessages, visitorToken, widgetConfig]);

  const syncWidgetSettings = useCallback(async () => {
    if (!hasApiKey) {
      return;
    }

    if (widgetSettingsRequestRef.current) {
      return widgetSettingsRequestRef.current;
    }

    widgetSettingsRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getWidgetSettings({ apiKey }, visitorToken);
        const settings = response.widgetSettings;

        setWidgetConfig((currentConfig) => {
          const nextTitle = String(settings.widgetTitle || "").trim();
          const nextWelcomeMessage = String(settings.welcomeMessage || "").trim();
          const nextWidgetLogo = String(settings.widgetLogo || "").trim();
          const nextAccentColor = String(settings.accentColor || "").trim();
          const hasWidgetLogo = Object.prototype.hasOwnProperty.call(settings, "widgetLogo");
          const hasAccentColor = Object.prototype.hasOwnProperty.call(settings, "accentColor");

          if (nextTitle) {
            writeStoredValue(WIDGET_TITLE_KEY, nextTitle);
          }

          if (nextWelcomeMessage) {
            writeStoredValue(WIDGET_WELCOME_KEY, nextWelcomeMessage);
          }

          if (hasWidgetLogo) {
            if (nextWidgetLogo) {
              writeStoredValue(WIDGET_LOGO_KEY, nextWidgetLogo);
            } else {
              clearStoredValue(WIDGET_LOGO_KEY);
            }
          }

          if (hasAccentColor) {
            if (nextAccentColor) {
              writeStoredValue(WIDGET_ACCENT_COLOR_KEY, nextAccentColor);
            } else {
              clearStoredValue(WIDGET_ACCENT_COLOR_KEY);
            }
          }

          return {
            ...currentConfig,
            title: nextTitle || currentConfig.title,
            welcomeMessage: nextWelcomeMessage || currentConfig.welcomeMessage,
            widgetLogo: hasWidgetLogo ? nextWidgetLogo : currentConfig.widgetLogo,
            accentColor: nextAccentColor || currentConfig.accentColor,
          };
        });
      } catch {
        // Keep chat usable even when widget settings fail to load.
      } finally {
        widgetSettingsRequestRef.current = null;
      }
    })();

    return widgetSettingsRequestRef.current;
  }, [apiKey, hasApiKey, visitorToken]);

  const syncQuickMessages = useCallback(async () => {
    if (!hasApiKey) {
      setQuickMessages([]);
      return;
    }

    if (quickMessagesRequestRef.current) {
      return quickMessagesRequestRef.current;
    }

    quickMessagesRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getQuickMessages({ apiKey }, visitorToken, {
          page: 1,
          limit: 10,
        });

        setQuickMessages(response.quickMessages || []);
      } catch {
        // Keep chat usable even when quick messages fail to load.
        setQuickMessages([]);
      } finally {
        quickMessagesRequestRef.current = null;
      }
    })();

    return quickMessagesRequestRef.current;
  }, [apiKey, hasApiKey, visitorToken]);

  const syncConversationHistory = useCallback(async () => {
    if (!hasApiKey) {
      setHistoryConversations([]);
      setHistoryCount(0);
      setIsReturningVisitor(false);
      setReturningVisitorName("");
      return;
    }

    if (historyRequestRef.current) {
      return historyRequestRef.current;
    }

    setIsHistoryLoading(true);
    setHistoryError("");

    historyRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getConversationHistory({ apiKey }, visitorToken, {
          page: 1,
          limit: 20,
        });

        setHistoryConversations(response.conversations || []);
        setHistoryCount(response.historyCount || 0);
        setIsReturningVisitor(Boolean(response.isReturningVisitor));
        setReturningVisitorName(String(response.visitor?.name || response.visitor?.fullName || "").trim());
      } catch {
        setHistoryConversations([]);
        setHistoryCount(0);
        setHistoryError("Unable to load chat history.");
      } finally {
        setIsHistoryLoading(false);
        historyRequestRef.current = null;
      }
    })();

    return historyRequestRef.current;
  }, [apiKey, hasApiKey, visitorToken]);

  const syncVisitorProfile = useCallback(async () => {
    if (!hasApiKey) {
      return;
    }

    if (profileRequestRef.current) {
      return profileRequestRef.current;
    }

    profileRequestRef.current = (async () => {
      try {
        const response = await liveChatWidgetServices.getVisitorProfile({ apiKey }, visitorToken);
        const visitor = response.visitor;

        setPreChatFullName(String(visitor?.name || visitor?.fullName || ""));
        setPreChatEmailAddress(String(visitor?.emailAddress || ""));
        setPreChatPhoneNumber(String(visitor?.phoneNumber || ""));
      } catch {
        // Keep widget usable even if profile fetch fails.
      } finally {
        profileRequestRef.current = null;
      }
    })();

    return profileRequestRef.current;
  }, [apiKey, hasApiKey, visitorToken]);

  const handleSaveProfile = useCallback(async () => {
    if (!hasApiKey || isProfileSaving) {
      return;
    }

    const sanitizedEmail = preChatEmailAddress.trim();
    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      setProfileStatusMessage("Please enter a valid email address.");
      return;
    }

    setIsProfileSaving(true);
    setProfileStatusMessage("");

    try {
      const response = await liveChatWidgetServices.updateVisitorProfile(
        { apiKey },
        visitorToken,
        {
          fullName: preChatFullName,
          emailAddress: sanitizedEmail,
          phoneNumber: preChatPhoneNumber,
        },
      );

      const visitor = response.visitor;
      setPreChatFullName(String(visitor?.name || visitor?.fullName || ""));
      setPreChatEmailAddress(String(visitor?.emailAddress || ""));
      setPreChatPhoneNumber(String(visitor?.phoneNumber || ""));
      setProfileStatusMessage("Profile saved.");
      setErrorMessage("");
    } catch (error) {
      setProfileStatusMessage(getErrorMessage(error));
    } finally {
      setIsProfileSaving(false);
    }
  }, [apiKey, hasApiKey, isProfileSaving, preChatEmailAddress, preChatFullName, preChatPhoneNumber, visitorToken]);

  const loadHistoryTranscript = useCallback(async (targetConversationId: string) => {
    if (!hasApiKey || !targetConversationId) {
      return;
    }

    setSelectedHistoryConversationId(targetConversationId);
    setIsHistoryTranscriptLoading(true);

    try {
      const response = await liveChatWidgetServices.getConversationMessages(
        widgetConfig,
        visitorToken,
        targetConversationId,
        { page: 1, limit: MESSAGE_PAGE_LIMIT },
      );

      setHistoryMessages(normalizeMessages(response.messages));
      setHistoryError("");
    } catch {
      setHistoryMessages([]);
      setHistoryError("Unable to load transcript.");
    } finally {
      setIsHistoryTranscriptLoading(false);
    }
  }, [hasApiKey, visitorToken, widgetConfig]);

  const handleSendMessage = useCallback(async (presetMessage?: string) => {
    const trimmedMessage = String(presetMessage ?? messageText).trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    if (!conversationId && !hasCompletedPreChat) {
      setErrorMessage("Complete the optional pre-chat form step first.");
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

    stopVisitorTyping();
    setIsSending(true);
    setErrorMessage("");

    try {
      const optimisticMessage: WidgetTranscriptMessage = {
        _id: `local-${Date.now()}`,
        conversationId: resolvedConversationId,
        senderType: "VISITOR",
        senderId: visitorToken,
        message: trimmedMessage,
        status: "SENDING",
        createdAt: new Date().toISOString(),
      };

      setMessages((currentMessages) => {
        const nextMessages = [...currentMessages, optimisticMessage];
        const pendingQueuePosition = pendingQueuePositionRef.current;

        if (
          pendingQueuePosition
          && String(pendingQueuePosition.conversationId || "") === String(resolvedConversationId)
        ) {
          const pendingPosition = Number(pendingQueuePosition.position);
          if (Number.isFinite(pendingPosition) && pendingPosition >= 1 && latestQueuePositionRef.current !== pendingPosition) {
            void appendQueuePositionMessage({
              conversationId: resolvedConversationId,
              position: pendingPosition,
              reason: "POSITION_UPDATED",
            }, resolvedConversationId);
          }

          pendingQueuePositionRef.current = null;
        }

        return normalizeMessages(nextMessages);
      });
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
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      await syncMessages(resolvedConversationId);
    } finally {
      setIsSending(false);

      // Keep typing flow uninterrupted after each send.
      if (!presetMessage) {
        window.requestAnimationFrame(() => {
          const input = messageInputRef.current;
          if (!input) {
            return;
          }

          input.focus({ preventScroll: true });
          const cursorPosition = input.value.length;
          input.setSelectionRange(cursorPosition, cursorPosition);
        });
      }
    }
  }, [appendQueuePositionMessage, conversationId, hasCompletedPreChat, isSending, messageText, startConversation, stopVisitorTyping, syncMessages, visitorGreetingName, visitorToken, widgetConfig]);

  const handleQuickMessageClick = useCallback((quickMessage: QuickMessage) => {
    if (isQuickReplyBlocked) {
      return;
    }

    const questionText = String(quickMessage.title || "").trim();
    const responseText = String(quickMessage.response || "").trim();

    if (!questionText || !responseText) {
      return;
    }

    clearQuickReplyTimer();

    const quickReplyId = quickMessage._id;
    const now = Date.now();
    const typingCreatedAt = new Date(now + 1).toISOString();
    const questionMessage: WidgetTranscriptMessage = {
      _id: `quick-question-${quickReplyId}-${now}`,
      conversationId: quickReplyId,
      senderType: "VISITOR",
      senderId: `quick-${quickReplyId}`,
      message: questionText,
      status: "DELIVERED",
      createdAt: new Date(now).toISOString(),
      localKind: "quick-question",
      quickReplyId,
    };
    const typingMessage: WidgetTranscriptMessage = {
      _id: `quick-typing-${quickReplyId}-${now}`,
      conversationId: quickReplyId,
      senderType: "SUPPORT_AGENT",
      senderId: "SYSTEM",
      message: "",
      status: "DELIVERED",
      createdAt: typingCreatedAt,
      localKind: "quick-typing",
      quickReplyId,
    };

    setActiveQuickReplyId(quickReplyId);
    setShowQuickMessages(false);
    setMessages((currentMessages) => normalizeMessages([...currentMessages, questionMessage, typingMessage]));

    quickReplyTimerRef.current = window.setTimeout(() => {
      const responseMessage: WidgetTranscriptMessage = {
        _id: `quick-response-${quickReplyId}-${Date.now()}`,
        conversationId: quickReplyId,
        senderType: "SUPPORT_AGENT",
        senderId: "SYSTEM",
        message: responseText,
        status: "DELIVERED",
        createdAt: new Date().toISOString(),
        localKind: "quick-response",
        quickReplyId,
      };

      setMessages((currentMessages) => {
        const nextMessages = currentMessages.filter((message) => message.localKind !== "quick-typing" || message.quickReplyId !== quickReplyId);
        return normalizeMessages([...nextMessages, responseMessage]);
      });

      setActiveQuickReplyId(null);
      quickReplyTimerRef.current = null;
    }, 1100);
  }, [clearQuickReplyTimer, isQuickReplyBlocked]);

  const appendCustomerFriendlyWelcomeMessage = useCallback(() => {
    const automatedWelcomeMessage = `Hi ${visitorGreetingName}! Welcome to ${title}. We're happy to help. Tell us what you need, and we'll support you as quickly as possible.`;
    const targetConversationId = String(conversationId || "pre-chat");
    const replyToken = `${targetConversationId}-${Date.now()}`;
    const typingId = `welcome-typing-${replyToken}`;
    const messageId = `system-welcome-${replyToken}`;

    setMessages((currentMessages) => {
      const hasExistingWelcome = currentMessages.some((entry) => entry.localKind === "system-welcome");
      if (hasExistingWelcome) {
        return currentMessages;
      }

      const typingMessage: WidgetTranscriptMessage = {
        _id: typingId,
        conversationId: targetConversationId,
        senderType: "SUPPORT_AGENT",
        senderId: "SYSTEM",
        message: "",
        status: "DELIVERED",
        createdAt: getNextOrderedTimestamp(currentMessages),
        localKind: "system-typing",
      };

      return normalizeMessages([...currentMessages, typingMessage]);
    });

    const timerId = window.setTimeout(() => {
      setMessages((currentMessages) => {
        const withoutTyping = currentMessages.filter((entry) => String(entry._id) !== typingId);
        const hasExistingWelcome = withoutTyping.some((entry) => entry.localKind === "system-welcome");

        if (hasExistingWelcome) {
          return withoutTyping;
        }

        const welcomeMessageEntry: WidgetTranscriptMessage = {
          _id: messageId,
          conversationId: targetConversationId,
          senderType: "SUPPORT_AGENT",
          senderId: "SYSTEM",
          message: automatedWelcomeMessage,
          status: "DELIVERED",
          createdAt: getNextOrderedTimestamp(withoutTyping),
          localKind: "system-welcome",
        };

        return normalizeMessages([...withoutTyping, welcomeMessageEntry]);
      });

      systemAutoReplyTimersRef.current = systemAutoReplyTimersRef.current.filter((activeTimerId) => activeTimerId !== timerId);
    }, SYSTEM_AUTO_REPLY_TYPING_MS);

    systemAutoReplyTimersRef.current.push(timerId);
  }, [conversationId, title, visitorGreetingName]);

  const handleCompletePreChat = useCallback(() => {
    setHasCompletedPreChat(true);
    setErrorMessage("");
    appendCustomerFriendlyWelcomeMessage();
  }, [appendCustomerFriendlyWelcomeMessage]);

  const openPostChatFeedbackPrompt = useCallback((endedConversationId?: string) => {
    const targetConversationId = String(endedConversationId || conversationId || "").trim();

    if (!targetConversationId || readStoredValue(WIDGET_FEEDBACK_CONVERSATION_KEY) === targetConversationId) {
      return;
    }

    setFeedbackConversationId(targetConversationId);
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackMessage("");
    setIsFeedbackSubmitting(false);
    setIsFeedbackPromptOpen(true);
  }, [conversationId]);

  const resetConversationState = useCallback(() => {
    clearSystemAutoReplyTimers();
    clearQuickReplyTimer();
    stopVisitorTyping(false);
    clearAgentTypingTimer();
    disconnectSocket();
    setConversationId("");
    setMessages([]);
    setMessageText("");
    setUnreadCount(0);
    setErrorMessage("");
    setHasCompletedPreChat(true);
    setActiveQuickReplyId(null);
    setShowQuickMessages(false);
    setSelectedHistoryConversationId("");
    setHistoryMessages([]);
    setIsAgentTyping(false);
    latestQueuePositionRef.current = null;
    pendingQueuePositionRef.current = null;
    assignmentNoticeConversationIdRef.current = "";
    clearStoredValue(CONVERSATION_ID_KEY);
  }, [clearAgentTypingTimer, clearQuickReplyTimer, clearSystemAutoReplyTimers, disconnectSocket, stopVisitorTyping]);

  const handleEndChat = useCallback(async () => {
    if (conversationId) {
      try {
        const response = await liveChatWidgetServices.endConversation(widgetConfig, visitorToken, conversationId);
        openPostChatFeedbackPrompt(response.conversation?._id || conversationId);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      }
    }

    resetConversationState();
    void syncConversationHistory();
  }, [conversationId, openPostChatFeedbackPrompt, resetConversationState, syncConversationHistory, visitorToken, widgetConfig]);

  const handleGoBackToStart = useCallback(() => {
    resetConversationState();
    setWidgetView("chat");
    appendCustomerFriendlyWelcomeMessage();
  }, [appendCustomerFriendlyWelcomeMessage, resetConversationState]);

  const finalizeEndSession = useCallback(() => {
    clearSystemAutoReplyTimers();
    clearQuickReplyTimer();
    stopVisitorTyping(false);
    clearAgentTypingTimer();
    disconnectSocket();
    clearStoredValue(CONVERSATION_ID_KEY);
    clearStoredValue(VISITOR_TOKEN_KEY);

    const nextVisitorToken = createVisitorToken();
    writeStoredValue(VISITOR_TOKEN_KEY, nextVisitorToken);
    setVisitorToken(nextVisitorToken);

    setConversationId("");
    setMessages([]);
    setMessageText("");
    setUnreadCount(0);
    setErrorMessage("");
    setHasCompletedPreChat(false);
    setActiveQuickReplyId(null);
    setShowQuickMessages(false);
    setPreChatFullName("");
    setPreChatEmailAddress("");
    setPreChatPhoneNumber("");
    setBrowserLocation(null);
    setBrowserLocationStatus("idle");
    setLocationPermissionState("unknown");
    setHistoryConversations([]);
    setHistoryCount(0);
    setHistoryMessages([]);
    setSelectedHistoryConversationId("");
    setIsReturningVisitor(false);
    setReturningVisitorName("");
    setWidgetView("chat");
    setProfileStatusMessage("Session ended. You are logged out.");
    setIsEndChatModalOpen(false);
    setIsEndSessionModalOpen(false);
    setIsSessionEndPendingFeedback(false);
    setIsFeedbackPromptOpen(false);
    setFeedbackConversationId("");
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackMessage("");
    setIsFeedbackSubmitting(false);
    setIsAgentTyping(false);
    latestQueuePositionRef.current = null;
    pendingQueuePositionRef.current = null;
    assignmentNoticeConversationIdRef.current = "";
  }, [clearAgentTypingTimer, clearQuickReplyTimer, clearSystemAutoReplyTimers, disconnectSocket, stopVisitorTyping]);

  const handleEndSession = useCallback(async () => {
    setIsEndSessionModalOpen(false);

    const activeConversationId = String(conversationId || "").trim();
    if (activeConversationId) {
      try {
        await liveChatWidgetServices.endConversation(widgetConfig, visitorToken, activeConversationId);
      } catch {
        // Continue session-end flow even if ending the active chat fails.
      }

      const hasFeedbackAlreadyHandled = readStoredValue(WIDGET_FEEDBACK_CONVERSATION_KEY) === activeConversationId;
      if (!hasFeedbackAlreadyHandled) {
        setIsSessionEndPendingFeedback(true);
        openPostChatFeedbackPrompt(activeConversationId);
        return;
      }
    }

    finalizeEndSession();
  }, [conversationId, finalizeEndSession, openPostChatFeedbackPrompt, visitorToken, widgetConfig]);

  const appendEndedMessage = useCallback((payload: LiveChatConversationEndedEvent) => {
    const endedBy = payload.endedBy?.displayName ? ` Ended by ${payload.endedBy.displayName}.` : "";
    const endedTimestamp = payload.endedBy?.endedAt || payload.conversation?.closedAt || new Date().toISOString();
    const endedMessage: WidgetTranscriptMessage = {
      _id: `ended-${String(payload.conversation?._id || conversationId || Date.now())}`,
      conversationId: String(payload.conversation?._id || conversationId || ""),
      senderType: "SUPPORT_AGENT",
      senderId: String(payload.endedBy?.id || "SYSTEM"),
      message: `This chat has ended.${endedBy}`,
      status: "DELIVERED",
      createdAt: endedTimestamp,
    };

    setMessages((currentMessages) => {
      if (currentMessages.some((entry) => String(entry._id) === endedMessage._id)) {
        return currentMessages;
      }

      return normalizeMessages([...currentMessages, endedMessage]);
    });
  }, [conversationId]);

  const closePostChatFeedbackPrompt = useCallback((markComplete = false) => {
    if (markComplete && feedbackConversationId) {
      writeStoredValue(WIDGET_FEEDBACK_CONVERSATION_KEY, feedbackConversationId);
    }

    setIsFeedbackPromptOpen(false);
    setFeedbackConversationId("");
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackMessage("");
    setIsFeedbackSubmitting(false);

    if (isSessionEndPendingFeedback) {
      finalizeEndSession();
    }
  }, [feedbackConversationId, finalizeEndSession, isSessionEndPendingFeedback]);

  const submitPostChatFeedback = useCallback(async () => {
    const targetConversationId = String(feedbackConversationId || "").trim();

    if (!targetConversationId || feedbackRating < 1 || feedbackRating > 5 || isFeedbackSubmitting) {
      return;
    }

    setIsFeedbackSubmitting(true);
    setFeedbackMessage("");

    try {
      await liveChatWidgetServices.submitConversationFeedback(widgetConfig, visitorToken, targetConversationId, {
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      });

      closePostChatFeedbackPrompt(true);
    } catch (error) {
      setFeedbackMessage(getErrorMessage(error));
    } finally {
      setIsFeedbackSubmitting(false);
    }
  }, [closePostChatFeedbackPrompt, feedbackComment, feedbackConversationId, feedbackRating, isFeedbackSubmitting, visitorToken, widgetConfig]);

  const messageSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[12px] leading-5";
    }

    if (textSize === "large") {
      return "text-[16px] leading-7";
    }

    return "text-[13px] leading-6";
  }, [textSize]);

  const messageMetaSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[10px] leading-4";
    }

    if (textSize === "large") {
      return "text-[11px] leading-4";
    }

    return "text-[11px] leading-4";
  }, [textSize]);

  const composerTextClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[12px] leading-5";
    }

    if (textSize === "large") {
      return "text-[15px] leading-6";
    }

    return "text-[13px] leading-6";
  }, [textSize]);

  const bubblePaddingClass = useMemo(() => {
    if (textSize === "small") {
      return "px-[14px] py-[9px]";
    }

    if (textSize === "large") {
      return "px-[18px] py-[12px]";
    }

    return "px-4 py-2.5";
  }, [textSize]);

  const avatarSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "h-9 w-9 text-[11px]";
    }

    if (textSize === "large") {
      return "h-11 w-11 text-sm";
    }

    return "h-[38px] w-[38px] text-[12px]";
  }, [textSize]);

  const quickMessageTextClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[11px]";
    }

    if (textSize === "large") {
      return "text-[14px]";
    }

    return "text-xs";
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

  const panelSpacingClass = useMemo(() => {
    if (textSize === "small") {
      return "gap-3";
    }

    if (textSize === "large") {
      return "gap-5";
    }

    return "gap-4";
  }, [textSize]);

  const headerTitleClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[0.96rem]";
    }

    if (textSize === "large") {
      return "text-[1.15rem]";
    }

    return "text-[1.05rem]";
  }, [textSize]);

  const headerStatusClass = useMemo(() => {
    if (textSize === "small") {
      return "text-[10px] tracking-wide";
    }

    if (textSize === "large") {
      return "text-[11px] tracking-wide";
    }

    return "text-[11px] tracking-wide";
  }, [textSize]);

  const headerButtonClass = useMemo(() => {
    if (textSize === "small") {
      return "px-2.5 py-1 text-xs";
    }

    if (textSize === "large") {
      return "px-4 py-2 text-sm";
    }

    return "px-3 py-1.5 text-sm";
  }, [textSize]);

  const composerGapClass = useMemo(() => {
    if (textSize === "small") {
      return "gap-1.5";
    }

    if (textSize === "large") {
      return "gap-3";
    }

    return "gap-2";
  }, [textSize]);

  const composerButtonSizeClass = useMemo(() => {
    if (textSize === "small") {
      return "h-10 w-10";
    }

    if (textSize === "large") {
      return "h-12 w-12";
    }

    return "h-11 w-11";
  }, [textSize]);

  const inputPaddingClass = useMemo(() => {
    if (textSize === "small") {
      return "px-2 py-1.5";
    }

    if (textSize === "large") {
      return "px-4 py-2.5";
    }

    return "px-3 py-2";
  }, [textSize]);

  useEffect(() => {
    const syncConfig = () => {
      const resolvedConfig = getResolvedConfig(initialConfig);
      setWidgetConfig(resolvedConfig);
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
    if (!isOpen || locationPermissionState !== "unknown") {
      return;
    }

    if (browserLocationStatus === "resolving") {
      return;
    }

    requestBrowserLocation();
  }, [browserLocationStatus, isOpen, locationPermissionState, requestBrowserLocation]);

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
      setIsEndSessionModalOpen(false);
      setShowQuickMessages(false);
      setProfileStatusMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || widgetView !== "settings") {
      return;
    }

    void syncConversationHistory();
    void syncVisitorProfile();
  }, [isOpen, syncConversationHistory, syncVisitorProfile, widgetView]);

  useEffect(() => {
    if (!isOpen) {
      conversationBootstrapRef.current = false;
      return;
    }

    if (conversationBootstrapRef.current) {
      return;
    }

    conversationBootstrapRef.current = true;
    setUnreadCount(0);

    if (!hasApiKey) {
      setErrorMessage("Configure an apiKey to start the live chat widget.");
      return;
    }

    void syncWidgetSettings();
    void syncQuickMessages();
    void syncConversationHistory();
    void syncVisitorProfile();

    if (!conversationId) {
      return;
    }

    void syncMessages(conversationId);
  }, [conversationId, hasApiKey, isOpen, syncConversationHistory, syncMessages, syncQuickMessages, syncVisitorProfile, syncWidgetSettings]);

  useEffect(() => {
    // If returning visitor, skip pre-chat form and go straight to chat
    if (isReturningVisitor && !conversationId) {
      setHasCompletedPreChat(true);
      appendCustomerFriendlyWelcomeMessage();
    }
    // If new visitor (not returning), ensure pre-chat form is shown
    else if (!isReturningVisitor && historyCount === 0 && isOpen && !conversationId) {
      setHasCompletedPreChat(false);
    }
  }, [isReturningVisitor, historyCount, isOpen, conversationId, appendCustomerFriendlyWelcomeMessage]);

  useEffect(() => {
    if (!apiKey || !conversationId) {
      stopVisitorTyping(false);
      clearAgentTypingTimer();
      setIsAgentTyping(false);
      disconnectSocket();
      setSocketStatus(apiKey ? "closed" : "idle");
      return;
    }

    const socket = createLiveChatSocket({
      apiKey,
      visitorToken,
      conversationId,
      role: "VISITOR",
    });

    if (!socket) {
      setSocketStatus("unsupported");
      return;
    }

    disconnectSocket();
    socketRef.current = socket;
    setSocketStatus("connecting");

    socket.on("connect", () => {
      setSocketStatus("connected");
      clearPersistedSystemMessages();
    });

    socket.on("disconnect", () => {
      setSocketStatus("closed");
      setIsAgentTyping(false);
      clearAgentTypingTimer();
    });

    socket.on("connect_error", () => {
      setSocketStatus("error");
      setIsAgentTyping(false);
      clearAgentTypingTimer();
    });

    socket.on("TYPING", (payload: { conversationId?: string; senderRole?: string }) => {
      const targetConversationId = String(payload?.conversationId || "");
      if (!targetConversationId || targetConversationId !== String(conversationId)) {
        return;
      }

      if (payload?.senderRole === "VISITOR") {
        return;
      }

      setIsAgentTyping(true);
      clearAgentTypingTimer();
      agentTypingTimerRef.current = window.setTimeout(() => {
        setIsAgentTyping(false);
        agentTypingTimerRef.current = null;
      }, TYPING_INDICATOR_GRACE_MS);
    });

    socket.on("STOP_TYPING", (payload: { conversationId?: string; senderRole?: string }) => {
      const targetConversationId = String(payload?.conversationId || "");
      if (!targetConversationId || targetConversationId !== String(conversationId)) {
        return;
      }

      if (payload?.senderRole === "VISITOR") {
        return;
      }

      setIsAgentTyping(false);
      clearAgentTypingTimer();
    });

    socket.on("NEW_MESSAGE", (incomingMessage: LiveChatMessage) => {
      if (!incomingMessage || String(incomingMessage.conversationId || "") !== String(conversationId)) {
        return;
      }

      setMessages((currentMessages) => {
        const nextMessages = [...currentMessages];
        const incomingId = String(incomingMessage._id || "");
        const byIdIndex = incomingId ? nextMessages.findIndex((message) => String(message._id) === incomingId) : -1;

        if (byIdIndex >= 0) {
          nextMessages[byIdIndex] = {
            ...nextMessages[byIdIndex],
            ...incomingMessage,
          };
          return normalizeMessages(nextMessages);
        }

        if (incomingMessage.senderType === "VISITOR") {
          const localMessageIndex = nextMessages.findIndex(
            (message) => String(message._id).startsWith("local-")
              && message.senderType === "VISITOR"
              && message.message === incomingMessage.message,
          );

          if (localMessageIndex >= 0) {
            const localMessage = nextMessages[localMessageIndex];
            nextMessages[localMessageIndex] = {
              ...localMessage,
              ...incomingMessage,
              // Keep optimistic client timestamp so ordering does not jump on server ack.
              createdAt: localMessage.createdAt || incomingMessage.createdAt,
            };
            return normalizeMessages(nextMessages);
          }
        }

        nextMessages.push(incomingMessage);
        return normalizeMessages(nextMessages);
      });

      if (incomingMessage.senderType !== "VISITOR") {
        setIsAgentTyping(false);
        clearAgentTypingTimer();
        playIncomingMessageSound();

        if (!isOpen) {
          setUnreadCount((currentCount) => currentCount + 1);
        }
      }
    });

    socket.on("MESSAGE_STATUS_UPDATED", (payload: { messageIds?: string[]; status?: "DELIVERED" | "SEEN" }) => {
      if (!Array.isArray(payload?.messageIds) || !payload.status) {
        return;
      }

      const messageIds = new Set(payload.messageIds.map((id) => String(id)));
      setMessages((currentMessages) => currentMessages.map((message) => {
        if (!messageIds.has(String(message._id))) {
          return message;
        }

        return {
          ...message,
          status: payload.status,
        };
      }));
    });

    socket.on("QUEUE_POSITION_CHANGED", (payload: LiveChatQueuePositionChangedEvent) => {
      appendQueuePositionMessage(payload);
    });

    socket.on("CONVERSATION_ASSIGNED", (payload: LiveChatStartConversationResponse) => {
      const assignedConversationId = resolveConversationIdFromAssignedEvent(payload);
      const activeConversationId = String(conversationId || "").trim();

      if (!assignedConversationId || !activeConversationId || assignedConversationId !== activeConversationId) {
        return;
      }

      if (assignmentNoticeConversationIdRef.current === assignedConversationId) {
        return;
      }

      assignmentNoticeConversationIdRef.current = assignedConversationId;
      latestQueuePositionRef.current = null;
      pendingQueuePositionRef.current = null;

      const assignedAgentName = String(payload.agent?.fullName || payload.agent?.displayName || "").trim();
      const assignmentMessage = assignedAgentName
        ? `Hi ${visitorGreetingName} you are now connected with ${assignedAgentName}.`
        : `Hi ${visitorGreetingName} you are now connected with an agent.`;

      const replyToken = `${assignedConversationId}-${Date.now()}`;
      const typingId = `assignment-update-typing-${replyToken}`;
      const messageId = `assignment-update-${replyToken}`;

      setMessages((currentMessages) => {
        const typingMessage: WidgetTranscriptMessage = {
          _id: typingId,
          conversationId: assignedConversationId,
          senderType: "SUPPORT_AGENT",
          senderId: "SYSTEM",
          message: "",
          status: "DELIVERED",
          createdAt: getNextOrderedTimestamp(currentMessages),
          localKind: "system-typing",
        };

        return normalizeMessages([...currentMessages, typingMessage]);
      });

      const timerId = window.setTimeout(() => {
        setMessages((currentMessages) => {
          const withoutTyping = currentMessages.filter((entry) => String(entry._id) !== typingId);

          const assignedMessage: WidgetTranscriptMessage = {
            _id: messageId,
            conversationId: assignedConversationId,
            senderType: "SUPPORT_AGENT",
            senderId: "SYSTEM",
            message: assignmentMessage,
            status: "DELIVERED",
            createdAt: getNextOrderedTimestamp(withoutTyping),
            localKind: "assignment-update",
          };

          persistSystemMessage(assignedMessage);

          return normalizeMessages([...withoutTyping, assignedMessage]);
        });

        systemAutoReplyTimersRef.current = systemAutoReplyTimersRef.current.filter((activeTimerId) => activeTimerId !== timerId);
      }, SYSTEM_AUTO_REPLY_TYPING_MS);

      systemAutoReplyTimersRef.current.push(timerId);
    });

    socket.on("CONVERSATION_ENDED", (payload: LiveChatConversationEndedEvent) => {
      appendEndedMessage(payload);
      stopVisitorTyping(false);
      setIsAgentTyping(false);
      clearAgentTypingTimer();
      openPostChatFeedbackPrompt(payload.conversation?._id || conversationId || "");
      setConversationId("");
      setHasCompletedPreChat(true);
      clearStoredValue(CONVERSATION_ID_KEY);
      setSocketStatus("closed");
      void syncConversationHistory();
    });

    return () => {
      stopVisitorTyping();
      setIsAgentTyping(false);
      clearAgentTypingTimer();
      disconnectSocket();
    };
  }, [apiKey, appendEndedMessage, appendQueuePositionMessage, clearAgentTypingTimer, clearPersistedSystemMessages, conversationId, disconnectSocket, isOpen, openPostChatFeedbackPrompt, persistSystemMessage, playIncomingMessageSound, stopVisitorTyping, syncConversationHistory, visitorGreetingName, visitorToken]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      clearSystemAutoReplyTimers();
      latestQueuePositionRef.current = null;
      pendingQueuePositionRef.current = null;
      assignmentNoticeConversationIdRef.current = "";
    }
  }, [clearSystemAutoReplyTimers, conversationId]);

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
      setHasCompletedPreChat(true);
    }
  }, [conversationId, visitorToken]);

  useEffect(() => {
    return () => {
      clearSystemAutoReplyTimers();
      clearQuickReplyTimer();
      clearVisitorTypingTimer();
      clearAgentTypingTimer();
    };
  }, [clearAgentTypingTimer, clearQuickReplyTimer, clearSystemAutoReplyTimers, clearVisitorTypingTimer]);

  const getVisitorMessageStatus = useCallback((message: WidgetTranscriptMessage) => {
    if (String(message._id || "").startsWith("local-")) {
      return {
        label: "Sending",
        toneClass: "text-white/70",
      };
    }

    if (message.status === "SEEN") {
      return {
        label: "Seen",
        toneClass: "text-cyan-100",
      };
    }

    return {
      label: "Delivered",
      toneClass: "text-white/80",
    };
  }, []);

  const latestVisitorMessageId = useMemo(() => {
    const latestMessage = [...messages].reverse().find((message) => message.senderType === "VISITOR" && !message.localKind);
    return latestMessage ? String(latestMessage._id) : null;
  }, [messages]);

  const theme = isDarkMode
    ? {
      shell: "bg-slate-950 border-slate-300/55 text-slate-100 shadow-[0_34px_72px_-28px_rgba(2,6,23,0.9)] ring-2 ring-slate-800/65 outline outline-1 outline-slate-200/20 backdrop-blur-xl",
      header: "bg-slate-900 border-b border-slate-700 text-slate-100 shadow-sm",
      panel: "bg-slate-900/85 border-slate-500/70 shadow-[0_18px_36px_-26px_rgba(2,6,23,0.75)]",
      body: "bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.16),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.8)_100%)]",
      subText: "text-cyan-100/90 text-xs font-medium",
      muted: "text-slate-400 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg border border-cyan-500/70 shadow-[0_18px_32px_-22px_rgba(8,145,178,0.95)]",
      bubbleAgent: "bg-slate-800/95 text-slate-100 border border-slate-600/80 rounded-3xl rounded-tl-lg shadow-[0_18px_30px_-24px_rgba(15,23,42,0.95)]",
      composer: "bg-slate-900/96 border-t border-slate-700",
      input: "bg-slate-800/95 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-2xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-700 disabled:cursor-not-allowed",
      buttonSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600/80",
      quickBar: "bg-slate-900/85 border-y border-slate-700/80",
      quickDock: "relative w-full",
      quickDockHeader: "text-slate-200/90 text-[11px] font-semibold tracking-[0.18em]",
      quickDockHint: "text-slate-400 text-[11px]",
      quickDockToggle: "w-full inline-flex items-center justify-center gap-2 rounded-[18px] border border-slate-700/80 bg-slate-900/92 px-4 py-2 text-[11px] font-semibold text-slate-200 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.9)] transition-colors hover:bg-slate-800",
      quickDockPanel: "absolute bottom-full mb-2 left-0 right-0 rounded-[18px] border border-slate-700/80 bg-slate-950/95 px-3 pb-3 pt-2.5 shadow-[0_20px_34px_-24px_rgba(15,23,42,0.95)] backdrop-blur-xl",
      quickDockChip: "w-full rounded-full border border-slate-600/80 bg-slate-800/90 px-3.5 py-2 text-center text-[11px] font-medium text-slate-100 transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed",
      error: "bg-red-950/50 text-red-200 border border-red-900/50",
      welcomeTitle: "text-slate-100 text-sm font-semibold",
      headerAction: "bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700",
      headerIconButton: "border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700",
      settingsSectionTitle: "text-slate-400 text-[11px] font-semibold tracking-[0.18em]",
      settingsDivider: "border-slate-700/80",
      settingsText: "text-slate-100 text-[13px] font-medium",
      settingsMuted: "text-slate-400 text-[11px] leading-5",
      settingsCard: "rounded-[22px] border border-slate-700/70 bg-slate-900/55 px-4 py-3 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.95)] backdrop-blur-md",
      settingsControlShell: "grid grid-cols-3 rounded-2xl border p-1 shadow-inner",
      settingsControlShellTone: "border-slate-700 bg-slate-800/80",
      settingsControlActive: "bg-slate-800 text-cyan-200 border border-cyan-500/35 shadow-[0_10px_18px_-16px_rgba(8,145,178,0.7)]",
      settingsControlIdle: "text-slate-300 hover:bg-slate-700/70",
      toggleOff: "bg-slate-600",
      toggleOn: "bg-cyan-600",
      modalBackdrop: "bg-slate-950/68",
      modalCard: "bg-slate-900 border border-slate-700 shadow-2xl",
      modalPrimary: "bg-red-500 hover:bg-red-600 text-white",
      modalSecondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
      poweredText: "text-slate-300",
      poweredBrand: "text-cyan-300",
    }
    : {
      shell: "bg-white border-slate-300 text-slate-900 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.3)] ring-2 ring-slate-200/70 outline outline-1 outline-slate-300/75 backdrop-blur-xl",
      header: "bg-white border-b border-slate-200 text-slate-900 shadow-sm",
      panel: "bg-white border-slate-300 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.3)]",
      body: "bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.08),_transparent_42%),linear-gradient(180deg,#f8fbfc_0%,#eef5f8_100%)]",
      subText: "text-slate-600 text-xs font-medium",
      muted: "text-slate-500 text-xs",
      bubbleVisitor: "bg-cyan-600 text-white rounded-3xl rounded-tr-lg border border-cyan-500/80 shadow-[0_16px_28px_-22px_rgba(8,145,178,0.65)]",
      bubbleAgent: "bg-white text-slate-900 border border-slate-300 rounded-3xl rounded-tl-lg shadow-[0_16px_26px_-24px_rgba(15,23,42,0.35)]",
      composer: "bg-white border-t border-slate-200",
      input: "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-2xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20",
      button: "bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-200 disabled:cursor-not-allowed",
      buttonSecondary: "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200",
      quickBar: "bg-white/92 border-y border-slate-200",
      quickDock: "relative w-full",
      quickDockHeader: "text-slate-500 text-[11px] font-semibold tracking-[0.18em]",
      quickDockHint: "text-slate-500 text-[11px]",
      quickDockToggle: "w-full inline-flex items-center justify-center gap-2 rounded-[18px] border border-slate-200 bg-white/96 px-4 py-2 text-[11px] font-semibold text-cyan-700 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.16)] transition-colors hover:bg-white",
      quickDockPanel: "absolute bottom-full mb-2 left-0 right-0 rounded-[18px] border border-slate-200 bg-white/98 px-3 pb-3 pt-2.5 shadow-[0_20px_34px_-24px_rgba(15,23,42,0.2)] backdrop-blur-xl",
      quickDockChip: "w-full rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-2 text-center text-[11px] font-medium text-cyan-700 transition-colors hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed",
      error: "bg-red-50 text-red-700 border border-red-200",
      welcomeTitle: "text-slate-800 text-sm font-semibold",
      headerAction: "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200",
      headerIconButton: "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200",
      settingsSectionTitle: "text-slate-500 text-[11px] font-semibold tracking-[0.18em]",
      settingsDivider: "border-slate-200",
      settingsText: "text-slate-800 text-[13px] font-medium",
      settingsMuted: "text-slate-500 text-[11px] leading-5",
      settingsCard: "rounded-[22px] border border-slate-200 bg-white/88 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.28)] backdrop-blur-md",
      settingsControlShell: "grid grid-cols-3 rounded-2xl border p-1 shadow-inner",
      settingsControlShellTone: "border-slate-200 bg-slate-100/90",
      settingsControlActive: "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm",
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
    <div className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-[70] flex flex-col items-end ${panelSpacingClass}`} style={{ fontFamily: "Sora, Avenir Next, Segoe UI, sans-serif" }}>
      <style>
        {`@keyframes widgetPulseOut {
          0% { transform: scale(1); opacity: 0.2; }
          55% { opacity: 0.07; }
          100% { transform: scale(1.85); opacity: 0; }
        }`}
      </style>

      {shouldRenderPanel ? (
        <div
          className={`relative w-[min(390px,calc(100vw-1rem))] sm:w-[378px] h-[min(640px,calc(100vh-1rem))] sm:h-[588px] overflow-hidden rounded-[24px] border flex flex-col origin-bottom-right transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${theme.shell}`}
          style={{
            opacity: isPanelVisible ? 1 : 0,
            transform: isPanelVisible ? "translateY(0) scale(1)" : "translateY(22px) scale(0.9)",
            filter: isPanelVisible ? "blur(0px)" : "blur(6px)",
            borderColor: isDarkMode ? "rgba(203,213,225,0.45)" : "rgba(148,163,184,0.72)",
            boxShadow: isDarkMode
              ? "0 34px 72px -28px rgba(2,6,23,0.74), 0 0 0 1px rgba(203,213,225,0.22)"
              : "0 30px 62px -30px rgba(15,23,42,0.29), 0 0 0 1px rgba(148,163,184,0.35)",
          }}
        >
          <div
            className={`${theme.header} px-5 py-4 flex items-center justify-between gap-3 flex-shrink-0`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="h-11 w-11 rounded-full border flex items-center justify-center overflow-hidden text-white text-lg font-semibold shrink-0"
                style={{
                  backgroundColor: resolvedAccent,
                  borderColor: accentSoftBorder,
                  boxShadow: accentShadow,
                }}
              >
                {widgetLogo ? (
                  <img
                    src={widgetLogo}
                    alt={`${title} logo`}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span>{getWidgetInitials(title)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold leading-tight truncate whitespace-nowrap ${headerTitleClass}`}>{title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${socketStatus === "connected" ? "bg-emerald-400 animate-pulse" : socketStatus === "connecting" ? "bg-yellow-300" : "bg-emerald-400 animate-pulse"}`} />
                  <p className={`${headerStatusClass} font-medium ${socketStatus === "connected" ? "text-emerald-500" : socketStatus === "connecting" ? "text-amber-500" : isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
                    {statusLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {conversationId && (
                <button
                  type="button"
                  onClick={() => setIsEndChatModalOpen(true)}
                  className={`rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap ${theme.headerAction} ${headerButtonClass}`}
                >
                  End Chat
                </button>
              )}
              <button
                type="button"
                onClick={() => setWidgetView((current) => (current === "settings" ? "chat" : "settings"))}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${theme.headerIconButton}`}
                aria-label="Toggle menu"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${theme.headerIconButton}`}
                aria-label="Close live chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {widgetView === "settings" ? (
            <>
              <div className={`flex-1 overflow-y-auto px-5 py-5 ${theme.body}`}>
                {selectedHistoryConversation ? (
                  <div className="h-full flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHistoryConversationId("");
                        setHistoryMessages([]);
                      }}
                      className={`inline-flex items-center gap-2 text-[11px] font-semibold mb-4 transition-colors ${theme.settingsText}`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>

                    <div className={`${theme.settingsCard} flex-1 min-h-0 p-4 sm:p-5`}>
                      {isHistoryTranscriptLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <p className={theme.settingsMuted}>Loading transcript...</p>
                        </div>
                      ) : historyMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className={theme.settingsMuted}>No messages found in this conversation.</p>
                        </div>
                      ) : (
                        <div className="h-full overflow-y-auto space-y-2 pr-1">
                          {historyMessages.map((message) => (
                            <div
                              key={message._id}
                              className={`rounded-xl px-3 py-2 ${message.senderType === "VISITOR" ? "bg-cyan-50 border border-cyan-100" : "bg-slate-100 border border-slate-200"}`}
                            >
                              <p className="text-[10px] font-semibold tracking-wide text-slate-500">
                                {message.senderType === "VISITOR" ? "You" : "Support"}
                              </p>
                              <p className={`mt-0.5 whitespace-pre-wrap ${messageSizeClass}`}>{message.message}</p>
                              <p className={`mt-1 ${theme.settingsMuted}`}>{formatDateTime(message.createdAt)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setWidgetView("chat")}
                      className={`inline-flex items-center gap-2 text-[11px] font-semibold mb-4 transition-colors ${theme.settingsText}`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to chat</span>
                    </button>

                    <div className={theme.settingsCard}>
                      <p className={`${theme.settingsSectionTitle} mb-2`}>PROFILE</p>
                      <div className="grid gap-2.5">
                        <input
                          type="text"
                          value={preChatFullName}
                          onChange={(event) => setPreChatFullName(event.target.value)}
                          placeholder="Full name"
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                        />
                        <input
                          type="email"
                          value={preChatEmailAddress}
                          onChange={(event) => setPreChatEmailAddress(event.target.value)}
                          placeholder="Email address"
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                        />
                        <input
                          type="text"
                          value={preChatPhoneNumber}
                          onChange={(event) => setPreChatPhoneNumber(event.target.value)}
                          placeholder="Phone number"
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void handleSaveProfile();
                        }}
                        disabled={isProfileSaving}
                        className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed ${theme.button}`}
                        style={{ backgroundColor: resolvedAccent, boxShadow: accentShadow }}
                      >
                        {isProfileSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        <span>{isProfileSaving ? "Saving..." : "Save profile"}</span>
                      </button>
                      {profileStatusMessage ? (
                        <p className={`mt-2 ${theme.settingsMuted}`}>{profileStatusMessage}</p>
                      ) : null}
                    </div>

                    <div className={`my-5 border-t ${theme.settingsDivider}`} />

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
                            style={textSize === size ? { borderColor: resolvedAccent } : undefined}
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
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`${theme.settingsSectionTitle} mb-1`}>LOCATION PERMISSION</p>
                          <p className={`${theme.settingsMuted}`}>{locationPermissionLabel}</p>
                        </div>
                        <button
                          type="button"
                          onClick={requestBrowserLocation}
                          disabled={browserLocationStatus === "resolving"}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed ${theme.button}`}
                          style={{ backgroundColor: resolvedAccent, boxShadow: accentShadow }}
                        >
                          {browserLocationStatus === "resolving" ? "Checking..." : "Check"}
                        </button>
                      </div>
                    </div>

                    <div className={`my-5 border-t ${theme.settingsDivider}`} />

                    <div className={theme.settingsCard}>
                      <div className="flex items-center justify-between gap-3">
                        <p className={`${theme.settingsSectionTitle}`}>CHAT HISTORY</p>
                        <span className={`${theme.settingsMuted}`}>{historyCount} ended chat{historyCount === 1 ? "" : "s"}</span>
                      </div>

                      {isHistoryLoading ? (
                        <p className={`mt-2 ${theme.settingsMuted}`}>Loading chat history...</p>
                      ) : historyConversations.length === 0 ? (
                        <p className={`mt-2 ${theme.settingsMuted}`}>No previous conversations found for this visitor.</p>
                      ) : (
                        <div className="mt-3 grid gap-2">
                          {historyConversations.slice(0, 6).map((conversation) => {
                            const conversationLabel = formatDateTime(conversation.closedAt || conversation.updatedAt || conversation.createdAt) || "Ended conversation";
                            const isSelected = String(conversation._id) === selectedHistoryConversationId;

                            return (
                              <button
                                key={conversation._id}
                                type="button"
                                onClick={() => {
                                  void loadHistoryTranscript(String(conversation._id));
                                }}
                                className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${isSelected ? "border-cyan-400 bg-cyan-50/80" : "border-slate-300 hover:bg-slate-50"}`}
                              >
                                <p className={`text-xs font-semibold ${theme.settingsText}`}>{conversationLabel}</p>
                                <p className={`mt-0.5 text-[11px] ${theme.settingsMuted}`}>Transcript only</p>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {historyError ? (
                        <p className="mt-2 text-xs text-red-500">{historyError}</p>
                      ) : null}
                    </div>

                    <div className={`my-5 border-t ${theme.settingsDivider}`} />

                    <div className={theme.settingsCard}>
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className={`h-4.5 w-4.5 ${theme.settingsMuted}`} />
                        <p className={`font-semibold tracking-wide ${theme.settingsText}`}>SESSION</p>
                      </div>
                      <p className={`leading-relaxed ${theme.settingsMuted}`}>
                        End session logs out this visitor profile on this browser. End chat only closes the current chat.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEndSessionModalOpen(true);
                        }}
                        className={`mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold ${theme.button}`}
                        style={{ backgroundColor: resolvedAccent, boxShadow: accentShadow }}
                      >
                        End session
                      </button>
                    </div>
                  </>
                )}
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
              <div
                className={`flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col relative pb-28 sm:pb-32 rounded-[18px] border ${theme.body}`}
                style={{
                  borderColor: isDarkMode ? "rgba(148,163,184,0.28)" : "rgba(148,163,184,0.34)",
                  boxShadow: isDarkMode
                    ? "inset 0 0 0 1px rgba(15,23,42,0.42)"
                    : "inset 0 0 0 1px rgba(148,163,184,0.18)",
                }}
              >
                {isLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Starting your chat session...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className={`rounded-[22px] border px-4 py-5 sm:px-5 sm:py-6 text-center ${theme.panel}`}>
                    <div className="flex justify-center">
                      <div className={`h-[52px] w-[78px] rounded-full flex items-center justify-center ${isDarkMode ? "bg-cyan-900/25" : "bg-cyan-50"}`}>
                        <MessageCircle className="h-6 w-6 text-cyan-600" />
                      </div>
                    </div>

                    <p className={`mt-5 ${theme.welcomeTitle} ${helperTextSizeClass} leading-snug`}>
                      {isPreChatPending ? `Welcome to ${title}` : welcomeTitleMessage}
                    </p>
                    <p className={`mt-2 ${theme.muted} ${helperTextSizeClass} leading-snug`}>
                      {isPreChatPending
                        ? "We're here to help. Please tell us a bit about yourself to get started."
                        : "We're here to help. Send a message to get started."}
                    </p>

                    {!conversationId && !hasCompletedPreChat ? (
                      <div className="mt-6 text-left">
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-cyan-600">
                          INTRODUCTION
                        </p>

                        <div className="mt-3 space-y-2.5">
                          <label className={`flex items-center gap-2.5 border-b px-1 pb-2 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                            <User className={`h-4 w-4 shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                            <input
                              type="text"
                              value={preChatFullName}
                              onChange={(event) => setPreChatFullName(event.target.value)}
                              placeholder="Full name (optional)"
                              className={`w-full bg-transparent text-sm outline-none ${isDarkMode ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
                            />
                          </label>

                          <label className={`flex items-center gap-2.5 border-b px-1 pb-2 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                            <Mail className={`h-4 w-4 shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                            <input
                              type="email"
                              value={preChatEmailAddress}
                              onChange={(event) => setPreChatEmailAddress(event.target.value)}
                              placeholder="Email address (optional)"
                              className={`w-full bg-transparent text-sm outline-none ${isDarkMode ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
                            />
                          </label>

                          <label className={`flex items-center gap-2.5 border-b px-1 pb-2 ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                            <Phone className={`h-4 w-4 shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                            <input
                              type="text"
                              value={preChatPhoneNumber}
                              onChange={(event) => setPreChatPhoneNumber(event.target.value)}
                              placeholder="Phone number (optional)"
                              className={`w-full bg-transparent text-sm outline-none ${isDarkMode ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
                            />
                          </label>
                        </div>

                        <p className={`mt-3 text-xs font-medium ${theme.settingsMuted}`}>
                          {browserLocationStatus === "resolved"
                            ? "Location access enabled for this session."
                            : browserLocationStatus === "resolving"
                              ? "Requesting location permission..."
                              : "Location access is off. Chat will continue without location data."}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map((message) => {
                      const isTypingQuickReply = message.localKind === "quick-typing" || message.localKind === "system-typing";
                      const isVisitorMessage = message.senderType === "VISITOR";
                      const visitorMessageStatus = isVisitorMessage && !message.localKind && String(message._id) === latestVisitorMessageId
                        ? getVisitorMessageStatus(message)
                        : null;
                      return (
                        <div key={message._id} className={`flex ${isVisitorMessage ? "justify-end" : "justify-start"} items-end gap-2`}>
                          {!isVisitorMessage && (
                            <div
                              className={`flex-shrink-0 rounded-full border flex items-center justify-center text-white font-bold ${avatarSizeClass}`}
                              style={{
                                background: accentHeaderBackground,
                                borderColor: accentSoftBorder,
                                boxShadow: accentShadow,
                              }}
                            >
                              {getWidgetInitials(title)}
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] sm:max-w-[74%] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isVisitorMessage ? theme.bubbleVisitor : theme.bubbleAgent}`}
                            style={isVisitorMessage ? { backgroundColor: resolvedAccent, borderColor: accentSoftBorder } : undefined}
                          >
                            {isTypingQuickReply ? (
                              <div className={`${bubblePaddingClass} flex items-center gap-1.5 min-h-[42px]`} aria-label="System is typing">
                                <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
                                <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
                                <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
                              </div>
                            ) : (
                              <p className={`${bubblePaddingClass} whitespace-pre-wrap ${messageSizeClass}`}>{message.message}</p>
                            )}
                            <div className={`px-4 pb-1 flex items-center gap-1 ${isVisitorMessage ? "text-white/70" : theme.muted}`}>
                              <p className={messageMetaSizeClass}>{formatTime(message.createdAt)}</p>
                              {visitorMessageStatus ? (
                                <>
                                  <p className={`${messageMetaSizeClass} ${visitorMessageStatus.toneClass}`}>
                                    {visitorMessageStatus.label}
                                  </p>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isAgentTyping ? (
                      <div className="flex justify-start items-end gap-2">
                        <div
                          className={`flex-shrink-0 rounded-full border flex items-center justify-center text-white font-bold ${avatarSizeClass}`}
                          style={{
                            background: accentHeaderBackground,
                            borderColor: accentSoftBorder,
                            boxShadow: accentShadow,
                          }}
                        >
                          {getWidgetInitials(title)}
                        </div>
                        <div className={`max-w-[80%] sm:max-w-[74%] ${theme.bubbleAgent}`}>
                          <div className={`${bubblePaddingClass} flex items-center gap-1.5 min-h-[42px]`} aria-label="Support is typing">
                            <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
                            <span className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
                            <span className="h-2 w-2 rounded-full bg-current animate-bounce" />
                          </div>
                          <div className={`px-4 pb-2 ${theme.muted}`}>
                            <p className={messageMetaSizeClass}>Support is typing...</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div ref={bottomRef} />
                  </div>
                )}

              </div>

              {quickMessages.length > 0 && !hasEndedConversation && !hasConversationStarted && isPreChatPending ? (
                <div className="absolute bottom-[98px] sm:bottom-[104px] left-4 right-4 z-30 pointer-events-none">
                  <div className={`${theme.quickDock} pointer-events-auto`}>
                    <button
                      type="button"
                      onClick={() => setShowQuickMessages((current) => !current)}
                      disabled={isQuickReplyBlocked}
                      className={`${theme.quickDockToggle} disabled:cursor-not-allowed disabled:opacity-60`}
                      aria-expanded={showQuickMessages}
                    >
                      <Zap className="h-4 w-4" />
                      <span className="leading-none">Quick Messages</span>
                      {showQuickMessages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showQuickMessages ? (
                      <div className={`${theme.quickDockPanel} transition-all duration-200 ease-out`}>
                        <div className="flex flex-col gap-2 w-full">
                          {quickMessages.slice(0, 5).map((qm) => (
                            <button
                              key={qm._id}
                              type="button"
                              onClick={() => {
                                setShowQuickMessages(false);
                                void handleQuickMessageClick(qm);
                              }}
                              disabled={isQuickReplyBlocked}
                              className={theme.quickDockChip}
                            >
                              {qm.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {hasEndedConversation ? (
                <div className={`${theme.quickBar} px-4 sm:px-5 py-3 flex-shrink-0`}>
                  <div className={`rounded-2xl border px-3.5 py-3 text-left ${theme.settingsCard}`}>
                    <p className={`font-semibold ${theme.settingsText}`}>This session has ended.</p>
                    <p className={`mt-1 leading-relaxed ${theme.settingsMuted}`}>
                      Start a new session when ready.
                    </p>
                    <button
                      type="button"
                      onClick={handleGoBackToStart}
                      className={`mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold ${theme.button}`}
                    >
                      Start new session
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Input Area */}
              <div className={`border-t ${theme.composer} px-4 sm:px-5 py-3.5 flex-shrink-0`}>
                {!hasApiKey || hasRuntimeError ? (
                  <div className={`mb-3 rounded-2xl border px-3.5 py-3 ${theme.error} flex items-start gap-2.5`}>
                    <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0 text-cyan-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide">{displayErrorTitle}</p>
                      <p className="mt-1 text-xs leading-relaxed">{displayErrorMessage}</p>
                    </div>
                  </div>
                ) : null}

                {isPreChatPending ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCompletePreChat}
                      disabled={!hasApiKey || hasRuntimeError || isLoading}
                      className={`w-full rounded-full px-3 py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed ${theme.button}`}
                      style={{ backgroundColor: resolvedAccent, boxShadow: accentShadow }}
                    >
                      Start conversation
                    </button>

                    <p className={`text-xs mt-2.5 text-center font-medium ${theme.poweredText}`}>
                      Powered by <span className={`font-bold text-[0.65rem] ${theme.poweredBrand}`}>JAF Chatra</span>
                    </p>
                  </>
                ) : (
                  <>
                    <div className={`flex items-end ${composerGapClass}`}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isComposerBlocked}
                        className={`flex ${composerButtonSizeClass} items-center justify-center rounded-2xl flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 ${theme.buttonSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label="Attach file"
                        title="Attach file (coming soon)"
                        style={{ backgroundColor: accentSoftBackground, borderColor: accentSoftBorder, color: resolvedAccent }}
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
                          onChange={(event) => handleComposerTextChange(event.target.value)}
                          rows={1}
                          onInput={(event) => {
                            const target = event.currentTarget;
                            target.style.height = "auto";
                            target.style.height = `${Math.min(target.scrollHeight, 84)}px`;
                          }}
                          onKeyDown={(event) => {
                            if (isComposerBlocked) {
                              return;
                            }

                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              void handleSendMessage();
                            }
                          }}
                          placeholder={
                            hasApiKey
                              ? (hasRuntimeError
                                ? "Resolve the error to continue chatting..."
                                : (hasEndedConversation
                                  ? "This chat has ended. Tap Go back to start again..."
                                  : (isPreChatPending ? "Complete the optional pre-chat step to continue..." : "Type a message...")))
                              : "Widget apiKey is missing..."
                          }
                          disabled={isComposerBlocked}
                          className={`w-full bg-transparent ${composerTextClass} outline-none ${inputPaddingClass} disabled:opacity-50 resize-none overflow-y-auto max-h-[84px] ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                        />
                      </div>

                      <button
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                        }}
                        onClick={() => {
                          if (isComposerBlocked) {
                            return;
                          }

                          void handleSendMessage();
                        }}
                        disabled={isComposerBlocked || !messageText.trim()}
                        className={`flex ${composerButtonSizeClass} flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-200 hover:-translate-y-0.5 ${theme.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label="Send message"
                        style={{ backgroundColor: resolvedAccent, boxShadow: accentShadow }}
                      >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </button>
                    </div>

                    <p className={`text-xs mt-2.5 text-center font-medium ${theme.poweredText}`}>
                      Powered by <span className={`font-bold text-[0.65rem] ${theme.poweredBrand}`}>JAF Chatra</span>
                    </p>
                  </>
                )}
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

                <h3 className="text-center text-xl font-semibold">End this chat?</h3>
                <p className={`text-center mt-2 text-sm ${theme.settingsMuted}`}>
                  This closes your current chat. Your visitor profile and session remain signed in.
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

                <button
                  type="button"
                  onClick={() => {
                    setIsEndChatModalOpen(false);
                    setIsEndSessionModalOpen(true);
                  }}
                  className={`mt-3 h-11 w-full rounded-2xl text-base font-semibold transition-colors ${theme.modalSecondary}`}
                >
                  End session instead
                </button>
              </div>
            </div>
          ) : null}

          {isEndSessionModalOpen ? (
            <div className={`absolute inset-0 z-40 backdrop-blur-[5px] ${theme.modalBackdrop} flex items-center justify-center p-4`}>
              <div className={`w-full max-w-[340px] rounded-3xl p-5 ${theme.modalCard}`}>
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </div>

                <h3 className="text-center text-xl font-semibold">End this session?</h3>
                <p className={`text-center mt-2 text-sm ${theme.settingsMuted}`}>
                  This will erase your current visitor session on this browser, and your past chat transcripts will no longer be viewable from this widget.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEndSessionModalOpen(false)}
                    className={`h-11 rounded-2xl text-base font-semibold transition-colors ${theme.modalSecondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleEndSession();
                    }}
                    className={`h-11 rounded-2xl text-base font-semibold transition-colors ${theme.modalPrimary}`}
                  >
                    Yes, end session
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {isFeedbackPromptOpen ? (
            <div className={`absolute inset-0 z-40 backdrop-blur-[5px] ${theme.modalBackdrop} flex items-center justify-center p-4`}>
              <div className={`w-full max-w-[340px] rounded-3xl p-5 ${theme.modalCard}`}>
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Star className="h-6 w-6 text-amber-500" />
                  </div>
                </div>

                <h3 className="text-center text-xl font-semibold">Rate your chat</h3>
                <p className={`text-center mt-2 text-sm ${theme.settingsMuted}`}>
                  Your feedback helps improve support quality. Comment is optional.
                </p>

                <div className="mt-4 flex items-center justify-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const ratingValue = index + 1;
                    const isActive = ratingValue <= feedbackRating;

                    return (
                      <button
                        key={ratingValue}
                        type="button"
                        onClick={() => setFeedbackRating(ratingValue)}
                        className="transition-transform hover:-translate-y-0.5"
                        aria-label={`${ratingValue} star${ratingValue === 1 ? "" : "s"}`}
                      >
                        <Star className={`h-8 w-8 ${isActive ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                      </button>
                    );
                  })}
                </div>

                <textarea
                  value={feedbackComment}
                  onChange={(event) => setFeedbackComment(event.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Add an optional comment"
                  className={`mt-4 w-full rounded-2xl border px-3.5 py-2.5 text-sm outline-none ${theme.input}`}
                />

                {feedbackMessage ? (
                  <p className={`mt-2 text-xs text-red-500`}>
                    {feedbackMessage}
                  </p>
                ) : null}

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => closePostChatFeedbackPrompt(true)}
                    className={`h-11 rounded-2xl text-base font-semibold transition-colors ${theme.modalSecondary}`}
                    disabled={isFeedbackSubmitting}
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void submitPostChatFeedback();
                    }}
                    disabled={isFeedbackSubmitting || feedbackRating < 1}
                    className={`h-11 rounded-2xl text-base font-semibold transition-colors ${theme.modalPrimary}`}
                  >
                    {isFeedbackSubmitting ? "Submitting..." : "Submit"}
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
        aria-label="Open live chat"
        style={{
          backgroundColor: resolvedAccent,
          boxShadow: accentShadow,
        }}
      >
        {!isOpen ? (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-3 rounded-full"
              style={{
                backgroundColor: resolvedAccent,
                opacity: 0.08,
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                backgroundColor: resolvedAccent,
                animation: "widgetPulseOut 3.4s ease-out infinite",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                backgroundColor: resolvedAccent,
                opacity: 0.72,
                animation: "widgetPulseOut 3.4s ease-out infinite",
                animationDelay: "1.7s",
              }}
            />
          </>
        ) : null}

        <span className="relative z-10">
          {isOpen ? (
            <X className="h-5 w-5 transition-transform duration-200" />
          ) : widgetLogo ? (
            <span
              className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-1 ring-white/25"
              style={{ backgroundColor: resolvedAccent }}
            >
              <img
                src={widgetLogo}
                alt={`${title} icon`}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </span>
          ) : (
            <MessageCircle className="h-5 w-5 transition-transform duration-200 group-hover:rotate-6" />
          )}
        </span>

        {unreadCount > 0 && !isOpen ? (
          <span className="absolute -right-3 -top-3 z-20 flex min-w-[24px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
    </div>
  );
};

export default LiveChatWidget;
